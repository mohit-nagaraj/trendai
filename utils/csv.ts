import { parse } from 'csv-parse/sync';

/**
 * Parses a CSV string or buffer into an array of objects using the first row as headers.
 * Handles quoted fields and commas inside quotes.
 * Skips rows that fail to parse.
 * @param input CSV string or Buffer
 * @returns Array of objects (one per row)
 */
export function parseCsvToObjects(input: string | Buffer): Record<string, any>[] {
  try {
    return parse(input, {
      columns: true, // Use first row as header
      skip_empty_lines: true,
      trim: true,
      bom: true,
    });
  } catch (e) {
    // Fallback: try to parse line by line, skipping bad lines
    const lines = input.toString().split(/\r?\n/);
    const [headerLine, ...dataLines] = lines;
    const headers = headerLine.split(',');
    const results: Record<string, any>[] = [];
    for (const line of dataLines) {
      if (!line.trim()) continue;
      try {
        const row = parse(headerLine + '\n' + line, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          bom: true,
        });
        if (row && row[0]) results.push(row[0]);
      } catch {
        // skip this line
        continue;
      }
    }
    return results;
  }
} 