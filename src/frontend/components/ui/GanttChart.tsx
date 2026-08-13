"use client";

interface Task {
  id: string;
  title: string;
  createdAt: string;
  deadline: string | null;
  status: string;
}

interface Milestone {
  id: string;
  title: string;
  deadline: string;
  status: string;
}

interface GanttChartProps {
  tasks: Task[];
  milestones: Milestone[];
}

export const GanttChart = ({ tasks, milestones }: GanttChartProps) => {
  // Simple Gantt implementation showing time relative to today
  const today = new Date();
  const startRange = new Date(today.getFullYear(), today.getMonth(), 1);
  const endRange = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  const totalDays = (endRange.getTime() - startRange.getTime()) / (1000 * 3600 * 24);

  const getPosition = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const diff = (date.getTime() - startRange.getTime()) / (1000 * 3600 * 24);
    return (diff / totalDays) * 100;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900">Project Timeline (Gantt)</h3>
        <div className="flex items-center space-x-4 text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-sm" />
            <span className="text-gray-500">Tasks</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className="text-gray-500">Milestones</span>
          </div>
        </div>
      </div>

      <div className="relative border-l border-gray-100 pl-4">
        {/* Date Headers */}
        <div className="flex border-b border-gray-50 mb-4 pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-1 text-[10px] font-bold text-gray-400 uppercase">
              Week {i + 1}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Milestones */}
          <div className="space-y-3">
            {milestones.map(m => {
              const pos = getPosition(m.deadline);
              if (pos === null) return null;
              return (
                <div key={m.id} className="relative h-6 group">
                  <div 
                    className={`absolute w-3 h-3 rounded-full top-1/2 -translate-y-1/2 z-10 ${m.status === 'COMPLETED' ? 'bg-green-500' : 'bg-purple-500'}`}
                    style={{ left: `${Math.max(0, Math.min(pos, 100))}%` }}
                    title={m.title}
                  />
                  <div className="ml-0 text-[10px] font-bold text-gray-500 truncate max-w-[150px]">{m.title}</div>
                </div>
              );
            })}
          </div>

          <div className="h-px bg-gray-100 w-full" />

          {/* Tasks */}
          <div className="space-y-3">
            {tasks.filter(t => t.deadline).map(t => {
              const startPos = getPosition(t.createdAt);
              const endPos = getPosition(t.deadline);
              if (startPos === null || endPos === null) return null;
              
              const left = Math.max(0, startPos);
              const width = Math.max(2, endPos - left);

              return (
                <div key={t.id} className="relative h-6 group">
                  <div className="text-[10px] font-medium text-gray-400 absolute -top-4 truncate max-w-[200px]">{t.title}</div>
                  <div 
                    className={`absolute h-2 rounded-full top-1/2 -translate-y-1/2 ${t.status === 'APPROVED' ? 'bg-green-400' : 'bg-blue-400'}`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Today Marker */}
        <div 
          className="absolute top-0 bottom-0 w-px bg-red-400 z-20 border-l border-dashed border-red-200"
          style={{ left: `${getPosition(today.toISOString())}%` }}
        >
          <div className="absolute -top-6 -left-4 text-[8px] font-bold text-red-500 uppercase">Today</div>
        </div>
      </div>
    </div>
  );
};
