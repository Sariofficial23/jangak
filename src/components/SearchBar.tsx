import { useTranslations } from "next-intl";

// Пока только вёрстка — поиск подключим на этапе 1
export default function SearchBar() {
  const t = useTranslations("search");

  return (
    <form className="flex flex-col gap-3 sm:flex-row" role="search">
      <input
        type="search"
        name="q"
        placeholder={`🔍 ${t("placeholder")}`}
        className="h-14 w-full rounded-xl sm:flex-1 border-2 border-brand px-4 outline-none focus:ring-4 focus:ring-brand/20"
      />
      <button
        type="button"
        className="h-14 rounded-xl border-2 border-brand/40 px-4 text-left text-neutral-600 sm:w-64"
      >
        📍 {t("location")}
      </button>
      <button
        type="submit"
        className="h-14 rounded-xl bg-brand px-8 font-extrabold text-white transition hover:bg-brand-dark"
      >
        {t("submit")}
      </button>
    </form>
  );
}
