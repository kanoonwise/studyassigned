export interface AppealLetterInput {
  studentName: string;
  institutionName: string;
  panelName: string;
  decisionSummary: string;
  grounds: string[];
  evidence: string[];
}

/** AI-Flag Appeal Kit letter builder - a starting draft, not legal advice. */
export function generateAppealLetter(input: AppealLetterInput): string {
  const grounds =
    input.grounds.length > 0
      ? input.grounds.map((g, i) => `${i + 1}. ${g}`).join("\n")
      : "[state your grounds for appeal]";
  const evidence =
    input.evidence.length > 0
      ? input.evidence.map((e) => `- ${e}`).join("\n")
      : "- [list supporting evidence]";

  return [
    `To: ${input.panelName || "[the academic integrity panel]"}`,
    `From: ${input.studentName || "[your name]"}`,
    `Re: Appeal against an AI-generated content flag`,
    "",
    `I am writing to formally appeal the finding made against my submission at ` +
      `${input.institutionName || "[institution name]"}.`,
    "",
    `Summary of the decision being appealed:`,
    input.decisionSummary || "[summarise the decision and date]",
    "",
    `Grounds for appeal:`,
    grounds,
    "",
    `Supporting evidence:`,
    evidence,
    "",
    `I respectfully request that the panel review this decision in light of the above. ` +
      `I am happy to provide any further information required.`,
    "",
    `Please check your institution's own appeal procedure and deadline before submitting this letter.`,
  ].join("\n");
}

export const APPEAL_EVIDENCE_CHECKLIST = [
  "Version history or drafts showing your own writing process",
  "Notes, outlines or research materials predating the final submission",
  "Timestamps from a writing tool, cloud document, or the Writing Proof Vault",
  "Any AI-Use Disclosure you filed for this work",
  "Correspondence with a supervisor about the work in progress",
  "A copy of the report or notice that raised the flag",
];
