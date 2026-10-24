import React from "react";
import { notFound } from "next/navigation";
import { repository } from "@/shared/db/supabase";
import { InvitationsClientView } from "./InvitationsClientView";

interface InvitationsPageProps {
  params: Promise<{ id: string }>;
}

export default async function InvitationsPage({ params }: InvitationsPageProps) {
  const { id } = await params;
  const event = repository.getEventById(id);

  if (!event) {
    notFound();
  }

  const invitation = repository.getInvitationDesignByEventId(id);
  const guests = repository.getGuestsByEventId(id);
  const logs = repository.getCommunicationLogsByEventId(id);

  return (
    <InvitationsClientView
      event={event}
      invitation={invitation}
      guests={guests}
      logs={logs}
    />
  );
}
