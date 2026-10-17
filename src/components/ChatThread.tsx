"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { CHAT_BUCKET, chatPhotoUrl } from "@/lib/supabase/config";
import { resizeImage } from "@/lib/resizeImage";
import { formatChatTime } from "@/lib/format";

export type ChatMessage = {
  id: number;
  sender_id: string;
  body: string | null;
  image_path: string | null;
  created_at: string;
};

export default function ChatThread({
  conversationId,
  meId,
  initial,
}: {
  conversationId: number;
  meId: string;
  initial: ChatMessage[];
}) {
  const t = useTranslations("chat");
  const locale = useLocale();
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Добавить сообщение без дублей (своё приходит и из ответа insert, и из realtime)
  function add(m: ChatMessage) {
    setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
  }

  // Автопрокрутка вниз при новых сообщениях
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime-подписка на новые сообщения этой переписки + отметка «прочитано»
  useEffect(() => {
    supabase.rpc("mark_conversation_read", { p_conversation_id: conversationId });
    const channel = supabase
      .channel(`conv-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const m = payload.new as ChatMessage;
          add(m);
          if (m.sender_id !== meId) {
            supabase.rpc("mark_conversation_read", { p_conversation_id: conversationId });
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, conversationId, meId]);

  async function sendText() {
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    setError("");
    const { data, error: err } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: meId, body })
      .select("id, sender_id, body, image_path, created_at")
      .single();
    if (err) setError(err.message);
    else {
      setText("");
      if (data) add(data as ChatMessage);
    }
    setBusy(false);
  }

  async function sendPhoto(file: File) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const path = `${meId}/${conversationId}/${Date.now()}.jpg`;
      const blob = await resizeImage(file);
      const { error: upErr } = await supabase.storage
        .from(CHAT_BUCKET)
        .upload(path, blob, { contentType: "image/jpeg" });
      if (upErr) throw upErr;
      const { data, error: err } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, sender_id: meId, image_path: path })
        .select("id, sender_id, body, image_path, created_at")
        .single();
      if (err) throw err;
      if (data) add(data as ChatMessage);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendText();
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          {messages.length === 0 && (
            <p className="py-10 text-center text-sm text-neutral-500">{t("empty")}</p>
          )}
          {messages.map((m) => {
            const mine = m.sender_id === meId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    mine ? "bg-brand text-white" : "bg-white"
                  }`}
                >
                  {m.image_path && (
                    <a
                      href={chatPhotoUrl(m.image_path)}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                    >
                      <Image
                        src={chatPhotoUrl(m.image_path)}
                        alt=""
                        width={240}
                        height={240}
                        unoptimized
                        className="mb-1 h-auto w-48 rounded-lg object-cover"
                      />
                    </a>
                  )}
                  {m.body && <p className="whitespace-pre-line break-words">{m.body}</p>}
                  <div
                    className={`mt-0.5 text-right text-[10px] ${
                      mine ? "text-white/70" : "text-neutral-400"
                    }`}
                  >
                    {formatChatTime(m.created_at, locale)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </div>

      {error && <p className="px-4 pb-1 text-center text-xs text-red-600">{error}</p>}

      <div className="border-t border-neutral-200 bg-white px-3 py-2">
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) sendPhoto(f);
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-lg hover:bg-neutral-200 disabled:opacity-50"
            aria-label={t("attach")}
          >
            📎
          </button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder={t("placeholder")}
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border-2 border-neutral-200 px-3 py-2 outline-none focus:border-brand"
          />
          <button
            type="button"
            onClick={sendText}
            disabled={busy || !text.trim()}
            className="h-11 shrink-0 rounded-xl bg-brand px-4 font-extrabold text-white disabled:opacity-50"
          >
            {t("send")}
          </button>
        </div>
      </div>
    </div>
  );
}
