import React from "react";
import { notFound } from "next/navigation";
import { repository } from "@/shared/db/supabase";
import { NotificationsClientView } from "./NotificationsClientView";

interface NotificationsPageProps {
  params: Promise<{ id: string }>;
}

export default async function NotificationsPage({ params }: NotificationsPageProps) {
  const { id } = await params;
  const event = repository.getEventById(id);

  if (!event) {
    notFound();
  }

  const initialNotifications = repository.getNotificationsByEventId(id);

  return (
    <NotificationsClientView
      event={event}
      initialNotifications={initialNotifications}
    />
  );
}
