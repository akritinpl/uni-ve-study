// Generates N synthetic participants across every study table, reusing the
// app's own consultant-matching logic so the data is internally consistent
// (agreement %s, strong/weak picks, etc. all derive the same way the real
// flow produces them). Run with: npx tsx scripts/seed-sample-data.ts [count]
//
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in
// .env.local (loaded below) since it writes with the service_role key.

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { CONSULTANT_COLUMN_SUFFIX, CONSULTANTS } from "../src/lib/consultants";
import { generateConsultantData, agreementPct, type Ratings } from "../src/lib/matching";
import { SUGGESTIONS } from "../src/lib/suggestions";

config({ path: ".env.local", quiet: true });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

const COUNT = Number(process.argv[2] ?? 15);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickTwoDistinct(ids: number[]): [number, number] {
  const shuffled = [...ids].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function likert7(): number {
  return randInt(1, 7);
}

const RECIDS = SUGGESTIONS.map((s) => s.recId);

const EDUCATION_OPTIONS = [
  "Less than high school",
  "High school graduate",
  "Some college",
  "2 year degree",
  "4 year degree",
  "Professional degree",
  "Doctorate",
] as const;

const WORK_ARRANGEMENTS = ["Fully remote", "Fully on-site/in-office", "Hybrid"] as const;

const PROFESSIONAL_LEVELS = ["Entry level", "Mid level", "Senior level", "Manager", "Executive"] as const;

const INDUSTRIES = ["Technology", "Healthcare", "Finance", "Education", "Retail", "Manufacturing", "Government"];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const REFINED_RECS = [
  "I'd add clearer agendas shared in advance.",
  "I'd keep cameras optional but encourage check-ins.",
  "I'd rotate who leads the meeting each week.",
  "I'd cap meetings at 30 minutes by default.",
  "",
];

const FREE_TEXT_POOL = [
  "It felt a bit rushed but overall productive.",
  "I wish more people had spoken up.",
  "The lack of an agenda made it hard to follow.",
  "It was efficient and stayed on topic.",
  "",
];

async function main() {
  console.log(`Seeding ${COUNT} synthetic participants...`);

  for (let i = 0; i < COUNT; i++) {
    // 1. irb_consent
    const { data: consentRow, error: consentErr } = await supabase
      .from("irb_consent")
      .insert({ irb_consented: true })
      .select("participant_id")
      .single();
    if (consentErr) throw consentErr;
    const participantId: string = consentRow.participant_id;

    // 2. pre_task
    await supabase
      .from("pre_task")
      .insert({ participant_id: participantId, pre_task_change: pick(FREE_TEXT_POOL) || null });

    // 3. task
    const pRes: Ratings = {};
    for (const recId of RECIDS) pRes[recId] = Math.random() < 0.5;
    const pStrongRec = pickTwoDistinct(RECIDS.filter((id) => pRes[id]).length >= 2
      ? RECIDS.filter((id) => pRes[id])
      : RECIDS);
    const pWeakRec = pickTwoDistinct(RECIDS.filter((id) => !pRes[id] && !pStrongRec.includes(id)).length >= 2
      ? RECIDS.filter((id) => !pRes[id] && !pStrongRec.includes(id))
      : RECIDS.filter((id) => !pStrongRec.includes(id)));

    const consultantData = generateConsultantData(
      participantId,
      pRes,
      pStrongRec as [number, number],
      pWeakRec as [number, number],
    );

    const taskRow: Record<string, unknown> = {
      participant_id: participantId,
      p_res: pRes,
      p_strong_rec: pStrongRec,
      p_weak_rec: pWeakRec,
    };
    const timeSplit = randInt(0, 30);
    for (const name of CONSULTANTS) {
      const suffix = CONSULTANT_COLUMN_SUFFIX[name];
      taskRow[`c_res_${suffix}`] = consultantData[name].ratings;
      taskRow[`c_strong_rec_${suffix}`] = consultantData[name].strongRec;
      taskRow[`c_weak_rec_${suffix}`] = consultantData[name].weakRec;
      taskRow[`c_agreement_pct_${suffix}`] = agreementPct(pRes, consultantData[name].ratings);
    }
    taskRow[`time_c_${CONSULTANT_COLUMN_SUFFIX[CONSULTANTS[0]]}`] = timeSplit;
    taskRow[`time_c_${CONSULTANT_COLUMN_SUFFIX[CONSULTANTS[1]]}`] = 30 - timeSplit;

    const { error: taskErr } = await supabase.from("task").insert(taskRow);
    if (taskErr) throw taskErr;

    // 4. post_task_vm
    await supabase.from("post_task_vm").insert({
      participant_id: participantId,
      refined_rec: pick(REFINED_RECS) || null,
      frustration: pick(FREE_TEXT_POOL) || null,
      would_change: pick(FREE_TEXT_POOL) || null,
    });

    // 5. specific_meeting
    const impressionKeys = [
      "appropriate",
      "professional",
      "competent",
      "respectful",
      "rude",
      "disengaged",
      "receptive",
      "takenSeriously",
      "responded",
      "builtOn",
      "influenced",
      "grantedStatus",
      "gainStatus",
      "offeredLead",
      "receiveRespect",
    ];
    const impressions: Record<string, number> = {};
    for (const key of impressionKeys) impressions[key] = likert7();

    await supabase.from("specific_meeting").upsert(
      {
        participant_id: participantId,
        recurring: pick(["recurring", "one-off"]),
        day_of_week: pick(DAYS),
        memory_strength: likert7(),
        attendee1: pick(["a coworker", "my manager", "a client", "a teammate"]),
        attendee2: pick(["another coworker", "a stakeholder", "an intern", "a vendor"]),
        had_agenda: Math.random() < 0.5,
        started_on_time: Math.random() < 0.7,
        productivity: likert7(),
        productivity_reason: pick(FREE_TEXT_POOL) || null,
        gaze_listening: likert7(),
        gaze_speaking: likert7(),
        impressions,
      },
      { onConflict: "participant_id" },
    );

    // 6. demographics
    await supabase.from("demographics").insert({
      participant_id: participantId,
      age: randInt(22, 64),
      sex: pick(["Male", "Female"]),
      education: pick(EDUCATION_OPTIONS),
      meetings_per_week: randInt(1, 20),
      work_arrangement: pick(WORK_ARRANGEMENTS),
      years_at_job: randInt(0, 30),
      professional_level: pick(PROFESSIONAL_LEVELS),
      industry: pick(INDUSTRIES),
      future_email: null,
    });

    console.log(`  [${i + 1}/${COUNT}] ${participantId}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
