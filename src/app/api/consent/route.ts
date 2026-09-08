import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const { irbConsented } = await request.json();

  if (typeof irbConsented !== "boolean") {
    return Response.json({ error: "irbConsented must be a boolean" }, { status: 400 });
  }

  const { data, error } = await supabaseServer()
    .from("irb_consent")
    .insert({ irb_consented: irbConsented })
    .select("participant_id")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ participantId: data.participant_id });
}
