import { getTranslations, setRequestLocale } from "next-intl/server";
import SearchBar from "@/components/SearchBar";
import AppDownloadBanner from "@/components/AppDownloadBanner";
import ListingCard from "@/components/ListingCard";
import Image from "next/image";
import { categories } from "@/lib/categories";
import { Link } from "@/i18n/navigation";
import { getRefs } from "@/lib/refs";
import { LISTING_CARD_SELECT, type ListingCardData } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";
import { demoListings } from "@/lib/demo-listings";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const supabase = await createClient();
  const { regions } = await getRefs(locale);
  const { data } = await supabase
    .from("listings")
    .select(LISTING_CARD_SELECT)
    .eq("status", "active")
    .order("is_vip", { ascending: false })
    .order("bumped_at", { ascending: false })
    .limit(24);
  const listings = [...((data ?? []) as unknown as ListingCardData[]), ...demoListings];

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <SearchBar regions={regions} />
        </div>
      </section>

      <AppDownloadBanner />

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-8 text-center text-2xl font-extrabold text-walnut sm:text-3xl">
          {t("home.sections")}
        </h1>
        <ul className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
          {categories.map((c) => (
            <li key={c.key}>
              <Link
                href={{ pathname: "/search", query: { cat: c.key } }}
                className="group flex flex-col items-center gap-2 text-center"
              >
                <span
                  className="relative h-16 w-16 overflow-hidden rounded-full ring-1 ring-walnut/5 transition group-hover:-translate-y-1 group-hover:shadow-md sm:h-20 sm:w-20"
                  style={{ backgroundColor: c.bg }}
                >
                  <Image
                    src={`/categories/${c.key}.png`}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 80px, 64px"
                    className="object-cover"
                  />
                </span>
                <span className="text-sm font-semibold leading-tight group-hover:text-brand">
                  {t(`categories.${c.key}`)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <h2 className="mb-4 text-xl font-extrabold text-walnut">
          {t("home.latest")}
        </h2>
        <p className="mb-5 text-sm text-neutral-500">{t("listing.demoFeedNotice")}</p>
        {listings.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {listings.map((item) => (
              <ListingCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-brand/30 bg-white p-10 text-center text-neutral-500">
            {t("home.empty")}
          </div>
        )}
      </section>
    </>
  );
}
