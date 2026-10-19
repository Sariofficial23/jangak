import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { photoUrl } from "@/lib/supabase/config";
import ChatThread, { type ChatMessage } from "@/components/ChatThread";

type Conversation = {
  id: number;
  listing_id: number;
  seller_id: string;
  buyer_id: string;
  listing: { title: string; photos: { path: string; sort: number }[] } | null;
};

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("chat");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect({ href: "/login", locale });

  if (!/^\d+$/.test(id)) return <NotFound label={t("notFound")} back={t("back")} />;

  const { data: convData } = await supabase
    .from("conversations")
    .select("id, listing_id, seller_id, buyer_id, listing:listings(title, photos:listing_photos(path, sort))")
    .eq("id", Number(id))
    .maybeSingle();
  const conv = convData as unknown as Conversation | null;
  if (!conv) return <NotFound label={t("notFound")} back={t("back")} />;

  const otherId = conv.seller_id === user.id ? conv.buyer_id : conv.seller_id;
  const { data: other } = await supabase.from("profiles").select("name").eq("id", otherId).maybeSingle();

  const { data: msgs } = await supabase
    .from("messages")
    .select("id, sender_id, body, image_path, created_at")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: true });

  const cover = conv.listing?.photos?.slice().sort((a, b) => a.sort - b.sort)[0]?.path ?? null;

  return (
    <div className="flex h-[calc(100dvh-4rem-var(--mobile-nav-height))] flex-col">
      <div className="flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-2">
        <Link href="/chat" className="shrink-0 text-xl text-neutral-500 hover:text-brand" aria-label={t("back")}>
          ←
        </Link>
        <Link href={`/item/${conv.listing_id}`} className="flex min-w-0 items-center gap-3 hover:opacity-90">
          {cover ? (
            <Image
              src={photoUrl(cover)}
              alt=""
              width={40}
              height={40}
              unoptimized
              className="h-10 w-10 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-lg bg-neutral-100" />
          )}
          <div className="min-w-0">
            <div className="truncate font-bold leading-tight">{other?.name ?? t("user")}</div>
            <div className="truncate text-xs text-neutral-500">{conv.listing?.title}</div>
          </div>
        </Link>
      </div>
      <ChatThread conversationId={conv.id} meId={user.id} initial={(msgs ?? []) as ChatMessage[]} />
    </div>
  );
}

function NotFound({ label, back }: { label: string; back: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="mb-6 text-lg">{label}</p>
      <Link href="/chat" className="font-bold text-brand hover:underline">
        ← {back}
      </Link>
    </div>
  );
}
