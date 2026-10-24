import { z } from "zod";

export const InsightCategorySchema = z.enum([
  "BUDGET_RISK",
  "TIMELINE_BOTTLENECK",
  "VENDOR_GAP",
  "RSVP_ALERT",
  "SEATING_ISSUE",
  "READINESS_SCORE",
]);
export type InsightCategory = z.infer<typeof InsightCategorySchema>;

export const InsightSeveritySchema = z.enum(["INFO", "WARNING", "CRITICAL"]);
export type InsightSeverity = z.infer<typeof InsightSeveritySchema>;

export const EventInsightSchema = z.object({
  id: z.string(),
  event_id: z.string(),
  category: InsightCategorySchema,
  severity: InsightSeveritySchema,
  title: z.string().min(1),
  description: z.string().min(1),
  evidence_data: z.record(z.string(), z.any()).default({}),
  recommended_action: z.string().optional(),
  action_href: z.string().optional(),
  action_label: z.string().optional(),
  created_at: z.string(),
});
export type EventInsight = z.infer<typeof EventInsightSchema>;

export const ReadinessPillarSchema = z.object({
  score: z.number().min(0).max(100),
  weight: z.number().min(0).max(1),
  weightedScore: z.number().min(0).max(100),
  status: z.enum(["HEALTHY", "WARNING", "CRITICAL"]),
  details: z.string(),
});
export type ReadinessPillar = z.infer<typeof ReadinessPillarSchema>;

export const ReadinessScoreSchema = z.object({
  overallScore: z.number().min(0).max(100),
  status: z.enum(["ON_TRACK", "ATTENTION_NEEDED", "AT_RISK"]),
  pillars: z.object({
    budget: ReadinessPillarSchema,
    tasks: ReadinessPillarSchema,
    vendors: ReadinessPillarSchema,
    rsvp: ReadinessPillarSchema,
    seating: ReadinessPillarSchema,
  }),
  breakdownNotes: z.array(z.string()),
  calculatedAt: z.string(),
});
export type ReadinessScore = z.infer<typeof ReadinessScoreSchema>;

export const CitationSchema = z.object({
  module: z.string(),
  label: z.string(),
  value: z.string(),
  href: z.string().optional(),
});
export type Citation = z.infer<typeof CitationSchema>;

export const SuggestedActionSchema = z.object({
  label: z.string(),
  actionType: z.enum(["NAVIGATE", "SIMULATE", "EXECUTE"]),
  target: z.string(),
});
export type SuggestedAction = z.infer<typeof SuggestedActionSchema>;

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string(),
  citations: z.array(CitationSchema).default([]),
  suggestedActions: z.array(SuggestedActionSchema).default([]),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
