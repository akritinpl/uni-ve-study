import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const { participantId, refinedRec, frustration, wouldChange } = await request.json();

  if (typeof participantId !== "string") {
    return Response.json({ error: "participantId is required" }, { status: 400 });
  }

  const { error } = await supabaseServer().from("post_task_vm").insert({
    participant_id: participantId,
    refined_rec: refinedRec ?? null,
    frustration: frustration ?? null,
    would_change: wouldChange ?? null,
  });

  if (error) {
    console.error(error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
