import { z } from "zod";

export const TableShapeEnum = z.enum(["ROUND", "RECTANGULAR", "HEAD_TABLE"]);
export type TableShape = z.infer<typeof TableShapeEnum>;

export const ZoneLocationEnum = z.enum(["STAGE_FRONT", "MAIN_FLOOR", "BALCONY", "OUTDOOR"]);
export type ZoneLocation = z.infer<typeof ZoneLocationEnum>;

export const TableFormSchema = z.object({
  name: z.string().min(2, "Table name must be at least 2 characters"),
  shape: TableShapeEnum.default("ROUND"),
  capacity: z.number().int().min(1, "Capacity must be at least 1").max(30, "Capacity cannot exceed 30"),
  location_zone: ZoneLocationEnum.default("MAIN_FLOOR"),
  accessibility_friendly: z.boolean().default(false),
  notes: z.string().optional(),
});
export type TableFormData = z.infer<typeof TableFormSchema>;

export const AssignmentFormSchema = z.object({
  table_id: z.string().min(1, "Table is required"),
  guest_id: z.string().min(1, "Guest is required"),
  seat_number: z.number().int().optional(),
});
export type AssignmentFormData = z.infer<typeof AssignmentFormSchema>;
