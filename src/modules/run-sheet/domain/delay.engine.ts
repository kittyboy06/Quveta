import { SeedRunSheetItem } from "@/shared/db/seed-data";

export interface ScheduleImpactAnalysis {
  delayedItemId: string;
  delayMinutes: number;
  affectedItemIds: string[];
  cascadedItems: {
    id: string;
    title: string;
    originalStart: string;
    projectedStart: string;
    originalEnd: string;
    projectedEnd: string;
    delayMinutes: number;
  }[];
  recoveryOptions: {
    title: string;
    actionDescription: string;
    timeRecoveredMinutes: number;
    targetItemId?: string;
    feasibility: "HIGH" | "MEDIUM" | "LOW";
  }[];
  curfewWarning?: string;
}

export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const safeMinutes = Math.max(0, minutes) % (24 * 60);
  const h = Math.floor(safeMinutes / 60);
  const m = safeMinutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function analyzeScheduleDelay(
  items: SeedRunSheetItem[],
  delayedItemId: string,
  delayMinutes: number,
  hardCurfewTime?: string // e.g. "23:00"
): ScheduleImpactAnalysis {
  const sorted = [...items].sort(
    (a, b) => a.sequence_order - b.sequence_order || a.scheduled_start_time.localeCompare(b.scheduled_start_time)
  );

  const delayedIndex = sorted.findIndex((item) => item.id === delayedItemId);
  if (delayedIndex === -1 || delayMinutes <= 0) {
    return {
      delayedItemId,
      delayMinutes: Math.max(0, delayMinutes),
      affectedItemIds: [],
      cascadedItems: [],
      recoveryOptions: [],
    };
  }

  const affectedItems = sorted.slice(delayedIndex + 1);
  const cascadedItems = affectedItems.map((item) => {
    const origStartMin = timeToMinutes(item.scheduled_start_time);
    const origEndMin = timeToMinutes(item.scheduled_end_time);
    const projStartMin = origStartMin + delayMinutes;
    const projEndMin = origEndMin + delayMinutes;

    return {
      id: item.id,
      title: item.title,
      originalStart: item.scheduled_start_time,
      projectedStart: minutesToTime(projStartMin),
      originalEnd: item.scheduled_end_time,
      projectedEnd: minutesToTime(projEndMin),
      delayMinutes,
    };
  });

  const recoveryOptions: ScheduleImpactAnalysis["recoveryOptions"] = [];

  // 1. Identify buffer gaps between activities that can absorb delay
  for (let i = delayedIndex; i < sorted.length - 1; i++) {
    const currEnd = timeToMinutes(sorted[i].scheduled_end_time);
    const nextStart = timeToMinutes(sorted[i + 1].scheduled_start_time);
    const gap = nextStart - currEnd;
    if (gap >= 15) {
      recoveryOptions.push({
        title: `Absorb via ${gap}m buffer before '${sorted[i + 1].title}'`,
        actionDescription: `Utilize scheduled transition buffer between ${sorted[i].title} and ${sorted[i + 1].title}.`,
        timeRecoveredMinutes: Math.min(gap - 5, delayMinutes),
        targetItemId: sorted[i + 1].id,
        feasibility: "HIGH",
      });
    }
  }

  // 2. Identify flexible activities (PHOTO, SPEECH, ENTERTAINMENT) that can be compressed
  affectedItems.forEach((item) => {
    const duration = timeToMinutes(item.scheduled_end_time) - timeToMinutes(item.scheduled_start_time);
    if ((item.category === "PHOTO" || item.category === "SPEECH") && duration >= 30) {
      const compressible = Math.min(15, Math.floor(duration * 0.4));
      recoveryOptions.push({
        title: `Trim ${compressible}m from '${item.title}'`,
        actionDescription: `Condense ${item.category.toLowerCase()} session from ${duration}m to ${duration - compressible}m without skipping key cues.`,
        timeRecoveredMinutes: compressible,
        targetItemId: item.id,
        feasibility: "HIGH",
      });
    }
    if (item.category === "CATERING" && duration >= 120) {
      recoveryOptions.push({
        title: `Overlap dinner wrap-up with speeches (+20m recovered)`,
        actionDescription: `Commence stage speeches while dessert counter remains open in dining hall.`,
        timeRecoveredMinutes: 20,
        targetItemId: item.id,
        feasibility: "MEDIUM",
      });
    }
  });

  // 3. Curfew check
  let curfewWarning: string | undefined;
  if (hardCurfewTime && cascadedItems.length > 0) {
    const lastItem = cascadedItems[cascadedItems.length - 1];
    const curfewMin = timeToMinutes(hardCurfewTime);
    const lastEndMin = timeToMinutes(lastItem.projectedEnd);
    if (lastEndMin > curfewMin) {
      const breachMin = lastEndMin - curfewMin;
      curfewWarning = `CRITICAL: Projected event finish (${lastItem.projectedEnd}) breaches venue curfew of ${hardCurfewTime} by ${breachMin} minutes!`;
    }
  }

  return {
    delayedItemId,
    delayMinutes,
    affectedItemIds: affectedItems.map((i) => i.id),
    cascadedItems,
    recoveryOptions,
    curfewWarning,
  };
}
