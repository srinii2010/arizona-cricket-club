-- ACC Scheduling schema: events and rsvps

-- Teams table is assumed to exist (referenced by team_id)
-- Members table is assumed to exist with primary key id and unique email

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  tournament_format_id uuid not null references public.tournament_formats(id) on delete cascade,
  title text not null,
  opposition text,
  type text not null check (type in ('match','practice')),
  location text not null,
  notes text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_team_id_starts_at_idx on public.events(team_id, starts_at);
create index if not exists events_season_id_idx on public.events(season_id);
create index if not exists events_tournament_format_id_idx on public.events(tournament_format_id);

-- RSVP statuses: yes, no, maybe
do $$ begin
  create type rsvp_status as enum ('yes','no','maybe');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.rsvps (
  event_id uuid not null references public.events(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  status rsvp_status not null,
  responded_at timestamptz not null default now(),
  primary key (event_id, member_id)
);

-- Convenience view to get counts per event
create or replace view public.event_rsvp_counts as
select 
  e.id as event_id,
  count(*) filter (where r.status = 'yes') as yes_count,
  count(*) filter (where r.status = 'no') as no_count,
  count(*) filter (where r.status = 'maybe') as maybe_count
from public.events e
left join public.rsvps r on r.event_id = e.id
group by e.id;

-- Row Level Security (adjust as per your policy)
alter table public.events enable row level security;
alter table public.rsvps enable row level security;

-- Policies (examples; tighten as needed)
do $$ begin
  perform 1 from pg_policies where schemaname = 'public' and tablename = 'events' and policyname = 'events_select';
  if not found then
    create policy events_select on public.events for select using (true);
  end if;
end $$;

do $$ begin
  perform 1 from pg_policies where schemaname = 'public' and tablename = 'rsvps' and policyname = 'rsvps_upsert_own';
  if not found then
    create policy rsvps_upsert_own on public.rsvps for all using (true) with check (true);
  end if;
end $$;


