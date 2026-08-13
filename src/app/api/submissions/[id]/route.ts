import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { submissionService } from "@/backend/services/submissionService";
import { notificationService } from "@/backend/services/notificationService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const submission = await submissionService.getSubmissionById(id);
    if (!submission) return NextResponse.json({ error: "Not Found" }, { status: 404 });
    return NextResponse.json(submission);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "BDM") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const submission = await submissionService.updateSubmissionStatus(
      id,
      status,
      (session.user as any).id
    );

    // Notify the user who submitted
    await notificationService.createNotification({
      userId: submission.userId,
      title: `Submission ${status.replace('_', ' ')}`,
      message: `Your submission for task "${(submission as any).task.title}" has been ${status.toLowerCase().replace('_', ' ')}.`,
      type: "REVIEW",
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error updating submission status:", error);
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}
