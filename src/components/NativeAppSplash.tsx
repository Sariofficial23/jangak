"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { isNativeApp, nativeSplashStorageKey } from "@/lib/native-app";

export default function NativeAppSplash() {
  const t = useTranslations("splash");
  const videoRef = useRef<HTMLVideoElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const dismissRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const win = window as Window & Parameters<typeof isNativeApp>[0] & { __jangakSplashShown?: boolean };
    if (!isNativeApp(win)) return;
    const root = document.documentElement;
    let shown = !!win.__jangakSplashShown;
    try { shown = shown || sessionStorage.getItem(nativeSplashStorageKey) === "1"; } catch { /* Storage can be disabled in a WebView. */ }
    if (shown || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      delete root.dataset.nativeSplash;
      return;
    }
    const video = videoRef.current;
    if (!video) { delete root.dataset.nativeSplash; return; }
    win.__jangakSplashShown = true;
    try { sessionStorage.setItem(nativeSplashStorageKey, "1"); } catch { /* The in-memory guard still prevents repetition. */ }
    root.dataset.nativeSplash = "playing";
    video.dataset.splashOutcome = "playing";
    const previousFocus = document.activeElement;
    skipRef.current?.focus({ preventScroll: true });
    let finished = false;
    let removeTimer: ReturnType<typeof setTimeout> | undefined;
    const release = () => {
      delete root.dataset.nativeSplash;
      video.pause();
      video.removeAttribute("src");
      video.load();
      if (document.activeElement === skipRef.current && previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
    };
    const finish = (outcome: string) => {
      if (finished) return;
      finished = true;
      video.dataset.splashOutcome = outcome;
      root.dataset.nativeSplash = "closing";
      removeTimer = setTimeout(release, 220);
    };
    dismissRef.current = () => finish("skipped");
    // Never trap the user behind a stalled download or blocked autoplay.
    const safetyTimer = setTimeout(() => finish("timeout"), 6500);
    const onEnded = () => finish("completed");
    const onError = () => finish("error");
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onError);
    video.muted = true;
    video.src = "/splash/jangak-launch-v1.mp4";
    void video.play().catch(() => finish("blocked"));
    return () => {
      clearTimeout(safetyTimer);
      clearTimeout(removeTimer);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
      dismissRef.current = null;
      release();
    };
  }, []);

  return (
    <div role="dialog" aria-modal="true" aria-label={t("label")} className="native-splash-shell" onKeyDown={(event) => {
      if (event.key === "Escape") dismissRef.current?.();
      if (event.key === "Tab") { event.preventDefault(); skipRef.current?.focus(); }
    }}>
      <video ref={videoRef} muted playsInline preload="none" poster="/splash/jangak-launch-poster.jpg" className="h-full w-full object-contain" aria-hidden="true" />
      <button ref={skipRef} type="button" onClick={() => dismissRef.current?.()} className="absolute right-4 rounded-full bg-black/15 px-4 py-2 text-xs font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}>{t("skip")}</button>
    </div>
  );
}
