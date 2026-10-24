import { describe, it, expect } from "vitest";
import { interpolateTemplate, getAvailablePlaceholders } from "../domain/template.interpolator";

describe("Invitation Template Interpolator (Module 11)", () => {
  it("interpolates tokens accurately without leaking braces", () => {
    const template = "Dear {{guest_name}}, you are cordially invited to {{event_title}} on {{date}} at {{venue}}.";
    const result = interpolateTemplate(template, {
      guest_name: "Rajesh Sharma",
      event_title: "Aarav & Meera's Traditional Wedding",
      date: "August 23, 2026",
      venue: "The Grand Palace Hall",
    });

    expect(result).toBe(
      "Dear Rajesh Sharma, you are cordially invited to Aarav & Meera's Traditional Wedding on August 23, 2026 at The Grand Palace Hall."
    );
  });

  it("leaves unprovided tokens intact rather than rendering undefined", () => {
    const template = "Dress code is {{dress_code}}. Contact: {{contact_number}}.";
    const result = interpolateTemplate(template, {
      dress_code: "Traditional Festive",
    });

    expect(result).toBe("Dress code is Traditional Festive. Contact: {{contact_number}}.");
  });

  it("lists all available supported tokens", () => {
    const placeholders = getAvailablePlaceholders();
    expect(placeholders.length).toBeGreaterThanOrEqual(5);
    expect(placeholders.some((p) => p.token === "{{guest_name}}")).toBe(true);
    expect(placeholders.some((p) => p.token === "{{rsvp_link}}")).toBe(true);
  });
});
