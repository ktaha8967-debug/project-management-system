import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/frontend/styles/globals.css";
import { SessionProvider } from "@/frontend/components/providers/SessionProvider";
import { ReactQueryProvider } from "@/frontend/components/providers/ReactQueryProvider";
import { SocketProvider } from "@/frontend/components/providers/SocketProvider";
import { UIProvider } from "@/frontend/components/providers/UIProvider";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BritSync Unified System",
  description: "Project Management + Email Template Review + CRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <SessionProvider>
          <ReactQueryProvider>
            <UIProvider>
              <SocketProvider>
                <Suspense fallback={null}>
                  {children}
                </Suspense>
              </SocketProvider>
            </UIProvider>
          </ReactQueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
