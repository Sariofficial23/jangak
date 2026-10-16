-- Явные права для сайта (роли anon = гость, authenticated = вошедший пользователь).
-- Новые проекты Supabase не выдают их автоматически для таблиц, созданных через SQL.
-- Что именно можно делать с каждой строкой, по-прежнему решают политики RLS из 0001.

grant usage on schema public to anon, authenticated;

grant select on public.regions, public.categories, public.profiles,
                public.listings, public.listing_photos to anon, authenticated;

grant update (name, phone, avatar_url, account_type, region_id) on public.profiles to authenticated;

-- Для listings права на insert/update по колонкам выданы в 0001
grant delete on public.listings to authenticated;

grant insert, update, delete on public.listing_photos to authenticated;
grant select, insert, delete on public.favorites to authenticated;

grant usage, select on all sequences in schema public to authenticated;
