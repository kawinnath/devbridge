import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { proposalId } = await request.json();
    if (!proposalId) return NextResponse.json({ error: "Missing proposalId" }, { status: 400 });

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { project: true },
    });

    if (!proposal || proposal.developerId !== userId) {
      return NextResponse.json({ error: "Access denied or proposal not found" }, { status: 403 });
    }

    if (proposal.status !== "OFFERED") {
      return NextResponse.json({ error: "Proposal is not offered" }, { status: 400 });
    }

    // Accept offer
    const result = await prisma.$transaction(async (tx) => {
      const updatedProposal = await tx.proposal.update({
        where: { id: proposalId },
        data: { status: "HIRED" },
      });

      // Assign developer to project
      await tx.project.update({
        where: { id: proposal.projectId },
        data: {
          status: "IN_PROGRESS",
          developerId: proposal.developerId,
          acceptedAmount: proposal.bidAmount,
          remainingBalance: proposal.project.budget,
        },
      });

      // Reject other proposals
      await tx.proposal.updateMany({
        where: {
          projectId: proposal.projectId,
          id: { not: proposalId },
        },
        data: { status: "REJECTED" },
      });

      // Notify the client
      await tx.notification.create({
        data: {
          userId: proposal.project.clientId,
          title: "Offer Accepted!",
          message: `Your offer for "${proposal.project.title}" was accepted. The project is now IN PROGRESS.`,
          type: "SUCCESS",
        },
      });

      return updatedProposal;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Accept error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
