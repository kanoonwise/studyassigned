/**
 * Hand-written subset of the generated Supabase types, matching
 * supabase/migrations exactly. Replace with `supabase gen types typescript`
 * output once a real project exists, extending this shape rather than
 * replacing it.
 */

export type AppRole = "admin" | "verifier" | "ops" | "mentor" | "student";
export type DeadlineStatus =
  "verified" | "link_found" | "proxy" | "seasonality_only" | "manual_required";
export type PriceUnit = "per_word" | "per_page" | "per_doc" | "per_project";
export type OrderStatus =
  | "submitted"
  | "screened"
  | "quoted"
  | "paid_part"
  | "in_progress"
  | "delivered"
  | "closed"
  | "refunded"
  | "declined";

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
        Insert: { id: string; email?: string | null; full_name?: string | null; role?: AppRole };
        Update: { email?: string | null; full_name?: string | null; role?: AppRole };
        Relationships: [];
      };
      institutions: {
        Row: {
          aishe_code: string;
          kind: string;
          name: string;
          state: string;
          district: string | null;
          address: string | null;
          website: string | null;
          inst_type: string | null;
          management: string | null;
          affiliating_code: string | null;
          affiliating_name: string | null;
          urban_rural: string | null;
          established: number | null;
          calendar_authority_code: string | null;
          status: DeadlineStatus;
          last_checked: string | null;
          priority_rank: number | null;
          base_score: number | null;
          geo_target: string | null;
          maps_url: string | null;
          inner_km: number | null;
          outer_km: number | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["institutions"]["Row"]> & {
          aishe_code: string;
          kind: string;
          name: string;
          state: string;
        };
        Update: Partial<Database["public"]["Tables"]["institutions"]["Row"]>;
        Relationships: [];
      };
      authorities: {
        Row: {
          aishe_code: string;
          name: string;
          state: string | null;
          active_covered: number | null;
          calendar_url: string | null;
          exam_url: string | null;
          notice_url: string | null;
          link_confidence: string | null;
          status: DeadlineStatus;
          last_checked: string | null;
          next_refresh: string | null;
          owner: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["authorities"]["Row"]> & {
          aishe_code: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["authorities"]["Row"]>;
        Relationships: [];
      };
      deadlines: {
        Row: {
          id: string;
          authority_code: string | null;
          event_type: string;
          exact_date: string | null;
          status: DeadlineStatus;
          evidence_url: string | null;
          verified_by: string | null;
          verified_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["deadlines"]["Row"]> & {
          event_type: string;
          status: DeadlineStatus;
        };
        Update: Partial<Database["public"]["Tables"]["deadlines"]["Row"]>;
        Relationships: [];
      };
      verification_tasks: {
        Row: {
          id: string;
          authority_code: string | null;
          next_action: string | null;
          owner: string | null;
          state: "open" | "in_progress" | "done";
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["verification_tasks"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["verification_tasks"]["Row"]>;
        Relationships: [];
      };
      import_batches: {
        Row: {
          id: string;
          filename: string | null;
          uploaded_by: string | null;
          uploaded_at: string;
          state: "staged" | "approved" | "rejected" | "rolled_back";
          summary: Record<string, unknown> | null;
        };
        Insert: Partial<Database["public"]["Tables"]["import_batches"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["import_batches"]["Row"]>;
        Relationships: [];
      };
      import_staging: {
        Row: { batch_id: string; sheet: string; key: string; row: Record<string, unknown> };
        Insert: Database["public"]["Tables"]["import_staging"]["Row"];
        Update: Partial<Database["public"]["Tables"]["import_staging"]["Row"]>;
        Relationships: [];
      };
      import_snapshots: {
        Row: {
          batch_id: string;
          sheet: string;
          key: string;
          before: Record<string, unknown> | null;
        };
        Insert: Database["public"]["Tables"]["import_snapshots"]["Row"];
        Update: Partial<Database["public"]["Tables"]["import_snapshots"]["Row"]>;
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: number;
          actor: string | null;
          action: string;
          entity: string;
          entity_key: string | null;
          before: Record<string, unknown> | null;
          after: Record<string, unknown> | null;
          at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["audit_log"]["Row"]> & {
          action: string;
          entity: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_log"]["Row"]>;
        Relationships: [];
      };
      service_prices: {
        Row: {
          id: number;
          service: string;
          unit: PriceUnit;
          price_low: number | null;
          price_high: number | null;
          active: boolean;
          note: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["service_prices"]["Row"]> & {
          service: string;
          unit: PriceUnit;
        };
        Update: Partial<Database["public"]["Tables"]["service_prices"]["Row"]>;
        Relationships: [];
      };
      ugc_levels: {
        Row: {
          level: number;
          min_pct: number;
          max_pct: number | null;
          label: string;
          consequence: string;
          action_window_months: number | null;
          source_note: string | null;
        };
        Insert: Database["public"]["Tables"]["ugc_levels"]["Row"];
        Update: Partial<Database["public"]["Tables"]["ugc_levels"]["Row"]>;
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          created_at: string;
          name: string | null;
          email: string | null;
          phone: string | null;
          institution_code: string | null;
          institution_name: string | null;
          service: string | null;
          level: string | null;
          message: string | null;
          source: string | null;
          consent_at: string;
          flagged: boolean;
          flag_reason: string | null;
          handled_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["leads"]["Row"]> & { consent_at: string };
        Update: Partial<Database["public"]["Tables"]["leads"]["Row"]>;
        Relationships: [];
      };
      tool_events: {
        Row: {
          id: number;
          tool: string;
          at: string;
          inputs: Record<string, unknown> | null;
          lead_id: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["tool_events"]["Row"]> & { tool: string };
        Update: Partial<Database["public"]["Tables"]["tool_events"]["Row"]>;
        Relationships: [];
      };
      deadline_alerts: {
        Row: {
          id: string;
          institution_code: string | null;
          contact: string;
          consent_at: string;
          notified_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["deadline_alerts"]["Row"]> & {
          contact: string;
          consent_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["deadline_alerts"]["Row"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          student_id: string | null;
          service: string | null;
          quote: number | null;
          status: OrderStatus | null;
          mentor_id: string | null;
          due_date: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Relationships: [];
      };
      order_events: {
        Row: { id: number; order_id: string | null; event: string; at: string; by: string | null };
        Insert: Partial<Database["public"]["Tables"]["order_events"]["Row"]> & { event: string };
        Update: Partial<Database["public"]["Tables"]["order_events"]["Row"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          order_id: string | null;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          amount: number | null;
          status: string | null;
          milestone: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          owner: string | null;
          order_id: string | null;
          path: string;
          sha256: string | null;
          uploaded_at: string;
          delete_after: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["documents"]["Row"]> & { path: string };
        Update: Partial<Database["public"]["Tables"]["documents"]["Row"]>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          order_id: string | null;
          rating: number | null;
          body: string | null;
          published: boolean;
        };
        Insert: Partial<Database["public"]["Tables"]["reviews"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["reviews"]["Row"]>;
        Relationships: [];
      };
      report_reviews: {
        Row: {
          id: string;
          document_id: string;
          student_id: string;
          reviewer_id: string | null;
          status: "requested" | "in_review" | "completed";
          top_sources: string | null;
          references_vs_overlap: string | null;
          self_plagiarism: string | null;
          first_fixes: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["report_reviews"]["Row"]> & {
          document_id: string;
          student_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["report_reviews"]["Row"]>;
        Relationships: [];
      };
    };
    Views: {
      public_institutions: {
        Row: {
          aishe_code: string;
          kind: string;
          name: string;
          state: string;
          district: string | null;
          inst_type: string | null;
          website: string | null;
          affiliating_code: string | null;
          affiliating_name: string | null;
          calendar_authority_code: string | null;
          status: DeadlineStatus;
        };
        Relationships: [];
      };
      public_authorities: {
        Row: {
          aishe_code: string;
          name: string;
          state: string | null;
          calendar_url: string | null;
          exam_url: string | null;
          notice_url: string | null;
          status: DeadlineStatus;
          last_checked: string | null;
        };
        Relationships: [];
      };
      public_deadlines: {
        Row: {
          id: string;
          authority_code: string | null;
          event_type: string;
          exact_date: string | null;
          evidence_url: string | null;
          verified_at: string | null;
        };
        Relationships: [];
      };
      public_service_prices: {
        Row: {
          service: string;
          unit: PriceUnit;
          price_low: number | null;
          price_high: number | null;
          note: string | null;
        };
        Relationships: [];
      };
      public_ugc_levels: {
        Row: {
          level: number;
          min_pct: number;
          max_pct: number | null;
          label: string;
          consequence: string;
          action_window_months: number | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
      deadline_status: DeadlineStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
