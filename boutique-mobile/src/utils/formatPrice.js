export const formatPrice = (amount, locale = 'ar') => {
  const num = parseFloat(amount);
  if (isNaN(num)) return locale === 'ar' ? '0.00 د.أ' : 'JOD 0.00';
  return locale === 'ar' ? `${num.toFixed(2)} د.أ` : `JOD ${num.toFixed(2)}`;
};
