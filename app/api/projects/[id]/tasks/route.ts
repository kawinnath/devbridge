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

    const tasks = await prisma.task.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      tasks.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        assignedDate: t.assignedDate.toISOString(),
        deadline: t.deadline?.toISOString() || null,
        status: t.status,
      }))
    );
  } catch (error: any) {
    console.error("Tasks fetch error:", error);
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
    const { name, description, deadline } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Task name is required" },
        { status: 400 }
      );
    }

    // Verify project access (client or developer can create tasks)
    const project = await prisma.project.findUnique({
      where: { id },
      select: { clientId: true, developerId: true, title: true },
    });

    if (!project || (project.clientId !== userId && project.developerId !== userId)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const task = await prisma.task.create({
      data: {
        projectId: id,
        name,
        description: description || "",
        deadline: deadline ? new Date(deadline) : null,
        status: "PENDING",
      },
    });

    // Notify the other party
    const notifyUserId = project.clientId === userId ? project.developerId : project.clientId;
    if (notifyUserId) {
      await prisma.notification.create({
        data: {
          userId: notifyUserId,
          title: "New Task Created",
          message: `New task "${name}" added to project "${project.title}".`,
          type: "PROJECT",
        },
      });
    }

    return NextResponse.json({
      id: task.id,
      name: task.name,
      description: task.description,
      assignedDate: task.assignedDate.toISOString(),
      deadline: task.deadline?.toISOString() || null,
      status: task.status,
    });
  } catch (error: any) {
    console.error("Task creation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
