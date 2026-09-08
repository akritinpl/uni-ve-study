export const CONSULTANTS = ["Taylor Chen", "Morgan Rivera"] as const;

export type ConsultantName = (typeof CONSULTANTS)[number];

// Snake-cased suffix used for each consultant's dedicated columns on `task`
// (e.g. c_res_taylor_chen), since Postgres column names can't hold spaces.
export const CONSULTANT_COLUMN_SUFFIX: Record<ConsultantName, string> = {
  "Taylor Chen": "taylor_chen",
  "Morgan Rivera": "morgan_rivera",
};

// Shared display identity (avatar color/initials/short name) so each
// consultant looks the same everywhere they show up in the study.
export const CONSULTANT_META: Record<ConsultantName, { color: string; short: string; init: string }> = {
  "Taylor Chen": { color: "#378ADD", short: "Taylor", init: "TC" },
  "Morgan Rivera": { color: "#7F77DD", short: "Morgan", init: "MR" },
};
