-- The Phase 1 enquiry form collects institution as free text (no picker
-- yet - that arrives with the Phase 4 search). institution_code stays for
-- once a lead can be tied to a real row via that picker. `service` is the
-- service the enquiry is about; `level` (Section 3) is left for the UG/PG/
-- PhD or UGC-level context a free-tool lead carries.
alter table leads add column institution_name text;
alter table leads add column service text;
