import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-walnut text-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Image src="/brand/jangak-logo-white.svg" alt="Jangak.kg" width={140} height={38} />
          <p className="mt-2 text-sm text-kernel">{t("tagline")}</p>
        </div>
        <nav className="flex gap-6 text-sm">
          <a href="#" className="hover:text-kernel">{t("help")}</a>
          <a href="#" className="hover:text-kernel">{t("rules")}</a>
          <a href="#" className="hover:text-kernel">{t("privacy")}</a>
        </nav>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-cream/60">
        © {year} Jangak.kg. {t("rights")}
      </div>
    </footer>
  );
}
