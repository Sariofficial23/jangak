import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { getModerator } from "@/lib/admin";
import { photoUrl } from "@/lib/supabase/config";
import { formatDate, formatPrice, localName } from "@/lib/format";
import type { NamedRow } from "@/lib/listings";
import ModerateActions from "@/components/ModerateActions";

const TABS = ["pending", "active", "rejected"] as const;

type Row = {
  id: number;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  deal_type: "sell" | "exchange" | "free";
  status: string;
  contact_name: string | null;
  contact_phone: string | null;
  created_at: string;
  category: NamedRow | null;
  region: NamedRow | null;
  seller: { name: string | null } | null;
  photos: { path: string; sort: number }[];
};

export default async function AdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { tab: rawTab } = await searchParams;
  const tab = TABS.find((x) => x === rawTab) ?? "pending";
  const t = await getTranslations();

  const { supabase, user, isAdmin } = await getModerator();
  if (!user) return redirect({ href: "/login", locale });
  if (!isAdmin) return redirect({ href: "/", locale });

  const counts = await Promise.all(
    TABS.map((x) => supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", x)),
  );
  const countByTab = Object.fromEntries(TABS.map((x, i) => [x, counts[i].count ?? 0])) as Record<
    (typeof TABS)[number],
    number
  >;

  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, title, description, price, currency, deal_type, status, contact_name, contact_phone, created_at, category:categories(name_ru, name_ky, name_uz), region:regions(name_ru, name_ky, name_uz), seller:profiles(name), photos:listing_photos(path, sort)",
    )
    .eq("status", tab)
    .order("created_at", { ascending: true });
  const items = (data ?? []) as unknown as Row[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <h1 className="mb-5 text-2xl font-extrabold text-walnut sm:text-3xl">{t("admin.title")}</h1>

      <nav className="mb-5 flex gap-1 overflow-x-auto border-b border-neutral-200">
        {TABS.map((x) => (
          <Link
            key={x}
            href={{ pathname: "/admin", query: { tab: x } }}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-bold ${
              x === tab
                ? "border-brand text-brand"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {t(`admin.${x}`)} ({countByTab[x]})
          </Link>
        ))}
      </nav>

      {error ? (
        <div className="rounded-2xl bg-red-50 p-6 text-sm text-red-700">
          {t("admin.loadError")}: {error.message}
        </div>
      ) : items.length ? (
        <ul className="flex flex-col gap-4">
          {items.map((l) => {
            const photos = [...l.photos].sort((a, b) => a.sort - b.sort);
            const price =
              l.deal_type === "sell" ? formatPrice(l.price, l.currency) : t(`listing.${l.deal_type}`);
            return (
              <li key={l.id} className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row">
                  {photos.length ? (
                    <div className="flex snap-x gap-2 overflow-x-auto lg:w-72 lg:shrink-0">
                      {photos.map((p, i) => (
                        <div
                          key={p.path}
                          className="relative aspect-[4/3] w-40 shrink-0 snap-start overflow-hidden rounded-xl bg-neutral-100 sm:w-48 lg:w-full"
                        >
                          <Image src={photoUrl(p.path)} alt={`${l.title} — ${i + 1}`} fill unoptimized className="object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-neutral-100 text-sm text-neutral-400 lg:w-72 lg:shrink-0">
                      {t("listing.noPhoto")}
                    </div>
                  )}

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                      <span>#{l.id}</span>
                      <span>·</span>
                      <span>{formatDate(l.created_at, locale)}</span>
                      {l.category && (
                        <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-neutral-700">
                          {localName(l.category, locale)}
                        </span>
                      )}
                      {l.region && (
                        <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-neutral-700">
                          📍 {localName(l.region, locale)}
                        </span>
                      )}
                    </div>

                    <Link href={`/item/${l.id}`} className="font-bold hover:text-brand">
                      {l.title}
                    </Link>
                    <div className="text-sm font-extrabold">{price}</div>
                    <p className="line-clamp-3 whitespace-pre-line break-words text-sm text-neutral-600">
                      {l.description}
                    </p>
                    <div className="text-xs text-neutral-500">
                      {t("admin.seller")}: {l.contact_name || l.seller?.name || "—"}
                      {l.contact_phone ? ` · ${l.contact_phone}` : ""}
                    </div>

                    <div className="mt-2">
                      <ModerateActions id={l.id} status={l.status} />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-2xl bg-white p-10 text-center text-neutral-500">{t("admin.empty")}</div>
      )}
    </div>
  );
}
