/**
 * Flags enquiry-form submissions that ask for something we never do
 * (ghostwriting, lowering a similarity/AI score, fake data, unauthorised
 * originality-tool access - see CLAUDE.md). A match doesn't reject the
 * submission; it's stored with flagged=true and flag_reason for a human on
 * the team to review, and the student sees an explanation of what we can
 * do instead.
 */
export interface ScreeningResult {
  flagged: boolean;
  reason: string | null;
}

interface Rule {
  reason: string;
  pattern: RegExp;
}

const RULES: Rule[] = [
  {
    reason: "Asked us to write their thesis, assignment or other submitted work",
    pattern:
      /\b(write|do|complete|finish)\s+(my|our|the)\s+(thesis|dissertation|assignment|essay|paper|report)\b/i,
  },
  {
    reason: "Asked to lower or remove a similarity or AI-detection score",
    pattern:
      /\b(lower|reduce|remove|bypass|beat|trick|fool|evade)\b.{0,30}\b(plagiarism|similarity|turnitin|ai\s*(detection|score|flag)|drillbit|shodhshuddhi)\b/i,
  },
  {
    reason: "Asked for fabricated data or references",
    pattern:
      /\b(fake|fabricat\w*|made[\s-]up|invent\w*)\b.{0,20}\b(data|references?|citations?|results?)\b/i,
  },
  {
    reason: "Asked for unauthorised access to an originality-checking tool",
    pattern:
      /\b(hack\w*|crack\w*|free|pirated?|unauthoris\w*|unauthoriz\w*)\b.{0,20}\b(turnitin|drillbit|shodhshuddhi|ouriginal)\b/i,
  },
  {
    reason: "Asked for exam help",
    pattern: /\b(take|sit|write|pass)\s+(my|our|the)\s+exam\b/i,
  },
];

export function screenEnquiry(message: string): ScreeningResult {
  for (const rule of RULES) {
    if (rule.pattern.test(message)) {
      return { flagged: true, reason: rule.reason };
    }
  }
  return { flagged: false, reason: null };
}
