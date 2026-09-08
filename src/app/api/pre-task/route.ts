import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const { participantId, preTaskChange } = await request.json();

  if (typeof participantId !== "string") {
    return Response.json({ error: "participantId is required" }, { status: 400 });
  }

  const { error } = await supabaseServer()
    .from("pre_task")
    .insert({ participant_id: participantId, pre_task_change: preTaskChange ?? null });

  if (error) {
    console.error(error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
