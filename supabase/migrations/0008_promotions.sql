-- Jangak.kg — платные услуги: продвижение объявлений (этап 3)
-- Схема с ручным подтверждением оплаты (MBank/Элсом/O!Деньги), пока нет платёжного шлюза.
-- Как применить: Supabase → SQL Editor → New query → вставить весь файл → Run

-- ───────────── Заказы услуг ─────────────
create table public.service_orders (
  id bigint generated always as identity primary key,
  listing_id bigint not null references public.listings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  service text not null check (service in ('vip', 'bump')),
  days int,                      -- срок VIP (для bump null)
  price numeric(10, 2) not null, -- цена считается на сервере
  status text not null default 'pending' check (status in ('pending', 'paid', 'rejected')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  confirmed_by uuid references public.profiles(id)
);

create index service_orders_pending_idx on public.service_orders (status, created_at);
create index service_orders_user_idx on public.service_orders (user_id, created_at desc);

-- ───────────── RLS ─────────────
alter table public.service_orders enable row level security;

-- Автор видит свои заказы, модератор — все. Создание и подтверждение — только через RPC.
create policy service_orders_read_own on public.service_orders for select
  using (user_id = (select auth.uid()));
create policy service_orders_admin_read on public.service_orders for select
  using (public.is_admin());

grant select on public.service_orders to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- ───────────── RPC: создать заказ (цена на сервере) ─────────────
create function public.create_service_order(p_listing_id bigint, p_service text, p_days int default null)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_price numeric(10, 2);
  v_days int := p_days;
  v_id bigint;
begin
  if v_user is null then raise exception 'not authenticated'; end if;
  if not exists (select 1 from public.listings where id = p_listing_id and user_id = v_user) then
    raise exception 'not your listing';
  end if;

  if p_service = 'bump' then
    v_price := 30; v_days := null;
  elsif p_service = 'vip' then
    if p_days = 7 then v_price := 100;
    elsif p_days = 30 then v_price := 300;
    else raise exception 'bad days'; end if;
  else
    raise exception 'bad service';
  end if;

  insert into public.service_orders (listing_id, user_id, service, days, price)
  values (p_listing_id, v_user, p_service, v_days, v_price)
  returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.create_service_order(bigint, text, int) to authenticated;

-- ───────────── RPC: подтвердить заказ (модератор) — применяет эффект ─────────────
create function public.apply_service_order(p_order_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.service_orders;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  select * into r from public.service_orders where id = p_order_id;
  if r.id is null then raise exception 'order not found'; end if;
  if r.status <> 'pending' then raise exception 'already processed'; end if;

  if r.service = 'vip' then
    update public.listings set
      is_vip = true,
      vip_until = greatest(coalesce(vip_until, now()), now()) + make_interval(days => r.days),
      bumped_at = now()
    where id = r.listing_id;
  elsif r.service = 'bump' then
    update public.listings set bumped_at = now() where id = r.listing_id;
  end if;

  update public.service_orders
    set status = 'paid', confirmed_at = now(), confirmed_by = (select auth.uid())
    where id = p_order_id;
end;
$$;

grant execute on function public.apply_service_order(bigint) to authenticated;

-- ───────────── RPC: отклонить заказ (модератор) ─────────────
create function public.reject_service_order(p_order_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  update public.service_orders
    set status = 'rejected', confirmed_at = now(), confirmed_by = (select auth.uid())
    where id = p_order_id and status = 'pending';
end;
$$;

grant execute on function public.reject_service_order(bigint) to authenticated;

-- ───────────── RPC: снять истёкший VIP (вызывать по расписанию) ─────────────
create function public.expire_vip()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.listings set is_vip = false
  where is_vip = true and vip_until is not null and vip_until < now();
$$;
