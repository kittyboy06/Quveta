import { z } from "zod";

export const RunSheetCategoryEnum = z.enum([
  "CEREMONY",
  "RECEPTION",
  "CATERING",
  "LOGISTICS",
  "ENTERTAINMENT",
  "SPEECH",
  "PHOTO",
]);
export type RunSheetCategory = z.infer<typeof RunSheetCategoryEnum>;

export const RunSheetStatusEnum = z.enum([
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "DELAYED",
  "SKIPPED",
]);
export type RunSheetStatus = z.infer<typeof RunSheetStatusEnum>;

export const IncidentSeverityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export type IncidentSeverity = z.infer<typeof IncidentSeverityEnum>;

export const RunSheetItemFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  scheduled_start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be in HH:mm format"),
  scheduled_end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be in HH:mm format"),
  category: RunSheetCategoryEnum,
  location: z.string().optional(),
  responsible_person: z.string().optional(),
  vendor_id: z.string().optional(),
  linked_task_id: z.string().optional(),
  status: RunSheetStatusEnum.default("SCHEDULED"),
  notes: z.string().optional(),
  sequence_order: z.number().int().default(0),
});
export type RunSheetItemFormData = z.infer<typeof RunSheetItemFormSchema>;

export const IncidentFormSchema = z.object({
  run_sheet_item_id: z.string().optional(),
  severity: IncidentSeverityEnum,
  description: z.string().min(5, "Incident description must be at least 5 characters"),
  reported_by: z.string().optional(),
});
export type IncidentFormData = z.infer<typeof IncidentFormSchema>;
