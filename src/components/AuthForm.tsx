"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register";

export default function AuthForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));
    const name = String(form.get("name") ?? "").trim();
    const supabase = createClient();

    setBusy(true);
    setError("");
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message === "Invalid login credentials" ? t("wrongCredentials") : t("error", { message: error.message }));
          return;
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${window.location.origin}/${locale}`,
          },
        });
        if (error) {
          setError(t("error", { message: error.message }));
          return;
        }
        // Если в Supabase включено подтверждение почты — сессии ещё нет
        if (!data.session) {
          setSentTo(email);
          return;
        }
      }
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (sentTo) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mb-3 text-4xl">📩</div>
        <p>{t("checkEmail", { email: sentTo })}</p>
      </div>
    );
  }

  const input =
    "h-12 w-full rounded-xl border-2 border-neutral-200 px-4 outline-none focus:border-brand";

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
      <h1 className="mb-6 text-2xl font-extrabold text-walnut">
        {mode === "login" ? t("loginTitle") : t("registerTitle")}
      </h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {mode === "register" && (
          <label className="flex flex-col gap-1 text-sm font-semibold">
            {t("name")}
            <input name="name" required autoComplete="name" className={input} />
          </label>
        )}
        <label className="flex flex-col gap-1 text-sm font-semibold">
          {t("email")}
          <input name="email" type="email" required autoComplete="email" className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          {t("password")}
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className={input}
          />
          {mode === "register" && (
            <span className="font-normal text-neutral-500">{t("passwordHint")}</span>
          )}
        </label>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button
          disabled={busy}
          className="h-12 rounded-xl bg-brand font-extrabold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {mode === "login" ? t("login") : t("register")}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-neutral-600">
        {mode === "login" ? t("noAccount") : t("haveAccount")}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          className="font-bold text-brand hover:underline"
        >
          {mode === "login" ? t("register") : t("login")}
        </button>
      </p>
    </div>
  );
}
