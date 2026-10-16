-- Jangak.kg — модерация объявлений (этап 1)
-- Как применить: Supabase → SQL Editor → New query → вставить весь файл → Run

-- ───────────── Флаг модератора ─────────────
alter table public.profiles
  add column is_admin boolean not null default false;

-- Пользователь не может сам назначить себя модератором: правим только разрешённые колонки.
-- (is_admin и id меняются только через SQL Editor / сервер)
revoke update on public.profiles from anon, authenticated;
grant update (name, phone, avatar_url, account_type, region_id)
  on public.profiles to authenticated;

-- Проверка «текущий пользователь — модератор?» без рекурсии RLS
create function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select coalesce((select is_admin from public.profiles where id = (select auth.uid())), false);
$$;

-- ───────────── Новые объявления уходят на модерацию ─────────────
-- Строгая модерация — наше отличие от конкурентов. Статус при вставке
-- выставляет база (колонка status не входит в grant на insert), поэтому
-- любое новое объявление получает 'pending', пока модератор не одобрит.
alter table public.listings alter column status set default 'pending';

-- ───────────── Права модератора ─────────────
-- Модератор видит все объявления и может менять их статус
-- (колонка status уже входит в grant на update для authenticated)
create policy listings_admin_read on public.listings for select
  using (public.is_admin());
create policy listings_admin_update on public.listings for update
  using (public.is_admin()) with check (public.is_admin());

-- Назначить модератора вручную:
--   update public.profiles set is_admin = true where id = '<uuid пользователя>';
