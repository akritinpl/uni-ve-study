"use client";

import { useState } from "react";
import NoticeModal from "@/components/ui/NoticeModal";
import SlideScreen from "@/components/ui/SlideScreen";

export type Sex = "Male" | "Female";
export type Education =
  | "Less than high school"
  | "High school graduate"
  | "Some college"
  | "2 year degree"
  | "4 year degree"
  | "Professional degree"
  | "Doctorate";
export type WorkArrangement = "Fully remote" | "Fully on-site/in-office" | "Hybrid";
export type ProfessionalLevel = "Entry level" | "Mid level" | "Senior level" | "Manager" | "Executive";

export type DemographicsAnswers = {
  age: number;
  sex: Sex;
  education: Education;
  meetingsPerWeek: number;
  workArrangement: WorkArrangement;
  yearsAtJob: number;
  professionalLevel: ProfessionalLevel;
  industry: string;
  futureEmail: string;
};

const SEX_OPTIONS: Sex[] = ["Male", "Female"];
const EDUCATION_OPTIONS: Education[] = [
  "Less than high school",
  "High school graduate",
  "Some college",
  "2 year degree",
  "4 year degree",
  "Professional degree",
  "Doctorate",
];
const WORK_ARRANGEMENT_OPTIONS: WorkArrangement[] = ["Fully remote", "Fully on-site/in-office", "Hybrid"];
const PROFESSIONAL_LEVEL_OPTIONS: ProfessionalLevel[] = [
  "Entry level",
  "Mid level",
  "Senior level",
  "Manager",
  "Executive",
];

function PickList<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="pick-list">
      {options.map((opt) => (
        <div
          key={opt}
          className={`pick-card ${value === opt ? "sel" : ""}`}
          onClick={() => onChange(opt)}
        >
          <span className="pick-text">{opt}</span>
        </div>
      ))}
    </div>
  );
}

export default function DemographicsSurvey({
  onComplete,
  submitting = false,
  onBack,
}: {
  onComplete: (answers: DemographicsAnswers) => void;
  submitting?: boolean;
  onBack: () => void;
}) {
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<Sex | null>(null);
  const [education, setEducation] = useState<Education | null>(null);
  const [meetingsPerWeek, setMeetingsPerWeek] = useState("");
  const [workArrangement, setWorkArrangement] = useState<WorkArrangement | null>(null);
  const [yearsAtJob, setYearsAtJob] = useState("");
  const [professionalLevel, setProfessionalLevel] = useState<ProfessionalLevel | null>(null);
  const [industry, setIndustry] = useState("");
  const [futureEmail, setFutureEmail] = useState("");
  const [showIncompleteNotice, setShowIncompleteNotice] = useState(false);

  // futureEmail is intentionally excluded — it's optional (opt-in contact
  // for future studies), unlike every other field here.
  const valid =
    age.trim() !== "" &&
    sex !== null &&
    education !== null &&
    meetingsPerWeek.trim() !== "" &&
    workArrangement !== null &&
    yearsAtJob.trim() !== "" &&
    professionalLevel !== null &&
    industry.trim() !== "";

  return (
    <>
      <SlideScreen
        align="left"
        lines={["Last, please answer a few questions about yourself."]}
        onBack={onBack}
        continueMuted={!valid}
        submitting={submitting}
        onContinue={() => {
          if (!valid || sex === null || education === null || workArrangement === null || professionalLevel === null) {
            setShowIncompleteNotice(true);
            return;
          }
          onComplete({
            age: Number(age),
            sex,
            education,
            meetingsPerWeek: Number(meetingsPerWeek),
            workArrangement,
            yearsAtJob: Number(yearsAtJob),
            professionalLevel,
            industry: industry.trim(),
            futureEmail,
          });
        }}
      >
        <div className="slide-q-group">
          <p className="slide-q">
            What is your age?<span className="req">*</span>
          </p>
          <input
            type="number"
            min={0}
            className="slide-input"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        <div className="slide-q-group">
          <p className="slide-q">
            What is your sex?<span className="req">*</span>
          </p>
          <PickList options={SEX_OPTIONS} value={sex} onChange={setSex} />
        </div>

        <div className="slide-q-group">
          <p className="slide-q">
            What is your highest level of education?<span className="req">*</span>
          </p>
          <PickList options={EDUCATION_OPTIONS} value={education} onChange={setEducation} />
        </div>

        <div className="slide-q-group">
          <p className="slide-q">
            On average, how many meetings do you attend during a single work week?
            <span className="req">*</span>
          </p>
          <input
            type="number"
            min={0}
            className="slide-input"
            value={meetingsPerWeek}
            onChange={(e) => setMeetingsPerWeek(e.target.value)}
          />
        </div>

        <div className="slide-q-group">
          <p className="slide-q">
            What is your primary work arrangement?<span className="req">*</span>
          </p>
          <PickList options={WORK_ARRANGEMENT_OPTIONS} value={workArrangement} onChange={setWorkArrangement} />
        </div>

        <div className="slide-q-group">
          <p className="slide-q">
            For how many years have you been working at your current job?<span className="req">*</span>
          </p>
          <input
            type="number"
            min={0}
            className="slide-input"
            value={yearsAtJob}
            onChange={(e) => setYearsAtJob(e.target.value)}
          />
        </div>

        <div className="slide-q-group">
          <p className="slide-q">
            Which of the following positions most closely matches your current professional level?
            <span className="req">*</span>
          </p>
          <PickList options={PROFESSIONAL_LEVEL_OPTIONS} value={professionalLevel} onChange={setProfessionalLevel} />
        </div>

        <div className="slide-q-group">
          <p className="slide-q">
            In what industry do you work in?<span className="req">*</span>
          </p>
          <input
            type="text"
            className="slide-input"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
        </div>

        <div className="slide-q-group">
          <p className="slide-q">
            In the future, we will be conducting additional studies on the pros and cons of virtual
            meetings. If you would like to participate in those future surveys, please enter your
            email below.
          </p>
          <input
            type="email"
            className="slide-input"
            placeholder="Optional"
            value={futureEmail}
            onChange={(e) => setFutureEmail(e.target.value)}
          />
        </div>
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
