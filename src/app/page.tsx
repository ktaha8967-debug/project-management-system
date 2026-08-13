"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50 text-gray-900">
      <main className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight text-blue-600">
          BritSync Unified System
        </h1>
        <p className="text-xl text-gray-600">
          Centralized Project Management, Email Template Review, and CRM Workflow.
        </p>

        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          {status === "loading" ? (
            <p className="text-gray-500 italic">Checking session status...</p>
          ) : session ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4">
                {session.user?.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-12 h-12 rounded-full border-2 border-blue-500"
                  />
                )}
                <div className="text-left">
                  <p className="font-semibold text-lg">{session.user?.name}</p>
                  <p className="text-sm text-gray-500">{session.user?.email}</p>
                </div>
              </div>
              <div className="pt-4 flex flex-col space-y-2">
                <button
                  onClick={() => (window.location.href = "/dashboard")}
                  className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => signOut()}
                  className="w-full bg-gray-100 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-gray-700 font-medium">
                Please sign in to access the system.
              </p>
              <button
                onClick={() => (window.location.href = "/auth/signin")}
                className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Go to Sign In
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-8">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-2">Project Management</h3>
            <p className="text-sm text-blue-600">
              Track projects, tasks, and deadlines with ease.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <h3 className="font-bold text-green-800 mb-2">Email Builder</h3>
            <p className="text-sm text-green-600">
              Build and preview HTML email templates in real-time.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <h3 className="font-bold text-purple-800 mb-2">CRM Workflow</h3>
            <p className="text-sm text-purple-600">
              Manage leads and integrate templates into campaigns.
            </p>
          </div>
        </div>
      </main>
      <footer className="mt-16 text-gray-400 text-sm italic">
        Powered by BritSync
      </footer>
    </div>
  );
}
