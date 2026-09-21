-- Phase 3's Leads page needs a way to mark a lead as handled.
alter table leads add column handled_at timestamptz;
