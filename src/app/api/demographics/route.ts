import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    participantId,
    age,
    sex,
    education,
    meetingsPerWeek,
    workArrangement,
    yearsAtJob,
    professionalLevel,
    industry,
    futureEmail,
    contact1Email,
    contact2Email,
    contact3Email,
  } = body;

  if (typeof participantId !== "string") {
    return Response.json({ error: "participantId is required" }, { status: 400 });
  }

  const { error } = await supabaseServer().from("demographics").insert({
    participant_id: participantId,
    age,
    sex,
    education,
    meetings_per_week: meetingsPerWeek,
    work_arrangement: workArrangement,
    years_at_job: yearsAtJob,
    professional_level: professionalLevel,
    industry,
    future_email: futureEmail?.trim() ? futureEmail.trim() : null,
    contact_1_email: contact1Email?.trim() ? contact1Email.trim() : null,
    contact_2_email: contact2Email?.trim() ? contact2Email.trim() : null,
    contact_3_email: contact3Email?.trim() ? contact3Email.trim() : null,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
