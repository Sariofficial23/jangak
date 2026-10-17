// Разделы главной страницы (плитки в стиле «витрина с фото»). Названия — в
// src/messages/*.json → categories.<key>, фото — в public/categories/<key>.jpg,
// иконки (если фото ещё нет) — в components/CategoryIcon.tsx.
// photo — есть ли фото; wide — плитка на две колонки на телефоне. Порядок
// подобран так, чтобы 3-колоночная сетка на телефоне заполнялась без дыр.
export const categories = [
  { key: "transport", bg: "#E3F1E8", photo: true, wide: true },
  { key: "realty", bg: "#FFF1D6", photo: true, wide: false },
  { key: "electronics", bg: "#FFF1D6", photo: true, wide: false },
  { key: "jobs", bg: "#E3F1E8", photo: true, wide: false },
  { key: "home", bg: "#FFF1D6", photo: true, wide: false },
  { key: "kids", bg: "#E3F1E8", photo: true, wide: false },
  { key: "services", bg: "#FFF1D6", photo: true, wide: true },
  { key: "animals", bg: "#E3F1E8", photo: true, wide: false },
  { key: "fashion", bg: "#FFF1D6", photo: true, wide: false },
  { key: "hobby", bg: "#E3F1E8", photo: false, wide: false },
  { key: "free", bg: "#FFF1D6", photo: false, wide: false },
  { key: "exchange", bg: "#E3F1E8", photo: false, wide: true },
] as const;

export type CategoryKey = (typeof categories)[number]["key"];
