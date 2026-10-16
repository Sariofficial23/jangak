import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import LocaleSwitcher from "./LocaleSwitcher";
import LogoutButton from "./LogoutButton";

export default async function Header() {
  const t = await getTranslations("header");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
          <Link href="/favorites" className="hidden hover:opacity-80 sm:inline" aria-label={t("favorites")}>
            ♡
          </Link>
          {user ? (
            <>
              <Link href="/my" className="hover:opacity-80" aria-label={t("myListings")}>
                <span className="sm:hidden">👤</span>
                <span className="hidden sm:inline">{t("myListings")}</span>
              </Link>
              <LogoutButton label={t("logout")} />
            </>
          ) : (
            <Link href="/login" className="hover:opacity-80">
              {t("login")}
            </Link>
          )}
          <Link
            href="/post"
            className="rounded-xl bg-kernel px-3 py-2 font-extrabold text-walnut transition hover:brightness-105 sm:px-4"
          >
            + <span className="hidden sm:inline">{t("post")}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
