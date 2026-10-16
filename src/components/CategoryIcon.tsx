import type { CategoryKey } from "@/lib/categories";

// Фирменные иконки разделов: ореховый контур + золотые и зелёные акценты
const K = "#F2A33A"; // kernel
const G = "#1E7A4C"; // brand
const W = "#4A2E1B"; // walnut

const icons: Record<CategoryKey, React.ReactNode> = {
  kids: (
    <>
      <circle cx="14" cy="14" r="6" fill={K} />
      <circle cx="34" cy="14" r="6" fill={K} />
      <circle cx="24" cy="26" r="14" fill={K} />
      <ellipse cx="24" cy="31" rx="6.5" ry="5" fill="#fff" />
      <circle cx="19" cy="23" r="1.8" fill={W} stroke="none" />
      <circle cx="29" cy="23" r="1.8" fill={W} stroke="none" />
      <path d="M22 29.5h4l-2 2.2z" fill={W} />
      <path d="M24 31.7v2" />
    </>
  ),
  realty: (
    <>
      <path d="M8 23 24 9l16 14" fill="none" />
      <path d="M12 20v19h24V20" fill={K} />
      <rect x="20" y="27" width="8" height="12" rx="1.5" fill={G} />
      <rect x="29.5" y="23.5" width="4.5" height="4.5" rx="1" fill="#fff" />
    </>
  ),
  transport: (
    <>
      <path d="M7 31v-5l4-8a4 4 0 0 1 3.6-2.2h18.8A4 4 0 0 1 37 18l4 8v5a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z" fill={K} />
      <path d="M13 25l2.6-5.2h16.8L35 25z" fill="#fff" />
      <circle cx="15" cy="33" r="4.5" fill={G} />
      <circle cx="33" cy="33" r="4.5" fill={G} />
    </>
  ),
  jobs: (
    <>
      <path d="M18 15v-3a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" fill="none" />
      <rect x="7" y="15" width="34" height="23" rx="4" fill={K} />
      <path d="M7 25h34" />
      <rect x="20.5" y="22" width="7" height="6" rx="1.5" fill={G} />
    </>
  ),
  animals: (
    <>
      <path d="M24 25c-6 0-11 6-11 10.5 0 3 2.4 4.5 5 4.5 2.4 0 3.6-1.4 6-1.4s3.6 1.4 6 1.4c2.6 0 5-1.5 5-4.5C35 31 30 25 24 25z" fill={K} />
      <ellipse cx="15" cy="18" rx="3.6" ry="4.6" fill={G} />
      <ellipse cx="33" cy="18" rx="3.6" ry="4.6" fill={G} />
      <ellipse cx="20.5" cy="11.5" rx="3.6" ry="4.6" fill={G} />
      <ellipse cx="27.5" cy="11.5" rx="3.6" ry="4.6" fill={G} />
    </>
  ),
  home: (
    <>
      <path d="M24 26c0-7 4-12 11-13-.5 7-4.5 11-11 13z" fill={G} />
      <path d="M24 26c0-6-3.5-10.5-10-11.5.5 6.5 4 10.5 10 11.5z" fill={G} />
      <path d="M24 26v4" />
      <path d="M14 30h20l-2.5 10h-15z" fill={K} />
    </>
  ),
  electronics: (
    <>
      <rect x="14" y="6" width="20" height="36" rx="4.5" fill={K} />
      <rect x="17.5" y="11" width="13" height="22" rx="1.5" fill="#fff" />
      <path d="M21 37.5h6" />
      <path d="M20 20l3 3 5-6" stroke={G} fill="none" />
    </>
  ),
  services: (
    <>
      <path d="M31 8a8 8 0 0 0-7.6 10.4L9.6 32.2a3.4 3.4 0 0 0 4.8 4.8l13.8-13.8A8 8 0 0 0 39 15.5l-5 1.5-2.5-2.5L33 9.5A8 8 0 0 0 31 8z" fill={K} />
      <circle cx="12" cy="34.6" r="1.6" fill={W} stroke="none" />
      <path d="M30 31l7 7" stroke={G} strokeWidth="5" />
    </>
  ),
  fashion: (
    <>
      <path d="M18 8l-11 6 4 8 4-2v20h18V20l4 2 4-8-11-6c-.5 3-3.2 5-6 5s-5.5-2-6-5z" fill={K} />
      <path d="M21 26h6" stroke={G} />
    </>
  ),
  hobby: (
    <>
      <circle cx="24" cy="24" r="16" fill="#fff" />
      <path d="M24 17l6.6 4.8-2.5 7.8h-8.2l-2.5-7.8z" fill={W} />
      <path d="M24 17V8.5M30.6 21.8l8-2.6M28.1 29.6l5 6.8M19.9 29.6l-5 6.8M17.4 21.8l-8-2.6" />
      <circle cx="24" cy="24" r="16" fill="none" stroke={G} />
    </>
  ),
  free: (
    <>
      <rect x="8" y="19" width="32" height="8" rx="2" fill={K} />
      <path d="M11 27v12a2 2 0 0 0 2 2h22a2 2 0 0 0 2-2V27" fill={K} />
      <path d="M24 19v22" stroke={G} strokeWidth="4.5" />
      <path d="M24 19c-2-6-10-8-10-3 0 3 6 3 10 3zM24 19c2-6 10-8 10-3 0 3-6 3-10 3z" fill={G} />
    </>
  ),
  exchange: (
    <>
      <path d="M10 20a14 14 0 0 1 25-6" fill="none" stroke={K} strokeWidth="4" />
      <path d="M37 7.5v8h-8" fill="none" stroke={K} strokeWidth="4" />
      <path d="M38 28a14 14 0 0 1-25 6" fill="none" stroke={G} strokeWidth="4" />
      <path d="M11 40.5v-8h8" fill="none" stroke={G} strokeWidth="4" />
    </>
  ),
};

export default function CategoryIcon({ name, className }: { name: CategoryKey; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke={W}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {icons[name]}
    </svg>
  );
}
