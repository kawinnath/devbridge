import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import nodemailer from "nodemailer";

// In-memory OTP store as fallback (clears on server restart)
const otpStore = new Map<string, { code: string; expiry: Date }>();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  // Try nodemailer if SMTP credentials are configured
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
        subject: "Your DevBridge OTP Code",
        html: `
          <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:24px;background:#0f172a;color:#fff;border-radius:12px;">
            <h2 style="color:#8b5cf6;margin-bottom:8px;">DevBridge Verification</h2>
            <p style="color:#94a3b8;font-size:14px;">Your one-time password (OTP) is:</p>
            <div style="font-size:36px;font-weight:bold;letter-spacing:12px;text-align:center;padding:16px;background:#1e293b;border-radius:8px;margin:16px 0;color:#fff;">${otp}</div>
            <p style="color:#64748b;font-size:12px;">This OTP expires in 10 minutes. Do not share it with anyone.</p>
          </div>
        `,
      });
      return true;
    } catch (err) {
      console.error("SMTP send error:", err);
    }
  }
  return false;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in memory (always works, even without DB)
    otpStore.set(email.toLowerCase().trim(), { code: otp, expiry });

    // Also try to persist to DB if user record exists
    try {
      await prisma.user.updateMany({
        where: { email: email.toLowerCase().trim() },
        data: { otpCode: otp, otpExpiry: expiry },
      });
    } catch (dbErr) {
      // DB might not have OTP fields yet (migration pending) — in-memory store suffices
      console.warn("Could not save OTP to DB, using in-memory store:", dbErr);
    }

    // Try to send via email
    const emailSent = await sendOTPEmail(email, otp);

    // Only log in non-production environments
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n🔐 Dev OTP for ${email}: ${otp} (expires in 10 min)\n`);
    }

    return NextResponse.json({
      success: true,
      emailSent,
      // In development: expose OTP directly so the UI can show it
      ...(process.env.NODE_ENV !== "production" && { devOtp: otp }),
      message: emailSent
        ? "OTP sent to your email address"
        : "OTP generated (check server console in development)",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Failed to generate OTP" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  // Verify OTP endpoint
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const code = url.searchParams.get("code");

  if (!email || !code) {
    return NextResponse.json({ valid: false, error: "Missing email or code" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const stored = otpStore.get(normalizedEmail);

  if (!stored) {
    return NextResponse.json({ valid: false, error: "No OTP found. Please request a new one." }, { status: 400 });
  }

  if (new Date() > stored.expiry) {
    otpStore.delete(normalizedEmail);
    return NextResponse.json({ valid: false, error: "OTP has expired. Please request a new one." }, { status: 400 });
  }

  if (stored.code !== code) {
    return NextResponse.json({ valid: false, error: "Invalid OTP code." }, { status: 400 });
  }

  // OTP is valid — clear it
  otpStore.delete(normalizedEmail);

  const response = NextResponse.json({ valid: true });
  
  // Set a short-lived signed token to authenticate registration body email matches verified email
  const token = signToken({ email: normalizedEmail, purpose: "email_verification" });
  response.cookies.set("emailVerified", token, {
    path: "/",
    maxAge: 300, // 5 minutes
    httpOnly: true,
    sameSite: "lax",
  });

  return response;
}
