import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify project access
    const project = await prisma.project.findUnique({
      where: { id },
      select: { clientId: true, developerId: true },
    });

    if (!project || (project.clientId !== userId && project.developerId !== userId)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { projectId: id },
      include: {
        sender: { select: { id: true, name: true } },
      },
      orderBy: { timestamp: "asc" },
    });

    // Mark messages as read for the current user
    await prisma.message.updateMany({
      where: {
        projectId: id,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json(
      messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        senderName: m.sender.name,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
        isRead: m.isRead,
        fileUrl: m.fileUrl,
        fileName: m.fileName,
      }))
    );
  } catch (error: any) {
    console.error("Messages fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { content, fileUrl, fileName } = await request.json();

    if (!content && !fileUrl) {
      return NextResponse.json(
        { error: "Message content or file is required" },
        { status: 400 }
      );
    }

    // Verify project access and get the other party
    const project = await prisma.project.findUnique({
      where: { id },
      select: { clientId: true, developerId: true, title: true },
    });

    if (!project || (project.clientId !== userId && project.developerId !== userId)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const receiverId = project.clientId === userId ? project.developerId : project.clientId;

    if (!receiverId) {
      return NextResponse.json(
        { error: "No developer assigned to this project" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        senderId: userId,
        receiverId,
        projectId: id,
        content: content || "",
        fileUrl: fileUrl || null,
        fileName: fileName || null,
      },
      include: {
        sender: { select: { id: true, name: true } },
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: "New Message",
        message: `${message.sender.name} sent a message in project "${project.title}".`,
        type: "INFO",
      },
    });

    return NextResponse.json({
      id: message.id,
      senderId: message.senderId,
      senderName: message.sender.name,
      content: message.content,
      timestamp: message.timestamp.toISOString(),
      fileUrl: message.fileUrl,
      fileName: message.fileName,
    });
  } catch (error: any) {
    console.error("Message send error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
