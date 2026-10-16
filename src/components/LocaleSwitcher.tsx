"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { localeLabels, routing } from "@/i18n/routing";

export default function LocaleSwitcher({ label }: { label: string }) {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="opacity-40">|</span>}
          <Link
            href={pathname}
            locale={l}
            aria-current={l === locale ? "true" : undefined}
            className={l === locale ? "text-kernel" : "opacity-80 hover:opacity-100"}
          >
            {localeLabels[l]}
          </Link>
        </span>
      ))}
    </div>
  );
}
