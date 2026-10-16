"use client";

import { useState } from "react";

// Телефон скрыт, пока не нажмут кнопку (защита от сборщиков номеров)
export default function ShowPhone({ phone, label }: { phone: string; label: string }) {
  const [shown, setShown] = useState(false);

  if (shown) {
    return (
      <a
        href={`tel:${phone.replace(/[^\d+]/g, "")}`}
        className="flex h-12 items-center justify-center rounded-xl border-2 border-brand font-extrabold text-brand"
      >
        📞 {phone}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setShown(true)}
      className="h-12 rounded-xl border-2 border-brand font-extrabold text-brand transition hover:bg-brand/5"
    >
      📞 {label}
    </button>
  );
}
