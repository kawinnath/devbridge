import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";

export async function POST() {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.subscription.updateMany({
      where: { userId, status: "ACTIVE" },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    await prisma.profile.update({
      where: { userId },
      data: { subscription: "BASIC" },
    });

    return NextResponse.json({ success: true, message: "Subscription cancelled successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to cancel subscription." }, { status: 500 });
  }
}
