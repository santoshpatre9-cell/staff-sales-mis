export function todayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function formatDisplayDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Week-to-date start date (Monday of the week)
 */
export function getWtdStartDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  d.setDate(d.getDate() - distanceToMonday);
  return d.toISOString().split('T')[0];
}

/**
 * Month-to-date start date (1st of current month)
 */
export function getMtdStartDate(dateStr: string): string {
  const [year, month] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, 1);
  return d.toISOString().split('T')[0];
}

/**
 * Indian Financial Year: April 1 to March 31.
 * E.g., 7 Nov 2026 -> 1 Apr 2026
 * E.g., 15 Feb 2027 -> 1 Apr 2026
 */
export function getYtdStartDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const m = d.getMonth(); // 0-indexed: 0=Jan, 2=Mar, 3=Apr
  const y = d.getFullYear();

  const fyStartYear = m >= 3 ? y : y - 1;
  const fyDate = new Date(fyStartYear, 3, 1);
  return fyDate.toISOString().split('T')[0];
}

export function getFinancialYearLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const m = d.getMonth();
  const y = d.getFullYear();
  const startYear = m >= 3 ? y : y - 1;
  const endYearShort = String((startYear + 1) % 100).padStart(2, '0');
  return `FY ${startYear}-${endYearShort}`;
}

export function getYesterdayDate(dateStr: string): string {
  return addDays(dateStr, -1);
}

export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
