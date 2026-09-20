import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscription } = await request.json();
    if (!subscription || !["BASIC", "PRO", "ENTERPRISE"].includes(subscription)) {
      return NextResponse.json({ error: "Invalid subscription type" }, { status: 400 });
    }

    // Find the user to ensure they exist
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update the profile's subscription status
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: userId },
      update: { subscription },
      create: {
        userId: userId,
        skills: "",
        subscription,
      }
    });

    // Return the updated user session details
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      trustScore: user.trustScore,
      verificationBadge: user.verificationBadge,
      subscription: updatedProfile.subscription,
    });
  } catch (error: any) {
    console.error("Upgrade error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
