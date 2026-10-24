import { describe, it, expect } from "vitest";
import { analyzeScheduleDelay, timeToMinutes, minutesToTime } from "../domain/delay.engine";
import { SeedRunSheetItem } from "@/shared/db/seed-data";

describe("Event-Day Run Sheet Delay Engine (Module 08)", () => {
  const mockItems: SeedRunSheetItem[] = [
    {
      id: "rs-1",
      event_id: "evt-test",
      title: "Mandap Setup",
      scheduled_start_time: "07:00",
      scheduled_end_time: "08:30",
      category: "LOGISTICS",
      status: "SCHEDULED",
      sequence_order: 1,
      created_at: "2026-01-01",
    },
    {
      id: "rs-2",
      event_id: "evt-test",
      title: "Baraat Procession",
      scheduled_start_time: "09:00",
      scheduled_end_time: "10:00",
      category: "CEREMONY",
      status: "SCHEDULED",
      sequence_order: 2,
      created_at: "2026-01-01",
    },
    {
      id: "rs-3",
      event_id: "evt-test",
      title: "Varmala & Pheras",
      scheduled_start_time: "10:15",
      scheduled_end_time: "11:45",
      category: "CEREMONY",
      status: "SCHEDULED",
      sequence_order: 3,
      created_at: "2026-01-01",
    },
    {
      id: "rs-4",
      event_id: "evt-test",
      title: "Wedding Feast Lunch",
      scheduled_start_time: "12:00",
      scheduled_end_time: "14:30",
      category: "CATERING",
      status: "SCHEDULED",
      sequence_order: 4,
      created_at: "2026-01-01",
    },
    {
      id: "rs-5",
      event_id: "evt-test",
      title: "Couple & Family Portraits",
      scheduled_start_time: "14:45",
      scheduled_end_time: "16:00",
      category: "PHOTO",
      status: "SCHEDULED",
      sequence_order: 5,
      created_at: "2026-01-01",
    },
  ];

  it("converts time to minutes and back without drift", () => {
    expect(timeToMinutes("07:00")).toBe(420);
    expect(timeToMinutes("14:30")).toBe(870);
    expect(minutesToTime(420)).toBe("07:00");
    expect(minutesToTime(870)).toBe("14:30");
  });

  it("calculates cascading schedule ripple when an activity is delayed", () => {
    // 30-minute delay on Baraat (rs-2)
    const impact = analyzeScheduleDelay(mockItems, "rs-2", 30);

    expect(impact.affectedItemIds).toEqual(["rs-3", "rs-4", "rs-5"]);
    expect(impact.cascadedItems.length).toBe(3);

    const pheras = impact.cascadedItems.find((i) => i.id === "rs-3");
    expect(pheras?.originalStart).toBe("10:15");
    expect(pheras?.projectedStart).toBe("10:45"); // shifted by 30 mins
  });

  it("proposes non-destructive buffer absorption and activity compression", () => {
    // 30-minute delay on Baraat
    const impact = analyzeScheduleDelay(mockItems, "rs-2", 30);

    expect(impact.recoveryOptions.length).toBeGreaterThan(0);
    // Should identify photo session compression
    const photoRecovery = impact.recoveryOptions.find(
      (r) => r.targetItemId === "rs-5" && r.title.startsWith("Trim")
    );
    expect(photoRecovery).toBeDefined();
    expect(photoRecovery?.timeRecoveredMinutes).toBe(15);
  });

  it("triggers curfew warning when cascaded schedule breaches hard venue limit", () => {
    // 90-minute catastrophic delay with a 16:30 venue curfew
    const impact = analyzeScheduleDelay(mockItems, "rs-2", 90, "16:30");

    expect(impact.curfewWarning).toBeDefined();
    expect(impact.curfewWarning).toContain("breaches venue curfew of 16:30");
  });
});
