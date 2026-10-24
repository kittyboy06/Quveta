import React from "react";
import { notFound } from "next/navigation";
import { repository } from "@/shared/db/supabase";
import { SeatingClientView } from "./SeatingClientView";

interface SeatingPageProps {
  params: Promise<{ id: string }>;
}

export default async function SeatingPage({ params }: SeatingPageProps) {
  const { id } = await params;
  const event = repository.getEventById(id);

  if (!event) {
    notFound();
  }

  const tables = repository.getSeatingTablesByEventId(id);
  const guests = repository.getGuestsByEventId(id);
  const assignments = repository.getSeatingAssignmentsByEventId(id);

  return <SeatingClientView event={event} tables={tables} guests={guests} assignments={assignments} />;
}
