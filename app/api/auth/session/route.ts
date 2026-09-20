import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("userId")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ user: null });
    }

    const userId = decoded.userId as string;
    const role = decoded.role as string;

    // Check if the user is an Admin
    if (role === "ADMIN") {
      const admin = await prisma.admin.findUnique({
        where: { id: userId },
      });

      if (admin) {
        return NextResponse.json({
          user: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: "ADMIN",
            trustScore: 100.0,
            verificationBadge: true,
            subscription: "PRO",
            subscriptionStartDate: null,
            subscriptionEndDate: null,
          }
        });
      }
    }

    // Otherwise, check User table
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true
      }
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Check subscription expiration
    if (user.profile && user.profile.subscription !== "BASIC" && user.profile.subscriptionEndDate) {
      const now = new Date();
      if (user.profile.subscriptionEndDate < now) {
        // Degrade to BASIC automatically
        const updatedProfile = await prisma.profile.update({
          where: { userId: user.id },
          data: {
            subscription: "BASIC",
            subscriptionStartDate: null,
            subscriptionEndDate: null
          }
        });
        user.profile = updatedProfile;
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        trustScore: user.trustScore,
        verificationBadge: user.verificationBadge,
        subscription: user.profile?.subscription || "BASIC",
        subscriptionStartDate: user.profile?.subscriptionStartDate?.toISOString() || null,
        subscriptionEndDate: user.profile?.subscriptionEndDate?.toISOString() || null,
        hasUsedIntroOffer: user.hasUsedIntroOffer,
        profileCompleted: user.profileCompleted,
      }
    });
  } catch (error: any) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

