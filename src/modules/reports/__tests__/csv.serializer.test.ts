import { describe, it, expect } from "vitest";
import { escapeCsvField, serializeRowsToCsv } from "../domain/csv.serializer";

describe("Module 14: RFC-4180 CSV Serializer", () => {
  it("escapes fields with commas, quotes, and newlines properly", () => {
    expect(escapeCsvField("Simple")).toBe("Simple");
    expect(escapeCsvField("Hello, World")).toBe('"Hello, World"');
    expect(escapeCsvField('Quotes "Inside"')).toBe('"Quotes ""Inside"""');
    expect(escapeCsvField("Line1\nLine2")).toBe('"Line1\nLine2"');
    expect(escapeCsvField(null)).toBe("");
    expect(escapeCsvField(undefined)).toBe("");
  });

  it("serializes tabular data into RFC-4180 CSV string", () => {
    const headers = ["Item", "Cost, INR", "Notes"];
    const rows = [
      ["Venue", 50000, "Deposit paid, receipt #123"],
      ['Catering "Gourmet"', 45000, "Vegan & Jain options included"],
    ];

    const csv = serializeRowsToCsv(headers, rows);
    const lines = csv.split("\r\n");

    expect(lines.length).toBe(3);
    expect(lines[0]).toBe('Item,"Cost, INR",Notes');
    expect(lines[1]).toBe('Venue,50000,"Deposit paid, receipt #123"');
    expect(lines[2]).toBe('"Catering ""Gourmet""",45000,Vegan & Jain options included');
  });
});
