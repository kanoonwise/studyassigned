export type DegreeLevel = "UG" | "PG" | "PhD";

export type MilestoneKey =
  | "topic"
  | "synopsis"
  | "literature_review"
  | "methodology"
  | "data"
  | "analysis"
  | "draft"
  | "similarity_check"
  | "final";

const MILESTONE_LABELS: Record<MilestoneKey, string> = {
  topic: "Finalise topic",
  synopsis: "Submit synopsis",
  literature_review: "Complete literature review",
  methodology: "Finalise methodology",
  data: "Complete data collection",
  analysis: "Complete analysis",
  draft: "Complete full draft",
  similarity_check: "Run similarity/AI check and revise",
  final: "Final submission",
};

const MILESTONE_ORDER: MilestoneKey[] = [
  "topic",
  "synopsis",
  "literature_review",
  "methodology",
  "data",
  "analysis",
  "draft",
  "similarity_check",
  "final",
];

/**
 * Days before the submission date for each milestone, by degree level.
 * BUILD_SPEC.md gives the milestone list but no exact spacing - these are
 * illustrative defaults an admin should be able to tune later (a config
 * table, not a constant in a component, is the natural home once this
 * needs to be editable without a redeploy).
 */
const OFFSET_DAYS: Record<DegreeLevel, Record<MilestoneKey, number>> = {
  UG: {
    topic: 126,
    synopsis: 105,
    literature_review: 84,
    methodology: 63,
    data: 49,
    analysis: 35,
    draft: 21,
    similarity_check: 7,
    final: 0,
  },
  PG: {
    topic: 200,
    synopsis: 160,
    literature_review: 130,
    methodology: 95,
    data: 70,
    analysis: 50,
    draft: 30,
    similarity_check: 10,
    final: 0,
  },
  PhD: {
    topic: 540,
    synopsis: 420,
    literature_review: 320,
    methodology: 220,
    data: 150,
    analysis: 90,
    draft: 45,
    similarity_check: 14,
    final: 0,
  },
};

export interface TimelineMilestone {
  key: MilestoneKey;
  label: string;
  date: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function calculateTimeline(
  submissionDate: Date,
  degreeLevel: DegreeLevel,
  offsets: Record<DegreeLevel, Record<MilestoneKey, number>> = OFFSET_DAYS,
): TimelineMilestone[] {
  const levelOffsets = offsets[degreeLevel];
  return MILESTONE_ORDER.map((key) => ({
    key,
    label: MILESTONE_LABELS[key],
    date: new Date(submissionDate.getTime() - levelOffsets[key] * DAY_MS),
  }));
}
