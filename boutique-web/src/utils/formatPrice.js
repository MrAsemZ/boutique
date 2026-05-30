export function formatPrice(amount, locale = 'ar') {
  const num = parseFloat(amount).toFixed(2);
  return locale === 'ar' ? `${num} د.أ` : `JOD ${num}`;
}
