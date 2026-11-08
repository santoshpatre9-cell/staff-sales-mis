import type { MisMetric, PerformanceSummary, SalesEntry, StaffPerformance, StorePerformance } from '../types.ts';
import { getMtdStartDate, getWtdStartDate, getYtdStartDate } from './dateUtils.ts';

export function formatRupees(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatPercent(percent: number): string {
  return `${percent.toFixed(1)}%`;
}

export function calculateAchievementPercent(sales: number, target: number): number {
  if (target <= 0) {
    return sales > 0 ? 100.0 : 0.0;
  }
  if (sales <= 0) return 0.0;
  const pct = (sales / target) * 100.0;
  return isNaN(pct) || !isFinite(pct) ? 0.0 : pct;
}

export function createMetric(target: number, sales: number, bills: number, quantity: number): MisMetric {
  const achievementPercent = calculateAchievementPercent(sales, target);
  const shortfall = Math.max(0, target - sales);
  const excess = Math.max(0, sales - target);
  const averageBillValue = bills > 0 ? sales / bills : 0;
  const unitsPerTransaction = bills > 0 ? quantity / bills : 0;

  return {
    target,
    sales,
    bills,
    quantity,
    achievementPercent,
    shortfall,
    excess,
    averageBillValue,
    unitsPerTransaction
  };
}

export function calculateSummary(entries: SalesEntry[], selectedDate: string): PerformanceSummary {
  const wtdStart = getWtdStartDate(selectedDate);
  const mtdStart = getMtdStartDate(selectedDate);
  const ytdStart = getYtdStartDate(selectedDate);

  let dTarget = 0, dSales = 0, dBills = 0, dQty = 0;
  let wTarget = 0, wSales = 0, wBills = 0, wQty = 0;
  let mTarget = 0, mSales = 0, mBills = 0, mQty = 0;
  let yTarget = 0, ySales = 0, yBills = 0, yQty = 0;
  let count = 0;

  for (const entry of entries) {
    if (entry.date > selectedDate) continue;
    count++;

    // Daily
    if (entry.date === selectedDate) {
      dTarget += entry.daily_target;
      dSales += entry.daily_sales;
      dBills += entry.bills;
      dQty += entry.quantity;
    }

    // WTD
    if (entry.date >= wtdStart) {
      wTarget += entry.daily_target;
      wSales += entry.daily_sales;
      wBills += entry.bills;
      wQty += entry.quantity;
    }

    // MTD
    if (entry.date >= mtdStart) {
      mTarget += entry.daily_target;
      mSales += entry.daily_sales;
      mBills += entry.bills;
      mQty += entry.quantity;
    }

    // YTD
    if (entry.date >= ytdStart) {
      yTarget += entry.daily_target;
      ySales += entry.daily_sales;
      yBills += entry.bills;
      yQty += entry.quantity;
    }
  }

  return {
    daily: createMetric(dTarget, dSales, dBills, dQty),
    wtd: createMetric(wTarget, wSales, wBills, wQty),
    mtd: createMetric(mTarget, mSales, mBills, mQty),
    ytd: createMetric(yTarget, ySales, yBills, yQty),
    entryCount: count
  };
}

export function calculateStaffPerformance(
  entries: SalesEntry[],
  selectedDate: string,
  sortBy: string = 'DAILY'
): StaffPerformance[] {
  const wtdStart = getWtdStartDate(selectedDate);
  const mtdStart = getMtdStartDate(selectedDate);
  const ytdStart = getYtdStartDate(selectedDate);

  const groups = new Map<string, SalesEntry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.staff_id) || [];
    list.push(entry);
    groups.set(entry.staff_id, list);
  }

  const result: StaffPerformance[] = [];

  for (const [staffId, staffEntries] of groups.entries()) {
    const staffName = staffEntries[0]?.staff_name || staffId;
    const storeName = staffEntries[0]?.store_name || '';

    let dTarget = 0, dSales = 0, dBills = 0, dQty = 0;
    let wTarget = 0, wSales = 0, wBills = 0, wQty = 0;
    let mTarget = 0, mSales = 0, mBills = 0, mQty = 0;
    let yTarget = 0, ySales = 0, yBills = 0, yQty = 0;

    for (const e of staffEntries) {
      if (e.date > selectedDate) continue;

      if (e.date === selectedDate) {
        dTarget += e.daily_target;
        dSales += e.daily_sales;
        dBills += e.bills;
        dQty += e.quantity;
      }
      if (e.date >= wtdStart) {
        wTarget += e.daily_target;
        wSales += e.daily_sales;
        wBills += e.bills;
        wQty += e.quantity;
      }
      if (e.date >= mtdStart) {
        mTarget += e.daily_target;
        mSales += e.daily_sales;
        mBills += e.bills;
        mQty += e.quantity;
      }
      if (e.date >= ytdStart) {
        yTarget += e.daily_target;
        ySales += e.daily_sales;
        yBills += e.bills;
        yQty += e.quantity;
      }
    }

    result.push({
      staffId,
      staffName,
      storeName,
      daily: createMetric(dTarget, dSales, dBills, dQty),
      wtd: createMetric(wTarget, wSales, wBills, wQty),
      mtd: createMetric(mTarget, mSales, mBills, mQty),
      ytd: createMetric(yTarget, ySales, yBills, yQty),
      rank: 0
    });
  }

  // Sort
  result.sort((a, b) => {
    switch (sortBy) {
      case 'WTD': return b.wtd.sales - a.wtd.sales;
      case 'MTD': return b.mtd.sales - a.mtd.sales;
      case 'YTD': return b.ytd.sales - a.ytd.sales;
      case 'ACHIEVEMENT': return b.daily.achievementPercent - a.daily.achievementPercent;
      default: return b.daily.sales - a.daily.sales;
    }
  });

  return result.map((item, idx) => ({ ...item, rank: idx + 1 }));
}

export function calculateStorePerformance(
  entries: SalesEntry[],
  selectedDate: string,
  sortBy: string = 'DAILY'
): StorePerformance[] {
  const wtdStart = getWtdStartDate(selectedDate);
  const mtdStart = getMtdStartDate(selectedDate);
  const ytdStart = getYtdStartDate(selectedDate);

  const groups = new Map<string, SalesEntry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.store_name) || [];
    list.push(entry);
    groups.set(entry.store_name, list);
  }

  const result: StorePerformance[] = [];

  for (const [storeName, storeEntries] of groups.entries()) {
    const staffCount = new Set(storeEntries.map(e => e.staff_id)).size;

    let dTarget = 0, dSales = 0, dBills = 0, dQty = 0;
    let wTarget = 0, wSales = 0, wBills = 0, wQty = 0;
    let mTarget = 0, mSales = 0, mBills = 0, mQty = 0;
    let yTarget = 0, ySales = 0, yBills = 0, yQty = 0;

    for (const e of storeEntries) {
      if (e.date > selectedDate) continue;

      if (e.date === selectedDate) {
        dTarget += e.daily_target;
        dSales += e.daily_sales;
        dBills += e.bills;
        dQty += e.quantity;
      }
      if (e.date >= wtdStart) {
        wTarget += e.daily_target;
        wSales += e.daily_sales;
        wBills += e.bills;
        wQty += e.quantity;
      }
      if (e.date >= mtdStart) {
        mTarget += e.daily_target;
        mSales += e.daily_sales;
        mBills += e.bills;
        mQty += e.quantity;
      }
      if (e.date >= ytdStart) {
        yTarget += e.daily_target;
        ySales += e.daily_sales;
        yBills += e.bills;
        yQty += e.quantity;
      }
    }

    result.push({
      storeName,
      daily: createMetric(dTarget, dSales, dBills, dQty),
      wtd: createMetric(wTarget, wSales, wBills, wQty),
      mtd: createMetric(mTarget, mSales, mBills, mQty),
      ytd: createMetric(yTarget, ySales, yBills, yQty),
      staffCount,
      rank: 0
    });
  }

  result.sort((a, b) => {
    switch (sortBy) {
      case 'WTD': return b.wtd.sales - a.wtd.sales;
      case 'MTD': return b.mtd.sales - a.mtd.sales;
      case 'YTD': return b.ytd.sales - a.ytd.sales;
      case 'ACHIEVEMENT': return b.daily.achievementPercent - a.daily.achievementPercent;
      default: return b.daily.sales - a.daily.sales;
    }
  });

  return result.map((item, idx) => ({ ...item, rank: idx + 1 }));
}
