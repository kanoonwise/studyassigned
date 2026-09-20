-- Default deny everywhere. Anonymous and student roles reach institution
-- data only through the public views created in 0009_public_views.sql.

alter table profiles enable row level security;
alter table institutions enable row level security;
alter table authorities enable row level security;
alter table deadlines enable row level security;
alter table verification_tasks enable row level security;
alter table import_batches enable row level security;
alter table import_staging enable row level security;
alter table import_snapshots enable row level security;
alter table audit_log enable row level security;
alter table service_prices enable row level security;
alter table ugc_levels enable row level security;
alter table leads enable row level security;
alter table tool_events enable row level security;
alter table deadline_alerts enable row level security;
alter table orders enable row level security;
alter table order_events enable row level security;
alter table payments enable row level security;
alter table documents enable row level security;
alter table reviews enable row level security;

-- profiles: everyone can see and update their own row; admins see and manage all.
create policy profiles_select_own on profiles for select
  using (id = auth.uid());
create policy profiles_select_admin on profiles for select
  using (public.current_user_role() = 'admin');
create policy profiles_update_own on profiles for update
  using (id = auth.uid());
create policy profiles_admin_all on profiles for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- institutions / authorities / deadlines / verification_tasks:
-- readable by staff (admin, verifier, ops); the public reads the views instead.
create policy institutions_staff_select on institutions for select
  using (public.is_staff());
create policy institutions_admin_write on institutions for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy authorities_staff_select on authorities for select
  using (public.is_staff());
create policy authorities_admin_write on authorities for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');
create policy authorities_verifier_update on authorities for update
  using (public.current_user_role() = 'verifier')
  with check (public.current_user_role() = 'verifier');

create policy deadlines_staff_select on deadlines for select
  using (public.is_staff());
create policy deadlines_admin_write on deadlines for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');
create policy deadlines_verifier_insert on deadlines for insert
  with check (public.current_user_role() = 'verifier');
create policy deadlines_verifier_update on deadlines for update
  using (public.current_user_role() = 'verifier')
  with check (public.current_user_role() = 'verifier');

create policy verification_tasks_staff_select on verification_tasks for select
  using (public.is_staff());
create policy verification_tasks_admin_write on verification_tasks for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');
create policy verification_tasks_verifier_update on verification_tasks for update
  using (public.current_user_role() = 'verifier')
  with check (public.current_user_role() = 'verifier');

-- import machinery and audit log: admin only.
create policy import_batches_admin_all on import_batches for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');
create policy import_staging_admin_all on import_staging for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');
create policy import_snapshots_admin_all on import_snapshots for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');
create policy audit_log_admin_select on audit_log for select
  using (public.current_user_role() = 'admin');
create policy audit_log_admin_insert on audit_log for insert
  with check (public.current_user_role() = 'admin');

-- service_prices / ugc_levels: admin manages; public reads active rows
-- only through the public_* views (see 0009), never the base table directly.
create policy service_prices_admin_write on service_prices for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');
create policy ugc_levels_admin_write on ugc_levels for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- leads: anyone (including anonymous) may create one with consent recorded;
-- only admin/ops may read or triage them.
create policy leads_public_insert on leads for insert
  to anon, authenticated
  with check (consent_at is not null);
create policy leads_staff_select on leads for select
  using (public.current_user_role() in ('admin', 'ops'));
create policy leads_staff_update on leads for update
  using (public.current_user_role() in ('admin', 'ops'))
  with check (public.current_user_role() in ('admin', 'ops'));

-- tool_events: anyone may log a tool run; only admin reads them.
create policy tool_events_public_insert on tool_events for insert
  to anon, authenticated
  with check (true);
create policy tool_events_admin_select on tool_events for select
  using (public.current_user_role() = 'admin');

-- deadline_alerts: anyone may subscribe with consent; staff manage delivery.
create policy deadline_alerts_public_insert on deadline_alerts for insert
  to anon, authenticated
  with check (consent_at is not null);
create policy deadline_alerts_staff_select on deadline_alerts for select
  using (public.is_staff());
create policy deadline_alerts_staff_update on deadline_alerts for update
  using (public.is_staff())
  with check (public.is_staff());

-- orders: a student sees and creates their own; a mentor sees what's
-- assigned to them; ops/admin see and manage everything.
create policy orders_student_select on orders for select
  using (student_id = auth.uid());
create policy orders_student_insert on orders for insert
  with check (student_id = auth.uid());
create policy orders_mentor_select on orders for select
  using (mentor_id = auth.uid());
create policy orders_staff_all on orders for all
  using (public.current_user_role() in ('admin', 'ops'))
  with check (public.current_user_role() in ('admin', 'ops'));

create policy order_events_participant_select on order_events for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_events.order_id
        and (o.student_id = auth.uid() or o.mentor_id = auth.uid())
    )
    or public.current_user_role() in ('admin', 'ops')
  );
create policy order_events_staff_insert on order_events for insert
  with check (public.current_user_role() in ('admin', 'ops'));

create policy payments_participant_select on payments for select
  using (
    exists (
      select 1 from orders o
      where o.id = payments.order_id and o.student_id = auth.uid()
    )
    or public.current_user_role() in ('admin', 'ops')
  );
create policy payments_staff_write on payments for all
  using (public.current_user_role() in ('admin', 'ops'))
  with check (public.current_user_role() in ('admin', 'ops'));

-- documents: strictly the owner, plus admin/ops/assigned mentor.
create policy documents_owner_all on documents for all
  using (owner = auth.uid())
  with check (owner = auth.uid());
create policy documents_staff_select on documents for select
  using (public.current_user_role() in ('admin', 'ops'));
create policy documents_mentor_select on documents for select
  using (
    exists (
      select 1 from orders o
      where o.id = documents.order_id and o.mentor_id = auth.uid()
    )
  );

-- reviews: the order's student can write their own; published reviews are
-- public through public_reviews (0009); staff can moderate.
create policy reviews_student_insert on reviews for insert
  with check (
    exists (
      select 1 from orders o
      where o.id = reviews.order_id and o.student_id = auth.uid()
    )
  );
create policy reviews_student_select on reviews for select
  using (
    exists (
      select 1 from orders o
      where o.id = reviews.order_id and o.student_id = auth.uid()
    )
  );
create policy reviews_staff_all on reviews for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');
