import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getYtdStartDate, getMtdStartDate, getWtdStartDate, getFinancialYearLabel } from '../src/utils/dateUtils.ts';
import { calculateAchievementPercent, calculateStaffPerformance, calculateSummary, createMetricDetail } from '../src/utils/misCalculator.ts';

test('Indian Financial Year (April 1 to March 31) logic', () => {
  assert.equal(getYtdStartDate('2026-11-08'), '2026-04-01');
  assert.equal(getFinancialYearLabel('2026-11-08'), 'FY 2026-27');
});

test('Rahul master verification test scenario (Requirement 24)', () => {
  const today = '2026-11-08';
  const staffList = [
    {
      id: 'STF-101',
      name: 'Rahul',
      store_name: 'Mumbai Store',
      store_id: 'STR-01',
      daily_target: 20000,
      daily_sale_target: 20000,
      daily_qty_target: 20,
      daily_ff_target: 15,
      daily_big_bill_target: 5,
      monthly_target: 600000,
      annual_aop: 7200000,
      status: 'ACTIVE'
    }
  ];

  const entries = [
    { id: 1, date: today, time: '10:01 AM', staff_id: 'STF-101', staff_name: 'Rahul', store_id: 'STR-01', store_name: 'Mumbai Store', sale_amount: 2500, qty: 2, ff: 1, big_bill: 1, target_amount: 20000, target_qty: 20, target_ff: 15, target_big_bill: 5, bill_number: 'R-01', product_category: 'Apparel', payment_mode: 'UPI', remarks: '', is_demo: 1, created_at: 1, updated_at: 1 },
    { id: 2, date: today, time: '10:05 AM', staff_id: 'STF-101', staff_name: 'Rahul', store_id: 'STR-01', store_name: 'Mumbai Store', sale_amount: 1800, qty: 1, ff: 1, big_bill: 0, target_amount: 20000, target_qty: 20, target_ff: 15, target_big_bill: 5, bill_number: 'R-02', product_category: 'Accessories', payment_mode: 'Cash', remarks: '', is_demo: 1, created_at: 2, updated_at: 2 },
    { id: 3, date: today, time: '10:12 AM', staff_id: 'STF-101', staff_name: 'Rahul', store_id: 'STR-01', store_name: 'Mumbai Store', sale_amount: 3000, qty: 3, ff: 2, big_bill: 1, target_amount: 20000, target_qty: 20, target_ff: 15, target_big_bill: 5, bill_number: 'R-03', product_category: 'Footwear', payment_mode: 'Card', remarks: '', is_demo: 1, created_at: 3, updated_at: 3 }
  ];

  const staffPerf = calculateStaffPerformance(entries, today, staffList);
  const rahul = staffPerf.find(s => s.staffId === 'STF-101');

  assert.ok(rahul, 'Rahul performance found');
  
  // Expected FTD: Sale = ₹7,300, Qty = 6, FF = 4, Big Bill = 2
  assert.equal(rahul.daily.sale.achieved, 7300);
  assert.equal(rahul.daily.qty.achieved, 6);
  assert.equal(rahul.daily.ff.achieved, 4);
  assert.equal(rahul.daily.bigBill.achieved, 2);

  // Expected Achievement %: Sale = 36.5%, Qty = 30%, FF = 26.67%, Big Bill = 40%
  assert.equal(rahul.daily.sale.achievementPercent, 36.5);
  assert.equal(rahul.daily.qty.achievementPercent, 30);
  assert.equal(Number(rahul.daily.ff.achievementPercent.toFixed(2)), 26.67);
  assert.equal(rahul.daily.bigBill.achievementPercent, 40);

  // Verify WTD and MTD automatically include these transactions
  assert.equal(rahul.wtd.sale.achieved >= 7300, true);
  assert.equal(rahul.mtd.sale.achieved >= 7300, true);
});
