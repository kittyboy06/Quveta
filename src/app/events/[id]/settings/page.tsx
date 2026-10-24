import React from "react";
import { notFound } from "next/navigation";
import { repository } from "@/shared/db/supabase";
import { SettingsClientView } from "./SettingsClientView";
import { runSystemDiagnosticAction } from "@/modules/settings/server/settings.actions";

interface SettingsPageProps {
  params: Promise<{ id: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { id } = await params;
  const event = repository.getEventById(id);

  if (!event) {
    notFound();
  }

  const initialSettings = repository.getEventSettings(id);
  const auditLogs = repository.getAuditLogsByEventId(id);
  const initialDiagnostic = await runSystemDiagnosticAction(id);

  return (
    <SettingsClientView
      event={event}
      initialSettings={initialSettings}
      initialDiagnostic={initialDiagnostic}
      auditLogs={auditLogs}
    />
  );
}
