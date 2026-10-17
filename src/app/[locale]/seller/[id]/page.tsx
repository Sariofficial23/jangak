import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, localName } from "@/lib/format";
import { LISTING_CARD_SELECT, type ListingCardData, type NamedRow } from "@/lib/listings";
import ListingCard from "@/components/ListingCard";
import Stars from "@/components/Stars";
import ReviewForm from "@/components/ReviewForm";

type Profile = {
  id: string;
  name: string | null;
  account_type: "private" | "business";
  created_at: string;
  rating_count: number;
  rating_sum: number;
  region: NamedRow | null;
};

type Review = {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  author_id: string;
  author: { name: string | null } | null;
};

const UUID = /^[0-9a-f-]{36}$/i;

async function getSeller(id: string) {
  if (!UUID.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, name, account_type, created_at, rating_count, rating_sum, region:regions(name_ru, name_ky, name_uz)")
    .eq("id", id)
    .maybeSingle();
  return data as Profile | null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const seller = await getSeller(id);
  return seller ? { title: `${seller.name ?? "Продавец"} — Jangak.kg` } : {};
}

export default async function SellerPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const seller = await getSeller(id);

  if (!seller) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="mb-6 text-lg">{t("seller.notFound")}</p>
        <Link href="/" className="font-bold text-brand hover:underline">
          ← {t("seller.back")}
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listingsData } = await supabase
    .from("listings")
    .select(LISTING_CARD_SELECT)
    .eq("user_id", id)
    .eq("status", "active")
    .order("is_vip", { ascending: false })
    .order("bumped_at", { ascending: false });
  const listings = (listingsData ?? []) as unknown as ListingCardData[];

  const { data: reviewsData } = await supabase
    .from("seller_reviews")
    .select("id, rating, comment, created_at, author_id, author:profiles!seller_reviews_author_id_fkey(name)")
    .eq("seller_id", id)
    .order("created_at", { ascending: false });
  const reviews = (reviewsData ?? []) as unknown as Review[];

  const name = seller.name || t("seller.anonymous");
  const avg = seller.rating_count > 0 ? seller.rating_sum / seller.rating_count : 0;
  const isSelf = user?.id === seller.id;
  const myReview = user ? reviews.find((r) => r.author_id === user.id) : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-8 flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-cream text-2xl font-extrabold text-walnut sm:h-20 sm:w-20">
          {name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-extrabold text-walnut sm:text-2xl">{name}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm">
            {seller.rating_count > 0 ? (
              <>
                <Stars value={avg} />
                <span className="font-bold">{avg.toFixed(1)}</span>
                <span className="text-neutral-500">
                  ({seller.rating_count} {t("review.count")})
                </span>
              </>
            ) : (
              <span className="text-neutral-400">{t("review.noRatings")}</span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
            <span className="rounded-md bg-neutral-100 px-2 py-0.5 font-semibold text-neutral-700">
              {t(`seller.${seller.account_type}`)}
            </span>
            {seller.region && <span>📍 {localName(seller.region, locale)}</span>}
            <span>{t("seller.joined", { date: formatDate(seller.created_at, locale) })}</span>
          </div>
        </div>
      </section>

      <h2 className="mb-4 text-lg font-bold text-walnut">
        {t("seller.listings")} · {listings.length}
      </h2>
      {listings.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((item) => (
            <ListingCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-10 text-center text-neutral-500">
          {t("seller.noListings")}
        </div>
      )}

      <h2 className="mb-4 mt-10 text-lg font-bold text-walnut">
        {t("review.sectionTitle")} · {seller.rating_count}
      </h2>

      {!isSelf && (
        <div className="mb-6">
          <ReviewForm
            sellerId={seller.id}
            loggedIn={!!user}
            initialRating={myReview?.rating ?? 0}
            initialComment={myReview?.comment ?? ""}
          />
        </div>
      )}

      {reviews.length ? (
        <ul className="flex flex-col gap-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold">{r.author?.name || t("review.anonymous")}</span>
                <span className="text-xs text-neutral-400">{formatDate(r.created_at, locale)}</span>
              </div>
              <div className="mt-1">
                <Stars value={r.rating} size={14} />
              </div>
              {r.comment && (
                <p className="mt-2 whitespace-pre-line break-words text-sm text-neutral-700">{r.comment}</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl bg-white p-8 text-center text-neutral-500">{t("review.empty")}</div>
      )}
    </div>
  );
}
