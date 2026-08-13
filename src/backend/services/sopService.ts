import prisma from "../lib/prisma";

export const sopService = {
  async createSOP(data: { title: string; content: string; category: string }) {
    return await prisma.sOP.create({ data });
  },

  async searchSOPs(query: string) {
    return await prisma.sOP.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
          { category: { contains: query } }
        ]
      }
    });
  },

  async getAllSOPs() {
    return await prisma.sOP.findMany({
      orderBy: { createdAt: "desc" }
    });
  }
};
