"use client";

import { useEffect } from "react";
import { isNativeApp } from "@/lib/native-app";

export default function NativeAppEnvironment() {
  useEffect(() => {
    if (isNativeApp(window as Window & Parameters<typeof isNativeApp>[0])) {
      document.documentElement.dataset.nativeApp = "true";
    }
  }, []);
  return null;
}
