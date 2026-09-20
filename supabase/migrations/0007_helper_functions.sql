-- Returns the caller's role, or null when signed out or profile-less.
-- security definer + fixed search_path so it can be called from RLS
-- policies on `profiles` itself without recursing into RLS.
create or replace function public.current_user_role()
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('admin', 'verifier', 'ops');
$$;

-- Only an admin may change someone's role.
create or replace function public.prevent_non_admin_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() is null outside an end-user session (the service role key,
  -- used by scripts/seed-admin.ts and admin-only server code, has no JWT
  -- subject) - that trusted server-side path may always set the role.
  -- An end-user session may only do so as an admin.
  if new.role is distinct from old.role
    and auth.uid() is not null
    and public.current_user_role() is distinct from 'admin' then
    raise exception 'only an admin can change a user role';
  end if;
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_role_change
  before update on profiles
  for each row execute function public.prevent_non_admin_role_change();

-- Creates the matching profiles row the moment someone signs up.
-- Default role is 'student'; an admin promotes staff afterwards.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Every admin write is audited: who, what, before, after, when.
create or replace function public.write_audit_log(
  p_action text,
  p_entity text,
  p_entity_key text,
  p_before jsonb,
  p_after jsonb
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into audit_log (actor, action, entity, entity_key, before, after)
  values (auth.uid(), p_action, p_entity, p_entity_key, p_before, p_after);
$$;
