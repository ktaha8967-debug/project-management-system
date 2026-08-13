import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { prisma } from "@/backend/lib/prisma";
import { ruleEngineService } from "@/backend/services/ruleEngineService";
import Link from "next/link";
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight,
  Zap,
  Layout,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  UserCheck,
  BarChart3,
  Activity,
  History
} from "@/frontend/components/ui/Icons";
import { EmptyState } from "@/frontend/components/ui/EmptyState";
import { Button } from "@/frontend/components/ui/Button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const user = session.user as any;
  const userRole = user.role || "EMPLOYEE";
  const isManager = userRole === "ADMIN" || userRole === "BDM";

  // Data for Command Center
  const [
    myTasks,
    recentSubmissions,
    executiveDashboard,
    criticalAlerts,
    performanceScore
  ] = await Promise.all([
    prisma.task.findMany({ 
      where: { assigneeId: user.id, status: { notIn: ["APPROVED", "REJECTED"] } },
      include: { project: { select: { name: true } } },
      take: 4,
      orderBy: { deadline: "asc" }
    }),
    prisma.submission.findMany({
      where: { userId: user.id },
      include: { task: { select: { title: true } } },
      take: 3,
      orderBy: { createdAt: "desc" }
    }),
    isManager ? ruleEngineService.getExecutiveDashboard() : null,
    ruleEngineService.getSmartAlerts(),
    ruleEngineService.calculatePerformanceScore(user.id)
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 8. SYSTEM TRUST LAYER & WELCOME */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            Hey, {user?.name.split(' ')[0]}! <Sparkles className="w-5 h-5 text-yellow-500" />
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 uppercase tracking-tighter">
              <Activity className="w-3 h-3 mr-1" /> System Healthy
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
              Last Synced: Just Now
            </span>
          </div>
        </div>
        
        {/* Quick Actions (Action-First) */}
        <div className="flex items-center gap-2">
          {isManager && (
            <Button variant="outline" size="sm" className="font-bold text-xs h-9">
              <TrendingUp className="w-4 h-4 mr-2" /> Team Report
            </Button>
          )}
          <Link href="/dashboard/tasks">
            <Button size="sm" className="font-bold text-xs h-9">
              <Zap className="w-4 h-4 mr-2" /> Start Work
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Main Focus Area */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. ROLE-BASED SIMPLICITY: EMPLOYEE VIEW */}
          {!isManager ? (
            <div className="space-y-8">
              {/* Today's High Priority Focus */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center">
                      <Layout className="w-4 h-4 mr-2 text-blue-600" />
                      My Active Focus
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Tasks waiting for your expertise</p>
                  </div>
                  <Link href="/dashboard/tasks" className="text-xs font-bold text-blue-600 hover:underline bg-blue-50 px-3 py-1 rounded-full transition-all">View All Work</Link>
                </div>
                <div className="p-8">
                  {myTasks.length === 0 ? (
                    <EmptyState 
                      title="All Caught Up!" 
                      description="You have no pending tasks. Great job! Enjoy the break or check knowledge base." 
                      type="success"
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myTasks.map((task) => (
                        <div key={task.id} className="p-5 border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-lg transition-all group relative overflow-hidden bg-gray-50/20">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tighter">{task.project.name}</span>
                            {task.deadline && new Date(task.deadline) < new Date() && (
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase tracking-tighter">Overdue</span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-gray-900 mb-4">{task.title}</h4>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-gray-500 font-medium">
                              <Clock className="w-3.5 h-3.5 mr-1" />
                              {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No Deadline'}
                            </div>
                            <Link href={`/dashboard/projects/${task.projectId}`} className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Waiting for Review (Recent Submissions) */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center">
                    <History className="w-4 h-4 mr-2 text-purple-600" />
                    Waiting for Review
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {recentSubmissions.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm italic font-medium">No recent submissions.</div>
                  ) : (
                    recentSubmissions.map((sub) => (
                      <div key={sub.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{sub.task.title}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Submitted {new Date(sub.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter border ${
                          sub.status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' :
                          sub.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
                          'bg-yellow-50 text-yellow-600 border-yellow-100'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* 1. ROLE-BASED SIMPLICITY: MANAGER VIEW */
            <div className="space-y-8">
              {/* Executive Command: Team & Company Health */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center text-center">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Company Health Score</h4>
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <svg className="w-32 h-32">
                      <circle className="text-gray-100" strokeWidth="10" stroke="currentColor" fill="transparent" r="54" cx="64" cy="64" />
                      <circle className="text-blue-600 transition-all duration-1000" strokeWidth="10" strokeDasharray={339} strokeDashoffset={339 - (339 * (executiveDashboard?.companyHealthScore || 0)) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="54" cx="64" cy="64" />
                    </svg>
                    <span className="absolute text-3xl font-black text-gray-900">{executiveDashboard?.companyHealthScore}%</span>
                  </div>
                  <p className="text-sm font-bold text-gray-600">Overall Efficiency</p>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Team Load Summary</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                      <span className="text-sm font-bold text-gray-700">Overloaded</span>
                      <span className="text-sm font-black text-red-600">{executiveDashboard?.overloadedEmployees.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                      <span className="text-sm font-bold text-gray-700">At Risk Projects</span>
                      <span className="text-sm font-black text-orange-600">{executiveDashboard?.atRiskProjects.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                      <span className="text-sm font-bold text-gray-700">Top Performer</span>
                      <span className="text-xs font-black text-blue-600 uppercase truncate max-w-[120px]">
                        {executiveDashboard?.weeklySummary.topPerformer?.name || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Center: Critical Alerts */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between bg-red-50/30">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                    Critical Risk Center
                  </h3>
                  <span className="text-[10px] font-black text-red-600 bg-white border border-red-100 px-3 py-1 rounded-full">
                    {criticalAlerts.length} Active Risks
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {criticalAlerts.length === 0 ? (
                    <EmptyState 
                      title="No Risks Detected" 
                      description="The system is running smoothly with no critical alerts or overloaded resources." 
                      type="success"
                    />
                  ) : (
                    criticalAlerts.slice(0, 5).map((alert, idx) => (
                      <div key={idx} className="p-5 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2.5 rounded-xl ${
                            alert.type === 'PROJECT_RISK' ? 'bg-orange-100 text-orange-600' : 
                            alert.type === 'EMPLOYEE_OVERLOADED' ? 'bg-red-100 text-red-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{alert.message}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                              {alert.assignee ? `Assigned to: ${alert.assignee}` : 'Critical Priority'}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-all h-8 text-[10px] font-black uppercase tracking-tighter">
                          Resolve
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Performance & System Stats */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Personal Performance Card */}
          <div className="bg-gradient-to-br from-gray-900 to-blue-950 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 text-center">
              <h4 className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mb-8">Performance Score</h4>
              <div className="relative inline-flex items-center justify-center mb-6">
                <svg className="w-40 h-40">
                  <circle className="text-white/5" strokeWidth="12" stroke="currentColor" fill="transparent" r="70" cx="80" cy="80" />
                  <circle className="text-blue-500 transition-all duration-1000" strokeWidth="12" strokeDasharray={440} strokeDashoffset={440 - (440 * performanceScore) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="70" cx="80" cy="80" />
                </svg>
                <span className="absolute text-5xl font-black">{performanceScore}</span>
              </div>
              <p className="text-sm font-bold text-blue-100">
                {performanceScore > 80 ? "Rockstar Level 🚀" : performanceScore > 50 ? "Steady Growth 👍" : "Needs Review ⚠️"}
              </p>
            </div>
            <Zap className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/5 rotate-12" />
          </div>

          {/* 9. ONBOARDING / TIPS (HUMAN UX) */}
          <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest">BritSync Tip</h4>
            </div>
            <p className="text-sm text-blue-800 font-medium leading-relaxed">
              {userRole === 'EMPLOYEE' 
                ? "Try using the 'Focus Mode' in your tasks list to eliminate distractions and finish work 20% faster."
                : "The Executive Dashboard updates in real-time. Use it to spot bottlenecks before they delay projects."}
            </p>
            <Button variant="outline" size="sm" className="mt-6 w-full border-blue-200 text-blue-700 font-bold hover:bg-blue-100">
              Learn More
            </Button>
          </div>

          {/* Quick Support / Feedback */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-gray-700">Need help?</span>
            </div>
            <Button variant="secondary" size="sm" className="text-xs font-bold rounded-xl">Chat</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
