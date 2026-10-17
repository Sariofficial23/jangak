import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getModerator } from "@/lib/admin";
import LocaleSwitcher from "./LocaleSwitcher";
import LogoutButton from "./LogoutButton";

export default async function Header() {
  const t = await getTranslations("header");
  const { supabase, user, isAdmin } = await getModerator();

  // Непрочитанные сообщения (RLS отдаёт только переписки этого пользователя)
  let unread = 0;
  if (user) {
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .neq("sender_id", user.id)
      .is("read_at", null);
    unread = count ?? 0;
  }

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
          {user && (
            <Link href="/chat" className="relative hover:opacity-80">
              💬 <span className="hidden sm:inline">{t("chat")}</span>
              {unread > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>
          )}
          <LocaleSwitcher label={t("language")} />
          <Link href="/favorites" className="hidden hover:opacity-80 sm:inline" aria-label={t("favorites")}>
            ♡
          </Link>
          {user && (
            <Link href="/saved" className="hidden hover:opacity-80 sm:inline" aria-label={t("savedSearches")}>
              🔖
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="hover:opacity-80" aria-label={t("admin")}>
              🛡️ <span className="hidden sm:inline">{t("admin")}</span>
            </Link>
          )}
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
