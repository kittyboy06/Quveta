import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/shared/design-system/Navbar";
import { Sidebar } from "@/shared/design-system/Sidebar";
import { env } from "@/shared/config/env";

export const metadata: Metadata = {
  title: `${env.APP_NAME} — ${env.APP_DESCRIPTION}`,
  description:
    "Intelligent celebration and event planning web application with adaptive budget simulation and dependency-aware timelines.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
