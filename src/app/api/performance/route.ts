import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { performanceService } from "@/backend/services/performanceService";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // stats, leaderboard, report

  try {
    if (type === "leaderboard") {
      const leaderboard = await performanceService.getTeamLeaderboard();
      return NextResponse.json(leaderboard);
    }
    if (type === "report") {
      const report = await performanceService.generateDailyReport((session.user as any).id);
      return NextResponse.json(report);
    }
    const stats = await performanceService.getUserStats((session.user as any).id);
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
