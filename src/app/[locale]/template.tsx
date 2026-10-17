// Оборачивает каждую страницу — при переходе заново монтируется, поэтому
// анимация появления (.page-in) проигрывается на каждом переходе.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
