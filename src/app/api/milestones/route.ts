import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { milestoneService } from "@/backend/services/milestoneService";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const milestone = await milestoneService.createMilestone({
      ...body,
      deadline: new Date(body.deadline)
    });
    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  try {
    if (!projectId) return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    const milestones = await milestoneService.getProjectMilestones(projectId);
    return NextResponse.json(milestones);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
