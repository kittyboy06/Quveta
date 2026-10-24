export interface InterpolationContext {
  guest_name?: string;
  event_title?: string;
  date?: string;
  venue?: string;
  dress_code?: string;
  rsvp_link?: string;
  [key: string]: string | undefined;
}

export function interpolateTemplate(templateStr: string, context: InterpolationContext): string {
  if (!templateStr) return "";

  return templateStr.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, tokenName) => {
    const val = context[tokenName];
    if (val !== undefined && val !== null) {
      return String(val);
    }
    // Return original placeholder if not provided
    return match;
  });
}

export function getAvailablePlaceholders(): { token: string; description: string; sample: string }[] {
  return [
    { token: "{{guest_name}}", description: "Recipient's full name", sample: "Rajesh Sharma" },
    { token: "{{event_title}}", description: "Title of the celebration", sample: "Aarav & Meera's Wedding" },
    { token: "{{date}}", description: "Formatted event date and time", sample: "Sunday, August 23, 2026" },
    { token: "{{venue}}", description: "Venue name and city", sample: "The Grand Palace Hall, Bangalore" },
    { token: "{{dress_code}}", description: "Attire recommendation", sample: "Traditional Festive Silk" },
    { token: "{{rsvp_link}}", description: "Direct response link", sample: "https://quveta.app/rsvp/evt-123" },
  ];
}
