import React from "react";

export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "purple"
  | "outline"
  | "destructive"
  | "secondary";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

export function Badge({
  children,
  className = "",
  variant = "neutral",
  icon,
  ...props
}: BadgeProps) {
  const variantStyles = {
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-rose-50 text-rose-800 border-rose-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
    purple: "bg-brand-50 text-brand-800 border-brand-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    outline: "bg-transparent text-slate-700 border-slate-200",
    destructive: "bg-rose-50 text-rose-800 border-rose-200",
    secondary: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="w-3.5 h-3.5 inline-flex items-center justify-center">{icon}</span>}
      {children}
    </span>
  );
}
