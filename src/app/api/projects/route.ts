import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { projectService } from "@/backend/services/projectService";
import { Role } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await projectService.getAllProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized", details: "No session found" }, { status: 401 });
  }

  const user = session.user as any;
  const userRole = user.role;
  const userId = user.id;

  if (userRole === "EMPLOYEE") {
    return NextResponse.json({ 
      error: "Unauthorized", 
      details: `User with role ${userRole} (ID: ${userId}) cannot create projects.` 
    }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "Bad Request", details: "Project name is required" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Internal Server Error", details: "User authentication data missing" }, { status: 500 });
    }

    const project = await projectService.createProject({
      ...body,
      creatorId: userId,
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create project:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message 
    }, { status: 500 });
  }
}
