import { z } from "zod";

export const NotificationCategorySchema = z.enum([
  "BUDGET",
  "TASK",
  "VENDOR",
  "GUEST",
  "RUN_SHEET",
  "SYSTEM",
]);
export type NotificationCategory = z.infer<typeof NotificationCategorySchema>;

export const NotificationPrioritySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);
export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;

export const NotificationItemSchema = z.object({
  id: z.string(),
  event_id: z.string(),
  title: z.string().min(1),
  message: z.string().min(1),
  category: NotificationCategorySchema,
  priority: NotificationPrioritySchema,
  read: z.boolean().default(false),
  action_url: z.string().optional(),
  created_at: z.string(),
});
export type NotificationItem = z.infer<typeof NotificationItemSchema>;

export const AutomationRuleSchema = z.object({
  id: z.string(),
  event_id: z.string(),
  name: z.string(),
  trigger_event: z.enum([
    "TASK_OVERDUE",
    "BUDGET_DEFICIT",
    "RSVP_DEADLINE_APPROACHING",
    "RUN_SHEET_DELAY",
    "INCIDENT_LOGGED",
  ]),
  enabled: z.boolean().default(true),
});
export type AutomationRule = z.infer<typeof AutomationRuleSchema>;
