import { describe, it, expect, beforeEach } from "vitest";
import { db } from "./storage";

describe("Database Storage Extensions (Modules 07-15)", () => {
  const weddingId = "evt-wedding-001";

  beforeEach(() => {
    db.resetEventToSeed(weddingId);
  });

  it("retrieves seeded vendors and quotations for wedding event", () => {
    const vendors = db.getVendorsByEventId(weddingId);
    expect(vendors.length).toBeGreaterThanOrEqual(4);

    const cateringVendor = vendors.find((v) => v.category === "CATERING");
    expect(cateringVendor).toBeDefined();
    expect(cateringVendor?.status).toBe("BOOKED");

    const quotations = db.getQuotationsByEventId(weddingId);
    expect(quotations.length).toBeGreaterThanOrEqual(2);
  });

  it("relational coupling: accepting a quotation links and commits to budget line item", () => {
    // Create a new vendor and quote
    const vendor = db.createVendor({
      event_id: weddingId,
      name: "Artisan Sweet Delights",
      category: "CATERING",
      contact_person: "Sumanth",
      email: "sumanth@sweets.in",
      phone: "+91 99000 11223",
      status: "QUOTED",
    });

    const quote = db.createQuotation({
      vendor_id: vendor.id,
      event_id: weddingId,
      quote_reference: "ASD-2026-01",
      amount_minor: 5000000, // ₹50,000
      currency: "INR",
      status: "RECEIVED",
      valid_until: "2026-12-31",
      line_items: [{ description: "Gourmet Mithai Boxes", amount_minor: 5000000, is_mandatory: true }],
      inclusions: ["Custom box packaging"],
      exclusions: [],
      deposit_required_minor: 1500000,
    });

    const result = db.acceptQuotation(quote.id);
    expect(result.success).toBe(true);
    expect(result.lineItemId).toBeDefined();

    // Verify vendor updated to BOOKED
    const updatedVendor = db.getVendorById(vendor.id);
    expect(updatedVendor?.status).toBe("BOOKED");

    // Verify budget line item committed
    const lineItems = db.getLineItemsByEventId(weddingId);
    const linkedItem = lineItems.find((li) => li.id === result.lineItemId);
    expect(linkedItem).toBeDefined();
    expect(linkedItem?.status).toBe("COMMITTED");
    expect(linkedItem?.planned_amount).toBe(5000000);
  });

  it("retrieves run sheet items in sequence and logs incidents", () => {
    const items = db.getRunSheetItemsByEventId(weddingId);
    expect(items.length).toBeGreaterThanOrEqual(5);
    expect(items[0].scheduled_start_time).toBe("07:00");

    const incident = db.createIncident({
      event_id: weddingId,
      run_sheet_item_id: items[0].id,
      severity: "LOW",
      description: "Minor mic feedback in stage right audio monitor.",
      reported_by: "Audio Lead",
    });
    expect(incident.id).toBeDefined();

    const incidents = db.getIncidentsByEventId(weddingId);
    expect(incidents.some((i) => i.id === incident.id)).toBe(true);

    const resolved = db.resolveIncident(incident.id, "Replaced audio XLR cable with shielded line.");
    expect(resolved).toBe(true);
  });

  it("retrieves guests, handles attendance and enforces seating capacity", () => {
    const guests = db.getGuestsByEventId(weddingId);
    expect(guests.length).toBeGreaterThanOrEqual(6);

    const tables = db.getSeatingTablesByEventId(weddingId);
    expect(tables.length).toBeGreaterThanOrEqual(4);

    const table1 = tables[0];
    expect(table1.accessibility_friendly).toBe(true);

    // Assign a guest to table
    const unseatedGuest = guests.find((g) => g.id === "gst-w-3")!;
    const assignResult = db.assignGuestToTable(table1.id, unseatedGuest.id, 5);
    expect(assignResult.success).toBe(true);

    const assignments = db.getSeatingAssignmentsByEventId(weddingId);
    expect(assignments.some((a) => a.guest_id === unseatedGuest.id && a.table_id === table1.id)).toBe(true);
  });

  it("persists and resets sample events cleanly", () => {
    // Add temporary task
    const tsk = db.createTask({
      event_id: weddingId,
      title: "Temporary Task To Be Cleared",
      description: "Should disappear on reset",
      category: "Test",
      priority: "LOW",
      status: "NOT_STARTED",
      start_date: "2026-06-01",
      due_date: "2026-06-02",
      estimated_days: 1,
    });

    let tasks = db.getTasksByEventId(weddingId);
    expect(tasks.some((t) => t.id === tsk.id)).toBe(true);

    // Reset
    db.resetEventToSeed(weddingId);
    tasks = db.getTasksByEventId(weddingId);
    expect(tasks.some((t) => t.id === tsk.id)).toBe(false);
  });
});
