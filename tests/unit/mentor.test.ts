import { describe, expect, it } from "vitest";
import { summarizeMentorWorkload } from "@/lib/mentor";

describe("summarizeMentorWorkload", () => {
  it("counts bookings per mentor by status", () => {
    const workload = summarizeMentorWorkload([
      { mentor_id: "m1", status: "scheduled" },
      { mentor_id: "m1", status: "completed" },
      { mentor_id: "m1", status: "scheduled" },
      { mentor_id: "m2", status: "cancelled" },
    ]);
    const m1 = workload.find((w) => w.mentorId === "m1");
    const m2 = workload.find((w) => w.mentorId === "m2");
    expect(m1).toEqual({ mentorId: "m1", scheduled: 2, completed: 1, cancelled: 0, total: 3 });
    expect(m2).toEqual({ mentorId: "m2", scheduled: 0, completed: 0, cancelled: 1, total: 1 });
  });

  it("sorts the busiest (most scheduled) mentor first", () => {
    const workload = summarizeMentorWorkload([
      { mentor_id: "quiet", status: "scheduled" },
      { mentor_id: "busy", status: "scheduled" },
      { mentor_id: "busy", status: "scheduled" },
    ]);
    expect(workload[0].mentorId).toBe("busy");
  });

  it("returns an empty list for no bookings", () => {
    expect(summarizeMentorWorkload([])).toEqual([]);
  });
});
