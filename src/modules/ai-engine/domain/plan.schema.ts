import { z } from "zod";

export const PlanMilestoneSchema = z.object({
  title: z.string(),
  daysBeforeEvent: z.number().int(),
  category: z.string(),
  description: z.string(),
});

export const ProposedCategorySchema = z.object({
  name: z.string(),
  priority: z.enum(["MUST_HAVE", "HIGH", "FLEXIBLE", "LOW"]),
  allocationRatio: z.number().min(0).max(1),
  explanation: z.string(),
});

export const ProposedTaskSchema = z.object({
  title: z.string(),
  category: z.string(),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  estimatedDays: z.number().int().default(2),
  daysBeforeEvent: z.number().int(),
  prerequisiteTitles: z.array(z.string()).default([]),
});

export const RiskItemSchema = z.object({
  risk: z.string(),
  severity: z.enum(["HIGH", "MEDIUM", "LOW"]),
  mitigation: z.string(),
});

export const EventPlanSchema = z.object({
  summary: z.string(),
  assumptions: z.array(z.string()),
  milestones: z.array(PlanMilestoneSchema),
  proposedCategories: z.array(ProposedCategorySchema),
  proposedTasks: z.array(ProposedTaskSchema),
  riskAnalysis: z.array(RiskItemSchema),
  missingInformation: z.array(z.string()).default([]),
});

export type EventPlan = z.infer<typeof EventPlanSchema>;
