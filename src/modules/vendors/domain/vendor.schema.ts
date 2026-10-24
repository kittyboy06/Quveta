import { z } from "zod";

export const VendorCategoryEnum = z.enum([
  "VENUE",
  "CATERING",
  "PHOTOGRAPHY",
  "MUSIC_ENTERTAINMENT",
  "DECOR",
  "TRANSPORT",
  "ATTIRE",
  "OTHER",
]);
export type VendorCategory = z.infer<typeof VendorCategoryEnum>;

export const VendorStatusEnum = z.enum([
  "RESEARCHING",
  "CONTACTED",
  "QUOTED",
  "CONTRACT_PENDING",
  "BOOKED",
  "DECLINED",
  "ARCHIVED",
]);
export type VendorStatus = z.infer<typeof VendorStatusEnum>;

export const QuotationStatusEnum = z.enum([
  "DRAFT",
  "RECEIVED",
  "UNDER_REVIEW",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
]);
export type QuotationStatus = z.infer<typeof QuotationStatusEnum>;

export const QuotationLineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount_minor: z.number().int().nonnegative("Amount must be non-negative"),
  is_mandatory: z.boolean().default(true),
});
export type QuotationLineItem = z.infer<typeof QuotationLineItemSchema>;

export const VendorFormSchema = z.object({
  name: z.string().min(2, "Vendor name must be at least 2 characters"),
  category: VendorCategoryEnum,
  contact_person: z.string().min(1, "Contact person is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Valid contact number required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  address: z.string().optional(),
  status: VendorStatusEnum.default("RESEARCHING"),
  notes: z.string().optional(),
});
export type VendorFormData = z.infer<typeof VendorFormSchema>;

export const QuotationFormSchema = z.object({
  vendor_id: z.string().min(1, "Vendor selection is required"),
  quote_reference: z.string().min(1, "Quote reference code required"),
  amount_minor: z.number().int().positive("Quote total must be greater than zero"),
  currency: z.string().default("INR"),
  valid_until: z.string().min(1, "Validity date is required"),
  line_items: z.array(QuotationLineItemSchema).default([]),
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  payment_terms: z.string().optional(),
  deposit_required_minor: z.number().int().nonnegative().default(0),
  notes: z.string().optional(),
});
export type QuotationFormData = z.infer<typeof QuotationFormSchema>;
