import { z } from "zod";

export const RsvpStatusEnum = z.enum(["ATTENDING", "DECLINED", "TENTATIVE", "NO_RESPONSE"]);
export type RsvpStatus = z.infer<typeof RsvpStatusEnum>;

export const InvitationStatusEnum = z.enum(["NOT_SENT", "SENT", "DELIVERED", "BOUNCED"]);
export type InvitationStatus = z.infer<typeof InvitationStatusEnum>;

export const DietaryRestrictionEnum = z.enum([
  "VEG",
  "VEGAN",
  "JAIN",
  "GLUTEN_FREE",
  "NUT_ALLERGY",
  "HALAL",
  "DAIRY_FREE",
  "KOSHER",
]);
export type DietaryRestriction = z.infer<typeof DietaryRestrictionEnum>;

export const AccessibilityNeedEnum = z.enum([
  "WHEELCHAIR",
  "GROUND_FLOOR",
  "ASSISTIVE_LISTENING",
  "SERVICE_ANIMAL",
  "SIGN_LANGUAGE",
]);
export type AccessibilityNeed = z.infer<typeof AccessibilityNeedEnum>;

export const GuestFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  household_group_id: z.string().optional(),
  invitation_status: InvitationStatusEnum.default("NOT_SENT"),
  rsvp_status: RsvpStatusEnum.default("NO_RESPONSE"),
  plus_one_allowed: z.boolean().default(false),
  plus_one_name: z.string().optional(),
  dietary_restrictions: z.array(z.string()).default([]),
  accessibility_needs: z.array(z.string()).default([]),
  notes: z.string().optional(),
});
export type GuestFormData = z.infer<typeof GuestFormSchema>;

export const HouseholdFormSchema = z.object({
  name: z.string().min(2, "Household name is required"),
  max_guests: z.number().int().min(1).default(2),
});
export type HouseholdFormData = z.infer<typeof HouseholdFormSchema>;
