-- Jangak.kg — начальная схема базы данных
-- Как применить: Supabase → SQL Editor → New query → вставить весь файл → Run

-- ───────────── Регионы ─────────────
create table public.regions (
  id smallint primary key,
  slug text unique not null,
  name_ru text not null,
  name_ky text not null,
  name_uz text not null,
  sort smallint not null default 0
);

insert into public.regions (id, slug, name_ru, name_ky, name_uz, sort) values
  (1, 'bishkek',     'Бишкек',                   'Бишкек',             'Bishkek',             1),
  (2, 'osh-city',    'Ош',                       'Ош',                 'O''sh',               2),
  (3, 'chuy',        'Чуйская область',          'Чүй облусу',         'Chuy viloyati',       3),
  (4, 'osh',         'Ошская область',           'Ош облусу',          'O''sh viloyati',      4),
  (5, 'jalal-abad',  'Джалал-Абадская область',  'Жалал-Абад облусу',  'Jalol-Obod viloyati', 5),
  (6, 'batken',      'Баткенская область',       'Баткен облусу',      'Botken viloyati',     6),
  (7, 'issyk-kul',   'Иссык-Кульская область',   'Ысык-Көл облусу',    'Issiqko''l viloyati', 7),
  (8, 'naryn',       'Нарынская область',        'Нарын облусу',       'Norin viloyati',      8),
  (9, 'talas',       'Таласская область',        'Талас облусу',       'Talas viloyati',      9);

-- ───────────── Категории (дерево: раздел → подраздел) ─────────────
create table public.categories (
  id serial primary key,
  parent_id int references public.categories(id) on delete cascade,
  slug text unique not null,
  name_ru text not null,
  name_ky text not null,
  name_uz text not null,
  icon text,
  sort smallint not null default 0
);

insert into public.categories (slug, name_ru, name_ky, name_uz, icon, sort) values
  ('kids',        'Детский мир',          'Балдар дүйнөсү',            'Bolalar dunyosi',           '🧸', 1),
  ('realty',      'Недвижимость',         'Кыймылсыз мүлк',            'Ko''chmas mulk',            '🏠', 2),
  ('transport',   'Транспорт',            'Транспорт',                 'Transport',                 '🚗', 3),
  ('jobs',        'Работа',               'Жумуш',                     'Ish',                       '💼', 4),
  ('animals',     'Животные',             'Жаныбарлар',                'Hayvonlar',                 '🐾', 5),
  ('home',        'Дом и сад',            'Үй жана бакча',             'Uy va bog''',               '🪴', 6),
  ('electronics', 'Электроника',          'Электроника',               'Elektronika',               '📱', 7),
  ('services',    'Бизнес и услуги',      'Бизнес жана кызматтар',     'Biznes va xizmatlar',       '🛠️', 8),
  ('fashion',     'Мода и стиль',         'Мода жана стиль',           'Moda va stil',              '👗', 9),
  ('hobby',       'Хобби, отдых и спорт', 'Хобби, эс алуу жана спорт', 'Xobbi, dam olish va sport', '⚽', 10),
  ('free',        'Отдам даром',          'Бекер берем',               'Tekinga beraman',           '🎁', 11),
  ('exchange',    'Обмен',                'Алмашуу',                   'Ayirboshlash',              '🔄', 12);

-- ───────────── Профили пользователей ─────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  avatar_url text,
  account_type text not null default 'private' check (account_type in ('private', 'business')),
  region_id smallint references public.regions(id),
  created_at timestamptz not null default now()
);

-- Профиль создаётся автоматически при регистрации
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, phone)
  values (new.id, new.raw_user_meta_data ->> 'name', new.phone);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────── Объявления ─────────────
create table public.listings (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id int not null references public.categories(id),
  region_id smallint not null references public.regions(id),
  title text not null check (char_length(title) between 16 and 70),
  description text not null check (char_length(description) between 40 and 9000),
  deal_type text not null default 'sell' check (deal_type in ('sell', 'exchange', 'free')),
  price numeric(14, 2) check (price is null or price >= 0),
  currency text not null default 'KGS' check (currency in ('KGS', 'USD')),
  negotiable boolean not null default false,
  condition text check (condition in ('new', 'used')),
  seller_type text not null default 'private' check (seller_type in ('private', 'business')),
  contact_name text,
  contact_phone text,
  -- pending = на модерации, active = опубликовано, rejected = отклонено, inactive = снято
  status text not null default 'active' check (status in ('pending', 'active', 'rejected', 'inactive')),
  is_vip boolean not null default false,
  vip_until timestamptz,
  bumped_at timestamptz not null default now(),
  views int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search tsvector generated always as (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) stored
);

create index listings_feed_idx on public.listings (status, bumped_at desc);
create index listings_category_idx on public.listings (category_id, status);
create index listings_region_idx on public.listings (region_id, status);
create index listings_user_idx on public.listings (user_id);
create index listings_search_idx on public.listings using gin (search);

create function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger listings_touch before update on public.listings
  for each row execute function public.touch_updated_at();

-- ───────────── Фото объявлений (до 8 штук) ─────────────
create table public.listing_photos (
  id bigint generated always as identity primary key,
  listing_id bigint not null references public.listings(id) on delete cascade,
  path text not null,
  sort smallint not null default 0
);

create index listing_photos_listing_idx on public.listing_photos (listing_id, sort);

-- ───────────── Избранное ─────────────
create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id bigint not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- ───────────── Права доступа (Row Level Security) ─────────────
alter table public.regions enable row level security;
alter table public.categories enable row level security;
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;
alter table public.favorites enable row level security;

create policy regions_read on public.regions for select using (true);
create policy categories_read on public.categories for select using (true);

create policy profiles_read on public.profiles for select using (true);
create policy profiles_update_own on public.profiles for update
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy listings_read on public.listings for select
  using (status = 'active' or (select auth.uid()) = user_id);
create policy listings_insert_own on public.listings for insert
  with check ((select auth.uid()) = user_id);
create policy listings_update_own on public.listings for update
  using ((select auth.uid()) = user_id and status <> 'rejected')
  with check ((select auth.uid()) = user_id and status in ('active', 'pending', 'inactive'));
create policy listings_delete_own on public.listings for delete
  using ((select auth.uid()) = user_id);

-- Пользователь не может сам включить себе VIP, накрутить просмотры или поднять объявление —
-- эти поля меняет только сервер (платные услуги, этап 3)
revoke insert, update on public.listings from anon, authenticated;
grant insert (user_id, category_id, region_id, title, description, deal_type, price, currency,
              negotiable, condition, seller_type, contact_name, contact_phone)
  on public.listings to authenticated;
grant update (category_id, region_id, title, description, deal_type, price, currency,
              negotiable, condition, seller_type, contact_name, contact_phone, status)
  on public.listings to authenticated;

create policy photos_read on public.listing_photos for select
  using (exists (select 1 from public.listings l where l.id = listing_id));
create policy photos_manage_own on public.listing_photos for all
  using (exists (select 1 from public.listings l where l.id = listing_id and l.user_id = (select auth.uid())))
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.user_id = (select auth.uid())));

create policy favorites_own on public.favorites for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ───────────── Хранилище фото ─────────────
-- Файлы кладутся в папку <id пользователя>/..., читать может любой
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-photos', 'listing-photos', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']);

create policy listing_photos_upload_own on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy listing_photos_delete_own on storage.objects for delete to authenticated
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
