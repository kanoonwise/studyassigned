-- Mentor booking (Phase 6): a mentor publishes open slots, a student books
-- one, and after the session the mentor leaves structured feedback that
-- labels the type of each point raised. Ops gets a workload view across
-- all mentors.
create table mentor_availability (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references profiles (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_booked boolean not null default false,
  created_at timestamptz not null default now(),
  constraint mentor_availability_valid_range check (ends_at > starts_at)
);

create index mentor_availability_mentor_idx on mentor_availability (mentor_id);
create index mentor_availability_open_idx on mentor_availability (starts_at) where not is_booked;

create table mentor_bookings (
  id uuid primary key default gen_random_uuid(),
  availability_id uuid not null unique references mentor_availability (id) on delete cascade,
  mentor_id uuid not null references profiles (id),
  student_id uuid not null references profiles (id),
  order_id uuid references orders (id),
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  student_notes text,
  created_at timestamptz not null default now()
);

create index mentor_bookings_mentor_idx on mentor_bookings (mentor_id);
create index mentor_bookings_student_idx on mentor_bookings (student_id);

create table mentor_feedback (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references mentor_bookings (id) on delete cascade,
  error_type text not null check (
    error_type in ('grammar', 'structure', 'citation', 'argument', 'clarity', 'other')
  ),
  detail text not null,
  created_at timestamptz not null default now()
);

create index mentor_feedback_booking_idx on mentor_feedback (booking_id);

-- Books a slot atomically: locks the row so two students can't win the
-- same slot, sets student_id from the caller's own session (never a
-- parameter, so nobody can book on someone else's behalf).
create or replace function public.book_mentor_slot(p_availability_id uuid, p_order_id uuid default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking_id uuid;
  v_mentor_id uuid;
begin
  if auth.uid() is null then
    raise exception 'must be signed in to book a session';
  end if;

  select mentor_id into v_mentor_id
  from mentor_availability
  where id = p_availability_id and not is_booked
  for update;

  if v_mentor_id is null then
    raise exception 'this slot is no longer available';
  end if;

  update mentor_availability set is_booked = true where id = p_availability_id;

  insert into mentor_bookings (availability_id, mentor_id, student_id, order_id)
  values (p_availability_id, v_mentor_id, auth.uid(), p_order_id)
  returning id into v_booking_id;

  return v_booking_id;
end;
$$;

grant execute on function public.book_mentor_slot(uuid, uuid) to authenticated;

-- Cancelling a booking (by either side) frees the slot back up.
create or replace function public.free_slot_on_cancel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'cancelled' and old.status is distinct from 'cancelled' then
    update mentor_availability set is_booked = false where id = new.availability_id;
  end if;
  return new;
end;
$$;

create trigger trg_mentor_bookings_cancel
  after update on mentor_bookings
  for each row execute function public.free_slot_on_cancel();

alter table mentor_availability enable row level security;
alter table mentor_bookings enable row level security;
alter table mentor_feedback enable row level security;

-- availability: anyone signed in can see open slots (to choose one to
-- book); a mentor manages their own; staff see all.
create policy mentor_availability_authenticated_select on mentor_availability for select
  to authenticated
  using (not is_booked or mentor_id = auth.uid() or public.is_staff());
-- Once a slot is booked, the policy above stops matching for anyone but
-- the mentor and staff - so the student who booked it also needs a way
-- to read its start/end time back.
create policy mentor_availability_booking_student_select on mentor_availability for select
  using (
    exists (
      select 1 from mentor_bookings b
      where b.availability_id = mentor_availability.id and b.student_id = auth.uid()
    )
  );
create policy mentor_availability_mentor_write on mentor_availability for insert
  with check (mentor_id = auth.uid());
create policy mentor_availability_mentor_update on mentor_availability for update
  using (mentor_id = auth.uid())
  with check (mentor_id = auth.uid());
create policy mentor_availability_mentor_delete on mentor_availability for delete
  using (mentor_id = auth.uid());
create policy mentor_availability_staff_all on mentor_availability for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- bookings: student and mentor each see their own; staff see all.
-- Creation only happens through book_mentor_slot() above (security
-- definer), so there is no direct insert policy for students.
create policy mentor_bookings_student_select on mentor_bookings for select
  using (student_id = auth.uid());
create policy mentor_bookings_student_update on mentor_bookings for update
  using (student_id = auth.uid())
  with check (student_id = auth.uid());
create policy mentor_bookings_mentor_select on mentor_bookings for select
  using (mentor_id = auth.uid());
create policy mentor_bookings_mentor_update on mentor_bookings for update
  using (mentor_id = auth.uid())
  with check (mentor_id = auth.uid());
create policy mentor_bookings_staff_all on mentor_bookings for all
  using (public.is_staff())
  with check (public.is_staff());

-- feedback: the booking's student and mentor can see it; only the mentor
-- writes it; staff see all.
create policy mentor_feedback_participant_select on mentor_feedback for select
  using (
    exists (
      select 1 from mentor_bookings b
      where b.id = mentor_feedback.booking_id
        and (b.student_id = auth.uid() or b.mentor_id = auth.uid())
    )
    or public.is_staff()
  );
create policy mentor_feedback_mentor_insert on mentor_feedback for insert
  with check (
    exists (
      select 1 from mentor_bookings b
      where b.id = mentor_feedback.booking_id and b.mentor_id = auth.uid()
    )
  );

grant select, insert, update, delete on mentor_availability to authenticated;
grant select, update on mentor_bookings to authenticated;
grant select, insert on mentor_feedback to authenticated;
