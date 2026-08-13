import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { submissionService } from "@/backend/services/submissionService";
import { notificationService } from "@/backend/services/notificationService";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId");

  try {
    if (taskId) {
      const submissions = await submissionService.getSubmissionsByTask(taskId);
      return NextResponse.json(submissions);
    }
    
    // For admin/reviews page
    const submissions = await submissionService.getAllSubmissions();
    return NextResponse.json(submissions);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const submission = await submissionService.createSubmission({
      ...body,
      userId: (session.user as any).id,
    });

    // Notify admins/BDMs
    // In a real app, we'd fetch users with ADMIN/BDM roles. For now, let's just create a generic notification logic
    // or assume we have a way to find who needs to be notified.
    // For simplicity, let's notify the project creator? Or just log for now.

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}
