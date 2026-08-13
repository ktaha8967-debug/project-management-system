import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { timeService } from "@/backend/services/timeService";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { taskId, stop, logId } = body;

    if (stop && logId) {
      const log = await timeService.stopTimer(logId);
      return NextResponse.json(log);
    }

    const log = await timeService.startTimer(taskId, (session.user as any).id);
    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId");

  try {
    if (taskId) {
      const logs = await timeService.getTaskTimeLogs(taskId);
      return NextResponse.json(logs);
    }
    const logs = await timeService.getUserTimeLogs((session.user as any).id);
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
