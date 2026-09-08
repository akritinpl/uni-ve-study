import { supabaseServer } from "@/lib/supabase-server";

// Column name for each field the specific-meeting-* flow can save, keyed by
// the camelCase name the client sends. Each page in that flow posts only the
// fields it collected — see handleSpecificMeetingSave in lib/study-context.tsx
// — so a request body only ever contains a subset of these keys.
const FIELD_COLUMNS: Record<string, string> = {
  recurring: "recurring",
  dayOfWeek: "day_of_week",
  memoryStrength: "memory_strength",
  attendee1: "attendee1",
  attendee2: "attendee2",
  hadAgenda: "had_agenda",
  startedOnTime: "started_on_time",
  productivity: "productivity",
  productivityReason: "productivity_reason",
  gazeListening: "gaze_listening",
  gazeSpeaking: "gaze_speaking",
  impressions: "impressions",
};

export async function POST(request: Request) {
  const body = await request.json();
  const { participantId } = body;

  if (typeof participantId !== "string") {
    return Response.json({ error: "participantId is required" }, { status: 400 });
  }

  const row: Record<string, unknown> = { participant_id: participantId };
  for (const [field, column] of Object.entries(FIELD_COLUMNS)) {
    if (field in body) row[column] = body[field];
  }

  const { error } = await supabaseServer()
    .from("specific_meeting")
    .upsert(row, { onConflict: "participant_id" });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
