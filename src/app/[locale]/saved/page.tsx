import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRefs } from "@/lib/refs";
import { formatPrice } from "@/lib/format";
import DeleteSavedButton from "@/components/DeleteSavedButton";

type SearchParams = {
  q?: string;
  cat?: string;
  region?: string;
  min?: string;
  max?: string;
  cond?: string;
  seller?: string;
  sort?: string;
};

type SavedRow = { id: number; params: SearchParams };

export default async function SavedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect({ href: "/login", locale });

  const [{ data }, { regions, categories }] = await Promise.all([
    supabase.from("saved_searches").select("id, params").eq("user_id", user.id).order("created_at", { ascending: false }),
    getRefs(locale),
  ]);
  const items = (data ?? []) as SavedRow[];

  function describe(p: SearchParams) {
    const parts: string[] = [];
    if (p.q) parts.push(`«${p.q}»`);
    const cat = categories.find((c) => c.slug === p.cat);
    if (cat) parts.push(cat.name);
    const reg = regions.find((r) => r.slug === p.region);
    if (reg) parts.push(`📍 ${reg.name}`);
    const min = Number(p.min) || null;
    const max = Number(p.max) || null;
    if (min !== null && max !== null) parts.push(`${formatPrice(min, "KGS")} – ${formatPrice(max, "KGS")}`);
    else if (min !== null) parts.push(`${t("search.priceFrom")} ${formatPrice(min, "KGS")}`);
    else if (max !== null) parts.push(`${t("search.priceTo")} ${formatPrice(max, "KGS")}`);
    if (p.cond === "new" || p.cond === "used") parts.push(t(`listing.${p.cond}`));
    if (p.seller === "private" || p.seller === "business") parts.push(t(`listing.${p.seller}`));
    return parts.length ? parts.join(" · ") : t("saved.all");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-walnut">🔖 {t("saved.title")}</h1>

      {items.length ? (
        <ul className="flex flex-col gap-2">
          {items.map((s) => {
            const label = describe(s.params);
            return (
              <li key={s.id} className="flex items-center gap-2 rounded-2xl bg-white p-4 shadow-sm">
                <Link
                  href={{ pathname: "/search", query: s.params as Record<string, string> }}
                  className="min-w-0 flex-1 font-semibold hover:text-brand"
                >
                  <span className="line-clamp-2 break-words">{label}</span>
                </Link>
                <DeleteSavedButton id={s.id} label={t("saved.delete")} />
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-2xl bg-white p-10 text-center text-neutral-500">{t("saved.empty")}</div>
      )}
    </div>
  );
}
