// Exports one row per participant, joining across all study tables.
// Run with: npx tsx scripts/export-csv.ts [output-path]
//
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in
// .env.local since it reads with the service_role key.

import { config } from "dotenv";
import { writeFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local", quiet: true });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

const OUT_PATH = process.argv[2] ?? "export.csv";

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

async function fetchAll(table: string) {
  const { data, error } = await supabase.from(table).select("*");
  if (error) throw error;
  return data ?? [];
}

async function main() {
  const [consent, preTask, task, postTask, specificMeeting, demographics] = await Promise.all([
    fetchAll("irb_consent"),
    fetchAll("pre_task"),
    fetchAll("task"),
    fetchAll("post_task_vm"),
    fetchAll("specific_meeting"),
    fetchAll("demographics"),
  ]);

  const byParticipant = new Map<string, Record<string, unknown>>();

  // Seed one row per participant from irb_consent (every participant has
  // exactly one row there, and every other table FKs onto it).
  for (const row of consent) {
    const { participant_id, ...rest } = row;
    byParticipant.set(participant_id, { participant_id, ...prefix("consent", rest) });
  }

  function prefix(table: string, row: Record<string, unknown>) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) out[`${table}.${k}`] = v;
    return out;
  }

  function merge(table: string, rows: Record<string, unknown>[]) {
    for (const row of rows) {
      const { participant_id, ...rest } = row;
      const existing = byParticipant.get(participant_id as string);
      if (!existing) continue; // orphaned row with no consent record — skip
      Object.assign(existing, prefix(table, rest));
    }
  }

  merge("pre_task", preTask);
  merge("task", task);
  merge("post_task_vm", postTask);
  merge("specific_meeting", specificMeeting);
  merge("demographics", demographics);

  const rows = [...byParticipant.values()];

  // Union of every column seen across all rows, in a stable order (grouped
  // by table, in the order the tables were merged above).
  const columns: string[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    }
  }

  const lines = [columns.join(",")];
  for (const row of rows) {
    lines.push(columns.map((col) => csvCell(row[col])).join(","));
  }

  writeFileSync(OUT_PATH, lines.join("\n") + "\n");
  console.log(`Wrote ${rows.length} rows x ${columns.length} columns to ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
