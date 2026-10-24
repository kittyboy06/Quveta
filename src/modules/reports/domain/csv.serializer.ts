/**
 * Pure RFC-4180 compliant CSV serializer.
 */

export function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);

  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function serializeRowsToCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const headerLine = headers.map(escapeCsvField).join(",");
  const dataLines = rows.map((row) => row.map(escapeCsvField).join(","));
  return [headerLine, ...dataLines].join("\r\n");
}
