"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { NotificationBell } from "../ui/NotificationBell";
import { useSocket } from "../providers/SocketProvider";
import { CheckCircle2, AlertCircle, RefreshCw, Menu, X } from "@/frontend/components/ui/Icons";
import { useState, useEffect } from "react";
import { useUI } from "../providers/UIProvider";

export const Navbar = () => {
  const { data: session } = useSession();
  const { isConnected, isPolling } = useSocket();
  const { toggleSidebar, isSidebarOpen } = useUI();
  const [lastSync, setLastSync] = useState<string>("Just now");

  useEffect(() => {
    const interval = setInterval(() => {
      setLastSync("Few seconds ago");
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleSidebar}
              className="p-2 mr-2 text-gray-600 rounded-lg cursor-pointer lg:hidden hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:ring-2 focus:ring-gray-100"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/" className="flex ml-2 md:mr-12">
              <span className="self-center text-xl font-bold sm:text-2xl whitespace-nowrap text-blue-600 tracking-tight">
                BritSync<span className="text-gray-400 font-light">Unified</span>
              </span>
            </Link>
            
            {/* System Trust Indicator */}
            <div className="hidden md:flex items-center space-x-4 ml-8 border-l pl-8 border-gray-100">
              <div className="flex items-center space-x-1.5">
                {isConnected ? (
                  <div className="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">System Healthy</span>
                  </div>
                ) : (
                  <div className="flex items-center text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{isPolling ? 'Polling Mode' : 'Connecting...'}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center text-gray-400 text-[11px] font-medium">
                <RefreshCw className={`w-3 h-3 mr-1 ${isConnected ? 'animate-spin-slow' : ''}`} />
                <span>Synced: {lastSync}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            {session && (
              <div className="flex items-center ml-3">
                <NotificationBell />
                <div className="flex items-center mx-4 border-l pl-4">
                  <span className="text-sm font-medium text-gray-900 mr-2">
                    {session.user?.name}
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded uppercase">
                    {(session.user as any).role || "Employee"}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
