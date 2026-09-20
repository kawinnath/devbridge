import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, taskId } = await params;
    const { status } = await request.json();

    const validStatuses = ["PENDING", "IN_PROGRESS", "UNDER_REVIEW", "COMPLETED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Verify project access
    const project = await prisma.project.findUnique({
      where: { id },
      select: { clientId: true, developerId: true, title: true },
    });

    if (!project || (project.clientId !== userId && project.developerId !== userId)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const task = await prisma.task.update({
      where: { id: taskId, projectId: id },
      data: { status },
    });

    // Notify the other party
    const notifyUserId = project.clientId === userId ? project.developerId : project.clientId;
    if (notifyUserId) {
      await prisma.notification.create({
        data: {
          userId: notifyUserId,
          title: "Task Status Updated",
          message: `Task "${task.name}" in project "${project.title}" is now "${status}".`,
          type: "PROJECT",
        },
      });
    }

    return NextResponse.json({
      id: task.id,
      name: task.name,
      status: task.status,
    });
  } catch (error: any) {
    console.error("Task update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
