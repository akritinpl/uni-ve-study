"use client";

import { Fragment, useState } from "react";
import NoticeModal from "@/components/ui/NoticeModal";
import SlideScreen from "@/components/ui/SlideScreen";

const IMPRESSION_ITEMS = [
  ["appropriate", "Socially appropriate"],
  ["professional", "Professional"],
  ["competent", "Competent"],
  ["respectful", "Respectful"],
  ["rude", "Rude"],
  ["disengaged", "Socially disengaged"],
] as const;

const RECEPTION_ITEMS = [
  ["receptive", "Others were receptive to this person’s input"],
  ["takenSeriously", "Others took this person’s contributions seriously"],
  ["responded", "Others responded to this person’s ideas"],
  ["builtOn", "Others built on this person’s comments"],
  ["influenced", "This person’s contribution appeared to influence the discussion"],
] as const;

const STATUS_ITEMS = [["grantedStatus", "They were granted a lot of status by the group"]] as const;

const SHOULD_ITEMS = [
  ["gainStatus", "Gain a lot of status at work"],
  ["offeredLead", "Be offered the opportunity to lead at work"],
  ["receiveRespect", "Receive respect from others at work"],
] as const;

type Key =
  | (typeof IMPRESSION_ITEMS)[number][0]
  | (typeof RECEPTION_ITEMS)[number][0]
  | (typeof STATUS_ITEMS)[number][0]
  | (typeof SHOULD_ITEMS)[number][0];

export type SpecificMeetingImpressionsAnswers = Record<Key, number>;

const SCALE = [1, 2, 3, 4, 5, 6, 7];

type Group = {
  intro: string;
  note?: string;
  leftLabel: string;
  rightLabel: string;
  items: readonly (readonly [string, string])[];
};

export default function SpecificMeetingImpressions({
  personInitials,
  onComplete,
  onBack,
}: {
  personInitials: string;
  onComplete: (answers: SpecificMeetingImpressionsAnswers) => void;
  onBack: () => void;
}) {
  const [values, setValues] = useState<Partial<Record<Key, number>>>({});
  const [showIncompleteNotice, setShowIncompleteNotice] = useState(false);
  const person = personInitials.trim() !== "" ? personInitials : "this attendee";

  const groups: Group[] = [
    {
      intro: `Overall, this person ${person} came across as`,
      leftLabel: "Strongly agree",
      rightLabel: "Strongly disagree",
      items: IMPRESSION_ITEMS,
    },
    {
      intro: `After this person ${person} contributed/spoke, it seemed that…`,
      leftLabel: "Strongly agree",
      rightLabel: "Strongly disagree",
      items: RECEPTION_ITEMS,
    },
    {
      intro: `After this person ${person} contributed/spoke, it seemed that…`,
      leftLabel: "Strongly agree",
      rightLabel: "Strongly disagree",
      items: STATUS_ITEMS,
    },
    {
      intro: `Based on how this person ${person} presented themselves during the virtual meeting, do you think that ${person} should…`,
      leftLabel: "Strongly disagree",
      rightLabel: "Strongly agree",
      items: SHOULD_ITEMS,
    },
  ];

  const allKeys: Key[] = groups.flatMap((g) => g.items.map((i) => i[0])) as Key[];
  const valid = allKeys.every((key) => values[key] !== undefined);

  function setValue(key: string, value: number) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <>
      <SlideScreen
        align="left"
        innerClassName="impressions-wide"
        lines={["Please answer the following questions."]}
        onBack={onBack}
        continueMuted={!valid}
        onContinue={() => {
          if (!valid) {
            setShowIncompleteNotice(true);
            return;
          }
          onComplete(values as SpecificMeetingImpressionsAnswers);
        }}
      >
        {groups.map((group, i) => (
          <Fragment key={i}>
            <div className="likert-section">
              {group.intro}
              {group.note && <span className="note">{group.note}</span>}
            </div>
            <div className="likert-group">
              <div className="likert-corner-cell" />
              {SCALE.map((n) => (
                <div className="likert-num-cell" key={n}>
                  <span className="end">
                    {n === 1 ? group.leftLabel : n === 7 ? group.rightLabel : ""}
                  </span>
                  <span className="num">{n}</span>
                </div>
              ))}
              {group.items.map(([key, label]) => (
                <Fragment key={key}>
                  <span className="likert-label">{label}</span>
                  {SCALE.map((n) => (
                    <button
                      type="button"
                      key={n}
                      className={`likert-dot ${values[key as Key] === n ? "sel" : ""}`}
                      aria-label={`${label}: ${n}`}
                      onClick={() => setValue(key, n)}
                    >
                      <span className="likert-radio" />
                    </button>
                  ))}
                </Fragment>
              ))}
            </div>
          </Fragment>
        ))}
      </SlideScreen>
      {showIncompleteNotice && (
        <NoticeModal
          message="Please answer all the questions before continuing."
          onDismiss={() => setShowIncompleteNotice(false)}
        />
      )}
    </>
  );
}
