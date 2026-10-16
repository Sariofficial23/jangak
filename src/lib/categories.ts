// Разделы главной страницы. Названия — в src/messages/*.json → categories.<key>
export const categories = [
  { key: "kids", icon: "🧸", color: "#FDE68A" },
  { key: "realty", icon: "🏠", color: "#BFDBFE" },
  { key: "transport", icon: "🚗", color: "#A7F3D0" },
  { key: "jobs", icon: "💼", color: "#FECACA" },
  { key: "animals", icon: "🐾", color: "#FED7AA" },
  { key: "home", icon: "🪴", color: "#C7D2FE" },
  { key: "electronics", icon: "📱", color: "#BAE6FD" },
  { key: "services", icon: "🛠️", color: "#DDD6FE" },
  { key: "fashion", icon: "👗", color: "#FBCFE8" },
  { key: "hobby", icon: "⚽", color: "#D9F99D" },
  { key: "free", icon: "🎁", color: "#FEF3C7" },
  { key: "exchange", icon: "🔄", color: "#E5E7EB" },
] as const;

export type CategoryKey = (typeof categories)[number]["key"];
