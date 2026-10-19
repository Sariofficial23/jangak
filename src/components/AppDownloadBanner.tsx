import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function AppDownloadBanner() {
  const t = useTranslations("appDownload");
  return (
    <aside className="browser-install-only mx-auto max-w-6xl px-4 pt-6">
      <div className="flex flex-wrap items-center gap-4 rounded-3xl bg-brand p-5 text-white sm:p-6">
        <Image src="/brand/jangak-app-icon-192.png" alt="" width={64} height={64} className="rounded-2xl" />
        <div className="min-w-0 flex-1 basis-48">
          <h2 className="text-xl font-extrabold">{t("title")}</h2>
          <p className="mt-1 text-sm text-white/90">{t("subtitle")}</p>
        </div>
        <Link href="/download" className="rounded-2xl bg-white px-5 py-3 text-center font-bold text-brand transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          {t("cta")}
        </Link>
      </div>
    </aside>
  );
}
