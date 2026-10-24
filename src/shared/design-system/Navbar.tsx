import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Calendar, PlusCircle, Bell, Search } from "lucide-react";
import { Button } from "./Button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden shadow-sm border border-brand-100/50 flex-shrink-0 bg-brand-950">
            <Image
              src="/logo.png"
              alt="Quveta Logo"
              width={36}
              height={36}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-brand-950">Quveta</span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
              AI Event Suite
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search events, tasks..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/80 pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors"
          />
        </div>

        <button
          type="button"
          aria-label="View notifications"
          className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
          </span>
        </button>

        <Link href="/events/new">
          <Button size="sm" className="hidden sm:inline-flex gap-1.5 shadow-sm">
            <PlusCircle className="w-4 h-4" />
            <span>Create Event</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
