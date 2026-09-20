import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";

export async function GET() {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify current user has admin rights
    const [adminRecord, adminUser] = await Promise.all([
      prisma.admin.findUnique({ where: { id: userId } }),
      prisma.user.findFirst({ where: { id: userId, role: "ADMIN" } }),
    ]);

    if (!adminRecord && !adminUser) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch all metrics from database
    const [
      totalUsers,
      totalProjects,
      totalProposals,
      completedProjects,
      ongoingProjects,
      allUsers,
      flaggedProjects,
      pendingPayments,
      allPayments,
      activeSubscriptions,
      allSubscriptions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.proposal.count(),
      prisma.project.count({ where: { status: "COMPLETED" } }),
      prisma.project.count({ where: { status: "IN_PROGRESS" } }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          fullName: true,
          email: true,
          role: true,
          createdAt: true,
          isActive: true,
          trustScore: true,
          verificationBadge: true,
          hasUsedIntroOffer: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.findMany({
        where: { aiScamFlagged: true },
        include: { client: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.findMany({
        where: { status: "PENDING" },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.findMany({
        where: { status: { in: ["SUCCESS", "APPROVED"] } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.subscription.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    // Calculate revenue
    const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);

    // Monthly income (current month)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyPayments = allPayments.filter((p) => p.createdAt >= monthStart);
    const monthlyIncome = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);

    // Pending payment total
    const pendingPaymentTotal = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

    // Format all users list
    const formattedUsers = allUsers.map((u) => ({
      id: u.id,
      name: u.fullName || u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      isActive: u.isActive,
      trustScore: u.trustScore,
      verificationBadge: u.verificationBadge,
      hasUsedIntroOffer: u.hasUsedIntroOffer,
    }));

    // Format flagged projects
    const formattedFlaggedProjects = flaggedProjects.map((p) => ({
      id: p.id,
      title: p.title,
      clientName: p.client.name,
      budget: p.budget,
      scamReason: p.aiScamReason || "Suspicious project keywords or multiple duplicates flagged.",
    }));

    // Format pending payments with screenshot proof
    const formattedPayments = pendingPayments.map((p) => ({
      id: p.id,
      plan: p.plan,
      amount: p.amount,
      transactionId: p.transactionId,
      screenshot: p.screenshot || null,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      userName: p.user.name,
      userEmail: p.user.email,
    }));

    // Format all payment history
    const paymentHistory = allPayments.map((p) => ({
      id: p.id,
      plan: p.plan,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      transactionId: p.transactionId,
    }));

    // Format subscriptions
    const formattedSubscriptions = allSubscriptions.map((s) => ({
      id: s.id,
      plan: s.plan,
      status: s.status,
      userName: s.user.name,
      userEmail: s.user.email,
      currentPeriodEnd: s.currentPeriodEnd?.toISOString() || null,
      createdAt: s.createdAt.toISOString(),
    }));

    const activeDevelopersCount = allUsers.filter((u) => u.role === "DEVELOPER").length;
    const activeClientsCount = allUsers.filter((u) => u.role === "CLIENT").length;

    return NextResponse.json({
      totalUsers,
      totalProjects,
      totalProposals,
      completedProjects,
      ongoingProjects,
      totalRevenue,
      monthlyIncome,
      activeSubscriptions,
      pendingPaymentTotal,
      activeDevelopersCount,
      activeClientsCount,
      allUsers: formattedUsers,
      flaggedProjects: formattedFlaggedProjects,
      pendingPayments: formattedPayments,
      paymentHistory,
      subscriptions: formattedSubscriptions,
    });
  } catch (error: any) {
    console.error("Admin dashboard data fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Action POST to handle admin operations (Toggle user, Delete, Unflag, Approve/Reject Payment)
export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [adminRecord, adminUser] = await Promise.all([
      prisma.admin.findUnique({ where: { id: userId } }),
      prisma.user.findFirst({ where: { id: userId, role: "ADMIN" } }),
    ]);

    if (!adminRecord && !adminUser) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { action, targetId } = await request.json();

    if (!action || !targetId) {
      return NextResponse.json({ error: "Missing arguments" }, { status: 400 });
    }

    if (action === "TOGGLE_ACTIVE") {
      const targetUser = await prisma.user.findUnique({ where: { id: targetId } });
      if (!targetUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      const updatedUser = await prisma.user.update({
        where: { id: targetId },
        data: { isActive: !targetUser.isActive },
      });
      return NextResponse.json({ success: true, isActive: updatedUser.isActive });
    } else if (action === "DELETE_USER") {
      await prisma.user.delete({
        where: { id: targetId },
      });
      return NextResponse.json({ success: true, message: "User deleted permanently" });
    } else if (action === "VERIFY_USER") {
      await prisma.user.update({
        where: { id: targetId },
        data: {
          verificationBadge: true,
          trustScore: 95.0,
        },
      });
      return NextResponse.json({ success: true });
    } else if (action === "UNFLAG_PROJECT") {
      await prisma.project.update({
        where: { id: targetId },
        data: {
          aiScamFlagged: false,
          aiScamReason: null,
        },
      });
      return NextResponse.json({ success: true });
    } else if (action === "APPROVE_PAYMENT") {
      const payment = await prisma.payment.findUnique({
        where: { id: targetId },
        include: { subscription: true, user: true },
      });

      if (!payment) {
        return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
      }

      // Calculate period duration: 365 days for PRO_YEARLY, 30 days for INTRO/PRO_MONTHLY
      const durationDays = payment.plan === "PRO_YEARLY" ? 365 : 30;
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

      // Perform atomic database update
      await prisma.$transaction(async (tx) => {
        // 1. Update Payment status
        await tx.payment.update({
          where: { id: targetId },
          data: { status: "APPROVED" },
        });

        // 2. If plan is INTRO, mark hasUsedIntroOffer on User
        if (payment.plan === "INTRO") {
          await tx.user.update({
            where: { id: payment.userId },
            data: { hasUsedIntroOffer: true },
          });
        }

        // 3. Update Subscription status
        if (payment.subscriptionId) {
          await tx.subscription.update({
            where: { id: payment.subscriptionId },
            data: {
              status: "ACTIVE",
              currentPeriodStart: startDate,
              currentPeriodEnd: endDate,
            },
          });
        }

        // 4. Update Profile subscription
        await tx.profile.upsert({
          where: { userId: payment.userId },
          update: {
            subscription: "PRO",
            subscriptionStartDate: startDate,
            subscriptionEndDate: endDate,
          },
          create: {
            userId: payment.userId,
            skills: "",
            subscription: "PRO",
            subscriptionStartDate: startDate,
            subscriptionEndDate: endDate,
          },
        });

        // 5. Create user Notification
        await tx.notification.create({
          data: {
            userId: payment.userId,
            title: "Payment Verified",
            message: "Your payment has been verified. Your subscription is now active.",
            type: "PAYMENT",
          },
        });

        // 6. Generate Invoice record
        const invCount = await tx.invoice.count();
        await tx.invoice.create({
          data: {
            paymentId: payment.id,
            userId: payment.userId,
            invoiceNumber: `DB-INV-${new Date().getFullYear()}-${String(invCount + 1).padStart(4, "0")}`,
            amount: payment.amount,
            plan: payment.plan,
            billingPeriodStart: startDate,
            billingPeriodEnd: endDate,
          },
        });
      });

      return NextResponse.json({ success: true, message: "Your payment has been verified. Your subscription is now active." });
    } else if (action === "REJECT_PAYMENT") {
      const payment = await prisma.payment.findUnique({ where: { id: targetId } });
      if (!payment) {
        return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: targetId },
          data: { status: "REJECTED" },
        });

        if (payment.subscriptionId) {
          await tx.subscription.update({
            where: { id: payment.subscriptionId },
            data: { status: "CANCELLED" },
          });
        }

        await tx.notification.create({
          data: {
            userId: payment.userId,
            title: "Payment Verification Failed",
            message: "Your payment could not be verified. Please contact DevBridge support if needed.",
            type: "WARNING",
          },
        });
      });

      return NextResponse.json({ success: true, message: "Payment rejected." });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Admin action error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
