import type { AppRole } from "@/lib/supabase/types";

export interface AdminNavItem {
  href: string;
  label: string;
  roles: AppRole[];
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", roles: ["admin", "verifier", "ops"] },
  { href: "/admin/imports", label: "Imports", roles: ["admin"] },
  { href: "/admin/exports", label: "Exports", roles: ["admin"] },
  { href: "/admin/institutions", label: "Institutions", roles: ["admin", "verifier"] },
  { href: "/admin/verification", label: "Verification", roles: ["admin", "verifier"] },
  { href: "/admin/prices", label: "Prices", roles: ["admin"] },
  { href: "/admin/leads", label: "Leads", roles: ["admin", "ops"] },
  { href: "/admin/orders", label: "Orders", roles: ["admin", "ops"] },
  { href: "/admin/audit", label: "Audit Log", roles: ["admin"] },
];
