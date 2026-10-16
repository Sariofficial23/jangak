import { getLocale, getTranslations } from "next-intl/server";
import type { RefOption } from "@/lib/refs";

// Обычная HTML-форма: работает даже без JavaScript, ведёт на /<язык>/search
export default async function SearchBar({
  regions,
  q = "",
  region = "",
}: {
  regions: RefOption[];
  q?: string;
  region?: string;
}) {
  const t = await getTranslations("search");
  const locale = await getLocale();

  return (
    <form action={`/${locale}/search`} className="flex flex-col gap-3 sm:flex-row" role="search">
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder={`🔍 ${t("placeholder")}`}
        className="h-14 w-full rounded-xl border-2 border-brand px-4 outline-none focus:ring-4 focus:ring-brand/20 sm:flex-1"
      />
      <select
        name="region"
        defaultValue={region}
        className="h-14 rounded-xl border-2 border-brand/40 bg-white px-4 text-neutral-700 sm:w-64"
      >
        <option value="">📍 {t("location")}</option>
        {regions.map((r) => (
          <option key={r.id} value={r.slug}>
            {r.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="h-14 rounded-xl bg-brand px-8 font-extrabold text-white transition hover:bg-brand-dark"
      >
        {t("submit")}
      </button>
    </form>
  );
}
