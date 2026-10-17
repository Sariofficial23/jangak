-- Jangak.kg — сохранённые поиски (этап 2)
-- Как применить: Supabase → SQL Editor → New query → вставить весь файл → Run

create table public.saved_searches (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  -- параметры фильтра (q, cat, region, min, max, cond, seller, sort)
  params jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index saved_searches_user_idx on public.saved_searches (user_id, created_at desc);

alter table public.saved_searches enable row level security;

-- Пользователь работает только со своими сохранёнными поисками
create policy saved_searches_own on public.saved_searches for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant select, insert, delete on public.saved_searches to authenticated;
grant usage, select on all sequences in schema public to authenticated;
