"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

// Форма «оставить/изменить отзыв о продавце»
export default function ReviewForm({
  sellerId,
  loggedIn,
  initialRating,
  initialComment,
}: {
  sellerId: string;
  loggedIn: boolean;
  initialRating: number;
  initialComment: string;
}) {
  const t = useTranslations("review");
  const router = useRouter();
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(initialComment);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!rating || busy) return;
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
    const { error: err } = await supabase.from("seller_reviews").upsert(
      { seller_id: sellerId, author_id: user.id, rating, comment: comment.trim() || null },
      { onConflict: "seller_id,author_id" },
    );
    if (err) setError(err.message);
    else router.refresh();
    setBusy(false);
  }

  if (!loggedIn) {
    return (
      <button
        type="button"
        onClick={() => router.push("/login")}
        className="rounded-xl bg-neutral-100 px-4 py-2 text-sm font-bold hover:bg-neutral-200"
      >
        {t("loginToReview")}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm">
      <div className="font-bold">{initialRating ? t("editTitle") : t("title")}</div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="text-3xl leading-none"
            aria-label={`${n}`}
          >
            <span className={(hover || rating) >= n ? "text-kernel" : "text-neutral-300"}>★</span>
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder={t("commentPlaceholder")}
        className="resize-none rounded-xl border-2 border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={!rating || busy}
        className="h-11 rounded-xl bg-brand font-extrabold text-white disabled:opacity-50"
      >
        {initialRating ? t("update") : t("send")}
      </button>
    </div>
  );
}
