"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toggleFavorite } from "@/app/[locale]/my/actions";

export default function FavoriteButton({
  listingId,
  initial,
  loggedIn,
}: {
  listingId: number;
  initial: boolean;
  loggedIn: boolean;
}) {
  const t = useTranslations("fav");
  const router = useRouter();
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!loggedIn) return router.push("/login");
        const next = !on;
        setOn(next);
        start(() => toggleFavorite(listingId, next));
      }}
      className={`flex h-12 items-center justify-center gap-2 rounded-xl border-2 font-bold transition ${
        on ? "border-kernel bg-kernel/15 text-walnut" : "border-neutral-200 hover:border-kernel"
      }`}
    >
      <span className={on ? "text-red-500" : ""}>{on ? "♥" : "♡"}</span>
      {on ? t("remove") : t("add")}
    </button>
  );
}
