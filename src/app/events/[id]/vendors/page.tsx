import React from "react";
import { notFound } from "next/navigation";
import { repository } from "@/shared/db/supabase";
import { VendorsClientView } from "./VendorsClientView";

interface VendorsPageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorsPage({ params }: VendorsPageProps) {
  const { id } = await params;
  const event = repository.getEventById(id);

  if (!event) {
    notFound();
  }

  const vendors = repository.getVendorsByEventId(id);
  const quotations = repository.getQuotationsByEventId(id);

  return <VendorsClientView event={event} vendors={vendors} quotations={quotations} />;
}
