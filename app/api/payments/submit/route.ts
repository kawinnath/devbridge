import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { plan, amount, transactionId, screenshot } = body;

    if (!plan || !amount || !transactionId || String(transactionId).trim() === "") {
      return NextResponse.json(
        { error: "Transaction ID and payment details are required." },
        { status: 400 }
      );
    }

    const cleanTxnId = String(transactionId).trim();

    // Check if Transaction ID already exists to prevent duplicate submissions
    const existingTxn = await prisma.payment.findUnique({
      where: { transactionId: cleanTxnId },
    });

    if (existingTxn) {
      return NextResponse.json(
        { error: "This Transaction ID has already been submitted for verification." },
        { status: 409 }
      );
    }

    // Fetch user to check intro offer status
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    if (plan === "INTRO" && user.hasUsedIntroOffer) {
      return NextResponse.json(
        { error: "You have already claimed the ₹1 introductory offer." },
        { status: 400 }
      );
    }

    // Create Subscription record in PENDING state
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        plan: plan === "INTRO" ? "PRO_INTRO" : plan === "PRO_YEARLY" ? "PRO_YEARLY" : "PRO_MONTHLY",
        status: "PENDING",
      },
    });

    // Create Payment proof record in PENDING state
    const payment = await prisma.payment.create({
      data: {
        userId,
        plan,
        amount: Number(amount),
        currency: "INR",
        transactionId: cleanTxnId,
        screenshot: screenshot || null,
        status: "PENDING",
        subscriptionId: subscription.id,
      },
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      subscriptionId: subscription.id,
      message: "Payment proof submitted! Pending Admin verification.",
    });
  } catch (error: any) {
    console.error("Payment submission error:", error);
    return NextResponse.json(
      { error: "Internal server error submitting payment proof." },
      { status: 500 }
    );
  }
}
