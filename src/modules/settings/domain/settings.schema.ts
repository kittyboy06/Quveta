import { z } from "zod";

export const EventSettingsFormSchema = z.object({
  currency: z.enum(["INR", "USD", "EUR", "GBP"]).default("INR"),
  timezone: z.string().default("Asia/Kolkata"),
  default_catering_budget_per_guest: z.number().nonnegative().optional(),
  notifications_enabled: z.boolean().default(true),
  ai_features_enabled: z.boolean().default(true),
  privacy_mode: z.boolean().default(false),
});
export type EventSettingsFormData = z.infer<typeof EventSettingsFormSchema>;

export const AuditLogSchema = z.object({
  id: z.string(),
  event_id: z.string(),
  action: z.string(),
  entity_type: z.string(),
  entity_id: z.string().optional(),
  actor: z.string().default("Organizer"),
  details: z.string().optional(),
  timestamp: z.string(),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

export const DiagnosticReportSchema = z.object({
  overallStatus: z.enum(["HEALTHY", "DEGRADED", "FAILED"]),
  checkedAt: z.string(),
  storageLatencyMs: z.number(),
  relationalIntegrity: z.object({
    passed: z.boolean(),
    orphanedRecordsCount: z.number(),
    issues: z.array(z.string()),
  }),
  geminiApiStatus: z.enum(["CONFIGURED", "FALLBACK_READY"]),
  recordCounts: z.record(z.string(), z.number()),
});
export type DiagnosticReport = z.infer<typeof DiagnosticReportSchema>;
