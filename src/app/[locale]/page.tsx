import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import SearchBar from "@/components/SearchBar";
import ListingCard from "@/components/ListingCard";
import { categories } from "@/lib/categories";
import CategoryIcon from "@/components/CategoryIcon";
import { Link } from "@/i18n/navigation";
import { getRefs } from "@/lib/refs";
import { LISTING_CARD_SELECT, type ListingCardData } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";

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
  const listings = (data ?? []) as unknown as ListingCardData[];

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <SearchBar regions={regions} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-8 text-center text-2xl font-extrabold text-walnut sm:text-3xl">
          {t("home.sections")}
        </h1>
        <ul className="grid auto-rows-[118px] grid-cols-3 gap-2 sm:auto-rows-[132px] sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
          {categories.map((c) => (
            <li key={c.key} className={c.wide ? "col-span-2 sm:col-span-1" : ""}>
              <Link
                href={{ pathname: "/search", query: { cat: c.key } }}
                className="group relative block h-full overflow-hidden rounded-2xl p-2.5 text-[12px] font-bold leading-tight text-[#1b1b1b] transition hover:shadow-md active:scale-[0.98] sm:p-3 sm:text-sm"
                style={{ backgroundColor: c.bg }}
              >
                <span
                  className={`block break-words hyphens-auto group-hover:text-brand ${
                    c.wide ? "text-[15px] sm:text-sm" : ""
                  }`}
                >
                  {t(`categories.${c.key}`)}
                </span>
                {c.photo ? (
                  <Image
                    src={`/categories/${c.key}.jpg`}
                    alt=""
                    width={288}
                    height={171}
                    sizes="(min-width: 640px) 96px, 150px"
                    className={`absolute bottom-1.5 right-1.5 rounded-xl object-cover ${
                      c.wide
                        ? "h-[72px] w-[140px] sm:h-[60px] sm:w-[76px]"
                        : "h-[60px] w-[76px]"
                    }`}
                  />
                ) : (
                  <CategoryIcon
                    name={c.key}
                    className="absolute bottom-2 right-2 h-14 w-14"
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <h2 className="mb-4 text-xl font-extrabold text-walnut">
          {t("home.latest")}
        </h2>
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
