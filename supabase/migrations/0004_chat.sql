-- Jangak.kg — чат (этап 2)
-- Как применить: Supabase → SQL Editor → New query → вставить весь файл → Run

-- ───────────── Переписки (по одной на пару: объявление + покупатель) ─────────────
create table public.conversations (
  id bigint generated always as identity primary key,
  listing_id bigint not null references public.listings(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  unique (listing_id, buyer_id),
  check (seller_id <> buyer_id)
);

create index conversations_seller_idx on public.conversations (seller_id, last_message_at desc);
create index conversations_buyer_idx on public.conversations (buyer_id, last_message_at desc);

-- ───────────── Сообщения ─────────────
create table public.messages (
  id bigint generated always as identity primary key,
  conversation_id bigint not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text check (body is null or char_length(body) between 1 and 4000),
  image_path text,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  -- хотя бы текст или фото
  check (body is not null or image_path is not null)
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);

-- Обновляем время последнего сообщения у переписки
create function public.touch_conversation()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_touch after insert on public.messages
  for each row execute function public.touch_conversation();

-- ───────────── Права доступа (RLS) ─────────────
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Переписку видит только её участник
create policy conversations_read on public.conversations for select
  using ((select auth.uid()) in (seller_id, buyer_id));

-- Создание переписки напрямую запрещено — только через RPC start_conversation (ниже),
-- поэтому insert-политику не выдаём.

-- Сообщения видит участник переписки
create policy messages_read on public.messages for select
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id and (select auth.uid()) in (c.seller_id, c.buyer_id)
  ));

-- Отправлять может участник переписки и только от своего имени
create policy messages_insert on public.messages for insert
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (select auth.uid()) in (c.seller_id, c.buyer_id)
    )
  );

grant select on public.conversations to authenticated;
grant select on public.messages to authenticated;
grant insert (conversation_id, sender_id, body, image_path) on public.messages to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- ───────────── RPC: начать или открыть переписку ─────────────
-- Покупатель жмёт «Написать»: берём существующую переписку или создаём новую.
-- seller_id берём из объявления, buyer_id — текущий пользователь, себе писать нельзя.
create function public.start_conversation(p_listing_id bigint)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_seller uuid;
  v_buyer uuid := (select auth.uid());
  v_id bigint;
begin
  if v_buyer is null then
    raise exception 'not authenticated';
  end if;
  select user_id into v_seller from public.listings where id = p_listing_id and status = 'active';
  if v_seller is null then
    raise exception 'listing not available';
  end if;
  if v_seller = v_buyer then
    raise exception 'cannot message yourself';
  end if;

  insert into public.conversations (listing_id, seller_id, buyer_id)
  values (p_listing_id, v_seller, v_buyer)
  on conflict (listing_id, buyer_id) do nothing;

  select id into v_id from public.conversations
  where listing_id = p_listing_id and buyer_id = v_buyer;
  return v_id;
end;
$$;

grant execute on function public.start_conversation(bigint) to authenticated;

-- ───────────── RPC: отметить переписку прочитанной ─────────────
create function public.mark_conversation_read(p_conversation_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.messages
  set read_at = now()
  where conversation_id = p_conversation_id
    and sender_id <> (select auth.uid())
    and read_at is null
    and exists (
      select 1 from public.conversations c
      where c.id = p_conversation_id and (select auth.uid()) in (c.seller_id, c.buyer_id)
    );
end;
$$;

grant execute on function public.mark_conversation_read(bigint) to authenticated;

-- ───────────── RPC: список моих переписок (для /chat) ─────────────
-- Возвращает собеседника, объявление, последнее сообщение и число непрочитанных.
create function public.my_conversations()
returns table (
  id bigint,
  listing_id bigint,
  listing_title text,
  cover_path text,
  other_id uuid,
  other_name text,
  last_body text,
  last_image text,
  last_at timestamptz,
  last_sender uuid,
  unread bigint
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    c.id,
    c.listing_id,
    l.title as listing_title,
    (select p.path from public.listing_photos p
       where p.listing_id = l.id order by p.sort limit 1) as cover_path,
    case when c.seller_id = (select auth.uid()) then c.buyer_id else c.seller_id end as other_id,
    (select pr.name from public.profiles pr where pr.id =
       case when c.seller_id = (select auth.uid()) then c.buyer_id else c.seller_id end) as other_name,
    lm.body as last_body,
    lm.image_path as last_image,
    lm.created_at as last_at,
    lm.sender_id as last_sender,
    (select count(*) from public.messages m
       where m.conversation_id = c.id
         and m.sender_id <> (select auth.uid())
         and m.read_at is null) as unread
  from public.conversations c
  join public.listings l on l.id = c.listing_id
  left join lateral (
    select body, image_path, created_at, sender_id
    from public.messages m
    where m.conversation_id = c.id
    order by m.created_at desc
    limit 1
  ) lm on true
  where (select auth.uid()) in (c.seller_id, c.buyer_id)
  order by c.last_message_at desc;
$$;

grant execute on function public.my_conversations() to authenticated;

-- ───────────── Хранилище фото чата ─────────────
-- Файлы кладутся в папку <id пользователя>/..., читать может любой вошедший.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chat-photos', 'chat-photos', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']);

create policy chat_photos_upload_own on storage.objects for insert to authenticated
  with check (bucket_id = 'chat-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy chat_photos_read on storage.objects for select to authenticated
  using (bucket_id = 'chat-photos');

-- ───────────── Realtime (мгновенная доставка сообщений) ─────────────
alter publication supabase_realtime add table public.messages;
