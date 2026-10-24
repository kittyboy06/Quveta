import { fromMajorUnits } from "@/shared/types/money";

export interface DefaultCategoryTemplate {
  name: string;
  priority: "MUST_HAVE" | "HIGH" | "FLEXIBLE" | "LOW";
  allocationRatio: number; // percentage of target budget (0.0 to 1.0)
}

export const EVENT_CATEGORY_TEMPLATES: Record<string, DefaultCategoryTemplate[]> = {
  wedding: [
    { name: "Catering & Feast", priority: "MUST_HAVE", allocationRatio: 0.35 },
    { name: "Venue & Mandap", priority: "HIGH", allocationRatio: 0.30 },
    { name: "Photography & Video", priority: "HIGH", allocationRatio: 0.14 },
    { name: "Floral & Decor", priority: "FLEXIBLE", allocationRatio: 0.10 },
    { name: "Sound, DJ & Music", priority: "LOW", allocationRatio: 0.05 },
    { name: "Invitations & Stationery", priority: "FLEXIBLE", allocationRatio: 0.03 },
    { name: "Emergency Contingency", priority: "FLEXIBLE", allocationRatio: 0.03 },
  ],
  birthday: [
    { name: "Food, Cake & Beverages", priority: "MUST_HAVE", allocationRatio: 0.40 },
    { name: "Party Venue / Space", priority: "FLEXIBLE", allocationRatio: 0.25 },
    { name: "Entertainment, Host & Games", priority: "HIGH", allocationRatio: 0.15 },
    { name: "Theme Decor & Balloons", priority: "FLEXIBLE", allocationRatio: 0.10 },
    { name: "Return Gifts & Favors", priority: "LOW", allocationRatio: 0.10 },
  ],
  corporate: [
    { name: "Venue & Connectivity", priority: "MUST_HAVE", allocationRatio: 0.35 },
    { name: "Catering & Coffee Service", priority: "HIGH", allocationRatio: 0.30 },
    { name: "Prizes, Awards & Honorariums", priority: "HIGH", allocationRatio: 0.20 },
    { name: "A/V, Rigging & Streaming", priority: "FLEXIBLE", allocationRatio: 0.10 },
    { name: "Badges & Marketing Collateral", priority: "LOW", allocationRatio: 0.05 },
  ],
  community: [
    { name: "Venue, Permits & Logistics", priority: "MUST_HAVE", allocationRatio: 0.30 },
    { name: "Community Refreshments", priority: "HIGH", allocationRatio: 0.35 },
    { name: "Tents, Seating & Tables", priority: "HIGH", allocationRatio: 0.15 },
    { name: "PA System & Stage", priority: "FLEXIBLE", allocationRatio: 0.10 },
    { name: "Waste Disposal & Clean-up", priority: "FLEXIBLE", allocationRatio: 0.10 },
  ],
  college: [
    { name: "Stage, Lighting & Pro Audio", priority: "MUST_HAVE", allocationRatio: 0.35 },
    { name: "Celebrity / Artist Fees", priority: "HIGH", allocationRatio: 0.30 },
    { name: "Hospitality & Food Counters", priority: "HIGH", allocationRatio: 0.15 },
    { name: "Security & Medical Desk", priority: "HIGH", allocationRatio: 0.10 },
    { name: "Event Badges & Merch", priority: "LOW", allocationRatio: 0.10 },
  ],
  engagement: [
    { name: "Banquet Hall & Stage", priority: "HIGH", allocationRatio: 0.35 },
    { name: "Appetizers & Lunch/Dinner", priority: "MUST_HAVE", allocationRatio: 0.35 },
    { name: "Photography & Highlights Video", priority: "HIGH", allocationRatio: 0.15 },
    { name: "Stage Decor & Ring Stand", priority: "FLEXIBLE", allocationRatio: 0.10 },
    { name: "Traditional Music", priority: "LOW", allocationRatio: 0.05 },
  ],
  other: [
    { name: "Core Experience & Logistics", priority: "MUST_HAVE", allocationRatio: 0.40 },
    { name: "Food & Refreshments", priority: "HIGH", allocationRatio: 0.30 },
    { name: "Venue or Space Rental", priority: "FLEXIBLE", allocationRatio: 0.20 },
    { name: "Miscellaneous & Contingency", priority: "LOW", allocationRatio: 0.10 },
  ],
};

export function getDefaultCategoriesForEvent(eventType: string, totalBudgetMajor: number, currency: string = "INR") {
  const templates = EVENT_CATEGORY_TEMPLATES[eventType] || EVENT_CATEGORY_TEMPLATES.other;
  return templates.map((tpl) => {
    const allocatedMajor = Math.round(totalBudgetMajor * tpl.allocationRatio);
    return {
      name: tpl.name,
      priority: tpl.priority,
      allocated_amount: fromMajorUnits(allocatedMajor, currency).amount,
    };
  });
}
