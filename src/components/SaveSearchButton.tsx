"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

// Кнопка «Сохранить поиск» на странице поиска
export default function SaveSearchButton({
  params,
  loggedIn,
}: {
  params: Record<string, string>;
  loggedIn: boolean;
}) {
  const t = useTranslations("saved");
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { error } = await supabase.from("saved_searches").insert({ user_id: user.id, params });
    if (!error) setSaved(true);
    setBusy(false);
  }

  if (saved) return <span className="shrink-0 text-sm text-neutral-500">{t("done")} ✓</span>;

  return (
    <button
      type="button"
      onClick={save}
      disabled={busy}
      className="shrink-0 rounded-xl bg-neutral-100 px-3 py-2 text-sm font-bold hover:bg-neutral-200 disabled:opacity-50"
    >
      🔖 {t("save")}
    </button>
  );
}
