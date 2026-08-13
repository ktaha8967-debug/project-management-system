import prisma from "../lib/prisma";
import { gamificationService } from "./gamificationService";
import { socketService } from "./socketService";
import { notificationService } from "./notificationService";

export const submissionService = {
  async createSubmission(data: {
    taskId: string;
    userId: string;
    content: string;
    previewUrl?: string;
  }) {
    // Get current version number
    const lastSubmission = await prisma.submission.findFirst({
      where: { taskId: data.taskId },
      orderBy: { versionNumber: "desc" },
    });

    const versionNumber = (lastSubmission?.versionNumber || 0) + 1;

    const submission = await prisma.submission.create({
      data: {
        taskId: data.taskId,
        userId: data.userId,
        content: data.content,
        previewUrl: data.previewUrl,
        versionNumber,
        status: "PENDING",
      },
      include: {
        task: { include: { project: true } }
      }
    });

    // Update task status
    await prisma.task.update({
      where: { id: data.taskId },
      data: { status: "SUBMITTED" },
    });

    // Emit event
    socketService.emitToProject(submission.task.projectId, "submission:created", submission);
    
    // Notify admins
    socketService.emitAll("admin:new_submission", submission);

    return submission;
  },

  async updateSubmissionStatus(id: string, status: string, adminId: string) {
    const submission = await prisma.submission.update({
      where: { id },
      data: { status },
      include: { 
        task: true,
        user: { select: { fullName: true } }
      },
    });

    // Sync task status
    let taskStatus: string;
    switch (status) {
      case "APPROVED":
        taskStatus = "APPROVED";
        
        // Award points for approval
        await gamificationService.awardPoints(submission.userId, 100);

        // If it's an email template, add to library
        if (submission.task.type === "EMAIL_TEMPLATE") {
          await prisma.templateLibrary.create({
            data: {
              name: submission.task.title,
              category: "MARKETING",
              htmlCode: submission.content,
              previewUrl: submission.previewUrl,
              approvedBy: adminId,
            }
          });
        }
        break;
      case "REVISION_REQUESTED":
        taskStatus = "NEEDS_REVISION";
        break;
      case "UNDER_REVIEW":
        taskStatus = "UNDER_REVIEW";
        break;
      case "REJECTED":
        taskStatus = "NEEDS_REVISION";
        break;
      default:
        taskStatus = "SUBMITTED";
    }

    await prisma.task.update({
      where: { id: submission.taskId },
      data: { status: taskStatus },
    });

    // Emit events
    socketService.emitToUser(submission.userId, "review:completed", { submission, status });
    socketService.emitToProject(submission.task.projectId, "task:updated", { taskId: submission.taskId, status: taskStatus });

    // Create notification
    await notificationService.createNotification({
      userId: submission.userId,
      title: "Work Reviewed",
      message: `Your submission for "${submission.task.title}" has been ${status.toLowerCase()}`,
      type: "REVIEW"
    });

    return submission;
  },

  async getSubmissionsByTask(taskId: string) {
    return await prisma.submission.findMany({
      where: { taskId },
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
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { versionNumber: "desc" },
    });
  },

  async getAllSubmissions() {
    return await prisma.submission.findMany({
      include: {
        task: {
          include: {
            project: { select: { name: true } },
          },
        },
        user: {
          select: { fullName: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getSubmissionById(id: string) {
    return await prisma.submission.findUnique({
      where: { id },
      include: {
        task: {
          include: {
            project: { select: { name: true } },
          },
        },
        user: {
          select: { fullName: true, email: true },
        },
        comments: {
          include: {
            user: {
              select: { fullName: true, role: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  },
};
