import { SeedGuest } from "@/shared/db/seed-data";

export interface GuestStatistics {
  totalGuests: number;
  totalInvitedWithPlusOnes: number;
  attendingCount: number;
  attendingPlusOnes: number;
  totalAttendingHeads: number;
  declinedCount: number;
  pendingCount: number;
  responseRatePercentage: number;
  dietarySummary: Record<string, number>;
  accessibilitySummary: Record<string, number>;
  capacityVariance: number; // positive = surplus capacity, negative = overflow
  cateringCostDeltaPaise: number; // calculated if cateringCostPerHead is provided
}

export function calculateGuestStatistics(
  guests: SeedGuest[],
  plannedTargetGuests: number,
  cateringPerGuestMinor: number = 0
): GuestStatistics {
  const totalGuests = guests.length;
  let attendingCount = 0;
  let attendingPlusOnes = 0;
  let declinedCount = 0;
  let pendingCount = 0;
  let plusOnesAllowedCount = 0;

  const dietarySummary: Record<string, number> = {};
  const accessibilitySummary: Record<string, number> = {};

  guests.forEach((g) => {
    if (g.plus_one_allowed) plusOnesAllowedCount++;

    if (g.rsvp_status === "ATTENDING") {
      attendingCount++;
      if (g.plus_one_allowed && g.plus_one_name) {
        attendingPlusOnes++;
      }
    } else if (g.rsvp_status === "DECLINED") {
      declinedCount++;
    } else {
      pendingCount++;
    }

    // Tally dietary only for attending or pending guests (avoid reserving meals for declined)
    if (g.rsvp_status !== "DECLINED") {
      (g.dietary_restrictions || []).forEach((diet) => {
        dietarySummary[diet] = (dietarySummary[diet] || 0) + 1;
      });
      (g.accessibility_needs || []).forEach((acc) => {
        accessibilitySummary[acc] = (accessibilitySummary[acc] || 0) + 1;
      });
    }
  });

  const totalAttendingHeads = attendingCount + attendingPlusOnes;
  const totalInvitedWithPlusOnes = totalGuests + plusOnesAllowedCount;
  const respondedCount = attendingCount + declinedCount;
  const responseRatePercentage = totalGuests > 0 ? Math.round((respondedCount / totalGuests) * 100) : 0;
  const capacityVariance = plannedTargetGuests - totalAttendingHeads;
  const cateringCostDeltaPaise = (totalAttendingHeads - plannedTargetGuests) * cateringPerGuestMinor;

  return {
    totalGuests,
    totalInvitedWithPlusOnes,
    attendingCount,
    attendingPlusOnes,
    totalAttendingHeads,
    declinedCount,
    pendingCount,
    responseRatePercentage,
    dietarySummary,
    accessibilitySummary,
    capacityVariance,
    cateringCostDeltaPaise,
  };
}
