import React from "react";
import { notFound } from "next/navigation";
import { repository } from "@/shared/db/supabase";
import { InsightsClientView } from "./InsightsClientView";
import {
  calculateReadinessScore,
  generateProactiveInsights,
} from "@/modules/insights/domain/readiness.calculator";

interface InsightsPageProps {
  params: Promise<{ id: string }>;
}

export default async function InsightsPage({ params }: InsightsPageProps) {
  const { id } = await params;
  const event = repository.getEventById(id);

  if (!event) {
    notFound();
  }

  const budgetLineItems = repository.getBudgetLineItemsByEventId(id);
  const tasks = repository.getTasksByEventId(id);
  const vendors = repository.getVendorsByEventId(id);
  const quotations = repository.getQuotationsByEventId(id);
  const guests = repository.getGuestsByEventId(id);
  const tables = repository.getSeatingTablesByEventId(id);
  const assignments = repository.getSeatingAssignmentsByEventId(id);

  const initialReadiness = calculateReadinessScore({
    event,
    budgetLineItems,
    tasks,
    vendors,
    quotations,
    guests,
    tables,
    assignments,
  });

  const proactive = generateProactiveInsights({
    event,
    budgetLineItems,
    tasks,
    vendors,
    quotations,
    guests,
    tables,
    assignments,
  });

  const stored = repository.getEventInsightsByEventId(id);
  const initialInsights = [...proactive, ...stored];

  return (
    <InsightsClientView
      event={event}
      initialReadiness={initialReadiness}
      initialInsights={initialInsights}
    />
  );
}
