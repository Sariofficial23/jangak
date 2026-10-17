import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, localName } from "@/lib/format";
import { LISTING_CARD_SELECT, type ListingCardData, type NamedRow } from "@/lib/listings";
import ListingCard from "@/components/ListingCard";

type Profile = {
  id: string;
  name: string | null;
  account_type: "private" | "business";
  created_at: string;
  region: NamedRow | null;
};

const UUID = /^[0-9a-f-]{36}$/i;

async function getSeller(id: string) {
  if (!UUID.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, name, account_type, created_at, region:regions(name_ru, name_ky, name_uz)")
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
  const t = await getTranslations("seller");
  const seller = await getSeller(id);

  if (!seller) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="mb-6 text-lg">{t("notFound")}</p>
        <Link href="/" className="font-bold text-brand hover:underline">
          ← {t("back")}
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select(LISTING_CARD_SELECT)
    .eq("user_id", id)
    .eq("status", "active")
    .order("is_vip", { ascending: false })
    .order("bumped_at", { ascending: false });
  const listings = (data ?? []) as unknown as ListingCardData[];

  const name = seller.name || t("anonymous");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-8 flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-cream text-2xl font-extrabold text-walnut sm:h-20 sm:w-20">
          {name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-extrabold text-walnut sm:text-2xl">{name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
            <span className="rounded-md bg-neutral-100 px-2 py-0.5 font-semibold text-neutral-700">
              {t(seller.account_type)}
            </span>
            {seller.region && <span>📍 {localName(seller.region, locale)}</span>}
            <span>{t("joined", { date: formatDate(seller.created_at, locale) })}</span>
          </div>
        </div>
      </section>

      <h2 className="mb-4 text-lg font-bold text-walnut">
        {t("listings")} · {listings.length}
      </h2>

      {listings.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((item) => (
            <ListingCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-10 text-center text-neutral-500">{t("noListings")}</div>
      )}
    </div>
  );
}
