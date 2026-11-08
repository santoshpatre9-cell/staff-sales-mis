package com.example.util

import com.example.data.model.SalesEntry
import java.text.NumberFormat
import java.util.Locale
import kotlin.math.max

data class MisMetric(
    val target: Double = 0.0,
    val sales: Double = 0.0,
    val bills: Int = 0,
    val quantity: Int = 0
) {
    val achievementPercent: Double
        get() = MisCalculator.calculateAchievementPercent(sales, target)

    val shortfall: Double
        get() = max(0.0, target - sales)

    val excess: Double
        get() = max(0.0, sales - target)

    val averageBillValue: Double
        get() = if (bills > 0) sales / bills else 0.0

    val unitsPerTransaction: Double
        get() = if (bills > 0) quantity.toDouble() / bills else 0.0
}

data class PerformanceSummary(
    val daily: MisMetric = MisMetric(),
    val wtd: MisMetric = MisMetric(),
    val mtd: MisMetric = MisMetric(),
    val ytd: MisMetric = MisMetric(),
    val entryCount: Int = 0
)

data class StaffPerformance(
    val staffId: String,
    val staffName: String,
    val storeName: String,
    val daily: MisMetric = MisMetric(),
    val wtd: MisMetric = MisMetric(),
    val mtd: MisMetric = MisMetric(),
    val ytd: MisMetric = MisMetric(),
    val rank: Int = 0
)

data class StorePerformance(
    val storeName: String,
    val daily: MisMetric = MisMetric(),
    val wtd: MisMetric = MisMetric(),
    val mtd: MisMetric = MisMetric(),
    val ytd: MisMetric = MisMetric(),
    val staffCount: Int = 0,
    val rank: Int = 0
)

object MisCalculator {

    private val indianCurrencyFormat = NumberFormat.getCurrencyInstance(Locale("en", "IN")).apply {
        maximumFractionDigits = 0
    }

    private val numberFormatter = NumberFormat.getNumberInstance(Locale("en", "IN")).apply {
        maximumFractionDigits = 0
    }

    fun formatRupees(amount: Double): String {
        return try {
            indianCurrencyFormat.format(amount)
        } catch (e: Exception) {
            "₹${numberFormatter.format(amount)}"
        }
    }

    fun formatNumber(number: Number): String {
        return numberFormatter.format(number)
    }

    fun formatPercent(percent: Double): String {
        return String.format(Locale.US, "%.1f%%", percent)
    }

    /**
     * Safe calculation of achievement percent to avoid NaN or Infinity.
     */
    fun calculateAchievementPercent(sales: Double, target: Double): Double {
        return when {
            target <= 0.0 -> if (sales > 0.0) 100.0 else 0.0
            sales <= 0.0 -> 0.0
            else -> {
                val pct = (sales / target) * 100.0
                if (pct.isNaN() || pct.isInfinite()) 0.0 else pct
            }
        }
    }

    /**
     * Compute summary for a given list of entries and a selected date
     */
    fun calculateSummary(entries: List<SalesEntry>, selectedDate: String): PerformanceSummary {
        val wtdStart = DateUtils.getWtdStartDate(selectedDate)
        val mtdStart = DateUtils.getMtdStartDate(selectedDate)
        val ytdStart = DateUtils.getYtdStartDate(selectedDate)

        var dailyTarget = 0.0
        var dailySales = 0.0
        var dailyBills = 0
        var dailyQty = 0

        var wtdTarget = 0.0
        var wtdSales = 0.0
        var wtdBills = 0
        var wtdQty = 0

        var mtdTarget = 0.0
        var mtdSales = 0.0
        var mtdBills = 0
        var mtdQty = 0

        var ytdTarget = 0.0
        var ytdSales = 0.0
        var ytdBills = 0
        var ytdQty = 0

        var count = 0

        for (entry in entries) {
            // Must be on or before selectedDate for this timeline
            if (entry.date > selectedDate) continue

            count++
            // Daily check
            if (entry.date == selectedDate) {
                dailyTarget += entry.dailyTarget
                dailySales += entry.dailySales
                dailyBills += entry.bills
                dailyQty += entry.quantity
            }

            // WTD check (wtdStart <= entry.date <= selectedDate)
            if (entry.date >= wtdStart) {
                wtdTarget += entry.dailyTarget
                wtdSales += entry.dailySales
                wtdBills += entry.bills
                wtdQty += entry.quantity
            }

            // MTD check (mtdStart <= entry.date <= selectedDate)
            if (entry.date >= mtdStart) {
                mtdTarget += entry.dailyTarget
                mtdSales += entry.dailySales
                mtdBills += entry.bills
                mtdQty += entry.quantity
            }

            // YTD check (ytdStart <= entry.date <= selectedDate)
            if (entry.date >= ytdStart) {
                ytdTarget += entry.dailyTarget
                ytdSales += entry.dailySales
                ytdBills += entry.bills
                ytdQty += entry.quantity
            }
        }

        return PerformanceSummary(
            daily = MisMetric(dailyTarget, dailySales, dailyBills, dailyQty),
            wtd = MisMetric(wtdTarget, wtdSales, wtdBills, wtdQty),
            mtd = MisMetric(mtdTarget, mtdSales, mtdBills, mtdQty),
            ytd = MisMetric(ytdTarget, ytdSales, ytdBills, ytdQty),
            entryCount = count
        )
    }

    /**
     * Calculate staff-wise performance with ranking
     */
    fun calculateStaffPerformance(
        entries: List<SalesEntry>,
        selectedDate: String,
        sortBy: String = "DAILY" // "DAILY", "WTD", "MTD", "YTD", "ACHIEVEMENT"
    ): List<StaffPerformance> {
        val wtdStart = DateUtils.getWtdStartDate(selectedDate)
        val mtdStart = DateUtils.getMtdStartDate(selectedDate)
        val ytdStart = DateUtils.getYtdStartDate(selectedDate)

        // Group by staffId
        val staffGroups = entries.groupBy { it.staffId }
        val result = mutableListOf<StaffPerformance>()

        for ((staffId, staffEntries) in staffGroups) {
            val name = staffEntries.firstOrNull()?.staffName ?: staffId
            val store = staffEntries.firstOrNull()?.storeName ?: ""

            var dTarget = 0.0; var dSales = 0.0; var dBills = 0; var dQty = 0
            var wTarget = 0.0; var wSales = 0.0; var wBills = 0; var wQty = 0
            var mTarget = 0.0; var mSales = 0.0; var mBills = 0; var mQty = 0
            var yTarget = 0.0; var ySales = 0.0; var yBills = 0; var yQty = 0

            for (e in staffEntries) {
                if (e.date > selectedDate) continue

                if (e.date == selectedDate) {
                    dTarget += e.dailyTarget
                    dSales += e.dailySales
                    dBills += e.bills
                    dQty += e.quantity
                }
                if (e.date >= wtdStart) {
                    wTarget += e.dailyTarget
                    wSales += e.dailySales
                    wBills += e.bills
                    wQty += e.quantity
                }
                if (e.date >= mtdStart) {
                    mTarget += e.dailyTarget
                    mSales += e.dailySales
                    mBills += e.bills
                    mQty += e.quantity
                }
                if (e.date >= ytdStart) {
                    yTarget += e.dailyTarget
                    ySales += e.dailySales
                    yBills += e.bills
                    yQty += e.quantity
                }
            }

            result.add(
                StaffPerformance(
                    staffId = staffId,
                    staffName = name,
                    storeName = store,
                    daily = MisMetric(dTarget, dSales, dBills, dQty),
                    wtd = MisMetric(wTarget, wSales, wBills, wQty),
                    mtd = MisMetric(mTarget, mSales, mBills, mQty),
                    ytd = MisMetric(yTarget, ySales, yBills, yQty),
                    rank = 0
                )
            )
        }

        // Sort based on period/achievement
        val sorted = when (sortBy) {
            "WTD" -> result.sortedByDescending { it.wtd.sales }
            "MTD" -> result.sortedByDescending { it.mtd.sales }
            "YTD" -> result.sortedByDescending { it.ytd.sales }
            "ACHIEVEMENT" -> result.sortedByDescending { it.daily.achievementPercent }
            else -> result.sortedByDescending { it.daily.sales }
        }

        // Assign ranks
        return sorted.mapIndexed { index, item ->
            item.copy(rank = index + 1)
        }
    }

    /**
     * Calculate store-wise performance with ranking
     */
    fun calculateStorePerformance(
        entries: List<SalesEntry>,
        selectedDate: String,
        sortBy: String = "DAILY"
    ): List<StorePerformance> {
        val wtdStart = DateUtils.getWtdStartDate(selectedDate)
        val mtdStart = DateUtils.getMtdStartDate(selectedDate)
        val ytdStart = DateUtils.getYtdStartDate(selectedDate)

        val storeGroups = entries.groupBy { it.storeName }
        val result = mutableListOf<StorePerformance>()

        for ((storeName, storeEntries) in storeGroups) {
            val staffCount = storeEntries.map { it.staffId }.distinct().size

            var dTarget = 0.0; var dSales = 0.0; var dBills = 0; var dQty = 0
            var wTarget = 0.0; var wSales = 0.0; var wBills = 0; var wQty = 0
            var mTarget = 0.0; var mSales = 0.0; var mBills = 0; var mQty = 0
            var yTarget = 0.0; var ySales = 0.0; var yBills = 0; var yQty = 0

            for (e in storeEntries) {
                if (e.date > selectedDate) continue

                if (e.date == selectedDate) {
                    dTarget += e.dailyTarget
                    dSales += e.dailySales
                    dBills += e.bills
                    dQty += e.quantity
                }
                if (e.date >= wtdStart) {
                    wTarget += e.dailyTarget
                    wSales += e.dailySales
                    wBills += e.bills
                    wQty += e.quantity
                }
                if (e.date >= mtdStart) {
                    mTarget += e.dailyTarget
                    mSales += e.dailySales
                    mBills += e.bills
                    mQty += e.quantity
                }
                if (e.date >= ytdStart) {
                    yTarget += e.dailyTarget
                    ySales += e.dailySales
                    yBills += e.bills
                    yQty += e.quantity
                }
            }

            result.add(
                StorePerformance(
                    storeName = storeName,
                    daily = MisMetric(dTarget, dSales, dBills, dQty),
                    wtd = MisMetric(wTarget, wSales, wBills, wQty),
                    mtd = MisMetric(mTarget, mSales, mBills, mQty),
                    ytd = MisMetric(yTarget, ySales, yBills, yQty),
                    staffCount = staffCount,
                    rank = 0
                )
            )
        }

        val sorted = when (sortBy) {
            "WTD" -> result.sortedByDescending { it.wtd.sales }
            "MTD" -> result.sortedByDescending { it.mtd.sales }
            "YTD" -> result.sortedByDescending { it.ytd.sales }
            "ACHIEVEMENT" -> result.sortedByDescending { it.daily.achievementPercent }
            else -> result.sortedByDescending { it.daily.sales }
        }

        return sorted.mapIndexed { index, item ->
            item.copy(rank = index + 1)
        }
    }
}
