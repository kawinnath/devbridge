import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { comparePasswords, hashPassword } from "@/lib/hash";
import { signToken } from "@/lib/jwt";

const loginAttempts = new Map<string, { count: number; lockUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    console.log(`[AUTH LOGIN REQUEST] Email: ${email}`);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check Rate Limiting
    const attempt = loginAttempts.get(normalizedEmail);
    const now = Date.now();
    if (attempt && attempt.lockUntil > now) {
      const remainingTime = Math.ceil((attempt.lockUntil - now) / 60000);
      console.warn(`[AUTH LOGIN LOCKED] Email: ${normalizedEmail} for ${remainingTime}m`);
      return NextResponse.json(
        { error: `Too many failed login attempts. Locked for ${remainingTime} minutes.` },
        { status: 429 }
      );
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { profile: true },
    });

    if (!user) {
      console.warn(`[AUTH LOGIN FAILED] User not found: ${normalizedEmail}`);
      recordFailedAttempt(normalizedEmail);
      return NextResponse.json(
        { error: "Account does not exist." },
        { status: 401 }
      );
    }

    // Verify password securely
    let isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      const legacyHash = crypto.createHash("sha256").update(password).digest("hex");
      if (user.password === legacyHash) {
        const newBcryptHash = await hashPassword(password);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: newBcryptHash },
        });
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      console.warn(`[AUTH LOGIN FAILED] Invalid password for: ${normalizedEmail}`);
      recordFailedAttempt(normalizedEmail);
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is disabled. Please contact support." },
        { status: 403 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { error: "Please verify your email before logging in." },
        { status: 403 }
      );
    }

    // Clear failed attempts
    loginAttempts.delete(normalizedEmail);

    console.log(`[AUTH LOGIN SUCCESS] User ID: ${user.id}, Role: ${user.role}`);

    const responseData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      trustScore: user.trustScore,
      verificationBadge: user.verificationBadge,
      subscription: user.profile?.subscription || "BASIC",
      profileCompleted: user.profileCompleted,
    };

    const response = NextResponse.json(responseData);

    try {
      // Sign JWT Token
      const token = signToken({ userId: user.id, role: user.role, profileCompleted: user.profileCompleted });
      const isProd = process.env.NODE_ENV === "production";

      // Set userId cookie for Next.js App Router and Edge Middleware
      response.cookies.set("userId", token, {
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
        httpOnly: false,
        secure: isProd,
        sameSite: "lax",
      });

      // Fallback devbridge_session cookie
      response.cookies.set("devbridge_session", token, {
        path: "/",
        maxAge: 60 * 60 * 24,
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
      });
    } catch (e) {
      console.error("[AUTH LOGIN SESSION ERROR]:", e);
      return NextResponse.json(
        { error: "Unable to create login session. Please try again." },
        { status: 500 }
      );
    }

    return response;
  } catch (error: any) {
    console.error("[AUTH LOGIN EXCEPTION]:", error);
    return NextResponse.json(
      { error: "Unable to connect to the server." },
      { status: 500 }
    );
  }
}

function recordFailedAttempt(email: string) {
  const now = Date.now();
  const attempt = loginAttempts.get(email) || { count: 0, lockUntil: 0 };
  attempt.count += 1;
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.lockUntil = now + LOCK_TIME;
  }
  loginAttempts.set(email, attempt);
}
