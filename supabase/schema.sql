-- =============================================================================
-- NextLogicAI Hub — Supabase Schema
-- =============================================================================
-- HOW TO USE:
--   1. Go to https://supabase.com/dashboard → your project → SQL Editor
--   2. Paste this entire file and click "Run"
--   3. Done. All tables, policies, and triggers are live.
-- =============================================================================

-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── Enums ───────────────────────────────────────────────────────────────────
create type user_role as enum ('consultant', 'client');
create type package_tier as enum ('starter', 'growth', 'enterprise', 'custom');
create type service_request_status as enum ('pending', 'reviewing', 'accepted', 'declined', 'converted');
create type approval_status as enum ('pending', 'approved', 'rejected');

-- =============================================================================
-- PROFILES
-- One row per Supabase auth user. Created automatically via trigger on sign-up.
-- =============================================================================
create table if not exists profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  email          text not null,
  role           user_role not null default 'client',
  display_name   text,
  avatar_url     text,
  -- For client users: links to the client record in your app
  -- For consultant users: null
  client_id      text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Auto-create a profile row when a new user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, role, display_name, client_id)
  values (
    new.id,
    new.email,
    coalesce(
      (new.raw_user_meta_data->>'role')::user_role,
      'client'
    ),
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'client_id'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Auto-update updated_at on any profile change
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure update_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table profiles enable row level security;

-- Users can read their own profile
create policy "profiles: own read"
  on profiles for select
  using (auth.uid() = id);

-- Consultants can read all profiles
create policy "profiles: consultant read all"
  on profiles for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'consultant'
    )
  );

-- Users can update their own profile (display name, avatar only)
create policy "profiles: own update"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- =============================================================================
-- SERVICE PACKAGES
-- The "online store" — consultant creates packages, public can read active ones.
-- =============================================================================
create table if not exists service_packages (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  tier          package_tier not null default 'starter',
  description   text not null default '',
  features      text[] not null default '{}',
  price_usd     numeric(10, 2),    -- null = contact for pricing
  pricing_label text,              -- display override e.g. "Starting at $500/mo"
  phases        text[] not null default '{}',
  is_active     boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger service_packages_updated_at
  before update on service_packages
  for each row execute procedure update_updated_at();

alter table service_packages enable row level security;

-- Anyone can read active packages (the public store)
create policy "packages: public read active"
  on service_packages for select
  using (is_active = true);

-- Consultants can read all (including inactive)
create policy "packages: consultant read all"
  on service_packages for select
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'consultant')
  );

-- Only consultants can create/update/delete
create policy "packages: consultant write"
  on service_packages for all
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'consultant')
  );


-- =============================================================================
-- SERVICE REQUESTS
-- Submitted by prospective customers from the public store. No auth required.
-- =============================================================================
create table if not exists service_requests (
  id                uuid primary key default gen_random_uuid(),
  package_id        uuid references service_packages(id) on delete set null,
  package_name      text,           -- snapshot at submission time
  status            service_request_status not null default 'pending',
  business_name     text not null,
  industry          text not null default '',
  contact_name      text not null,
  contact_email     text not null,
  phone             text,
  website           text,
  message           text,
  -- Set once accepted & a Client record is created in the app
  client_id         text,
  consultant_notes  text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger service_requests_updated_at
  before update on service_requests
  for each row execute procedure update_updated_at();

alter table service_requests enable row level security;

-- Anyone can INSERT (the public "contact us" form — no auth)
create policy "requests: public insert"
  on service_requests for insert
  with check (true);

-- Only consultants can read/update service requests
create policy "requests: consultant read"
  on service_requests for select
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'consultant')
  );

create policy "requests: consultant update"
  on service_requests for update
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'consultant')
  );


-- =============================================================================
-- MESSAGES
-- Threaded by client_id. Both consultant and that specific client can read/write.
-- =============================================================================
create table if not exists messages (
  id                  uuid primary key default gen_random_uuid(),
  client_id           text not null,    -- matches Client.id in your local/Supabase app DB
  sender_user_id      uuid not null references auth.users(id) on delete cascade,
  sender_role         user_role not null,
  sender_name         text not null,
  body                text not null,
  read_by_consultant  boolean not null default false,
  read_by_client      boolean not null default false,
  created_at          timestamptz not null default now()
);

create index messages_client_id_idx on messages(client_id);
create index messages_created_at_idx on messages(created_at);

alter table messages enable row level security;

-- Consultants can read and send messages for any client thread
create policy "messages: consultant all"
  on messages for all
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'consultant')
  );

-- Clients can only read/send in their own thread
create policy "messages: client own thread"
  on messages for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'client'
        and p.client_id = messages.client_id
    )
  );


-- =============================================================================
-- TASK COMMENTS
-- Consultant and client can comment on any task for a given engagement.
-- =============================================================================
create table if not exists task_comments (
  id              uuid primary key default gen_random_uuid(),
  task_id         text not null,     -- matches Task.id from your app DB
  client_id       text not null,     -- matches Client.id
  author_user_id  uuid not null references auth.users(id) on delete cascade,
  author_role     user_role not null,
  author_name     text not null,
  body            text not null,
  created_at      timestamptz not null default now()
);

create index task_comments_task_id_idx on task_comments(task_id);
create index task_comments_client_id_idx on task_comments(client_id);

alter table task_comments enable row level security;

-- Consultants can read/write all task comments
create policy "task_comments: consultant all"
  on task_comments for all
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'consultant')
  );

-- Clients can read/write comments on their own tasks only
create policy "task_comments: client own"
  on task_comments for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'client'
        and p.client_id = task_comments.client_id
    )
  );


-- =============================================================================
-- TASK APPROVALS
-- Consultant requests sign-off; client approves or rejects.
-- =============================================================================
create table if not exists task_approvals (
  id                      uuid primary key default gen_random_uuid(),
  task_id                 text not null,
  client_id               text not null,
  requested_by_user_id    uuid not null references auth.users(id),
  responded_by_user_id    uuid references auth.users(id),
  status                  approval_status not null default 'pending',
  client_note             text,
  requested_at            timestamptz not null default now(),
  responded_at            timestamptz
);

create index task_approvals_task_id_idx on task_approvals(task_id);
create index task_approvals_client_id_idx on task_approvals(client_id);
create index task_approvals_status_idx on task_approvals(status);

alter table task_approvals enable row level security;

-- Consultants can read and create approval requests
create policy "approvals: consultant all"
  on task_approvals for all
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'consultant')
  );

-- Clients can read and respond to approvals on their own tasks
create policy "approvals: client own"
  on task_approvals for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'client'
        and p.client_id = task_approvals.client_id
    )
  );


-- =============================================================================
-- ENABLE REALTIME
-- Powers live chat and live comment feeds without polling.
-- =============================================================================
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table task_comments;
alter publication supabase_realtime add table task_approvals;


-- =============================================================================
-- SEED: Default service packages
-- Remove or edit these to match your real offerings.
-- =============================================================================
insert into service_packages (name, tier, description, features, price_usd, pricing_label, phases, sort_order)
values
(
  'AI Discovery Sprint',
  'starter',
  'A focused 2-week engagement to map your business, identify the highest-value AI opportunities, and deliver a prioritized roadmap.',
  array[
    'Initial business discovery session',
    'Process mapping across all core workflows',
    'AI opportunity assessment with ROI estimates',
    'Prioritized 90-day AI roadmap',
    'Final findings presentation'
  ],
  997,
  null,
  array['discovery', 'strategy'],
  1
),
(
  'AI Growth Engagement',
  'growth',
  'Full-service AI implementation covering strategy through team training. We do the heavy lifting so your team can focus on growth.',
  array[
    'Everything in Discovery Sprint',
    'AI tool selection & vendor negotiation',
    'Full setup & integration of up to 3 AI tools',
    'Automation workflow build-out',
    'Team training sessions (up to 5 staff)',
    '30-day post-launch support'
  ],
  4997,
  null,
  array['discovery', 'strategy', 'implementation', 'review', 'optimization'],
  2
),
(
  'AI Partner Retainer',
  'enterprise',
  'Ongoing monthly partnership for businesses that want continuous AI optimization, new automations, and a dedicated consultant.',
  array[
    'Monthly strategy & performance review',
    'Unlimited AI tool support & optimization',
    'New automation opportunities each quarter',
    'Priority response (within 4 business hours)',
    'Monthly ROI & performance report',
    'Dedicated Slack channel'
  ],
  null,
  'From $1,500/mo',
  array['optimization', 'maintenance'],
  3
),
(
  'Custom Engagement',
  'custom',
  'Not sure which package fits? Tell us about your business and we will build a custom proposal.',
  array[
    'Free 30-minute discovery call',
    'Custom scope & pricing',
    'Flexible timeline',
    'Any combination of phases'
  ],
  null,
  'Contact for pricing',
  array['discovery', 'strategy', 'implementation', 'review', 'optimization', 'maintenance'],
  4
);
