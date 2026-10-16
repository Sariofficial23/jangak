import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { photoUrl } from "@/lib/supabase/config";
import { formatDate, formatPrice } from "@/lib/format";
import { firstPhoto } from "@/lib/listings";
import MyListingActions from "@/components/MyListingActions";

const TABS = ["active", "pending", "inactive", "rejected"] as const;

export default async function MyListingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { tab: rawTab } = await searchParams;
  const tab = TABS.find((x) => x === rawTab) ?? "active";
  const t = await getTranslations();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect({ href: "/login", locale });

  const { data } = await supabase
    .from("listings")
    .select("id, title, price, currency, deal_type, status, views, created_at, photos:listing_photos(path, sort)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const all = data ?? [];
  const items = all.filter((l) => l.status === tab);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-walnut sm:text-3xl">{t("my.title")}</h1>
        <Link href="/post" className="rounded-xl bg-kernel px-4 py-2 font-extrabold text-walnut">
          + {t("my.postNew")}
        </Link>
      </div>

      <nav className="mb-5 flex gap-1 overflow-x-auto border-b border-neutral-200">
        {TABS.map((x) => (
          <Link
            key={x}
            href={{ pathname: "/my", query: { tab: x } }}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-bold ${
              x === tab ? "border-brand text-brand" : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {t(`my.${x}`)} ({all.filter((l) => l.status === x).length})
          </Link>
        ))}
      </nav>

      {items.length ? (
        <ul className="flex flex-col gap-3">
          {items.map((l) => {
            const cover = firstPhoto(l.photos);
            return (
              <li key={l.id} className="flex gap-4 rounded-2xl bg-white p-3 shadow-sm">
                <Link href={`/item/${l.id}`} className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                  {cover && <Image src={photoUrl(cover)} alt="" fill unoptimized className="object-cover" />}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Link href={`/item/${l.id}`} className="truncate font-bold hover:text-brand">{l.title}</Link>
                  <div className="text-sm font-extrabold">
                    {l.deal_type === "sell" ? formatPrice(l.price, l.currency) : t(`listing.${l.deal_type}`)}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {formatDate(l.created_at, locale)} · {t("my.views", { count: l.views })}
                  </div>
                  <div className="mt-auto pt-1">
                    <MyListingActions id={l.id} status={l.status} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-2xl bg-white p-10 text-center text-neutral-500">{t("my.empty")}</div>
      )}
    </div>
  );
}
