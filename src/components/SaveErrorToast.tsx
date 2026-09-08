"use client";

import { useStudy } from "@/lib/study-context";

export default function SaveErrorToast() {
  const { saveError } = useStudy();
  if (!saveError) return null;
  return (
    <div
      className="save-notice"
      style={{ position: "fixed", bottom: 16, right: 16, maxWidth: 280, zIndex: 10 }}
    >
      We couldn&rsquo;t save your last response to the server. You can keep going &mdash;
      we&rsquo;ll just note that this session has gaps.
    </div>
  );
}
