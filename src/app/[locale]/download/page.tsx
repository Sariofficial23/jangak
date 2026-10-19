import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ShareAppButton from "@/components/ShareAppButton";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "appDownload" });
  return { title: `${t("title")} — Jangak`, description: t("subtitle") };
}

export default async function DownloadPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("appDownload");
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <section className="rounded-3xl border border-brand/10 bg-white p-6 shadow-sm sm:p-10">
        <Image src="/brand/jangak-app-icon-192.png" alt="Jangak" width={88} height={88} className="mb-6 rounded-3xl" priority />
        <p className="mb-3 text-sm font-semibold text-brand">{t("badge")}</p>
        <h1 className="text-3xl font-extrabold text-walnut">{t("title")}</h1>
        <p className="mt-3 leading-relaxed text-neutral-600">{t("description")}</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <a href="/downloads/jangak-android.apk" download="jangak-android.apk" className="rounded-2xl bg-brand px-6 py-3 text-center font-bold text-white transition hover:bg-brand/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">{t("android")}</a>
          <ShareAppButton />
        </div>
        <p className="mt-2 text-sm text-neutral-500">{t("fileInfo")}</p>
        <h2 className="mt-8 text-xl font-bold text-walnut">{t("installTitle")}</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-neutral-700">
          <li>{t("step1")}</li><li>{t("step2")}</li><li>{t("step3")}</li>
        </ol>
        <div className="mt-7 rounded-2xl bg-cream p-4 text-sm leading-relaxed text-walnut">{t("internet")}</div>
        <h2 className="mt-8 text-xl font-bold text-walnut">{t("iphoneTitle")}</h2>
        <p className="mt-3 leading-relaxed text-neutral-600">{t("iphone")}</p>
        <Link href="/" className="mt-6 inline-block font-semibold text-brand underline underline-offset-4">{t("website")}</Link>
      </section>
    </div>
  );
}
