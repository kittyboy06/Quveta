"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Users,
  CalendarDays,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { SeedEvent, SeedNotification } from "@/shared/db/seed-data";
import { Card } from "@/shared/design-system/Card";
import { Badge } from "@/shared/design-system/Badge";
import { Button } from "@/shared/design-system/Button";
import {
  markNotificationReadAction,
  dismissAllNotificationsAction,
  triggerAutomationEvaluationAction,
} from "@/modules/notifications/server/notification.actions";
import { NotificationCategory } from "@/modules/notifications/domain/notification.schema";

interface NotificationsClientViewProps {
  event: SeedEvent;
  initialNotifications: SeedNotification[];
}

export function NotificationsClientView({
  event,
  initialNotifications,
}: NotificationsClientViewProps) {
  const [notifications, setNotifications] = useState<SeedNotification[]>(initialNotifications);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await markNotificationReadAction(id, event.id);
  };

  const handleDismissAll = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await dismissAllNotificationsAction(event.id);
  };

  const handleTriggerEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const res = await triggerAutomationEvaluationAction(event.id);
      if (res.success) {
        // Reload notifications or show alert
        window.location.reload();
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  const categories = [
    { id: "ALL", label: "All Alerts" },
    { id: "BUDGET", label: "Budget" },
    { id: "TASK", label: "Tasks" },
    { id: "VENDOR", label: "Vendors" },
    { id: "GUEST", label: "Guests & RSVPs" },
    { id: "RUN_SHEET", label: "Run Sheet" },
  ];

  const filteredNotifications = notifications.filter((n) => {
    if (selectedCategory !== "ALL" && n.category !== selectedCategory) return false;
    if (showUnreadOnly && n.read) return false;
    return true;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <Badge variant="destructive" className="text-[10px] font-bold">URGENT</Badge>;
      case "HIGH":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-[10px] font-bold">HIGH</Badge>;
      case "MEDIUM":
        return <Badge variant="outline" className="text-blue-700 border-blue-200 text-[10px] font-semibold">MEDIUM</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-500 text-[10px]">LOW</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "BUDGET":
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case "TASK":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "VENDOR":
        return <Users className="w-4 h-4 text-indigo-600" />;
      case "GUEST":
        return <Users className="w-4 h-4 text-purple-600" />;
      case "RUN_SHEET":
        return <CalendarDays className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Event Hub
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Notifications & Reminders
            </h1>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              <Bell className="w-3 h-3 mr-1 inline" />
              Module 13
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time operational alerts, threshold warnings, and automated reminders.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerEvaluation}
            disabled={isEvaluating}
            className="flex items-center gap-1.5 text-xs text-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? "animate-spin" : ""}`} />
            Scan Rules Engine
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismissAll}
              className="flex items-center gap-1.5 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              <Check className="w-3.5 h-3.5" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                selectedCategory === cat.id
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Unread Only Toggle */}
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => setShowUnreadOnly(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
          />
          Show Unread Only ({unreadCount})
        </label>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center text-slate-500 bg-slate-50 border-dashed">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">All Caught Up!</p>
            <p className="text-xs mt-1">
              {showUnreadOnly
                ? "No unread notifications in this category."
                : "No operational alerts matching your filter."}
            </p>
          </Card>
        ) : (
          filteredNotifications.map((n) => (
            <Card
              key={n.id}
              className={`p-4 transition-all border-l-4 ${
                !n.read ? "bg-white shadow-sm" : "bg-slate-50/70 border-slate-200"
              } ${
                n.priority === "URGENT"
                  ? "border-l-rose-500"
                  : n.priority === "HIGH"
                  ? "border-l-amber-500"
                  : n.priority === "MEDIUM"
                  ? "border-l-blue-500"
                  : "border-l-slate-300"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 mt-0.5 flex-shrink-0">
                    {getCategoryIcon(n.category)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-sm ${!n.read ? "text-slate-900" : "text-slate-600"}`}>
                        {n.title}
                      </span>
                      {getPriorityBadge(n.priority)}
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      {new Date(n.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="text-xs text-slate-400 hover:text-indigo-600 p-1.5 rounded transition-colors"
                      title="Mark as Read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {n.action_url && (
                    <Link
                      href={n.action_url}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <span>Take Action</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
