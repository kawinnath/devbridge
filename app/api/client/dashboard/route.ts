import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";

export async function GET() {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user role is CLIENT
    const clientUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!clientUser || clientUser.role !== "CLIENT") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch projects posted by this client along with all related data
    const projects = await prisma.project.findMany({
      where: { clientId: userId },
      include: {
        developer: {
          select: { id: true, name: true, email: true, trustScore: true },
        },
        proposals: {
          include: {
            developer: {
              include: {
                profile: true,
              },
            },
          },
        },
        tasks: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch payment history
    const payments = await prisma.payment.findMany({
      where: { userId, status: "SUCCESS" },
      orderBy: { createdAt: "desc" },
      include: {
        invoice: true,
      },
    });

    // Format projects to return
    const activeProjects = projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      budget: p.budget,
      deadline: p.deadline,
      proposalsCount: p.proposals.length,
      status: p.status,
      priority: p.priority,
      progress: p.progress,
      advancePaid: p.advancePaid,
      remainingBalance: p.remainingBalance,
      acceptedAmount: p.acceptedAmount,
      createdAt: p.createdAt.toISOString(),
      developer: p.developer
        ? { id: p.developer.id, name: p.developer.name, trustScore: p.developer.trustScore }
        : null,
      tasks: p.tasks.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        status: t.status,
        assignedDate: t.assignedDate.toISOString(),
        deadline: t.deadline?.toISOString() || null,
      })),
    }));

    // Gather all received proposals
    const receivedProposals: any[] = [];
    projects.forEach((proj) => {
      proj.proposals.forEach((prop) => {
        receivedProposals.push({
          id: prop.id,
          projectId: proj.id,
          projTitle: proj.title,
          devId: prop.developer.id,
          devName: prop.developer.name,
          avatar: prop.developer.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "DB",
          bidAmount: prop.bidAmount,
          matchPercentage: prop.matchPercentage,
          trustScore: prop.developer.trustScore,
          coverLetter: prop.coverLetter,
          status: prop.status,
        });
      });
    });

    // Format active contracts (Projects in progress or completed)
    const activeContracts = projects
      .filter((p) => p.status === "IN_PROGRESS" || p.status === "COMPLETED")
      .map((p) => {
        const hiredProposal = p.proposals.find((pr) => pr.status === "HIRED");
        return {
          id: p.id,
          projectTitle: p.title,
          developerName: p.developer?.name || hiredProposal?.developer.name || "Assigned Developer",
          developerId: p.developer?.id || hiredProposal?.developerId,
          budget: p.budget,
          status: p.status,
          progress: p.progress,
          advancePaid: p.advancePaid,
          remainingBalance: p.remainingBalance,
          acceptedAmount: p.acceptedAmount,
          deadline: p.deadline,
          tasks: p.tasks.map((t) => ({
            id: t.id,
            name: t.name,
            status: t.status,
          })),
        };
      });

    // Payment history
    const paymentHistory = payments.map((p) => ({
      id: p.id,
      plan: p.plan,
      amount: p.amount,
      currency: p.currency,
      transactionId: p.transactionId,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      invoiceNumber: p.invoice?.invoiceNumber || null,
    }));

    return NextResponse.json({
      activeProjects,
      receivedProposals,
      activeContracts,
      paymentHistory,
    });
  } catch (error: any) {
    console.error("Client dashboard data fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
export const dynamic = "force-dynamic";
