"use client";

/** Fire-and-forget usage log for a free tool - never blocks the UI on failure. */
export function logToolEvent(tool: string, inputs: Record<string, unknown>) {
  void fetch("/api/tools/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool, inputs }),
  }).catch(() => {});
}
