import type { MetricDetail, MultiMetricSummary, PerformanceSummary, SalesEntry, Staff, StaffPerformance, StorePerformance } from '../types.ts';
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

export function calculateAchievementPercent(achieved: number, target: number): number {
  if (target <= 0) {
    return achieved > 0 ? 100.0 : 0.0;
  }
  if (achieved <= 0) return 0.0;
  const pct = (achieved / target) * 100.0;
  return isNaN(pct) || !isFinite(pct) ? 0.0 : pct;
}

export function createMetricDetail(target: number, achieved: number): MetricDetail {
  const achievementPercent = calculateAchievementPercent(achieved, target);
  const shortfall = Math.max(0, target - achieved);
  const excess = Math.max(0, achieved - target);

  return {
    target,
    achieved,
    achievementPercent,
    shortfall,
    excess
  };
}

export function calculateSummary(entries: SalesEntry[], selectedDate: string, staffList: Staff[] = []): PerformanceSummary {
  const wtdStart = getWtdStartDate(selectedDate);
  const mtdStart = getMtdStartDate(selectedDate);
  const ytdStart = getYtdStartDate(selectedDate);

  let dSale = 0, dQty = 0, dFF = 0, dBigBill = 0, dBills = 0;
  let wSale = 0, wQty = 0, wFF = 0, wBigBill = 0, wBills = 0;
  let mSale = 0, mQty = 0, mFF = 0, mBigBill = 0, mBills = 0;
  let ySale = 0, yQty = 0, yFF = 0, yBigBill = 0, yBills = 0;
  let count = 0;

  // Active staff targets or defaults
  let dSaleTarget = 0, dQtyTarget = 0, dFFTarget = 0, dBigBillTarget = 0;
  const activeStaff = staffList.filter(s => s.status === 'ACTIVE');
  
  if (activeStaff.length > 0) {
    for (const st of activeStaff) {
      dSaleTarget += st.daily_sale_target || st.daily_target || 25000;
      dQtyTarget += st.daily_qty_target || 20;
      dFFTarget += st.daily_ff_target || 5;
      dBigBillTarget += st.daily_big_bill_target || 2;
    }
  } else {
    dSaleTarget = 8 * 25000;
    dQtyTarget = 8 * 20;
    dFFTarget = 8 * 5;
    dBigBillTarget = 8 * 2;
  }

  for (const entry of entries) {
    if (entry.date > selectedDate) continue;
    count++;

    const sAmt = entry.sale_amount || 0;
    const qAmt = entry.qty ?? 1;
    const fAmt = entry.ff ?? 1;
    const bAmt = entry.big_bill ?? 0;

    // Daily (FTD)
    if (entry.date === selectedDate) {
      dSale += sAmt;
      dQty += qAmt;
      dFF += fAmt;
      dBigBill += bAmt;
      dBills += 1;
    }

    // WTD
    if (entry.date >= wtdStart) {
      wSale += sAmt;
      wQty += qAmt;
      wFF += fAmt;
      wBigBill += bAmt;
      wBills += 1;
    }

    // MTD
    if (entry.date >= mtdStart) {
      mSale += sAmt;
      mQty += qAmt;
      mFF += fAmt;
      mBigBill += bAmt;
      mBills += 1;
    }

    // YTD
    if (entry.date >= ytdStart) {
      ySale += sAmt;
      yQty += qAmt;
      yFF += fAmt;
      yBigBill += bAmt;
      yBills += 1;
    }
  }

  const wTargetMultiplier = 6;
  const mTargetMultiplier = 25;
  const yTargetMultiplier = 200;

  const dailySummary: MultiMetricSummary = {
    sale: createMetricDetail(dSaleTarget, dSale),
    qty: createMetricDetail(dQtyTarget, dQty),
    ff: createMetricDetail(dFFTarget, dFF),
    bigBill: createMetricDetail(dBigBillTarget, dBigBill),
    billsCount: dBills
  };

  const wtdSummary: MultiMetricSummary = {
    sale: createMetricDetail(dSaleTarget * wTargetMultiplier, wSale),
    qty: createMetricDetail(dQtyTarget * wTargetMultiplier, wQty),
    ff: createMetricDetail(dFFTarget * wTargetMultiplier, wFF),
    bigBill: createMetricDetail(dBigBillTarget * wTargetMultiplier, wBigBill),
    billsCount: wBills
  };

  const mtdSummary: MultiMetricSummary = {
    sale: createMetricDetail(dSaleTarget * mTargetMultiplier, mSale),
    qty: createMetricDetail(dQtyTarget * mTargetMultiplier, mQty),
    ff: createMetricDetail(dFFTarget * mTargetMultiplier, mFF),
    bigBill: createMetricDetail(dBigBillTarget * mTargetMultiplier, mBigBill),
    billsCount: mBills
  };

  const ytdSummary: MultiMetricSummary = {
    sale: createMetricDetail(dSaleTarget * yTargetMultiplier, ySale),
    qty: createMetricDetail(dQtyTarget * yTargetMultiplier, yQty),
    ff: createMetricDetail(dFFTarget * yTargetMultiplier, yFF),
    bigBill: createMetricDetail(dBigBillTarget * yTargetMultiplier, yBigBill),
    billsCount: yBills
  };

  return {
    daily: dailySummary,
    wtd: wtdSummary,
    mtd: mtdSummary,
    ytd: ytdSummary,
    entryCount: count
  };
}

export function calculateStaffPerformance(
  entries: SalesEntry[],
  selectedDate: string,
  staffList: Staff[] = [],
  sortBy: string = 'DAILY'
): StaffPerformance[] {
  const wtdStart = getWtdStartDate(selectedDate);
  const mtdStart = getMtdStartDate(selectedDate);
  const ytdStart = getYtdStartDate(selectedDate);

  const staffMap = new Map<string, { staff: Staff; entries: SalesEntry[] }>();
  
  for (const st of staffList) {
    if (st.status === 'ACTIVE') {
      staffMap.set(st.id, { staff: st, entries: [] });
    }
  }

  for (const entry of entries) {
    if (!staffMap.has(entry.staff_id)) {
      staffMap.set(entry.staff_id, {
        staff: {
          id: entry.staff_id,
          name: entry.staff_name,
          store_name: entry.store_name,
          store_id: entry.store_id,
          daily_target: entry.target_amount || 25000,
          daily_sale_target: entry.target_amount || 25000,
          daily_qty_target: entry.target_qty || 20,
          daily_ff_target: entry.target_ff || 5,
          daily_big_bill_target: entry.target_big_bill || 2,
          monthly_target: 750000,
          annual_aop: 9000000,
          status: 'ACTIVE'
        },
        entries: []
      });
    }
    staffMap.get(entry.staff_id)!.entries.push(entry);
  }

  const result: StaffPerformance[] = [];

  for (const [staffId, data] of staffMap.entries()) {
    const { staff, entries: staffEntries } = data;
    let dSale = 0, dQty = 0, dFF = 0, dBigBill = 0, dBills = 0, dCount = 0;
    let wSale = 0, wQty = 0, wFF = 0, wBigBill = 0, wBills = 0;
    let mSale = 0, mQty = 0, mFF = 0, mBigBill = 0, mBills = 0;
    let ySale = 0, yQty = 0, yFF = 0, yBigBill = 0, yBills = 0;
    let lastTime = '-';

    const sTgt = staff.daily_sale_target || staff.daily_target || 25000;
    const qTgt = staff.daily_qty_target || 20;
    const fTgt = staff.daily_ff_target || 5;
    const bTgt = staff.daily_big_bill_target || 2;

    for (const e of staffEntries) {
      if (e.date > selectedDate) continue;

      const sAmt = e.sale_amount || 0;
      const qAmt = e.qty ?? 1;
      const fAmt = e.ff ?? 1;
      const bAmt = e.big_bill ?? 0;

      if (e.date === selectedDate) {
        dSale += sAmt;
        dQty += qAmt;
        dFF += fAmt;
        dBigBill += bAmt;
        dBills += 1;
        dCount += 1;
        lastTime = e.time || lastTime;
      }
      if (e.date >= wtdStart) {
        wSale += sAmt;
        wQty += qAmt;
        wFF += fAmt;
        wBigBill += bAmt;
        wBills += 1;
      }
      if (e.date >= mtdStart) {
        mSale += sAmt;
        mQty += qAmt;
        mFF += fAmt;
        mBigBill += bAmt;
        mBills += 1;
      }
      if (e.date >= ytdStart) {
        ySale += sAmt;
        yQty += qAmt;
        yFF += fAmt;
        yBigBill += bAmt;
        yBills += 1;
      }
    }

    result.push({
      staffId,
      staffName: staff.name,
      storeName: staff.store_name,
      salesCount: dCount,
      daily: {
        sale: createMetricDetail(sTgt, dSale),
        qty: createMetricDetail(qTgt, dQty),
        ff: createMetricDetail(fTgt, dFF),
        bigBill: createMetricDetail(bTgt, dBigBill),
        billsCount: dBills
      },
      wtd: {
        sale: createMetricDetail(sTgt * 6, wSale),
        qty: createMetricDetail(qTgt * 6, wQty),
        ff: createMetricDetail(fTgt * 6, wFF),
        bigBill: createMetricDetail(bTgt * 6, wBigBill),
        billsCount: wBills
      },
      mtd: {
        sale: createMetricDetail(sTgt * 25, mSale),
        qty: createMetricDetail(qTgt * 25, mQty),
        ff: createMetricDetail(fTgt * 25, mFF),
        bigBill: createMetricDetail(bTgt * 25, mBigBill),
        billsCount: mBills
      },
      ytd: {
        sale: createMetricDetail(sTgt * 200, ySale),
        qty: createMetricDetail(qTgt * 200, yQty),
        ff: createMetricDetail(fTgt * 200, yFF),
        bigBill: createMetricDetail(bTgt * 200, yBigBill),
        billsCount: yBills
      },
      lastSaleTime: lastTime,
      rank: 0
    });
  }

  result.sort((a, b) => {
    switch (sortBy) {
      case 'WTD': return b.wtd.sale.achieved - a.wtd.sale.achieved;
      case 'MTD': return b.mtd.sale.achieved - a.mtd.sale.achieved;
      case 'YTD': return b.ytd.sale.achieved - a.ytd.sale.achieved;
      case 'ACHIEVEMENT': return b.daily.sale.achievementPercent - a.daily.sale.achievementPercent;
      case 'QTY': return b.daily.qty.achieved - a.daily.qty.achieved;
      case 'FF': return b.daily.ff.achieved - a.daily.ff.achieved;
      default: return b.daily.sale.achieved - a.daily.sale.achieved;
    }
  });

  return result.map((item, idx) => ({ ...item, rank: idx + 1 }));
}

export function calculateStorePerformance(
  entries: SalesEntry[],
  selectedDate: string,
  staffList: Staff[] = [],
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
    const storeStaff = staffList.filter(s => s.store_name === storeName && s.status === 'ACTIVE');
    
    let sTgt = 0, qTgt = 0, fTgt = 0, bTgt = 0;
    if (storeStaff.length > 0) {
      for (const st of storeStaff) {
        sTgt += st.daily_sale_target || st.daily_target || 25000;
        qTgt += st.daily_qty_target || 20;
        fTgt += st.daily_ff_target || 5;
        bTgt += st.daily_big_bill_target || 2;
      }
    } else {
      const activeCount = Math.max(1, staffCount);
      sTgt = activeCount * 25000;
      qTgt = activeCount * 20;
      fTgt = activeCount * 5;
      bTgt = activeCount * 2;
    }

    let dSale = 0, dQty = 0, dFF = 0, dBigBill = 0, dBills = 0, transCount = 0;
    let wSale = 0, wQty = 0, wFF = 0, wBigBill = 0, wBills = 0;
    let mSale = 0, mQty = 0, mFF = 0, mBigBill = 0, mBills = 0;
    let ySale = 0, yQty = 0, yFF = 0, yBigBill = 0, yBills = 0;
    let lastTime = '-';

    for (const e of storeEntries) {
      if (e.date > selectedDate) continue;

      const sAmt = e.sale_amount || 0;
      const qAmt = e.qty ?? 1;
      const fAmt = e.ff ?? 1;
      const bAmt = e.big_bill ?? 0;

      if (e.date === selectedDate) {
        dSale += sAmt;
        dQty += qAmt;
        dFF += fAmt;
        dBigBill += bAmt;
        dBills += 1;
        transCount += 1;
        lastTime = e.time || lastTime;
      }
      if (e.date >= wtdStart) {
        wSale += sAmt;
        wQty += qAmt;
        wFF += fAmt;
        wBigBill += bAmt;
        wBills += 1;
      }
      if (e.date >= mtdStart) {
        mSale += sAmt;
        mQty += qAmt;
        mFF += fAmt;
        mBigBill += bAmt;
        mBills += 1;
      }
      if (e.date >= ytdStart) {
        ySale += sAmt;
        yQty += qAmt;
        yFF += fAmt;
        yBigBill += bAmt;
        yBills += 1;
      }
    }

    result.push({
      storeName,
      daily: {
        sale: createMetricDetail(sTgt, dSale),
        qty: createMetricDetail(qTgt, dQty),
        ff: createMetricDetail(fTgt, dFF),
        bigBill: createMetricDetail(bTgt, dBigBill),
        billsCount: dBills
      },
      wtd: {
        sale: createMetricDetail(sTgt * 6, wSale),
        qty: createMetricDetail(qTgt * 6, wQty),
        ff: createMetricDetail(fTgt * 6, wFF),
        bigBill: createMetricDetail(bTgt * 6, wBigBill),
        billsCount: wBills
      },
      mtd: {
        sale: createMetricDetail(sTgt * 25, mSale),
        qty: createMetricDetail(qTgt * 25, mQty),
        ff: createMetricDetail(fTgt * 25, mFF),
        bigBill: createMetricDetail(bTgt * 25, mBigBill),
        billsCount: mBills
      },
      ytd: {
        sale: createMetricDetail(sTgt * 200, ySale),
        qty: createMetricDetail(qTgt * 200, yQty),
        ff: createMetricDetail(fTgt * 200, yFF),
        bigBill: createMetricDetail(bTgt * 200, yBigBill),
        billsCount: yBills
      },
      staffCount: Math.max(staffCount, storeStaff.length),
      transactionCount: transCount,
      lastSaleTime: lastTime,
      rank: 0
    });
  }

  result.sort((a, b) => {
    switch (sortBy) {
      case 'WTD': return b.wtd.sale.achieved - a.wtd.sale.achieved;
      case 'MTD': return b.mtd.sale.achieved - a.mtd.sale.achieved;
      case 'YTD': return b.ytd.sale.achieved - a.ytd.sale.achieved;
      case 'ACHIEVEMENT': return b.daily.sale.achievementPercent - a.daily.sale.achievementPercent;
      default: return b.daily.sale.achieved - a.daily.sale.achieved;
    }
  });

  return result.map((item, idx) => ({ ...item, rank: idx + 1 }));
}
