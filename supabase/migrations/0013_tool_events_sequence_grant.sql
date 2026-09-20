-- tool_events.id is bigserial: inserting requires USAGE on its sequence,
-- not just INSERT on the table. 0010_grants.sql granted anon INSERT on
-- tool_events but missed this - anon inserts were failing with
-- "permission denied for sequence tool_events_id_seq".
grant usage on sequence tool_events_id_seq to anon;
