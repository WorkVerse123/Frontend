export function formatPrice(value, currency = 'VND') {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);

  // normalize currency input: accept symbol or code
  let code = String(currency || 'VND');
  if (code === '$') code = 'USD';
  if (code === 'đ' || code.toUpperCase() === 'VND' || code === 'VNĐ' || code === 'D') code = 'VND';

  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(num);
  } catch (e) {
    // fallback: thousands separator + currency text
    try {
      return new Intl.NumberFormat('vi-VN').format(num) + ' ' + String(currency || 'VND');
    } catch (ee) {
      return String(value) + ' ' + String(currency || 'VND');
    }
  }
}

export default formatPrice;
