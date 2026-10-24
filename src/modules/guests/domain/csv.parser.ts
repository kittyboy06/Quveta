export interface ParsedGuestRow {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  plus_one_allowed: boolean;
  plus_one_name?: string;
  dietary_restrictions: string[];
  accessibility_needs: string[];
  notes?: string;
}

export function parseGuestsCsv(csvContent: string): { guests: ParsedGuestRow[]; errors: string[] } {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { guests: [], errors: ["CSV file must contain a header row and at least one data row."] };
  }

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[\s_]+/g, ""));
  const guests: ParsedGuestRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Split taking care of simple quoted strings
    const cols = parseCsvLine(rawLine);

    if (cols.length < 2) {
      errors.push(`Row ${i + 1}: Incomplete row with fewer than 2 columns.`);
      continue;
    }

    const rowObj: Record<string, string> = {};
    header.forEach((h, idx) => {
      rowObj[h] = cols[idx] || "";
    });

    const firstName = rowObj["firstname"] || rowObj["first"] || cols[0];
    const lastName = rowObj["lastname"] || rowObj["last"] || cols[1];

    if (!firstName || !lastName) {
      errors.push(`Row ${i + 1}: Missing First Name or Last Name.`);
      continue;
    }

    const email = rowObj["email"] || (cols[2]?.includes("@") ? cols[2] : undefined);
    const phone = rowObj["phone"] || (cols[3]?.match(/[\d+]/) ? cols[3] : undefined);
    const dietaryRaw = rowObj["dietary"] || rowObj["dietaryrestrictions"] || "";
    const accessibilityRaw = rowObj["accessibility"] || rowObj["accessibilityneeds"] || "";
    const plusOneRaw = rowObj["plusone"] || rowObj["plusoneallowed"] || "";

    const dietary = dietaryRaw
      ? dietaryRaw.split(";").map((s) => s.trim().toUpperCase().replace(/\s+/g, "_")).filter(Boolean)
      : [];
    const accessibility = accessibilityRaw
      ? accessibilityRaw.split(";").map((s) => s.trim().toUpperCase().replace(/\s+/g, "_")).filter(Boolean)
      : [];

    guests.push({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email?.trim(),
      phone: phone?.trim(),
      plus_one_allowed: plusOneRaw.toLowerCase() === "true" || plusOneRaw.toLowerCase() === "yes" || plusOneRaw === "1",
      plus_one_name: rowObj["plusonename"] || undefined,
      dietary_restrictions: dietary,
      accessibility_needs: accessibility,
      notes: rowObj["notes"] || undefined,
    });
  }

  return { guests, errors };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function exportGuestsToCsv(
  guests: {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    rsvp_status: string;
    plus_one_allowed: boolean;
    plus_one_name?: string;
    dietary_restrictions: string[];
    accessibility_needs: string[];
  }[]
): string {
  const headers = [
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "RSVP Status",
    "Plus One Allowed",
    "Plus One Name",
    "Dietary Restrictions",
    "Accessibility Needs",
  ];

  const rows = guests.map((g) => [
    escapeCsv(g.first_name),
    escapeCsv(g.last_name),
    escapeCsv(g.email || ""),
    escapeCsv(g.phone || ""),
    escapeCsv(g.rsvp_status),
    escapeCsv(g.plus_one_allowed ? "Yes" : "No"),
    escapeCsv(g.plus_one_name || ""),
    escapeCsv((g.dietary_restrictions || []).join("; ")),
    escapeCsv((g.accessibility_needs || []).join("; ")),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
}

function escapeCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n") || val.includes("\r")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
