import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, coverLetter, bidAmount } = await request.json();

    if (!projectId || !coverLetter || !bidAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch developer details and skills
    const [devUser, project] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      }),
      prisma.project.findUnique({
        where: { id: projectId },
      }),
    ]);

    if (!devUser || !project) {
      return NextResponse.json(
        { error: "Developer or Project not found" },
        { status: 404 }
      );
    }

    // Calculate skills matching percentage deterministically (no AI predictions)
    const devSkills = devUser.profile?.skills
      ? devUser.profile.skills.split(",").map((s) => s.trim().toLowerCase())
      : [];
    const projSkills = project.skills
      ? project.skills.split(",").map((s) => s.trim().toLowerCase())
      : [];

    let matchPercentage = 100;
    if (projSkills.length > 0) {
      const matchCount = projSkills.filter((s) => devSkills.includes(s)).length;
      matchPercentage = Math.round((matchCount / projSkills.length) * 100);
    }

    // Insert proposal
    const proposal = await prisma.proposal.create({
      data: {
        projectId,
        developerId: userId,
        coverLetter,
        bidAmount: parseFloat(bidAmount.toString()),
        matchPercentage,
        trustScore: devUser.trustScore,
        status: "PENDING",
      },
    });

    return NextResponse.json(proposal);
  } catch (error: any) {
    console.error("Proposal submission error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
