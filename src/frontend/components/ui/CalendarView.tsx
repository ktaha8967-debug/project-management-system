"use client";

import { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  deadline: string | null;
  status: string;
  priority: string;
}

interface CalendarViewProps {
  tasks: Task[];
}

export const CalendarView = ({ tasks }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = [];
  const numDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  // Padding for start of month
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= numDays; i++) {
    days.push(new Date(year, month, i));
  }

  const getTasksForDay = (date: Date) => {
    return tasks.filter(t => {
      if (!t.deadline) return false;
      const d = new Date(t.deadline);
      return d.getDate() === date.getDate() && 
             d.getMonth() === date.getMonth() && 
             d.getFullYear() === date.getFullYear();
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">
          {currentDate.toLocaleString('default', { month: 'long' })} {year}
        </h3>
        <div className="flex space-x-2">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[120px]">
        {days.map((date, i) => (
          <div key={i} className={`border-r border-b border-gray-100 p-2 ${!date ? 'bg-gray-50/50' : 'hover:bg-blue-50/30 transition-colors'}`}>
            {date && (
              <>
                <span className={`text-xs font-bold ${
                  date.toDateString() === new Date().toDateString() 
                    ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full' 
                    : 'text-gray-500'
                }`}>
                  {date.getDate()}
                </span>
                <div className="mt-2 space-y-1">
                  {getTasksForDay(date).map(task => (
                    <div key={task.id} className={`px-2 py-1 rounded text-[9px] font-bold border truncate ${
                      task.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' :
                      task.priority === 'HIGH' ? 'bg-red-50 text-red-700 border-red-100' :
                      'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {task.title}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
