import prisma from "../lib/prisma";

export const performanceService = {
  async getUserStats(userId: string) {
    const tasks = await prisma.task.findMany({
      where: { assigneeId: userId }
    });

    const completed = tasks.filter(t => t.status === "APPROVED").length;
    const delayed = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== "APPROVED").length;
    
    // Average completion time (mocked logic or needs more complex query)
    const timeLogs = await prisma.timeLog.findMany({
      where: { userId, endTime: { not: null } }
    });
    
    const totalSeconds = timeLogs.reduce((acc, log) => acc + (log.totalTime || 0), 0);
    const avgTime = timeLogs.length > 0 ? totalSeconds / timeLogs.length : 0;

    return {
      totalAssigned: tasks.length,
      completed,
      delayed,
      avgCompletionTimeSeconds: avgTime,
      productivityScore: tasks.length > 0 ? (completed / tasks.length) * 100 : 0
    };
  },

  async getTeamLeaderboard() {
    return await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        points: true,
        team: { select: { name: true } }
      },
      orderBy: { points: "desc" },
      take: 10
    });
  },

  async generateDailyReport(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const completedToday = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: "APPROVED",
        updatedAt: { gte: startOfDay }
      }
    });

    const timeSpentToday = await prisma.timeLog.findMany({
      where: {
        userId,
        startTime: { gte: startOfDay },
        endTime: { not: null }
      }
    });

    return {
      completedCount: completedToday.length,
      totalTimeSeconds: timeSpentToday.reduce((acc, log) => acc + (log.totalTime || 0), 0),
      pendingCount: await prisma.task.count({
        where: { assigneeId: userId, status: { not: "APPROVED" } }
      })
    };
  }
};
