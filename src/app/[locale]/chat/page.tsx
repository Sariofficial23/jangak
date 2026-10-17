import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { photoUrl } from "@/lib/supabase/config";
import { formatChatTime } from "@/lib/format";

type InboxRow = {
  id: number;
  listing_id: number;
  listing_title: string;
  cover_path: string | null;
  other_id: string;
  other_name: string | null;
  last_body: string | null;
  last_image: string | null;
  last_at: string | null;
  last_sender: string | null;
  unread: number;
};

export default async function ChatInboxPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("chat");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect({ href: "/login", locale });

  const { data } = await supabase.rpc("my_conversations");
  const items = (data ?? []) as InboxRow[];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-5 text-2xl font-extrabold text-walnut">{t("title")}</h1>

      {items.length ? (
        <ul className="flex flex-col gap-2">
          {items.map((c) => {
            const preview = c.last_image ? `📷 ${t("photo")}` : c.last_body ?? "";
            return (
              <li key={c.id}>
                <Link
                  href={`/chat/${c.id}`}
                  className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm transition hover:shadow-md"
                >
                  {c.cover_path ? (
                    <Image
                      src={photoUrl(c.cover_path)}
                      alt=""
                      width={56}
                      height={56}
                      unoptimized
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 shrink-0 rounded-xl bg-neutral-100" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-bold">{c.other_name || t("user")}</span>
                      {c.last_at && (
                        <span className="ml-auto shrink-0 text-xs text-neutral-400">
                          {formatChatTime(c.last_at, locale)}
                        </span>
                      )}
                    </div>
                    <div className="truncate text-xs text-neutral-500">{c.listing_title}</div>
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm text-neutral-600">{preview}</span>
                      {c.unread > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-bold text-white">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-2xl bg-white p-10 text-center text-neutral-500">{t("emptyInbox")}</div>
      )}
    </div>
  );
}
