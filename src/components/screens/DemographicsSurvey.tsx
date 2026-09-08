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
export type DemographicsAnswers = {
  age: number;
  sex: Sex;
  education: Education;
  meetingsPerWeek: number;
  contact1Name: string;
  contact1Email: string;
  contact2Name: string;
  contact2Email: string;
  contact3Name: string;
  contact3Email: string;
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
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_ERROR = "Please enter a valid email address, e.g. janedoe@example.com.";
const CONTACT_EMAIL_REQUIRED_ERROR = "Please enter an email address for this contact.";

// All the email fields on this page are optional, so blank is valid too —
// only a non-empty value has to look like an email.
function isValidEmail(email: string) {
  const trimmed = email.trim();
  return trimmed === "" || EMAIL_RE.test(trimmed);
}

// A contact's email is only required once a name has been entered for them.
function contactEmailError(name: string, email: string): string | null {
  if (name.trim() !== "" && email.trim() === "") return CONTACT_EMAIL_REQUIRED_ERROR;
  if (!isValidEmail(email)) return EMAIL_ERROR;
  return null;
}

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
  const [contact1Name, setContact1Name] = useState("");
  const [contact1Email, setContact1Email] = useState("");
  const [contact2Name, setContact2Name] = useState("");
  const [contact2Email, setContact2Email] = useState("");
  const [contact3Name, setContact3Name] = useState("");
  const [contact3Email, setContact3Email] = useState("");
  const [contact1EmailTouched, setContact1EmailTouched] = useState(false);
  const [contact2EmailTouched, setContact2EmailTouched] = useState(false);
  const [contact3EmailTouched, setContact3EmailTouched] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const valid =
    age.trim() !== "" &&
    sex !== null &&
    education !== null &&
    meetingsPerWeek.trim() !== "";

  const contact1Error = contactEmailError(contact1Name, contact1Email);
  const contact2Error = contactEmailError(contact2Name, contact2Email);
  const contact3Error = contactEmailError(contact3Name, contact3Email);

  const emailsValid = !contact1Error && !contact2Error && !contact3Error;

  return (
    <>
      <SlideScreen
        align="left"
        lines={["Last, please answer a few questions about yourself."]}
        onBack={onBack}
        continueMuted={!valid || !emailsValid}
        submitting={submitting}
        onContinue={() => {
          if (!valid || sex === null || education === null) {
            setNoticeMessage("Please answer all the questions before continuing.");
            return;
          }
          if (!emailsValid) {
            setContact1EmailTouched(true);
            setContact2EmailTouched(true);
            setContact3EmailTouched(true);
            return;
          }
          onComplete({
            age: Number(age),
            sex,
            education,
            meetingsPerWeek: Number(meetingsPerWeek),
            contact1Name,
            contact1Email,
            contact2Name,
            contact2Email,
            contact3Name,
            contact3Email,
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
            step={1}
            className="slide-input"
            value={meetingsPerWeek}
            onChange={(e) => setMeetingsPerWeek(e.target.value.replace(/[^0-9]/g, ""))}
          />
        </div>

        <div className="slide-q-group">
          <p className="slide-q">
            As part of this study, we will also be reaching out to working professionals who
            regularly participate in either remote or in-person meetings.
          </p>
          <p className="slide-q">
            Please list three people you know who are currently working full-time and who
            regularly participate in workplace meetings. For each person, please provide their
            name and email address below.
          </p>
          <p className="slide-q">
            If possible, please also let these individuals know to look out for an email from Dr.
            Nikhil Awasty, Assistant Professor at the Peter T. Paul College of Business and
            Economics, inviting them to participate in a research study.
          </p>
        </div>

        <div className="slide-q-group">
          <div className="contact-row">
            <p className="slide-q">Contact 1</p>
            <input
              type="text"
              className="slide-input"
              placeholder="Name"
              value={contact1Name}
              onChange={(e) => setContact1Name(e.target.value)}
              onBlur={() => setContact1EmailTouched(true)}
            />
          </div>
          <div className="contact-row">
            <p className="slide-q">Email address:</p>
            <input
              type="email"
              className="slide-input"
              placeholder="e.g. jane.doe@email.com"
              value={contact1Email}
              onChange={(e) => setContact1Email(e.target.value)}
              onBlur={() => setContact1EmailTouched(true)}
            />
          </div>
          {contact1EmailTouched && contact1Error && (
            <p className="field-error contact-error">{contact1Error}</p>
          )}
        </div>

        <div className="slide-q-group">
          <div className="contact-row">
            <p className="slide-q">Contact 2</p>
            <input
              type="text"
              className="slide-input"
              placeholder="Name"
              value={contact2Name}
              onChange={(e) => setContact2Name(e.target.value)}
              onBlur={() => setContact2EmailTouched(true)}
            />
          </div>
          <div className="contact-row">
            <p className="slide-q">Email address:</p>
            <input
              type="email"
              className="slide-input"
              placeholder="e.g. jane.doe@email.com"
              value={contact2Email}
              onChange={(e) => setContact2Email(e.target.value)}
              onBlur={() => setContact2EmailTouched(true)}
            />
          </div>
          {contact2EmailTouched && contact2Error && (
            <p className="field-error contact-error">{contact2Error}</p>
          )}
        </div>

        <div className="slide-q-group">
          <div className="contact-row">
            <p className="slide-q">Contact 3</p>
            <input
              type="text"
              className="slide-input"
              placeholder="Name"
              value={contact3Name}
              onChange={(e) => setContact3Name(e.target.value)}
              onBlur={() => setContact3EmailTouched(true)}
            />
          </div>
          <div className="contact-row">
            <p className="slide-q">Email address:</p>
            <input
              type="email"
              className="slide-input"
              placeholder="e.g. jane.doe@email.com"
              value={contact3Email}
              onChange={(e) => setContact3Email(e.target.value)}
              onBlur={() => setContact3EmailTouched(true)}
            />
          </div>
          {contact3EmailTouched && contact3Error && (
            <p className="field-error contact-error">{contact3Error}</p>
          )}
        </div>
      </SlideScreen>
      {noticeMessage && (
        <NoticeModal message={noticeMessage} onDismiss={() => setNoticeMessage(null)} />
      )}
    </>
  );
}
