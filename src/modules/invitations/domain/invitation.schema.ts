import { z } from "zod";

export const TemplateIdEnum = z.enum([
  "ELEGANT_WEDDING",
  "MODERN_TECH",
  "FESTIVE_GALA",
  "MINIMALIST",
]);
export type TemplateId = z.infer<typeof TemplateIdEnum>;

export const InvitationDesignFormSchema = z.object({
  title: z.string().min(2, "Title is required"),
  template_id: TemplateIdEnum.default("ELEGANT_WEDDING"),
  headline: z.string().min(2, "Headline is required"),
  body_text: z.string().min(10, "Invitation body must be at least 10 characters"),
  dress_code: z.string().optional(),
  venue_name: z.string().min(2, "Venue name is required"),
  venue_address: z.string().min(2, "Venue address is required"),
  date_time_display: z.string().min(2, "Date/time display is required"),
  rsvp_deadline: z.string().optional(),
  primary_color: z.string().default("#5B21B6"),
  accent_color: z.string().default("#E9D5FF"),
});
export type InvitationDesignFormData = z.infer<typeof InvitationDesignFormSchema>;

export const ReminderCampaignFormSchema = z.object({
  target_filter: z.enum(["NO_RESPONSE_ONLY", "TENTATIVE_AND_NO_RESPONSE"]).default("NO_RESPONSE_ONLY"),
  channel: z.enum(["EMAIL", "SMS", "WHATSAPP_SIMULATED"]).default("EMAIL"),
  custom_message: z.string().min(5, "Reminder message is required"),
});
export type ReminderCampaignFormData = z.infer<typeof ReminderCampaignFormSchema>;
