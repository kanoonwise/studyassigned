/**
 * Promotes one user to the `admin` role, creating the auth user (and
 * emailing them an invite) if they don't exist yet. Run with:
 *
 *   ADMIN_EMAIL=you@example.com npm run seed:admin
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the
 * environment - the service role key bypasses RLS, so never run this
 * against production from a machine you don't trust.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/supabase/types";

async function main() {
  const email = process.env.ADMIN_EMAIL ?? process.argv[2];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!email) {
    throw new Error("Set ADMIN_EMAIL or pass the email as an argument.");
  }
  if (!url || !serviceRoleKey) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const userId = await findOrInviteUser(supabase, email);

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, email, role: "admin" }, { onConflict: "id" });

  if (error) {
    throw error;
  }

  console.log(`${email} is now an admin.`);
}

async function findOrInviteUser(
  supabase: ReturnType<typeof createClient<Database>>,
  email: string,
): Promise<string> {
  const invited = await supabase.auth.admin.inviteUserByEmail(email);
  if (!invited.error && invited.data.user) {
    return invited.data.user.id;
  }

  // Already registered - look them up instead.
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw error;
    }
    const match = data.users.find((user) => user.email === email);
    if (match) {
      return match.id;
    }
    if (data.users.length < perPage) {
      throw new Error(
        `No auth user found for ${email} and invite failed: ${invited.error?.message}`,
      );
    }
    page += 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
