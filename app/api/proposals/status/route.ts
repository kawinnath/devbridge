import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { proposalId, action } = await request.json();

    if (!proposalId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { project: true, developer: true },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    // Verify current user owns the project
    if (proposal.project.clientId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const newStatus = action === "HIRE" ? "OFFERED" : "SHORTLISTED";

    // Update proposal and project in transaction if hiring
    const result = await prisma.$transaction(async (tx) => {
      const updatedProposal = await tx.proposal.update({
        where: { id: proposalId },
        data: { status: newStatus },
      });

      if (action === "HIRE") {
        // Notify the developer they have an offer
        await tx.notification.create({
          data: {
            userId: proposal.developerId,
            title: "🎉 You have a job offer!",
            message: `You've received an offer for "${proposal.project.title}"! Budget: ₹${proposal.project.budget.toLocaleString("en-IN")}. Please accept it on your dashboard.`,
            type: "SUCCESS",
          },
        });
      }

      return updatedProposal;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Proposal status update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
