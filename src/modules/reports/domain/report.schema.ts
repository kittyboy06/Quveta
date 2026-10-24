import { z } from "zod";

export const ReportTypeSchema = z.enum([
  "EXECUTIVE_SUMMARY",
  "BUDGET_AUDIT",
  "GUEST_DIETARY_ROSTER",
  "SEATING_MANIFEST",
  "RUN_SHEET_CUES",
  "VENDOR_DIRECTORY",
]);
export type ReportType = z.infer<typeof ReportTypeSchema>;

export const ReportSnapshotSchema = z.object({
  reportType: ReportTypeSchema,
  eventId: z.string(),
  title: z.string(),
  subtitle: z.string(),
  generatedAt: z.string(),
  summaryStats: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      subtext: z.string().optional(),
    })
  ),
  columns: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});
export type ReportSnapshot = z.infer<typeof ReportSnapshotSchema>;
