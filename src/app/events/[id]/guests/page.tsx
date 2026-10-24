import React from "react";
import { notFound } from "next/navigation";
import { repository } from "@/shared/db/supabase";
import { GuestsClientView } from "./GuestsClientView";

interface GuestsPageProps {
  params: Promise<{ id: string }>;
}

export default async function GuestsPage({ params }: GuestsPageProps) {
  const { id } = await params;
  const event = repository.getEventById(id);

  if (!event) {
    notFound();
  }

  const guests = repository.getGuestsByEventId(id);
  const householdGroups = repository.getHouseholdGroupsByEventId(id);

  return <GuestsClientView event={event} guests={guests} householdGroups={householdGroups} />;
}
