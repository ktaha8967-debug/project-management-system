"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCircle2, AlertTriangle, Info, Clock } from "@/frontend/components/ui/Icons";
import { useSession } from "next-auth/react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
}

export const NotificationBell = () => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === "CRITICAL") return <AlertTriangle className="w-4 h-4 text-red-600" />;
    switch (type) {
      case "TASK": return <Clock className="w-4 h-4 text-blue-500" />;
      case "REVIEW": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "COMMENT": return <Info className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "CRITICAL": return "border-l-4 border-l-red-500 bg-red-50/30";
      case "NORMAL": return "border-l-4 border-l-blue-500 bg-blue-50/10";
      case "INFO": return "border-l-4 border-l-gray-300";
      default: return "";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 focus:ring-4 focus:ring-gray-300 relative transition-all"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-600 rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Inbox</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-tighter"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center">
                <Bell className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-medium">All caught up! ✨</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-4 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !n.isRead ? "bg-blue-50/30" : ""
                  } ${getPriorityStyle(n.priority)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">{getNotificationIcon(n.type, n.priority)}</div>
                    <div className="flex-1">
                      <div className="text-[13px] font-bold text-gray-900 leading-tight">
                        {n.priority === "CRITICAL" && <span className="text-[8px] font-black text-red-600 bg-red-50 px-1 rounded mr-1 uppercase">Urgent</span>}
                        {n.title}
                      </div>
                      <div className="text-[11px] text-gray-600 mt-1 line-clamp-2">{n.message}</div>
                      <div className="text-[9px] text-gray-400 mt-2 font-bold uppercase tracking-widest">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t border-gray-50 bg-gray-50/30 text-center">
             <Link href="/dashboard/settings" className="text-[10px] font-bold text-gray-400 hover:text-blue-600 uppercase tracking-widest">Manage Alerts</Link>
          </div>
        </div>
      )}
    </div>
  );
};
