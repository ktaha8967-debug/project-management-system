import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { ruleEngineService } from "@/backend/services/ruleEngineService";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // dashboard, decision, alerts, weekly, performance, progress, time-analysis

  try {
    switch (type) {
      case "dashboard":
        return NextResponse.json(await ruleEngineService.getExecutiveDashboard());
      case "decision":
        return NextResponse.json(await ruleEngineService.getDecisionSupport());
      case "alerts":
        return NextResponse.json(await ruleEngineService.getSmartAlerts());
      case "weekly":
        return NextResponse.json(await ruleEngineService.generateWeeklyReport());
      case "performance":
        const userId = searchParams.get("userId") || (session.user as any).id;
        return NextResponse.json({ score: await ruleEngineService.calculatePerformanceScore(userId) });
      case "progress":
        const projectId = searchParams.get("projectId");
        if (!projectId) return NextResponse.json({ error: "projectId is required" }, { status: 400 });
        return NextResponse.json(await ruleEngineService.getProjectProgress(projectId));
      case "time-analysis":
        const taskId = searchParams.get("taskId");
        if (!taskId) return NextResponse.json({ error: "taskId is required" }, { status: 400 });
        return NextResponse.json(await ruleEngineService.getTaskTimeAnalysis(taskId));
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Rule Engine Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
