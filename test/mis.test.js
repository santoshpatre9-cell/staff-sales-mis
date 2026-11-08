import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getYtdStartDate, getMtdStartDate, getWtdStartDate, getFinancialYearLabel } from '../src/utils/dateUtils.ts';
import { calculateAchievementPercent, calculateStaffPerformance, calculateSummary, createMetricDetail } from '../src/utils/misCalculator.ts';

test('Indian Financial Year (April 1 to March 31) logic', () => {
  assert.equal(getYtdStartDate('2026-11-08'), '2026-04-01');
  assert.equal(getFinancialYearLabel('2026-11-08'), 'FY 2026-27');
});

test('Rahul verification test scenario (Sale, Qty, FF, Big Bill)', () => {
  const today = '2026-11-08';
  const staffList = [
    {
      id: 'STF-101',
      name: 'Rahul',
      store_name: 'Mumbai Store',
      store_id: 'STR-01',
      daily_target: 25000,
      daily_sale_target: 25000,
      daily_qty_target: 20,
      daily_ff_target: 5,
      daily_big_bill_target: 2,
      monthly_target: 750000,
      annual_aop: 9000000,
      status: 'ACTIVE'
    }
  ];

  const entries = [
    { id: 1, date: today, time: '10:00 AM', staff_id: 'STF-101', staff_name: 'Rahul', store_id: 'STR-01', store_name: 'Mumbai Store', sale_amount: 5000, qty: 4, ff: 1, big_bill: 0, target_amount: 25000, target_qty: 20, target_ff: 5, target_big_bill: 2, bill_number: 'R-01', product_category: 'Apparel', payment_mode: 'UPI', remarks: '', is_demo: 1, created_at: 1, updated_at: 1 },
    { id: 2, date: today, time: '11:30 AM', staff_id: 'STF-101', staff_name: 'Rahul', store_id: 'STR-01', store_name: 'Mumbai Store', sale_amount: 8000, qty: 6, ff: 1, big_bill: 1, target_amount: 25000, target_qty: 20, target_ff: 5, target_big_bill: 2, bill_number: 'R-02', product_category: 'Footwear', payment_mode: 'Card', remarks: '', is_demo: 1, created_at: 2, updated_at: 2 },
    { id: 3, date: today, time: '02:15 PM', staff_id: 'STF-101', staff_name: 'Rahul', store_id: 'STR-01', store_name: 'Mumbai Store', sale_amount: 7000, qty: 5, ff: 1, big_bill: 0, target_amount: 25000, target_qty: 20, target_ff: 5, target_big_bill: 2, bill_number: 'R-03', product_category: 'Accessories', payment_mode: 'Cash', remarks: '', is_demo: 1, created_at: 3, updated_at: 3 }
  ];

  const staffPerf = calculateStaffPerformance(entries, today, staffList);
  const rahul = staffPerf.find(s => s.staffId === 'STF-101');

  assert.ok(rahul, 'Rahul performance found');
  
  // Expected FTD: Sale = ₹20,000, Qty = 15, FF = 3, Big Bill = 1
  assert.equal(rahul.daily.sale.achieved, 20000);
  assert.equal(rahul.daily.qty.achieved, 15);
  assert.equal(rahul.daily.ff.achieved, 3);
  assert.equal(rahul.daily.bigBill.achieved, 1);

  // Expected Achievement %: Sale = 80%, Qty = 75%, FF = 60%, Big Bill = 50%
  assert.equal(rahul.daily.sale.achievementPercent, 80);
  assert.equal(rahul.daily.qty.achievementPercent, 75);
  assert.equal(rahul.daily.ff.achievementPercent, 60);
  assert.equal(rahul.daily.bigBill.achievementPercent, 50);

  // Verify WTD and MTD automatically include these transactions
  assert.equal(rahul.wtd.sale.achieved >= 20000, true);
  assert.equal(rahul.mtd.sale.achieved >= 20000, true);
});
