export const formatSalary = (min, max, currency, time) => {
    if (!min && !max) return 'Thỏa thuận';
    const nf = new Intl.NumberFormat('vi-VN');
    const minStr = min ? nf.format(min) : '';
    const maxStr = max ? nf.format(max) : '';
    const range = min && max ? `${minStr} - ${maxStr}` : (minStr || maxStr);
    const suffix = time === 'hours' ? '/giờ' : time ? `/${time}` : '';
    return `${range} ${currency || 'VND'}${suffix}`.trim();
  };