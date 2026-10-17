import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { getModerator } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import OrderActions from "@/components/OrderActions";

type Order = {
  id: number;
  service: "vip" | "bump";
  days: number | null;
  price: number;
  created_at: string;
  listing: { id: number; title: string } | null;
  user: { name: string | null; phone: string | null } | null;
};

export default async function AdminOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const { supabase, user, isAdmin } = await getModerator();
  if (!user) return redirect({ href: "/login", locale });
  if (!isAdmin) return redirect({ href: "/", locale });

  const { data } = await supabase
    .from("service_orders")
    .select(
      "id, service, days, price, created_at, listing:listings(id, title), user:profiles!service_orders_user_id_fkey(name, phone)",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  const items = (data ?? []) as unknown as Order[];

  const label = (o: Order) =>
    o.service === "bump"
      ? t("promote.opt.bump.title")
      : t(o.days === 30 ? "promote.opt.vip30.title" : "promote.opt.vip7.title");

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <div className="mb-5 flex items-center gap-3">
        <Link href="/admin" className="text-xl text-neutral-500 hover:text-brand" aria-label="←">
          ←
        </Link>
        <h1 className="text-2xl font-extrabold text-walnut sm:text-3xl">{t("promote.adminTitle")}</h1>
      </div>

      {items.length ? (
        <ul className="flex flex-col gap-4">
          {items.map((o) => (
            <li key={o.id} className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                <span>#{o.id}</span>
                <span>·</span>
                <span>{formatDate(o.created_at, locale)}</span>
                <span className="rounded-md bg-kernel/20 px-2 py-0.5 font-semibold text-walnut">
                  {label(o)}
                </span>
                <span className="font-extrabold text-walnut">
                  {o.price} {t("promote.som")}
                </span>
              </div>
              {o.listing ? (
                <Link href={`/item/${o.listing.id}`} className="font-bold hover:text-brand">
                  {o.listing.title}
                </Link>
              ) : (
                <span className="text-neutral-400">{t("promote.listingGone")}</span>
              )}
              <div className="mt-1 text-xs text-neutral-500">
                {t("promote.buyer")}: {o.user?.name || "—"}
                {o.user?.phone ? ` · ${o.user.phone}` : ""}
              </div>
              <div className="mt-3">
                <OrderActions orderId={o.id} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl bg-white p-10 text-center text-neutral-500">{t("promote.adminEmpty")}</div>
      )}
    </div>
  );
}
