import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get("targetId");

    if (!targetId) {
      return NextResponse.json({ messages: [] });
    }

    // Retrieve all messages between the two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: targetId },
          { senderId: targetId, receiverId: userId },
        ],
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error("Fetch chat messages error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch sender user
    const sender = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, profile: { select: { subscription: true } } },
    });

    if (!sender) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { receiverId, content } = await request.json();

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "Receiver ID and content are required" },
        { status: 400 }
      );
    }

    // Enforce basic plan limit: max 5 distinct client contacts per month
    if (sender.role === "DEVELOPER" && sender.profile?.subscription === "BASIC") {
      // Calculate start of current month (UTC)
      const now = new Date();
      const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

      // Find distinct client contacts this month
      const contacts = await prisma.message.findMany({
        where: {
          senderId: userId,
          timestamp: { gte: startOfMonth },
          receiver: { role: "CLIENT" },
        },
        select: { receiverId: true },
        distinct: ["receiverId"],
      });

      const uniqueClients = new Set(contacts.map(c => c.receiverId));
      // Include the new target if not already counted
      if (!uniqueClients.has(receiverId)) {
        uniqueClients.add(receiverId);
      }

      if (uniqueClients.size > 5) {
        return NextResponse.json(
          { error: "Contact limit reached. Upgrade subscription to contact more clients." },
          { status: 403 }
        );
      }
    }

    const message = await prisma.message.create({
      data: {
        senderId: userId,
        receiverId,
        content,
        isRead: false,
      },
    });

    return NextResponse.json(message);
  } catch (error: any) {
    console.error("Save chat message error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
export const dynamic = "force-dynamic";
