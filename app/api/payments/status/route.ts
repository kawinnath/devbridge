import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";

export async function GET() {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ isPending: false, payment: null });
    }

    // Find latest PENDING payment for this user
    const pendingPayment = await prisma.payment.findFirst({
      where: {
        userId,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    });

    if (pendingPayment) {
      return NextResponse.json({
        isPending: true,
        payment: {
          id: pendingPayment.id,
          plan: pendingPayment.plan,
          amount: pendingPayment.amount,
          transactionId: pendingPayment.transactionId,
          createdAt: pendingPayment.createdAt.toISOString(),
          status: "PENDING",
        },
      });
    }

    return NextResponse.json({ isPending: false, payment: null });
  } catch (error: any) {
    console.error("Fetch payment status error:", error);
    return NextResponse.json({ isPending: false, payment: null });
  }
}

export const dynamic = "force-dynamic";
