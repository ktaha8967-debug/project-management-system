import { Navbar } from "@/frontend/components/layout/Navbar";
import { Sidebar } from "@/frontend/components/layout/Sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex pt-16 overflow-hidden">
        <Sidebar />
        <main className="relative w-full h-full overflow-y-auto bg-gray-50 lg:ml-64 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
