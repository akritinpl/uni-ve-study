"use client";

import { useState } from "react";
import SlideScreen from "@/components/ui/SlideScreen";

type ConsentScreenProps = {
  onContinue: () => void;
  onBack: () => void;
  // true once /api/consent has already succeeded for this participant —
  // re-showing the live checkbox form would let a resubmit slip through on
  // browser back, so render an already-consented notice instead.
  locked?: boolean;
  // true while the consent POST is in flight, so the button can show
  // that something's happening instead of appearing to hang.
  submitting?: boolean;
};

export default function ConsentScreen({
  onContinue,
  onBack,
  locked = false,
  submitting = false,
}: ConsentScreenProps) {
  const [consented, setConsented] = useState(false);

  return (
    <SlideScreen
      title="IRB informed consent"
      align="left"
      lines={["Please review the consent document below before continuing."]}
      onBack={onBack}
      onContinue={onContinue}
      continueLabel={submitting ? "Saving…" : "Continue"}
      continueDisabled={!locked && !consented}
      submitting={submitting}
    >
      <div className="consent-box" style={{ marginTop: 28 }}>
        <p>
          <strong>Researcher and title of study</strong>
          <br />
          This study is being conducted by Professor Nikhil Awasty, an Assistant Professor at the
          University of New Hampshire. The University of New Hampshire&apos;s Institutional Review
          Board for the Protection of Human Subjects in Research has approved the use of human
          subjects in this study (<strong>IRB-FY2024-134</strong>).
        </p>

        <p>
          <strong>What is the purpose of this form?</strong>
          <br />
          This consent form describes the research study and helps you to decide if you want to
          participate. It provides important information about what you will be asked to do in
          the study, about the risks and benefits of participating in the study, and about your
          rights as a research participant. You should:
        </p>
        <ul>
          <li>Read the information in this document carefully.</li>
          <li>
            Ask the research personnel any questions, particularly if you do not understand
            something.
          </li>
          <li>
            Not agree to participate until all your questions have been answered, or until you
            are sure that you want to.
          </li>
        </ul>

        <p>
          <strong>What is the purpose of this study?</strong>
          <br />
          The purpose of this study is to examine people&apos;s opinions and attitudes about
          virtual workplace meetings. In order to participate, individuals must be at least
          18-years-old.
        </p>

        <p>
          <strong>What does participation involve?</strong>
          <br />
          This study involves taking a survey and answering questions. Participants will be
          directed to an online survey platform where they will read and respond to questions.
        </p>

        <p>
          <strong>What are the possible risks of participating?</strong>
          <br />
          Participation in this study is expected to present minimal risk to you.
        </p>

        <p>
          <strong>What are the possible benefits of participating in this study?</strong>
          <br />
          You are not likely to benefit directly from this study, but I hope that others will
          benefit from the results of this research. This study could help managers and employees
          better understand how they can run virtual meetings to improve workplace outcomes.
        </p>

        <p>
          <strong>Can you withdraw from this study?</strong>
          <br />
          If you agree to participate in this study and you then change your mind, you may stop
          participating at any time simply by closing your browser window. Incomplete data will
          not be utilized.
        </p>

        <p>
          <strong>How will the confidentiality of your records be protected?</strong>
          <br />
          Responses will be stored in an online cloud space that is password protected and
          accessible only by research personnel. If an article about this study is published, you
          will not be able to be directly identified. The data will be reported in aggregate. The
          deidentified data may be used in reports, presentations, and publications, and may be
          shared with other researchers or posted to an online repository.
        </p>

        <p>
          <strong>Whom to contact if you have questions about this study</strong>
          <br />
          If you have any questions pertaining to the research you can contact Dr. Nikhil Awasty
          (
          <a href="mailto:nikhil.awasty@unh.edu">nikhil.awasty@unh.edu</a>
          ).
          <br />
          <br />
          If you have questions about your rights as a research subject you can contact Melissa
          McGee in UNH Research Integrity Services at 603-862-2005 or{" "}
          <a href="mailto:melissa.mcgee@unh.edu">melissa.mcgee@unh.edu</a> to discuss them.
        </p>
      </div>

      {locked ? (
        <p className="survey-note" style={{ marginTop: 20 }}>
          You already agreed to this consent document earlier in this session.
        </p>
      ) : (
        <label className="consent-check" style={{ marginTop: 20 }}>
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => setConsented(e.target.checked)}
          />
          <span>I have read the informed consent information above and agree to participate.</span>
        </label>
      )}
    </SlideScreen>
  );
}
