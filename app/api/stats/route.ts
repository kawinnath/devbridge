import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalDevelopers,
      totalClients,
      totalProjects,
      totalCompletedProjects,
      totalProMembers,
      recentProjectsRaw,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "DEVELOPER" } }),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.project.count(),
      prisma.project.count({ where: { status: "COMPLETED" } }),
      prisma.profile.count({
        where: {
          subscription: {
            in: ["PRO", "ENTERPRISE"],
          },
        },
      }),
      prisma.project.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          client: {
            select: { name: true },
          },
        },
      }),
    ]);

    const recentProjects = recentProjectsRaw.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      budget: p.budget,
      status: p.status,
      clientName: p.client?.name || "Client",
    }));

    return NextResponse.json({
      totalDevelopers,
      totalClients,
      totalProjects,
      totalCompletedProjects,
      totalProMembers,
      recentProjects,
    });
  } catch (error: any) {
    console.error("Stats fetching error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
export const dynamic = "force-dynamic";
