import React from "react";
import { notFound } from "next/navigation";
import { repository } from "@/shared/db/supabase";
import { RunSheetClientView } from "./RunSheetClientView";

interface RunSheetPageProps {
  params: Promise<{ id: string }>;
}

export default async function RunSheetPage({ params }: RunSheetPageProps) {
  const { id } = await params;
  const event = repository.getEventById(id);

  if (!event) {
    notFound();
  }

  const items = repository.getRunSheetItemsByEventId(id);
  const incidents = repository.getIncidentsByEventId(id);
  const vendors = repository.getVendorsByEventId(id);

  return <RunSheetClientView event={event} items={items} incidents={incidents} vendors={vendors} />;
}
