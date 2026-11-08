package com.example

import com.example.data.model.SalesEntry
import com.example.util.DateUtils
import com.example.util.MisCalculator
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ExampleUnitTest {

    @Test
    fun testIndianFinancialYearStart() {
        // November 2026 falls in FY 2026-27 (starts April 1, 2026)
        val fyStartNov = DateUtils.getYtdStartDate("2026-11-07")
        assertEquals("2026-04-01", fyStartNov)
        assertEquals("FY 2026-27", DateUtils.getFinancialYearLabel("2026-11-07"))

        // February 2027 falls in FY 2026-27 (starts April 1, 2026)
        val fyStartFeb = DateUtils.getYtdStartDate("2027-02-15")
        assertEquals("2026-04-01", fyStartFeb)
        assertEquals("FY 2026-27", DateUtils.getFinancialYearLabel("2027-02-15"))

        // April 1, 2026 is the first day of FY 2026-27
        val fyStartApr = DateUtils.getYtdStartDate("2026-04-01")
        assertEquals("2026-04-01", fyStartApr)
    }

    @Test
    fun testMtdAndWtdDates() {
        // MTD start for Nov 7, 2026 should be Nov 1, 2026
        val mtdStart = DateUtils.getMtdStartDate("2026-11-07")
        assertEquals("2026-11-01", mtdStart)

        // Nov 7, 2026 is a Saturday. Monday of that week was Nov 2, 2026
        val wtdStart = DateUtils.getWtdStartDate("2026-11-07")
        assertEquals("2026-11-02", wtdStart)
    }

    @Test
    fun testSafeAchievementCalculation() {
        // Normal case
        val ach = MisCalculator.calculateAchievementPercent(25000.0, 30000.0)
        assertEquals(83.33, ach, 0.01)

        // Target = 0 with positive sales
        val achZeroTargetWithSales = MisCalculator.calculateAchievementPercent(1000.0, 0.0)
        assertEquals(100.0, achZeroTargetWithSales, 0.01)

        // Target = 0 with zero sales
        val achZeroBoth = MisCalculator.calculateAchievementPercent(0.0, 0.0)
        assertEquals(0.0, achZeroBoth, 0.01)

        // Verify never NaN or Infinite
        assertFalse(achZeroTargetWithSales.isNaN())
        assertFalse(achZeroTargetWithSales.isInfinite())
    }

    @Test
    fun testSummaryCalculation() {
        val testEntries = listOf(
            SalesEntry(
                entryId = 1,
                date = "2026-11-07",
                staffId = "STF-1",
                staffName = "Test Staff",
                storeName = "Store A",
                dailyTarget = 30000.0,
                dailySales = 25000.0,
                bills = 10,
                quantity = 15
            ),
            SalesEntry(
                entryId = 2,
                date = "2026-11-04", // In this week and month
                staffId = "STF-1",
                staffName = "Test Staff",
                storeName = "Store A",
                dailyTarget = 20000.0,
                dailySales = 22000.0,
                bills = 8,
                quantity = 12
            ),
            SalesEntry(
                entryId = 3,
                date = "2026-05-10", // In this financial year (FY 2026-27), but not this month
                staffId = "STF-1",
                staffName = "Test Staff",
                storeName = "Store A",
                dailyTarget = 50000.0,
                dailySales = 45000.0,
                bills = 20,
                quantity = 30
            )
        )

        val summary = MisCalculator.calculateSummary(testEntries, "2026-11-07")

        // Daily
        assertEquals(25000.0, summary.daily.sales, 0.01)
        assertEquals(30000.0, summary.daily.target, 0.01)
        assertEquals(5000.0, summary.daily.shortfall, 0.01)

        // WTD (Nov 4 + Nov 7)
        assertEquals(47000.0, summary.wtd.sales, 0.01)
        assertEquals(50000.0, summary.wtd.target, 0.01)

        // MTD (Nov 4 + Nov 7)
        assertEquals(47000.0, summary.mtd.sales, 0.01)
        assertEquals(50000.0, summary.mtd.target, 0.01)

        // YTD (May 10 + Nov 4 + Nov 7)
        assertEquals(92000.0, summary.ytd.sales, 0.01)
        assertEquals(100000.0, summary.ytd.target, 0.01)
        assertEquals(92.0, summary.ytd.achievementPercent, 0.01)
    }
}
