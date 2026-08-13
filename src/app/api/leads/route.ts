import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import prisma from "@/backend/lib/prisma";
import { taskService } from "@/backend/services/taskService";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const leads = await prisma.lead.findMany({
      include: {
        assignedTo: {
          select: { fullName: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const lead = await prisma.lead.create({
      data: {
        ...body,
        assigneeId: (session.user as any).id
      }
    });

    // FLOW 1: Lead created → Auto-create task: "Create outreach email"
    // Find or create an internal project for CRM tasks
    let project = await prisma.project.findFirst({
      where: { type: "INTERNAL" }
    });

    if (!project) {
      project = await prisma.project.findFirst();
    }

    if (project) {
      await taskService.createTask({
        projectId: project.id,
        title: `Create outreach email for ${lead.name}`,
        description: `Follow up with lead: ${lead.email}`,
        type: "EMAIL_TEMPLATE",
        assigneeId: (session.user as any).id,
        priority: "MEDIUM"
      });
    }

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}
