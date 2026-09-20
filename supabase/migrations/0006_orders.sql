-- Orders (Phase 5+). Tables created now so RLS and roles are in place from day one.
create table orders (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles (id),
  service text,
  quote numeric,
  status text check (
    status in (
      'submitted', 'screened', 'quoted', 'paid_part', 'in_progress',
      'delivered', 'closed', 'refunded', 'declined'
    )
  ),
  mentor_id uuid references profiles (id),
  due_date date,
  created_at timestamptz not null default now()
);

create index orders_student_idx on orders (student_id);
create index orders_mentor_idx on orders (mentor_id);

create table order_events (
  id bigserial primary key,
  order_id uuid references orders (id) on delete cascade,
  event text not null,
  at timestamptz not null default now(),
  "by" uuid references profiles (id)
);

create index order_events_order_idx on order_events (order_id);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders (id) on delete cascade,
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  amount numeric,
  status text,
  milestone text
);

create index payments_order_idx on payments (order_id);

create table documents (
  id uuid primary key default gen_random_uuid(),
  owner uuid references profiles (id),
  order_id uuid references orders (id) on delete cascade,
  path text not null,
  sha256 text,
  uploaded_at timestamptz not null default now(),
  delete_after date
);

create index documents_owner_idx on documents (owner);
create index documents_order_idx on documents (order_id);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique references orders (id) on delete cascade,
  rating int check (rating between 1 and 5),
  body text,
  published boolean not null default false
);
