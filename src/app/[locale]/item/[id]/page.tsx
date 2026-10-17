import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { photoUrl } from "@/lib/supabase/config";
import { formatDate, formatPrice, localName } from "@/lib/format";
import type { NamedRow } from "@/lib/listings";
import ShowPhone from "@/components/ShowPhone";
import FavoriteButton from "@/components/FavoriteButton";

type Listing = {
  id: number;
  user_id: string;
  status: "pending" | "active" | "rejected" | "inactive";
  title: string;
  description: string;
  price: number | null;
  currency: string;
  deal_type: "sell" | "exchange" | "free";
  negotiable: boolean;
  condition: "new" | "used" | null;
  seller_type: "private" | "business";
  contact_name: string | null;
  contact_phone: string | null;
  created_at: string;
  category: NamedRow | null;
  region: NamedRow | null;
  seller: { name: string | null; created_at: string } | null;
  photos: { path: string; sort: number }[];
};

async function getListing(id: string) {
  if (!/^\d+$/.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select(
      "id, user_id, status, title, description, price, currency, deal_type, negotiable, condition, seller_type, contact_name, contact_phone, created_at, category:categories(name_ru, name_ky, name_uz), region:regions(name_ru, name_ky, name_uz), seller:profiles!listings_user_id_fkey(name, created_at), photos:listing_photos(path, sort)",
    )
    .eq("id", Number(id))
    .maybeSingle();
  return data as Listing | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const item = await getListing(id);
  return item ? { title: `${item.title} — Jangak.kg` } : {};
}

export default async function ItemPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("listing");
  const item = await getListing(id);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: fav } = user && item
    ? await supabase.from("favorites").select("listing_id").eq("user_id", user.id).eq("listing_id", item.id).maybeSingle()
    : { data: null };

  if (!item) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="mb-6 text-lg">{t("notFound")}</p>
        <Link href="/" className="font-bold text-brand hover:underline">
          ← {t("back")}
        </Link>
      </div>
    );
  }

  const photos = [...item.photos].sort((a, b) => a.sort - b.sort);
  const price =
    item.deal_type === "free"
      ? t("free")
      : item.deal_type === "exchange"
        ? t("exchange")
        : formatPrice(item.price, item.currency);

  const isOwner = user?.id === item.user_id;
  const banner =
    isOwner && item.status !== "active"
      ? item.status === "pending"
        ? { text: t("statusPending"), cls: "bg-kernel/20 text-walnut" }
        : item.status === "rejected"
          ? { text: t("statusRejected"), cls: "bg-red-50 text-red-700" }
          : { text: t("statusInactive"), cls: "bg-neutral-100 text-neutral-600" }
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {banner && (
        <p className={`mb-5 rounded-xl px-4 py-3 text-sm font-semibold ${banner.cls}`}>{banner.text}</p>
      )}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="flex min-w-0 flex-col gap-6">
        <div className="overflow-hidden rounded-2xl bg-neutral-900">
          {photos.length ? (
            <div className="flex snap-x snap-mandatory overflow-x-auto">
              {photos.map((p, i) => (
                <div key={p.path} className="relative aspect-[4/3] w-full shrink-0 snap-center">
                  <Image
                    src={photoUrl(p.path)}
                    alt={`${item.title} — ${i + 1}`}
                    fill
                    unoptimized
                    priority={i === 0}
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center text-neutral-400">
              {t("noPhoto")}
            </div>
          )}
        </div>
        {photos.length > 1 && (
          <p className="-mt-4 text-center text-xs text-neutral-500">← {photos.length} фото →</p>
        )}

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap gap-2 text-sm">
            <span className="rounded-lg bg-neutral-100 px-3 py-1">{t(item.seller_type)}</span>
            {item.condition && (
              <span className="rounded-lg bg-neutral-100 px-3 py-1">{t(item.condition)}</span>
            )}
            {item.category && (
              <span className="rounded-lg bg-neutral-100 px-3 py-1">{localName(item.category, locale)}</span>
            )}
          </div>
          <h2 className="mb-3 text-lg font-extrabold">{t("description")}</h2>
          <p className="whitespace-pre-line break-words leading-relaxed">{item.description}</p>
        </section>
      </div>

      <aside className="flex flex-col gap-4">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs text-neutral-500">
            {t("published")} {formatDate(item.created_at, locale)}
          </p>
          <h1 className="my-2 break-words text-xl font-bold">{item.title}</h1>
          <div className="text-2xl font-extrabold">{price}</div>
          {item.negotiable && <div className="text-sm text-neutral-500">{t("negotiable")}</div>}
          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              disabled
              title="Скоро"
              className="h-12 rounded-xl bg-brand font-extrabold text-white opacity-60"
            >
              💬 {t("message")}
            </button>
            {item.contact_phone && <ShowPhone phone={item.contact_phone} label={t("showPhone")} />}
            <FavoriteButton listingId={item.id} initial={!!fav} loggedIn={!!user} />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-neutral-500">{t("seller")}</h2>
          <Link
            href={`/seller/${item.user_id}`}
            className="group flex items-center gap-3 rounded-xl p-1 -m-1 transition hover:bg-neutral-50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream text-xl font-extrabold text-walnut">
              {(item.contact_name || item.seller?.name || "?").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate font-bold group-hover:text-brand">
                {item.contact_name || item.seller?.name}
              </div>
              {item.seller && (
                <div className="text-xs text-neutral-500">
                  Jangak · {formatDate(item.seller.created_at, locale)}
                </div>
              )}
            </div>
            <span className="ml-auto shrink-0 text-neutral-300 group-hover:text-brand">›</span>
          </Link>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">{t("location")}</h2>
          <p className="font-semibold">📍 {localName(item.region, locale)}</p>
        </section>
      </aside>
      </div>
    </div>
  );
}
