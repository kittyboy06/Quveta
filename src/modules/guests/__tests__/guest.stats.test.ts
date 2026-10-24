import { describe, it, expect } from "vitest";
import { calculateGuestStatistics } from "../domain/guest.stats";
import { parseGuestsCsv, exportGuestsToCsv } from "../domain/csv.parser";
import { SeedGuest } from "@/shared/db/seed-data";

describe("Guest Management & RSVP Stats Engine (Module 09)", () => {
  const mockGuests: SeedGuest[] = [
    {
      id: "g-1",
      event_id: "evt-test",
      first_name: "Amit",
      last_name: "Patel",
      email: "amit@example.com",
      invitation_status: "DELIVERED",
      rsvp_status: "ATTENDING",
      plus_one_allowed: true,
      plus_one_name: "Kavita Patel",
      dietary_restrictions: ["VEG", "JAIN"],
      accessibility_needs: ["GROUND_FLOOR"],
      created_at: "2026-01-01",
    },
    {
      id: "g-2",
      event_id: "evt-test",
      first_name: "Siddharth",
      last_name: "Nair",
      email: "sid@example.com",
      invitation_status: "DELIVERED",
      rsvp_status: "ATTENDING",
      plus_one_allowed: false,
      dietary_restrictions: ["GLUTEN_FREE"],
      accessibility_needs: ["WHEELCHAIR"],
      created_at: "2026-01-01",
    },
    {
      id: "g-3",
      event_id: "evt-test",
      first_name: "Rahul",
      last_name: "Verma",
      email: "rahul@example.com",
      invitation_status: "DELIVERED",
      rsvp_status: "DECLINED",
      plus_one_allowed: false,
      dietary_restrictions: ["VEG"], // should not be counted for catering since declined
      accessibility_needs: [],
      created_at: "2026-01-01",
    },
    {
      id: "g-4",
      event_id: "evt-test",
      first_name: "Pooja",
      last_name: "Shah",
      email: "pooja@example.com",
      invitation_status: "SENT",
      rsvp_status: "NO_RESPONSE",
      plus_one_allowed: true,
      dietary_restrictions: ["NUT_ALLERGY"],
      accessibility_needs: [],
      created_at: "2026-01-01",
    },
  ];

  it("calculates deterministic attendance numbers including confirmed plus-ones", () => {
    // Target was 5 guests, catering cost ₹1,500 (150000 paise) per head
    const stats = calculateGuestStatistics(mockGuests, 5, 150000);

    expect(stats.totalGuests).toBe(4);
    expect(stats.attendingCount).toBe(2);
    expect(stats.attendingPlusOnes).toBe(1); // Kavita Patel
    expect(stats.totalAttendingHeads).toBe(3); // Amit + Kavita + Siddharth
    expect(stats.declinedCount).toBe(1); // Rahul
    expect(stats.pendingCount).toBe(1); // Pooja
    expect(stats.responseRatePercentage).toBe(75); // 3 of 4 responded
  });

  it("aggregates dietary and accessibility requirements only for attending and pending guests", () => {
    const stats = calculateGuestStatistics(mockGuests, 5, 150000);

    // VEG should be 1 (Amit), Jain should be 1, Gluten-Free should be 1, Nut Allergy should be 1
    // Rahul's VEG should NOT be counted because he DECLINED
    expect(stats.dietarySummary["VEG"]).toBe(1);
    expect(stats.dietarySummary["JAIN"]).toBe(1);
    expect(stats.dietarySummary["GLUTEN_FREE"]).toBe(1);
    expect(stats.dietarySummary["NUT_ALLERGY"]).toBe(1);

    expect(stats.accessibilitySummary["WHEELCHAIR"]).toBe(1);
    expect(stats.accessibilitySummary["GROUND_FLOOR"]).toBe(1);
  });

  it("parses valid CSV data and handles quoted values", () => {
    const sampleCsv = `First Name,Last Name,Email,Phone,Dietary,Accessibility,Plus One,Plus One Name
Vikram,Kapoor,vikram@kapoor.com,+91 99000 88776,"VEG; JAIN",WHEELCHAIR,yes,Ritu Kapoor
Neha,Gupta,neha@gupta.com,+91 98000 11223,GLUTEN_FREE,,no,`;

    const { guests, errors } = parseGuestsCsv(sampleCsv);
    expect(errors.length).toBe(0);
    expect(guests.length).toBe(2);

    expect(guests[0].first_name).toBe("Vikram");
    expect(guests[0].last_name).toBe("Kapoor");
    expect(guests[0].dietary_restrictions).toEqual(["VEG", "JAIN"]);
    expect(guests[0].accessibility_needs).toEqual(["WHEELCHAIR"]);
    expect(guests[0].plus_one_allowed).toBe(true);
    expect(guests[0].plus_one_name).toBe("Ritu Kapoor");
  });

  it("exports guests to RFC-4180 CSV correctly", () => {
    const csvStr = exportGuestsToCsv(mockGuests);
    expect(csvStr).toContain("First Name,Last Name,Email");
    expect(csvStr).toContain("Amit,Patel,amit@example.com");
    expect(csvStr).toContain("Kavita Patel");
  });
});
