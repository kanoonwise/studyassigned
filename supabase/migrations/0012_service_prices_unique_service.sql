-- Lets the seed script upsert by service name instead of duplicating rows
-- every time it's re-run.
alter table service_prices add constraint service_prices_service_key unique (service);
