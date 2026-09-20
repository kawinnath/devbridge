import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePasswords } from "@/lib/hash";
import { signToken } from "@/lib/jwt";

// Simple in-memory map for admin login rate limiting
const adminLoginAttempts = new Map<string, { count: number; lockUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check rate limit
    const attempt = adminLoginAttempts.get(normalizedEmail);
    const now = Date.now();
    if (attempt && attempt.lockUntil > now) {
      const remainingTime = Math.ceil((attempt.lockUntil - now) / 60000);
      return NextResponse.json(
        { error: `Too many login attempts. Locked for ${remainingTime} minutes.` },
        { status: 429 }
      );
    }

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail }
    });

    if (!admin) {
      recordFailedAttempt(normalizedEmail);
      return NextResponse.json(
        { error: "Account does not exist." },
        { status: 401 }
      );
    }

    // Verify Password
    const isPasswordValid = await comparePasswords(password, admin.password);
    if (!isPasswordValid) {
      recordFailedAttempt(normalizedEmail);
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 }
      );
    }

    // Reset attempts
    adminLoginAttempts.delete(normalizedEmail);

    const response = NextResponse.json({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: "ADMIN"
    });

    try {
      // Set signed JWT token in userId cookie
      const token = signToken({ userId: admin.id, role: "ADMIN" });
      const isProd = process.env.NODE_ENV === "production";
      
      response.cookies.set("userId", token, {
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
        httpOnly: false,
        secure: isProd,
        sameSite: "lax",
      });

      response.cookies.set("devbridge_session", token, {
        path: "/",
        maxAge: 60 * 60 * 24,
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
      });
    } catch (e) {
      console.error("[AUTH ADMIN LOGIN SESSION ERROR]:", e);
      return NextResponse.json(
        { error: "Unable to create login session. Please try again." },
        { status: 500 }
      );
    }

    return response;
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Unable to connect to the server." },
      { status: 500 }
    );
  }
}

function recordFailedAttempt(email: string) {
  const now = Date.now();
  const attempt = adminLoginAttempts.get(email) || { count: 0, lockUntil: 0 };
  attempt.count += 1;
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.lockUntil = now + LOCK_TIME;
  }
  adminLoginAttempts.set(email, attempt);
}
