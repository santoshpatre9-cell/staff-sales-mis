import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getYtdStartDate, getMtdStartDate, getWtdStartDate, getFinancialYearLabel } from '../src/utils/dateUtils.ts';
import { calculateAchievementPercent, createMetric } from '../src/utils/misCalculator.ts';

test('Indian Financial Year (April 1 to March 31) logic', () => {
  // November 2026 -> FY started April 1, 2026
  assert.equal(getYtdStartDate('2026-11-07'), '2026-04-01');
  assert.equal(getFinancialYearLabel('2026-11-07'), 'FY 2026-27');

  // February 2027 -> FY started April 1, 2026
  assert.equal(getYtdStartDate('2027-02-15'), '2026-04-01');
  assert.equal(getFinancialYearLabel('2027-02-15'), 'FY 2026-27');

  // April 1, 2026
  assert.equal(getYtdStartDate('2026-04-01'), '2026-04-01');
});

test('WTD and MTD date calculations', () => {
  // Saturday 7 Nov 2026 -> Monday of the week was 2 Nov 2026
  assert.equal(getWtdStartDate('2026-11-07'), '2026-11-02');
  // 1st of the month
  assert.equal(getMtdStartDate('2026-11-07'), '2026-11-01');
});

test('Achievement and shortfall calculation logic', () => {
  // Normal case: 25000 / 30000 = 83.33%
  const ach = calculateAchievementPercent(25000, 30000);
  assert.ok(Math.abs(ach - 83.333) < 0.01);

  // Target = 0 with sales > 0 -> 100%
  assert.equal(calculateAchievementPercent(1000, 0), 100);

  // Target = 0 with sales = 0 -> 0%
  assert.equal(calculateAchievementPercent(0, 0), 0);

  // Negative safety
  const metric = createMetric(30000, 25000, 10, 15);
  assert.equal(metric.shortfall, 5000);
  assert.equal(metric.excess, 0);
  assert.equal(metric.averageBillValue, 2500);
  assert.equal(metric.unitsPerTransaction, 1.5);
});
