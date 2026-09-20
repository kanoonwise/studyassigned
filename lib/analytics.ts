export const ANALYTICS_CONSENT_KEY = "sa-analytics-consent";

export type ConsentChoice = "accepted" | "declined";

export function getStoredConsent(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    return value === "accepted" || value === "declined" ? value : null;
  } catch {
    return null;
  }
}

export function storeConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, choice);
  } catch {
    // Private browsing or blocked storage - the banner just reappears next visit.
  }
}

/**
 * Loads the analytics script only after consent, and only if one is
 * configured. No vendor is chosen yet (not in BUILD_SPEC.md's list of open
 * decisions, but nothing there commits to one either) - set
 * NEXT_PUBLIC_ANALYTICS_SCRIPT_URL once you pick a privacy-respecting
 * provider (e.g. Plausible, Umami) and this starts loading it.
 */
export function loadAnalyticsIfConsented() {
  if (getStoredConsent() !== "accepted") return;

  const src = process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL;
  if (!src || document.querySelector(`script[src="${src}"]`)) return;

  const script = document.createElement("script");
  script.src = src;
  script.defer = true;
  document.head.appendChild(script);
}
