-- Jangak.kg — жалобы на объявления (этап 2)
-- Как применить: Supabase → SQL Editor → New query → вставить весь файл → Run

-- ───────────── Жалобы ─────────────
create table public.reports (
  id bigint generated always as identity primary key,
  listing_id bigint not null references public.listings(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  -- причина (коды), текст подписей — в интерфейсе на трёх языках
  reason text not null check (reason in ('spam', 'prohibited', 'fraud', 'wrong_info', 'sold', 'other')),
  comment text check (comment is null or char_length(comment) <= 1000),
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now(),
  -- одна жалоба от одного пользователя на одно объявление
  unique (listing_id, reporter_id)
);

create index reports_open_idx on public.reports (status, created_at);
create index reports_listing_idx on public.reports (listing_id);

-- ───────────── Права доступа (RLS) ─────────────
alter table public.reports enable row level security;

-- Пожаловаться можно на чужое активное объявление, от своего имени
create policy reports_insert on public.reports for insert
  with check (
    reporter_id = (select auth.uid())
    and exists (
      select 1 from public.listings l
      where l.id = listing_id and l.status = 'active' and l.user_id <> (select auth.uid())
    )
  );

-- Автор видит свои жалобы, модератор — все
create policy reports_read_own on public.reports for select
  using (reporter_id = (select auth.uid()));
create policy reports_admin_read on public.reports for select
  using (public.is_admin());

-- Менять статус жалобы может только модератор
create policy reports_admin_update on public.reports for update
  using (public.is_admin()) with check (public.is_admin());

grant select on public.reports to authenticated;
grant insert (listing_id, reporter_id, reason, comment) on public.reports to authenticated;
grant update (status) on public.reports to authenticated;
grant usage, select on all sequences in schema public to authenticated;
