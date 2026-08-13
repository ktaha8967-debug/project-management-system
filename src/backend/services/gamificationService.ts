import prisma from "../lib/prisma";

export const gamificationService = {
  async awardPoints(userId: string, points: number) {
    return await prisma.user.update({
      where: { id: userId },
      data: { points: { increment: points } }
    });
  },

  async awardBadge(userId: string, badgeId: string) {
    return await prisma.userBadge.create({
      data: { userId, badgeId }
    });
  },

  async getAvailableBadges() {
    return await prisma.badge.findMany();
  },

  async getUserBadges(userId: string) {
    return await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true }
    });
  }
};
