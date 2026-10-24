import { z } from "zod";

export const EventTypeEnum = z.enum([
  "wedding",
  "birthday",
  "corporate",
  "community",
  "college",
  "engagement",
  "other",
]);

export type EventType = z.infer<typeof EventTypeEnum>;

export const CategoryPriorityEnum = z.enum(["MUST_HAVE", "HIGH", "FLEXIBLE", "LOW"]);
export type CategoryPriority = z.infer<typeof CategoryPriorityEnum>;

export const EventPreferencesSchema = z.object({
  theme: z.string().optional(),
  atmosphere: z.string().optional(),
  mustHaves: z.array(z.string()).default([]),
  priorities: z.record(CategoryPriorityEnum).default({}),
  dietary: z.array(z.string()).default([]),
  accessibility: z.array(z.string()).default([]),
});

export type EventPreferences = z.infer<typeof EventPreferencesSchema>;

export const CreateEventSchema = z.object({
  title: z
    .string()
    .min(3, "Event title must be at least 3 characters")
    .max(100, "Event title must be under 100 characters"),
  event_type: EventTypeEnum,
  event_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Event date must be in YYYY-MM-DD format"),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  location: z.string().min(2, "Location must be at least 2 characters"),
  guest_count: z.coerce.number().int().min(1, "Expected guest count must be at least 1"),
  target_budget: z.coerce.number().min(1000, "Target budget must be at least ₹1,000"), // major units
  currency: z.string().default("INR"),
  preferences: EventPreferencesSchema.default({
    mustHaves: [],
    priorities: {},
    dietary: [],
    accessibility: [],
  }),
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;

export const UpdateEventSchema = CreateEventSchema.partial();
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
