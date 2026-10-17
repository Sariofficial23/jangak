// Пять звёзд с точным закрашиванием под средний балл (например, 4.3).
const STAR =
  "M12 .587l3.668 7.431 8.2 1.192-5.934 5.784 1.401 8.168L12 18.896l-7.335 3.866 1.401-8.168L.132 9.21l8.2-1.192z";

export default function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const row = (cls: string) =>
    [0, 1, 2, 3, 4].map((i) => (
      <svg key={i} viewBox="0 0 24 24" className={`shrink-0 fill-current ${cls}`} style={{ width: size, height: size }}>
        <path d={STAR} />
      </svg>
    ));

  return (
    <span className="relative inline-flex align-middle" style={{ width: size * 5, height: size }} aria-hidden="true">
      <span className="flex text-neutral-300">{row("")}</span>
      <span className="absolute inset-0 flex overflow-hidden text-kernel" style={{ width: `${pct}%` }}>
        {row("")}
      </span>
    </span>
  );
}
