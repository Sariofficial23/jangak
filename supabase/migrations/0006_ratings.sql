-- Jangak.kg — рейтинг и отзывы о продавцах (этап 2)
-- Как применить: Supabase → SQL Editor → New query → вставить весь файл → Run

-- ───────────── Денормализованный рейтинг на профиле ─────────────
-- Эти колонки меняет только триггер (пользователю в grant они не входят).
alter table public.profiles add column rating_count int not null default 0;
alter table public.profiles add column rating_sum int not null default 0;

-- ───────────── Отзывы о продавцах ─────────────
create table public.seller_reviews (
  id bigint generated always as identity primary key,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- один отзыв от пользователя на продавца, себе оценку не поставить
  unique (seller_id, author_id),
  check (seller_id <> author_id)
);

create index seller_reviews_seller_idx on public.seller_reviews (seller_id, created_at desc);

-- Пересчёт рейтинга продавца при любом изменении отзывов
create function public.recalc_seller_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  s uuid := coalesce(new.seller_id, old.seller_id);
begin
  update public.profiles p set
    rating_count = (select count(*) from public.seller_reviews r where r.seller_id = s),
    rating_sum = (select coalesce(sum(r.rating), 0) from public.seller_reviews r where r.seller_id = s)
  where p.id = s;
  return null;
end;
$$;

create trigger seller_reviews_recalc
  after insert or update or delete on public.seller_reviews
  for each row execute function public.recalc_seller_rating();

-- Обновляем updated_at при правке отзыва
create trigger seller_reviews_touch before update on public.seller_reviews
  for each row execute function public.touch_updated_at();

-- ───────────── Права доступа (RLS) ─────────────
alter table public.seller_reviews enable row level security;

-- Отзывы видны всем (страница продавца публичная)
create policy seller_reviews_read on public.seller_reviews for select using (true);

-- Оставить отзыв: от своего имени, не самому себе
create policy seller_reviews_insert on public.seller_reviews for insert
  with check (author_id = (select auth.uid()) and author_id <> seller_id);

-- Править/удалять можно только свой отзыв
create policy seller_reviews_update on public.seller_reviews for update
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy seller_reviews_delete on public.seller_reviews for delete
  using (author_id = (select auth.uid()));

grant select on public.seller_reviews to anon, authenticated;
grant insert (seller_id, author_id, rating, comment) on public.seller_reviews to authenticated;
grant update (rating, comment) on public.seller_reviews to authenticated;
grant delete on public.seller_reviews to authenticated;
grant usage, select on all sequences in schema public to authenticated;
