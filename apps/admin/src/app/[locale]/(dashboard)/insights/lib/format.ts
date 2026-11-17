export const formatNumber = (value: number | null | undefined, digits = 1): string =>
  value === null || value === undefined
    ? '—'
    : value.toLocaleString(undefined, { maximumFractionDigits: digits });

export const formatPercent = (value: number | null | undefined, digits = 1): string =>
  value === null || value === undefined ? '—' : `${formatNumber(value, digits)}%`;

/** Formats a duration in seconds as [-]m:ss. */
export const formatDuration = (seconds: number | null | undefined): string => {
  if (seconds === null || seconds === undefined) return '—';
  const sign = seconds < 0 ? '-' : '';
  const total = Math.round(Math.abs(seconds));
  const minutes = Math.floor(total / 60);
  return `${sign}${minutes}:${String(total % 60).padStart(2, '0')}`;
};

export const round = (value: number | null | undefined, digits = 2): number | null =>
  value === null || value === undefined ? null : Number(value.toFixed(digits));
