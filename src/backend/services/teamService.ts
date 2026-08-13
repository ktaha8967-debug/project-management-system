import prisma from "../lib/prisma";

export const teamService = {
  async createTeam(data: { name: string; department: string }) {
    return await prisma.team.create({ data });
  },

  async getAllTeams() {
    return await prisma.team.findMany({
      include: {
        _count: { select: { users: true } }
      }
    });
  },

  async getTeamById(id: string) {
    return await prisma.team.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, fullName: true, role: true, roleType: true, points: true }
        }
      }
    });
  },

  async addUserToTeam(userId: string, teamId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { teamId }
    });
  }
};
