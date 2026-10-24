import React from "react";
import Link from "next/link";
import { Button } from "@/shared/design-system/Button";
import { CalendarDays, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-800 mb-6">
        <CalendarDays className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
        Event Not Found
      </h1>
      <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
        The celebration or event workspace you requested could not be located, or may have been deleted.
      </p>
      <Link href="/">
        <Button variant="primary" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Button>
      </Link>
    </div>
  );
}
