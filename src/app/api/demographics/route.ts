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
    futureEmail,
    contact1Name,
    contact1Email,
    contact2Name,
    contact2Email,
    contact3Name,
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
    future_email: futureEmail?.trim() ? futureEmail.trim() : null,
    contact_1_name: contact1Name?.trim() ? contact1Name.trim() : null,
    contact_1_email: contact1Email?.trim() ? contact1Email.trim() : null,
    contact_2_name: contact2Name?.trim() ? contact2Name.trim() : null,
    contact_2_email: contact2Email?.trim() ? contact2Email.trim() : null,
    contact_3_name: contact3Name?.trim() ? contact3Name.trim() : null,
    contact_3_email: contact3Email?.trim() ? contact3Email.trim() : null,
  });

  if (error) {
    console.error(error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
