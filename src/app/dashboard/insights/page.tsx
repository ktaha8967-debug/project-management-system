import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { ruleEngineService } from "@/backend/services/ruleEngineService";
import { 
  BarChart3, 
  AlertTriangle, 
  TrendingUp, 
  UserCheck, 
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight
} from "@/frontend/components/ui/Icons";
import Link from "next/link";

export default async function InsightsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const dashboardData = await ruleEngineService.getExecutiveDashboard();
  const decisionSupport = await ruleEngineService.getDecisionSupport();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Executive Insights</h1>
        <p className="text-gray-500">Logic-based analysis and decision support.</p>
      </div>

      {/* Health Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Company Health Score</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-bold text-gray-900">{dashboardData.companyHealthScore}%</span>
            <span className="text-sm text-gray-500 mb-1">Overall progress</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full mt-4">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${dashboardData.companyHealthScore}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">At-Risk Projects</span>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-bold text-gray-900">{dashboardData.atRiskProjects.length}</span>
            <span className="text-sm text-gray-500 mb-1">Requiring attention</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Overloaded Employees</span>
            <AlertCircle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-bold text-gray-900">{dashboardData.overloadedEmployees.length}</span>
            <span className="text-sm text-gray-500 mb-1">Potential bottlenecks</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Decision Support Panel */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <UserCheck className="w-5 h-5 mr-2 text-blue-600" />
            Decision Support Panel
          </h3>
          <div className="space-y-4">
            {decisionSupport.suggestions.map((suggestion, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg text-blue-800 text-sm font-medium">
                <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{suggestion}</span>
              </div>
            ))}
            {decisionSupport.suggestions.length === 0 && (
              <p className="text-gray-500 italic text-center py-4">No critical suggestions at this time.</p>
            )}
          </div>
        </div>

        {/* Smart Alert System */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
            Smart Alert System
          </h3>
          <div className="space-y-3">
            {decisionSupport.alerts.map((alert, idx) => (
              <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${
                alert.type === 'TASK_OVERDUE' ? 'border-red-100 bg-red-50 text-red-800' :
                alert.type === 'PROJECT_RISK' ? 'border-orange-100 bg-orange-50 text-orange-800' :
                'border-blue-100 bg-blue-50 text-blue-800'
              }`}>
                <div className="flex items-center space-x-3">
                  {alert.type === 'TASK_OVERDUE' ? <Clock className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span className="text-sm font-semibold">{alert.message}</span>
                </div>
                {alert.assignee && <span className="text-xs opacity-70">Assignee: {alert.assignee}</span>}
              </div>
            ))}
            {decisionSupport.alerts.length === 0 && (
              <div className="text-center py-10">
                <CheckCircle className="w-10 h-10 text-green-200 mx-auto mb-2" />
                <p className="text-gray-500">All systems normal. No active alerts.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Summary & Leaderboard */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
          Weekly Team Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Performance Score</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Risk Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.weeklySummary.teamPerformance.map((item) => (
                <tr key={item.userId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-100 h-1.5 w-24 rounded-full overflow-hidden">
                        <div className={`h-full ${item.score > 70 ? 'bg-green-500' : item.score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${item.score}%` }}></div>
                      </div>
                      <span className="font-bold">{item.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      item.score < 40 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {item.score < 40 ? 'Underperforming' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/dashboard/performance?userId=${item.userId}`} className="text-blue-600 hover:text-blue-900">Details</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
