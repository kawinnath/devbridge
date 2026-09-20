import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";
import nodemailer from "nodemailer";

// Simple in-memory map for password reset rate limiting
const resetAttempts = new Map<string, { count: number; lockUntil: number }>();
const MAX_RESET_ATTEMPTS = 5;
const RESET_LOCK_TIME = 15 * 60 * 1000; // 15 minutes


function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.sendMail({
        from: `"DevBridge" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Reset your DevBridge password",
        html: `
          <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:24px;background:#0f172a;color:#fff;border-radius:12px;">
            <h2 style="color:#8b5cf6;margin-bottom:8px;">Reset Password Verification</h2>
            <p style="color:#94a3b8;font-size:14px;">Your one-time password (OTP) to reset your password is:</p>
            <div style="font-size:36px;font-weight:bold;letter-spacing:12px;text-align:center;padding:16px;background:#1e293b;border-radius:8px;margin:16px 0;color:#fff;">${otp}</div>
            <p style="color:#64748b;font-size:12px;">This OTP expires in 10 minutes. Do not share it with anyone.</p>
          </div>
        `,
      });
      return true;
    } catch (err) {
      console.error("Forgot password SMTP send error:", err);
    }
  }
  return false;
}

export async function POST(request: Request) {
  try {
    const { action, email, code, password, confirmPassword } = await request.json();

    if (action === "SEND") {
      if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        return NextResponse.json({ error: "No user found with this email" }, { status: 404 });
      }

      const otp = generateOTP();
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.user.update({
        where: { id: user.id },
        data: { otpCode: otp, otpExpiry: expiry },
      });

      const emailSent = await sendOTPEmail(normalizedEmail, otp);
      console.log(`\n🔐 Forgot Password OTP for ${normalizedEmail}: ${otp} (expires in 10 min)\n`);

      return NextResponse.json({
        success: true,
        emailSent,
        ...(process.env.NODE_ENV !== "production" && { devOtp: otp }),
        message: emailSent ? "OTP sent to your email" : "OTP generated",
      });
    }

    if (action === "RESET") {
      if (!email || !code || !password) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      if (confirmPassword && password !== confirmPassword) {
        return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check reset rate limiting
      const attempt = resetAttempts.get(normalizedEmail);
      const now = Date.now();
      if (attempt && attempt.lockUntil > now) {
        const remainingTime = Math.ceil((attempt.lockUntil - now) / 60000);
        return NextResponse.json(
          { error: `Too many password reset attempts. Locked for ${remainingTime} minutes.` },
          { status: 429 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        return NextResponse.json({ error: "No user found with this email" }, { status: 404 });
      }

      if (!user.otpCode || user.otpCode !== code) {
        recordFailedReset(normalizedEmail);
        return NextResponse.json({ error: "Invalid OTP code" }, { status: 400 });
      }

      if (user.otpExpiry && new Date() > user.otpExpiry) {
        recordFailedReset(normalizedEmail);
        return NextResponse.json({ error: "OTP code has expired" }, { status: 400 });
      }

      // Hash password and save
      const hashedPassword = await hashPassword(password);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          otpCode: null,
          otpExpiry: null,
        },
      });

      // Reset rate limiting attempts on success
      resetAttempts.delete(normalizedEmail);

      return NextResponse.json({ success: true, message: "Password reset successful" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Forgot password handler error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function recordFailedReset(email: string) {
  const now = Date.now();
  const attempt = resetAttempts.get(email) || { count: 0, lockUntil: 0 };
  attempt.count += 1;
  if (attempt.count >= MAX_RESET_ATTEMPTS) {
    attempt.lockUntil = now + RESET_LOCK_TIME;
  }
  resetAttempts.set(email, attempt);
}
