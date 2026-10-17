"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

const REASONS = ["spam", "prohibited", "fraud", "wrong_info", "sold", "other"] as const;

// Кнопка «Пожаловаться» на странице объявления
export default function ReportButton({
  listingId,
  loggedIn,
}: {
  listingId: number;
  loggedIn: boolean;
}) {
  const t = useTranslations("report");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<"idle" | "done" | "already">("idle");
  const [error, setError] = useState("");

  async function submit() {
    if (!reason || busy) return;
    setBusy(true);
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { error: err } = await supabase
      .from("reports")
      .insert({ listing_id: listingId, reporter_id: user.id, reason, comment: comment.trim() || null });
    if (err) {
      if (err.code === "23505") setState("already");
      else setError(err.message);
    } else {
      setState("done");
    }
    setBusy(false);
  }

  if (state === "done" || state === "already") {
    return <p className="px-1 text-xs text-neutral-500">{t(state === "done" ? "thanks" : "already")}</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => (loggedIn ? setOpen(true) : router.push("/login"))}
        className="px-1 text-xs text-neutral-400 transition hover:text-red-600"
      >
        ⚑ {t("report")}
      </button>
    );
  }

  const field = "rounded-lg border-2 border-neutral-200 px-2 outline-none focus:border-brand";

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 p-3 text-sm">
      <div className="font-semibold">{t("title")}</div>
      <select value={reason} onChange={(e) => setReason(e.target.value)} className={`h-10 ${field}`}>
        <option value="">{t("choose")}</option>
        {REASONS.map((r) => (
          <option key={r} value={r}>
            {t(`reasons.${r}`)}
          </option>
        ))}
      </select>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder={t("commentPlaceholder")}
        className={`resize-none py-1 ${field}`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={!reason || busy}
          className="h-9 flex-1 rounded-lg bg-brand font-bold text-white disabled:opacity-50"
        >
          {t("send")}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="h-9 rounded-lg bg-neutral-100 px-3 font-bold">
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}
