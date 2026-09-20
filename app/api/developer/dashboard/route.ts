import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";
import { checkActiveSubscription } from "@/lib/subscription";

export async function GET() {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const devUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        proposals: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!devUser || devUser.role !== "DEVELOPER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check subscription status
    const subStatus = await checkActiveSubscription(userId);

    // Fetch assigned projects (where developer is assigned)
    const assignedProjects = await prisma.project.findMany({
      where: { developerId: userId },
      include: {
        client: {
          select: { id: true, name: true, email: true, trustScore: true },
        },
        tasks: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch open projects as recommendations
    const openProjects = await prisma.project.findMany({
      where: {
        status: "OPEN",
        clientId: { not: userId },
      },
      include: {
        client: {
          select: {
            name: true,
            verificationBadge: true,
            trustScore: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    const formattedProjects = openProjects.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      budget: p.budget,
      clientName: p.client.name,
      clientVerified: p.client.verificationBadge,
      trustScore: p.client.trustScore,
    }));

    // Parse team members from profile
    let teamMembers: any[] = [];
    if (devUser.profile?.teamMembers) {
      try {
        teamMembers = JSON.parse(devUser.profile.teamMembers);
      } catch (_) {}
    }

    // Format assigned projects
    const formattedAssigned = assignedProjects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      budget: p.budget,
      deadline: p.deadline,
      status: p.status,
      priority: p.priority,
      progress: p.progress,
      advancePaid: p.advancePaid,
      remainingBalance: p.remainingBalance,
      acceptedAmount: p.acceptedAmount,
      createdAt: p.createdAt.toISOString(),
      client: p.client,
      tasks: p.tasks.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        status: t.status,
        assignedDate: t.assignedDate.toISOString(),
        deadline: t.deadline?.toISOString() || null,
      })),
    }));

    // Fetch payment history (all payment statuses)
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      trustScore: devUser.trustScore,
      verificationBadge: devUser.verificationBadge,
      subscription: subStatus.plan,
      subscriptionActive: subStatus.isActive,
      subscriptionStartDate: devUser.profile?.subscriptionStartDate?.toISOString() || null,
      subscriptionEndDate: subStatus.expiresAt?.toISOString() || devUser.profile?.subscriptionEndDate?.toISOString() || null,
      proposalsCount: devUser.proposals.length,
      proposals: devUser.proposals.map((pr) => ({
        id: pr.id,
        projectTitle: pr.project.title,
        bidAmount: pr.bidAmount,
        status: pr.status,
        createdAt: pr.createdAt.toISOString(),
      })),
      assignedProjects: formattedAssigned,
      recommendedProjects: formattedProjects,
      teamMembers,
      paymentHistory: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        plan: p.plan,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error("Developer dashboard fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
export const dynamic = "force-dynamic";
