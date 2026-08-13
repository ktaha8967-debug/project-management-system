import prisma from "../lib/prisma";
import { socketService } from "./socketService";

export const notificationService = {
  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: "TASK" | "REVIEW" | "COMMENT";
    priority?: "CRITICAL" | "NORMAL" | "INFO";
  }) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority || "NORMAL",
      },
    });

    // Emit real-time notification
    socketService.emitToUser(data.userId, "notification:new", notification);

    return notification;
  },

  async getNotificationsByUser(userId: string) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async markAsRead(id: string) {
    return await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  },

  async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },
};
