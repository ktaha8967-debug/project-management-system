import prisma from "../lib/prisma";
import { socketService } from "./socketService";
import { notificationService } from "./notificationService";

export const commentService = {
  async addComment(data: {
    submissionId: string;
    userId: string;
    content: string;
  }) {
    const comment = await prisma.comment.create({
      data: {
        submissionId: data.submissionId,
        userId: data.userId,
        content: data.content,
      },
      include: {
        submission: {
          include: { task: true }
        },
        user: { select: { fullName: true } }
      }
    });

    // Emit event
    socketService.emitToProject(comment.submission.task.projectId, "comment:added", comment);

    // Notify the submission owner if they are not the commenter
    if (comment.submission.userId !== data.userId) {
      await notificationService.createNotification({
        userId: comment.submission.userId,
        title: "New Comment",
        message: `${comment.user.fullName} commented on your submission for "${comment.submission.task.title}"`,
        type: "COMMENT"
      });
    }

    return comment;
  },

  async getCommentsBySubmission(submissionId: string) {
    return await prisma.comment.findMany({
      where: { submissionId },
      include: {
        user: {
          select: { fullName: true, role: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  },
};
