import { getTranslations, setRequestLocale } from "next-intl/server";
import SearchBar from "@/components/SearchBar";
import ListingCard from "@/components/ListingCard";
import SaveSearchButton from "@/components/SaveSearchButton";
import { getRefs } from "@/lib/refs";
import { LISTING_CARD_SELECT, type ListingCardData } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";

type Params = Record<string, string | undefined>;

const PAGE_SIZE = 48;

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Params>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations();
  const { regions, categories } = await getRefs(locale);

  const q = (sp.q ?? "").trim().slice(0, 100);
  const category = categories.find((c) => c.slug === sp.cat);
  const region = regions.find((r) => r.slug === sp.region);
  const min = Number(sp.min) || null;
  const max = Number(sp.max) || null;
  const cond = sp.cond === "new" || sp.cond === "used" ? sp.cond : "";
  const seller = sp.seller === "private" || sp.seller === "business" ? sp.seller : "";
  const sort = sp.sort === "cheap" || sp.sort === "expensive" ? sp.sort : "new";

  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select(LISTING_CARD_SELECT, { count: "exact" })
    .eq("status", "active");
  if (q) query = query.textSearch("search", q, { type: "websearch", config: "simple" });
  if (category) query = query.eq("category_id", category.id);
  if (region) query = query.eq("region_id", region.id);
  if (min !== null) query = query.gte("price", min);
  if (max !== null) query = query.lte("price", max);
  if (cond) query = query.eq("condition", cond);
  if (seller) query = query.eq("seller_type", seller);
  query =
    sort === "new"
      ? query.order("is_vip", { ascending: false }).order("bumped_at", { ascending: false })
      : query.order("price", { ascending: sort === "cheap", nullsFirst: false });

  const { data, count } = await query.limit(PAGE_SIZE);
  const listings = (data ?? []) as unknown as ListingCardData[];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Параметры текущего поиска для кнопки «Сохранить»
  const savedParams: Record<string, string> = {};
  if (q) savedParams.q = q;
  if (category) savedParams.cat = category.slug;
  if (region) savedParams.region = region.slug;
  if (min !== null) savedParams.min = String(min);
  if (max !== null) savedParams.max = String(max);
  if (cond) savedParams.cond = cond;
  if (seller) savedParams.seller = seller;
  if (sort !== "new") savedParams.sort = sort;

  const field = "flex flex-col gap-1 text-xs font-semibold text-neutral-600";
  const input = "h-11 rounded-xl border-2 border-neutral-200 bg-white px-3 text-sm font-normal text-neutral-900 outline-none focus:border-brand";

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <SearchBar regions={regions} q={q} region={region?.slug ?? ""} />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <form action={`/${locale}/search`} className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <input type="hidden" name="q" value={q} />
          <h2 className="mb-3 font-extrabold">{t("search.filters")}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
            <label className={`${field} col-span-2`}>
              {t("search.category")}
              <select name="cat" defaultValue={category?.slug ?? ""} className={input}>
                <option value="">{t("search.allCategories")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className={`${field} col-span-2`}>
              {t("search.region")}
              <select name="region" defaultValue={region?.slug ?? ""} className={input}>
                <option value="">{t("search.location")}</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.slug}>{r.name}</option>
                ))}
              </select>
            </label>
            <label className={field}>
              {t("search.priceFrom")}
              <input name="min" inputMode="numeric" defaultValue={min ?? ""} className={input} />
            </label>
            <label className={field}>
              {t("search.priceTo")}
              <input name="max" inputMode="numeric" defaultValue={max ?? ""} className={input} />
            </label>
            <label className={field}>
              {t("search.condition")}
              <select name="cond" defaultValue={cond} className={input}>
                <option value="">{t("search.any")}</option>
                <option value="new">{t("listing.new")}</option>
                <option value="used">{t("listing.used")}</option>
              </select>
            </label>
            <label className={field}>
              {t("search.seller")}
              <select name="seller" defaultValue={seller} className={input}>
                <option value="">{t("search.any")}</option>
                <option value="private">{t("listing.private")}</option>
                <option value="business">{t("listing.business")}</option>
              </select>
            </label>
          </div>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <label className={field}>
              {t("search.sort")}
              <select name="sort" defaultValue={sort} className={input}>
                <option value="new">{t("search.sortNew")}</option>
                <option value="cheap">{t("search.sortCheap")}</option>
                <option value="expensive">{t("search.sortExpensive")}</option>
              </select>
            </label>
            <div className="flex gap-2">
              <a href={`/${locale}/search`} className="flex h-11 items-center rounded-xl px-4 text-sm font-bold text-neutral-600 hover:bg-neutral-100">
                {t("search.reset")}
              </a>
              <button className="h-11 rounded-xl bg-brand px-6 text-sm font-extrabold text-white hover:bg-brand-dark">
                {t("search.apply")}
              </button>
            </div>
          </div>
        </form>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-extrabold text-walnut">
            {category ? category.name : t("search.results")} · {t("search.found", { count: count ?? 0 })}
          </h1>
          <SaveSearchButton params={savedParams} loggedIn={!!user} />
        </div>
        {listings.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {listings.map((item) => (
              <ListingCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-10 text-center text-neutral-500">{t("search.nothing")}</div>
        )}
      </div>
    </>
  );
}
