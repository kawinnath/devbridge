import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { action, name, role } = await request.json();

    let team: any[] = [];
    if (profile.teamMembers) {
      try {
        team = JSON.parse(profile.teamMembers);
      } catch (_) {}
    }

    if (action === "ADD") {
      if (!name || !role) {
        return NextResponse.json({ error: "Name and role are required" }, { status: 400 });
      }
      team.push({ name, role, status: "Available" });
    } else if (action === "REMOVE") {
      const { index } = await request.json();
      team = team.filter((_, idx) => idx !== index);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Save updated team list
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        teamMembers: JSON.stringify(team),
      },
    });

    return NextResponse.json(team);
  } catch (error: any) {
    console.error("Team management error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
