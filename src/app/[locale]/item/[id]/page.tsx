import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { photoUrl } from "@/lib/supabase/config";
import { formatDate, formatPrice, localName } from "@/lib/format";
import type { NamedRow } from "@/lib/listings";
import ShowPhone from "@/components/ShowPhone";
import FavoriteButton from "@/components/FavoriteButton";
import MessageSellerButton from "@/components/MessageSellerButton";
import ReportButton from "@/components/ReportButton";
import Stars from "@/components/Stars";

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
  seller: { name: string | null; created_at: string; rating_count: number; rating_sum: number } | null;
  photos: { path: string; sort: number }[];
};

async function getListing(id: string) {
  if (!/^\d+$/.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select(
      "id, user_id, status, title, description, price, currency, deal_type, negotiable, condition, seller_type, contact_name, contact_phone, created_at, category:categories(name_ru, name_ky, name_uz), region:regions(name_ru, name_ky, name_uz), seller:profiles!listings_user_id_fkey(name, created_at, rating_count, rating_sum), photos:listing_photos(path, sort)",
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
            {!isOwner && (
              <MessageSellerButton listingId={item.id} loggedIn={!!user} label={t("message")} />
            )}
            {!isOwner && item.contact_phone && (
              <a
                href={`https://wa.me/${item.contact_phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                  t("whatsappText", { title: item.title }),
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] font-extrabold text-white transition hover:brightness-105"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t("whatsapp")}
              </a>
            )}
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
              {item.seller && item.seller.rating_count > 0 && (
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                  <Stars value={item.seller.rating_sum / item.seller.rating_count} size={13} />
                  <span className="font-bold">
                    {(item.seller.rating_sum / item.seller.rating_count).toFixed(1)}
                  </span>
                  <span>({item.seller.rating_count})</span>
                </div>
              )}
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

        {!isOwner && item.status === "active" && (
          <ReportButton listingId={item.id} loggedIn={!!user} />
        )}
      </aside>
      </div>
    </div>
  );
}
