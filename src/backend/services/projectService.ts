import prisma from "../lib/prisma";

export const projectService = {
  async getAllProjects(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        skip,
        take: limit,
        include: {
          _count: {
            select: { tasks: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count()
    ]);

    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getProjectById(id: string) {
    return await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: true,
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  },

  async createProject(data: {
    name: string;
    type: string;
    description?: string;
    creatorId: string;
  }) {
    return await prisma.project.create({
      data: {
        name: data.name,
        type: data.type,
        description: data.description,
        creatorId: data.creatorId,
      },
    });
  },

  async updateProject(
    id: string,
    data: { name?: string; type?: string; description?: string }
  ) {
    return await prisma.project.update({
      where: { id },
      data,
    });
  },

  async deleteProject(id: string) {
    return await prisma.project.delete({
      where: { id },
    });
  },
};
