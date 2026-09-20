/**
 * Hand-written subset of the generated Supabase types, covering only what
 * Phase 0 code touches. Replace with `supabase gen types typescript` output
 * once a real project exists, extending this shape rather than replacing it.
 */

export type AppRole = "admin" | "verifier" | "ops" | "mentor" | "student";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          role: AppRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          role?: AppRole;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          role?: AppRole;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
    };
    CompositeTypes: Record<string, never>;
  };
}
