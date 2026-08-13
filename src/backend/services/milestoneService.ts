import prisma from "../lib/prisma";

export const milestoneService = {
  async createMilestone(data: { projectId: string; title: string; deadline: Date }) {
    return await prisma.milestone.create({ data });
  },

  async getProjectMilestones(projectId: string) {
    return await prisma.milestone.findMany({
      where: { projectId },
      orderBy: { deadline: "asc" }
    });
  },

  async updateMilestoneStatus(id: string, status: string) {
    return await prisma.milestone.update({
      where: { id },
      data: { status }
    });
  }
};
