// Разделы главной страницы. Названия — в src/messages/*.json → categories.<key>,
// иконки — в components/CategoryIcon.tsx
export const categories = [
  { key: "kids", bg: "#FFF1D6" },
  { key: "realty", bg: "#E3F1E8" },
  { key: "transport", bg: "#FFF1D6" },
  { key: "jobs", bg: "#E3F1E8" },
  { key: "animals", bg: "#FFF1D6" },
  { key: "home", bg: "#E3F1E8" },
  { key: "electronics", bg: "#FFF1D6" },
  { key: "services", bg: "#E3F1E8" },
  { key: "fashion", bg: "#FFF1D6" },
  { key: "hobby", bg: "#E3F1E8" },
  { key: "free", bg: "#FFF1D6" },
  { key: "exchange", bg: "#E3F1E8" },
] as const;

export type CategoryKey = (typeof categories)[number]["key"];
