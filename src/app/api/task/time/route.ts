import { CONSULTANT_COLUMN_SUFFIX, CONSULTANTS } from "@/lib/consultants";
import { supabaseServer } from "@/lib/supabase-server";
import type { TimeAllocation } from "@/lib/types";

export async function POST(request: Request) {
  const { participantId, timeC }: { participantId: string; timeC: TimeAllocation } =
    await request.json();

  if (typeof participantId !== "string") {
    return Response.json({ error: "participantId is required" }, { status: 400 });
  }

  const total = Object.values(timeC).reduce((sum, n) => sum + n, 0);
  if (total !== 30) {
    return Response.json({ error: "timeC values must sum to 30" }, { status: 400 });
  }

  const row: Record<string, unknown> = {};
  for (const name of CONSULTANTS) {
    row[`time_c_${CONSULTANT_COLUMN_SUFFIX[name]}`] = timeC[name];
  }

  const { error } = await supabaseServer().from("task").update(row).eq("participant_id", participantId);

  if (error) {
    console.error(error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
