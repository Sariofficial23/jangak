import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import SearchBar from "@/components/SearchBar";
import { categories } from "@/lib/categories";

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations();

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <SearchBar />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-8 text-center text-2xl font-extrabold text-walnut sm:text-3xl">
          {t("home.sections")}
        </h1>
        <ul className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
          {categories.map((c) => (
            <li key={c.key}>
              <a
                href="#"
                className="group flex flex-col items-center gap-2 text-center"
              >
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-full text-3xl transition group-hover:scale-110 sm:h-20 sm:w-20 sm:text-4xl"
                  style={{ backgroundColor: c.color }}
                  aria-hidden
                >
                  {c.icon}
                </span>
                <span className="text-sm font-semibold leading-tight group-hover:text-brand">
                  {t(`categories.${c.key}`)}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <h2 className="mb-4 text-xl font-extrabold text-walnut">
          {t("home.vip")}
        </h2>
        <div className="rounded-2xl border-2 border-dashed border-brand/30 bg-white p-10 text-center text-neutral-500">
          {t("home.empty")}
        </div>
      </section>
    </>
  );
}
