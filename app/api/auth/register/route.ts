import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";
import { signToken } from "@/lib/jwt";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const { name, email, password, confirmPassword, role } = await request.json();

    console.log(`[AUTH REGISTER REQUEST] Email: ${email}, Role: ${role}`);

    if (!process.env.DATABASE_URL) {
      console.error("[AUTH REGISTER ERROR] DATABASE_URL environment variable missing");
      return NextResponse.json(
        { error: "Database configuration error. Please contact administrator." },
        { status: 500 }
      );
    }

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "All fields are required (Name, Email, Password, Role)" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address (e.g. example@gmail.com)" },
        { status: 400 }
      );
    }

    if (role !== "DEVELOPER" && role !== "CLIENT") {
      return NextResponse.json(
        { error: "Invalid role. Role must be DEVELOPER or CLIENT." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      console.warn(`[AUTH REGISTER CONFLICT] User already exists: ${normalizedEmail}`);
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in instead." },
        { status: 400 }
      );
    }

    // Hash password securely with bcrypt
    const hashedPassword = await hashPassword(password);

    // Create user and profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: name.trim(),
          fullName: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role,
          trustScore: 85.0,
          verificationBadge: true,
          isVerified: true,
          isActive: true,
        },
      });

      await tx.profile.create({
        data: {
          userId: newUser.id,
          skills: role === "DEVELOPER" ? "Full Stack Engineering" : "",
          subscription: "BASIC",
          availability: "Full Time",
          location: "India",
        },
      });

      return newUser;
    });

    console.log(`[AUTH REGISTER SUCCESS] Created user ID: ${user.id}, Role: ${user.role}`);

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully!",
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      trustScore: user.trustScore,
      verificationBadge: user.verificationBadge,
      subscription: "BASIC",
    });

    try {
      // Auto-sign in: set signed JWT token in cookies
      const token = signToken({ userId: user.id, role: user.role, profileCompleted: user.profileCompleted });
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
      console.error("[AUTH REGISTER SESSION ERROR]:", e);
      return NextResponse.json(
        { error: "Unable to create login session. Please try again." },
        { status: 500 }
      );
    }

    return response;
  } catch (error: any) {
    console.error("[AUTH REGISTER EXCEPTION]:", error);
    return NextResponse.json(
      { error: "Unable to connect to the server." },
      { status: 500 }
    );
  }
}
