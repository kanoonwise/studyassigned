/**
 * Phrases CLAUDE.md bans from any site copy, ad copy, page title or meta
 * tag. Matching is case-insensitive substring matching on normalised
 * whitespace - see scripts/copy-lint.ts. "guarantee" is banned outright
 * rather than only in its marks/approval/score sense, because a lint script
 * can't reliably tell the senses apart; a genuinely unrelated use (e.g. a
 * refund guarantee) needs the Integrity Policy allow-list or a rephrase.
 */
export const BANNED_PHRASES = [
  "plagiarism removal",
  "ai removal",
  "remove ai",
  "bypass",
  "100% human",
  "humanize",
  "humanise",
  "guaranteed",
  "guarantee",
  "we write your thesis",
  "write my assignment",
] as const;
