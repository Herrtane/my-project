export function formatPrice(value: number): string {
  if (value === 0) return "무료";
  return `₩${value.toLocaleString("ko-KR")}`;
}
