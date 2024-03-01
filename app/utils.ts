export function formatNumber(num: number, fixed: number) {
  return num.toFixed(fixed).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
