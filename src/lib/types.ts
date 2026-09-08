import type { ConsultantName } from "./consultants";
import type { ConsultantData, Ratings } from "./matching";

export type TaskSubmission = {
  participantId: string;
  pRes: Ratings;
  pStrongRec: [number, number] | null;
  pWeakRec: [number, number] | null;
  consultantData: Record<ConsultantName, ConsultantData>;
};

export type TimeAllocation = Record<ConsultantName, number>;
