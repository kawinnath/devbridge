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

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: {
          select: { id: true, name: true, email: true, trustScore: true },
        },
        developer: {
          select: { id: true, name: true, email: true, trustScore: true },
        },
        tasks: {
          orderBy: { createdAt: "asc" },
        },
        messages: {
          orderBy: { timestamp: "asc" },
          include: {
            sender: { select: { id: true, name: true } },
          },
        },
        proposals: {
          where: { status: "HIRED" },
          include: {
            developer: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Verify access
    // If project is OPEN, it's public.
    // If not, only client, assigned developer, or admin can view.
    if (project.status !== "OPEN" && project.clientId !== userId && project.developerId !== userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    return NextResponse.json({
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category,
      skills: project.skills,
      budget: project.budget,
      deadline: project.deadline,
      status: project.status,
      priority: project.priority,
      progress: project.progress,
      advancePaid: project.advancePaid,
      remainingBalance: project.remainingBalance,
      acceptedAmount: project.acceptedAmount,
      createdAt: project.createdAt.toISOString(),
      client: project.client,
      developer: project.developer,
      tasks: project.tasks.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        assignedDate: t.assignedDate.toISOString(),
        deadline: t.deadline?.toISOString() || null,
        status: t.status,
      })),
      messages: project.messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        senderName: m.sender.name,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
        isRead: m.isRead,
        fileUrl: m.fileUrl,
        fileName: m.fileName,
      })),
    });
  } catch (error: any) {
    console.error("Project fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Verify access
    if (project.clientId !== userId && project.developerId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const updateData: any = {};

    // Fields updatable by both client and developer
    if (body.status !== undefined) updateData.status = body.status;
    if (body.progress !== undefined) updateData.progress = Math.min(100, Math.max(0, Number(body.progress)));

    // Fields only client can update
    if (project.clientId === userId) {
      if (body.priority !== undefined) updateData.priority = body.priority;
      if (body.advancePaid !== undefined) updateData.advancePaid = Number(body.advancePaid);
      if (body.acceptedAmount !== undefined) updateData.acceptedAmount = Number(body.acceptedAmount);
      if (body.budget !== undefined) updateData.budget = Number(body.budget);
      if (body.developerId !== undefined) updateData.developerId = body.developerId;
    }

    // Recalculate remaining balance
    if (updateData.advancePaid !== undefined || updateData.budget !== undefined) {
      const newBudget = updateData.budget || project.budget;
      const newAdvance = updateData.advancePaid !== undefined ? updateData.advancePaid : project.advancePaid;
      updateData.remainingBalance = newBudget - newAdvance;
    }

    const updated = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    // Create notification for the other party
    const notifyUserId = project.clientId === userId ? project.developerId : project.clientId;
    if (notifyUserId) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
      await prisma.notification.create({
        data: {
          userId: notifyUserId,
          title: "Project Updated",
          message: `${user?.name || "Someone"} updated project "${project.title}". ${body.progress !== undefined ? `Progress: ${body.progress}%` : ""} ${body.status ? `Status: ${body.status}` : ""}`,
          type: "PROJECT",
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Project update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
