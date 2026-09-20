import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";

export async function GET() {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let users = [];

    if (currentUser.role === "CLIENT") {
      // Clients chat with Developers and Agencies
      users = await prisma.user.findMany({
        where: {
          role: "DEVELOPER",
        },
        orderBy: {
          name: "asc",
        },
      });
    } else {
      // Developers and Agencies chat with Clients
      users = await prisma.user.findMany({
        where: {
          role: "CLIENT",
        },
        orderBy: {
          name: "asc",
        },
      });
    }

    const formattedUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      avatar: u.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "DB",
      role: u.role,
      verified: u.verificationBadge,
      status: "Online", // Simulation
    }));

    return NextResponse.json(formattedUsers);
  } catch (error: any) {
    console.error("Fetch chat partners error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
export const dynamic = "force-dynamic";
