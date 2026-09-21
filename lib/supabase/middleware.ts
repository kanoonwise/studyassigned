import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./types";
import {
  sanitizeReferralCode,
  referralCookieMaxAge,
  REFERRAL_COOKIE,
  CONSENT_COOKIE,
} from "@/lib/referral";

const STAFF_ROLES = new Set(["admin", "verifier", "ops"]);

/**
 * Refreshes the Supabase auth session on every request and blocks
 * unauthenticated or non-staff visitors from `/admin`. Pure enough to unit
 * test the redirect decision separately in `shouldRedirectFromAdmin`.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (shouldRedirectFromAdmin(request.nextUrl.pathname, user !== null)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !STAFF_ROLES.has(profile.role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // A ?ref= on this request takes priority; otherwise carry forward a
  // code already captured earlier this visit, so consenting on a later
  // page can still upgrade it to the persistent cookie below.
  const ref =
    sanitizeReferralCode(request.nextUrl.searchParams.get("ref")) ??
    sanitizeReferralCode(request.cookies.get(REFERRAL_COOKIE)?.value);
  if (ref) {
    const consented = request.cookies.get(CONSENT_COOKIE)?.value === "accepted";
    response.cookies.set(REFERRAL_COOKIE, ref, {
      maxAge: referralCookieMaxAge(consented),
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

/** Pure redirect decision, kept separate from the Supabase call so it's unit-testable. */
export function shouldRedirectFromAdmin(pathname: string, isSignedIn: boolean): boolean {
  return pathname.startsWith("/admin") && !isSignedIn;
}
