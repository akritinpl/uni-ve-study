import { CONSULTANT_COLUMN_SUFFIX, CONSULTANTS } from "@/lib/consultants";
import { agreementPct } from "@/lib/matching";
import { supabaseServer } from "@/lib/supabase-server";
import type { TaskSubmission } from "@/lib/types";

export async function POST(request: Request) {
  const body: TaskSubmission = await request.json();
  const { participantId, pRes, pStrongRec, pWeakRec, consultantData } = body;

  if (typeof participantId !== "string") {
    return Response.json({ error: "participantId is required" }, { status: 400 });
  }

  const row: Record<string, unknown> = {
    participant_id: participantId,
    p_res: pRes,
    p_strong_rec: pStrongRec,
    p_weak_rec: pWeakRec,
  };
  for (const name of CONSULTANTS) {
    const suffix = CONSULTANT_COLUMN_SUFFIX[name];
    row[`c_res_${suffix}`] = consultantData[name].ratings;
    row[`c_strong_rec_${suffix}`] = consultantData[name].strongRec;
    row[`c_weak_rec_${suffix}`] = consultantData[name].weakRec;
    row[`c_agreement_pct_${suffix}`] = agreementPct(pRes, consultantData[name].ratings);
  }

  const { error } = await supabaseServer().from("task").insert(row);

  if (error) {
    console.error(error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
