import { defineRouting } from "next-intl/routing";

// ru — русский, ky — кыргызский, uz — узбекский (латиница)
export const routing = defineRouting({
  locales: ["ru", "ky", "uz"],
  defaultLocale: "ru",
});

export type Locale = (typeof routing.locales)[number];

// Короткие подписи для переключателя языков в шапке
export const localeLabels: Record<Locale, string> = {
  ru: "RU",
  ky: "KG",
  uz: "UZ",
};
