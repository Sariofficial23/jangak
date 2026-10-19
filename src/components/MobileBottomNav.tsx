"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const tabs = [
  { key: "home", href: "/" },
  { key: "favorites", href: "/favorites" },
  { key: "create", href: "/post" },
  { key: "chat", href: "/chat" },
  { key: "profile", href: "/my" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

function NavIcon({ name }: { name: TabKey }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
      {name === "home" && <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></>}
      {name === "favorites" && <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />}
      {name === "create" && <path d="M12 5v14M5 12h14" />}
      {name === "chat" && <path d="M21 11.5a9 9 0 0 1-9 9 10 10 0 0 1-4-.9L3 21l1.4-4.9a9 9 0 1 1 16.6-4.6Z" />}
      {name === "profile" && <><circle cx="12" cy="7.5" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>}
    </svg>
  );
}

function activeTab(path: string): TabKey {
  if (path === "/favorites") return "favorites";
  if (path === "/post" || path.startsWith("/edit/")) return "create";
  if (path === "/chat" || path.startsWith("/chat/")) return "chat";
  if (["/my", "/login", "/saved", "/admin"].some((route) => path === route || path.startsWith(`${route}/`)) || path.startsWith("/promote/")) return "profile";
  return "home";
}

export default function MobileBottomNav({ unread = 0 }: { unread?: number }) {
  const t = useTranslations("mobileNav");
  const active = activeTab(usePathname());

  return (
    <nav aria-label={t("label")} className="fixed inset-x-0 bottom-0 z-40 h-[var(--mobile-nav-height)] border-t border-brand/10 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(74,46,27,0.07)] backdrop-blur-xl sm:hidden">
      <div className="mx-auto grid h-20 max-w-lg grid-cols-5 px-1">
        {tabs.map(({ key, href }) => {
          const selected = active === key;
          const create = key === "create";
          return (
            <Link key={key} href={href} aria-label={t(key)} aria-current={selected ? "page" : undefined}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[10px] leading-tight transition focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-brand min-[360px]:text-[11px] ${selected ? "font-extrabold text-brand" : "font-medium text-neutral-500 hover:text-brand"}`}>
              <span className={`relative flex shrink-0 items-center justify-center ${create ? "h-11 w-11 rounded-2xl bg-kernel text-walnut shadow-sm" : `h-10 w-10 rounded-2xl ${selected ? "bg-brand/10 text-brand" : ""}`}`}>
                <NavIcon name={key} />
                {key === "chat" && unread > 0 && <span aria-label={t("unread", { count: unread })} className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white ring-2 ring-white">{unread > 99 ? "99+" : unread}</span>}
              </span>
              <span className="max-w-full truncate">{t(key)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
