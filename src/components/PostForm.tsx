"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { PHOTO_BUCKET } from "@/lib/supabase/config";
import { resizeImage } from "@/lib/resizeImage";

type Option = { id: number; name: string };
type Deal = "sell" | "exchange" | "free";

const MAX_PHOTOS = 8;

export default function PostForm({
  userId,
  categories,
  regions,
  defaultName,
  defaultPhone,
}: {
  userId: string;
  categories: Option[];
  regions: Option[];
  defaultName: string;
  defaultPhone: string;
}) {
  const t = useTranslations("post");
  const tl = useTranslations("listing");
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deal, setDeal] = useState<Deal>("sell");
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const added = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, MAX_PHOTOS - photos.length)
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPhotos([...photos, ...added]);
  }

  function removePhoto(i: number) {
    URL.revokeObjectURL(photos[i].url);
    setPhotos(photos.filter((_, j) => j !== i));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const categoryId = Number(f.get("category"));
    const regionId = Number(f.get("region"));
    const priceRaw = String(f.get("price") ?? "").replace(/\s/g, "");
    const phone = String(f.get("phone")).trim();

    const fail = (msg: string) => {
      setError(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    if (title.trim().length < 16 || title.trim().length > 70) return fail(t("errTitle"));
    if (!categoryId) return fail(t("errCategory"));
    if (description.trim().length < 40) return fail(t("errDescription"));
    if (deal === "sell" && !priceRaw) return fail(t("errPrice"));
    if (!regionId) return fail(t("errRegion"));
    if (!phone) return fail(t("errPhone"));

    setBusy(true);
    setError("");
    const supabase = createClient();
    try {
      const { data: listing, error: insertError } = await supabase
        .from("listings")
        .insert({
          user_id: userId,
          category_id: categoryId,
          region_id: regionId,
          title: title.trim(),
          description: description.trim(),
          deal_type: deal,
          price: deal === "sell" ? Number(priceRaw) : null,
          currency: String(f.get("currency")),
          negotiable: deal === "sell" && f.get("negotiable") === "on",
          condition: (f.get("condition") as string) || null,
          seller_type: String(f.get("seller_type")),
          contact_name: String(f.get("contact_name")).trim(),
          contact_phone: phone,
        })
        .select("id")
        .single();
      if (insertError) throw insertError;

      // Фото: <id пользователя>/<id объявления>/<номер>.jpg
      const rows = [];
      for (const [i, p] of photos.entries()) {
        const path = `${userId}/${listing.id}/${i}-${Date.now()}.jpg`;
        const blob = await resizeImage(p.file);
        const { error: upErr } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(path, blob, { contentType: "image/jpeg" });
        if (upErr) throw upErr;
        rows.push({ listing_id: listing.id, path, sort: i });
      }
      if (rows.length) {
        const { error: photoErr } = await supabase.from("listing_photos").insert(rows);
        if (photoErr) throw photoErr;
      }

      router.push(`/item/${listing.id}`);
      router.refresh();
    } catch (err) {
      fail(t("errSave", { message: err instanceof Error ? err.message : String(err) }));
    } finally {
      setBusy(false);
    }
  }

  const card = "rounded-2xl bg-white p-5 shadow-sm sm:p-6";
  const label = "flex flex-col gap-1 text-sm font-semibold";
  const input = "h-12 w-full rounded-xl border-2 border-neutral-200 bg-white px-4 font-normal outline-none focus:border-brand";
  const hint = "text-xs font-normal text-neutral-500";
  const chip = (active: boolean) =>
    `rounded-xl px-4 py-2 text-sm font-bold transition ${active ? "bg-brand text-white" : "bg-neutral-100 hover:bg-neutral-200"}`;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {error && <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}

      <section className={card}>
        <h2 className="mb-4 text-lg font-extrabold">{t("describe")}</h2>
        <div className="flex flex-col gap-4">
          <label className={label}>
            {t("titleLabel")} *
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={70}
              placeholder={t("titlePlaceholder")}
              className={input}
            />
            <span className={hint}>
              {t("titleHint")} · {title.length}/70
            </span>
          </label>
          <label className={label}>
            {t("category")} *
            <select name="category" defaultValue="" className={input}>
              <option value="" disabled>{t("choose")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-1 text-lg font-extrabold">{t("photos")}</h2>
        <p className={`${hint} mb-4`}>{t("photosHint")}</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((p, i) => (
            <div key={p.url} className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute right-1 top-1 h-7 w-7 rounded-full bg-black/60 text-white"
                aria-label="✕"
              >
                ✕
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-brand/40 bg-cream text-center text-sm font-bold text-brand hover:bg-brand/5">
              <span className="text-2xl">📷</span>
              {t("addPhoto")}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  addPhotos(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>
      </section>

      <section className={card}>
        <label className={label}>
          {t("descriptionLabel")} *
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={9000}
            rows={7}
            placeholder={t("descriptionPlaceholder")}
            className="w-full rounded-xl border-2 border-neutral-200 p-4 font-normal outline-none focus:border-brand"
          />
          <span className={hint}>
            {t("descriptionHint")} · {description.length}/9000
          </span>
        </label>
      </section>

      <section className={card}>
        <h2 className="mb-4 text-lg font-extrabold">{t("deal")}</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {(["sell", "exchange", "free"] as const).map((d) => (
            <button key={d} type="button" onClick={() => setDeal(d)} className={chip(deal === d)}>
              {d === "sell" ? t("sell") : tl(d)}
            </button>
          ))}
        </div>
        {deal === "sell" && (
          <div className="flex flex-wrap items-end gap-3">
            <label className={`${label} flex-1`}>
              {t("price")} *
              <input name="price" inputMode="numeric" pattern="[0-9 ]*" className={input} />
            </label>
            <label className={label}>
              {t("currency")}
              <select name="currency" defaultValue="KGS" className={input}>
                <option value="KGS">сом</option>
                <option value="USD">$</option>
              </select>
            </label>
            <label className="flex h-12 items-center gap-2 text-sm font-semibold">
              <input name="negotiable" type="checkbox" className="h-5 w-5 accent-brand" />
              {t("negotiable")}
            </label>
          </div>
        )}
        {deal !== "sell" && <input type="hidden" name="currency" value="KGS" />}
      </section>

      <section className={card}>
        <h2 className="mb-4 text-lg font-extrabold">{t("extra")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>
            {t("condition")}
            <select name="condition" defaultValue="" className={input}>
              <option value="">—</option>
              <option value="new">{tl("new")}</option>
              <option value="used">{tl("used")}</option>
            </select>
          </label>
          <label className={label}>
            {t("sellerType")}
            <select name="seller_type" defaultValue="private" className={input}>
              <option value="private">{tl("private")}</option>
              <option value="business">{tl("business")}</option>
            </select>
          </label>
          <label className={`${label} sm:col-span-2`}>
            {t("region")} *
            <select name="region" defaultValue="" className={input}>
              <option value="" disabled>{t("choose")}</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-4 text-lg font-extrabold">{t("contacts")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>
            {t("contactName")}
            <input name="contact_name" defaultValue={defaultName} className={input} />
          </label>
          <label className={label}>
            {t("phone")} *
            <input
              name="phone"
              type="tel"
              defaultValue={defaultPhone}
              placeholder={t("phonePlaceholder")}
              className={input}
            />
          </label>
        </div>
      </section>

      <button
        disabled={busy}
        className="h-14 rounded-xl bg-brand text-lg font-extrabold text-white transition hover:bg-brand-dark disabled:opacity-60 sm:self-end sm:px-12"
      >
        {busy ? t("publishing") : t("publish")}
      </button>
    </form>
  );
}
