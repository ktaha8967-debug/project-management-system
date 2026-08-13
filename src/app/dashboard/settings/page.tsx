"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/frontend/components/ui/Button";
import { User, Bell, Shield, Laptop, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account preferences and system configuration.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600 border-2 border-white shadow-sm">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm">Edit Profile</Button>
        </div>

        <div className="divide-y divide-gray-100">
          <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-500">Manage how you receive alerts and updates.</p>
              </div>
            </div>
            <div className="w-10 h-6 bg-blue-600 rounded-full relative p-1 transition-colors cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm"></div>
            </div>
          </div>

          <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                <Shield className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Security</h3>
                <p className="text-sm text-gray-500">Password, two-factor authentication and login history.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Manage</Button>
          </div>

          <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                <Laptop className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">System Preferences</h3>
                <p className="text-sm text-gray-500">Theme, language, and display settings.</p>
              </div>
            </div>
            <span className="text-sm text-blue-600 font-semibold">Light Mode</span>
          </div>
        </div>

        <div className="p-6 bg-gray-50">
          <Button 
            variant="danger" 
            className="w-full flex items-center justify-center space-x-2"
            onClick={() => signOut()}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out from all devices</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
