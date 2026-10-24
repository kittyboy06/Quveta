import React from "react";
import { notFound } from "next/navigation";
import { repository } from "@/shared/db/supabase";
import { ReportsClientView } from "./ReportsClientView";
import { getReportSnapshotAction } from "@/modules/reports/server/report.actions";

interface ReportsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportsPage({ params }: ReportsPageProps) {
  const { id } = await params;
  const event = repository.getEventById(id);

  if (!event) {
    notFound();
  }

  const initialSnapshot = await getReportSnapshotAction(id, "EXECUTIVE_SUMMARY");
  if (!initialSnapshot) {
    notFound();
  }

  return <ReportsClientView event={event} initialSnapshot={initialSnapshot} />;
}
