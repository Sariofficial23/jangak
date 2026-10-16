import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "./LocaleSwitcher";

export default function Header() {
  const t = useTranslations("header");

  return (
    <header className="bg-brand text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="shrink-0" aria-label="Jangak.kg">
          <Image
            src="/brand/jangak-logo-white.svg"
            alt="Jangak.kg"
            width={150}
            height={40}
            priority
          />
        </Link>
        <nav className="ml-auto flex items-center gap-4 text-sm font-semibold sm:gap-6">
          <a href="#" className="hidden hover:opacity-80 md:inline">
            💬 {t("chat")}
          </a>
          <LocaleSwitcher label={t("language")} />
          <a href="#" className="hidden hover:opacity-80 sm:inline" aria-label={t("favorites")}>
            ♡
          </a>
          <a href="#" className="hidden hover:opacity-80 md:inline">
            {t("profile")}
          </a>
          <a
            href="#"
            className="rounded-xl bg-kernel px-3 py-2 font-extrabold text-walnut transition hover:brightness-105 sm:px-4"
          >
            + <span className="hidden sm:inline">{t("post")}</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
