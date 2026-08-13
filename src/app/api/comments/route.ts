import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { commentService } from "@/backend/services/commentService";
import { notificationService } from "@/backend/services/notificationService";
import { submissionService } from "@/backend/services/submissionService";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { submissionId, content } = body;

    const comment = await commentService.addComment({
      submissionId,
      userId: (session.user as any).id,
      content,
    });

    // Notify the submitter if the commenter is someone else
    const submission = await submissionService.getSubmissionById(submissionId);
    if (submission && submission.userId !== (session.user as any).id) {
      await notificationService.createNotification({
        userId: submission.userId,
        title: "New Comment",
        message: `${session.user?.name || "Someone"} commented on your submission.`,
        type: "COMMENT",
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}
