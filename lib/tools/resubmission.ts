const DAY_MS = 24 * 60 * 60 * 1000;
const AVG_DAYS_PER_MONTH = 30.44;

export interface ResubmissionPlanWeek {
  week: number;
  task: string;
}

export interface ResubmissionResult {
  lastResubmissionDate: Date;
  daysLeft: number;
  plan: ResubmissionPlanWeek[];
}

/** Adds calendar months to a date without drifting on short months. */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const targetMonth = result.getMonth() + months;
  result.setMonth(targetMonth);
  return result;
}

function totalWeeks(actionWindowMonths: number): number {
  return Math.max(1, Math.round((actionWindowMonths * AVG_DAYS_PER_MONTH) / 7));
}

/** A generic, proportional revision plan spanning the whole window. */
function buildPlan(weeks: number): ResubmissionPlanWeek[] {
  const milestones: { atFraction: number; task: string }[] = [
    { atFraction: 0, task: "Review the report and list every flagged section" },
    { atFraction: 0.15, task: "Revise flagged sections in your own words" },
    { atFraction: 0.6, task: "Update citations and formatting to your institution's style" },
    { atFraction: 0.8, task: "Get feedback on your revised draft" },
    { atFraction: 0.92, task: "Run a fresh similarity check and address anything new" },
  ];

  const plan: ResubmissionPlanWeek[] = [];
  for (let week = 1; week <= weeks; week++) {
    const fraction = (week - 1) / weeks;
    const milestone = [...milestones].reverse().find((m) => fraction >= m.atFraction);
    plan.push({ week, task: milestone!.task });
  }
  plan[plan.length - 1] = { week: weeks, task: "Final proofread and submit" };
  return plan;
}

/**
 * Resubmission Deadline Calculator. `actionWindowMonths` comes from the
 * matched ugc_levels row - null means no resubmission window applies at
 * that level (Level 0 has no penalty; Level 2/3 consequences aren't a
 * "revise within N months" window).
 */
export function calculateResubmission(
  reportDate: Date,
  actionWindowMonths: number | null,
  today: Date = new Date(),
): ResubmissionResult | null {
  if (actionWindowMonths == null) return null;

  const lastResubmissionDate = addMonths(reportDate, actionWindowMonths);
  const daysLeft = Math.ceil((lastResubmissionDate.getTime() - today.getTime()) / DAY_MS);
  const weeks = totalWeeks(actionWindowMonths);

  return { lastResubmissionDate, daysLeft, plan: buildPlan(weeks) };
}
