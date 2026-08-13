import prisma from "../lib/prisma";
import { TaskType, Priority, TaskStatus } from "@prisma/client";
import { socketService } from "./socketService";
import { notificationService } from "./notificationService";

export const taskService = {
  async getAllTasks(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        skip,
        take: limit,
        include: {
          project: {
            select: { name: true },
          },
          assignedTo: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.task.count()
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getTasksByProject(projectId: string) {
    return await prisma.task.findMany({
      where: { projectId },
      include: {
        assignedTo: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async createTask(data: {
    projectId: string;
    title: string;
    description?: string;
    type: TaskType;
    assigneeId: string;
    deadline?: Date;
    priority?: Priority;
    estimatedTime?: number;
  }) {
    const task = await prisma.task.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        type: data.type,
        assigneeId: data.assigneeId,
        deadline: data.deadline,
        priority: data.priority || Priority.MEDIUM,
        status: TaskStatus.TODO,
        estimatedTime: data.estimatedTime,
      },
    });

    // Emit event
    socketService.emitToProject(data.projectId, "task:created", task);
    socketService.emitToUser(data.assigneeId, "task:assigned", task);

    // Create notification
    await notificationService.createNotification({
      userId: data.assigneeId,
      title: "New Task Assigned",
      message: `You have been assigned to task: ${data.title}`,
      type: "TASK"
    });

    return task;
  },

  async updateTaskStatus(id: string, status: TaskStatus) {
    const task = await prisma.task.update({
      where: { id },
      data: { status },
    });

    socketService.emitToProject(task.projectId, "task:updated", task);
    return task;
  },

  async assignTask(id: string, assigneeId: string) {
    const task = await prisma.task.update({
      where: { id },
      data: { assigneeId },
    });

    socketService.emitToProject(task.projectId, "task:updated", task);
    socketService.emitToUser(assigneeId, "task:assigned", task);

    return task;
  },

  async getTaskWithSubmissions(id: string) {
    return await prisma.task.findUnique({
      where: { id },
      include: {
        submissions: {
          include: {
            user: {
              select: { fullName: true, email: true },
            },
            comments: {
              include: {
                user: {
                  select: { fullName: true, role: true },
                },
              },
            },
          },
          orderBy: { versionNumber: "desc" },
        },
      },
    });
  },
};
