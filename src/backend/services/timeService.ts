import prisma from "../lib/prisma";

export const timeService = {
  async startTimer(taskId: string, userId: string) {
    return await prisma.timeLog.create({
      data: {
        taskId,
        userId,
        startTime: new Date()
      }
    });
  },

  async stopTimer(id: string) {
    const log = await prisma.timeLog.findUnique({ where: { id } });
    if (!log) throw new Error("Time log not found");

    const endTime = new Date();
    const totalTime = Math.floor((endTime.getTime() - log.startTime.getTime()) / 1000);

    return await prisma.timeLog.update({
      where: { id },
      data: {
        endTime,
        totalTime
      }
    });
  },

  async getTaskTimeLogs(taskId: string) {
    return await prisma.timeLog.findMany({
      where: { taskId },
      include: {
        user: { select: { fullName: true } }
      },
      orderBy: { startTime: "desc" }
    });
  },

  async getUserTimeLogs(userId: string) {
    return await prisma.timeLog.findMany({
      where: { userId },
      include: {
        task: { select: { title: true } }
      },
      orderBy: { startTime: "desc" }
    });
  }
};
