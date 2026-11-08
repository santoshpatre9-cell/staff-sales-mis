package com.example.util

import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

object DateUtils {

    private val DATE_FORMAT = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    private val DISPLAY_DATE_FORMAT = SimpleDateFormat("dd MMM yyyy", Locale.getDefault())
    private val SHORT_DISPLAY_FORMAT = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())

    fun todayDateString(): String {
        return DATE_FORMAT.format(Date())
    }

    fun parseDate(dateStr: String): Date {
        return try {
            DATE_FORMAT.parse(dateStr) ?: Date()
        } catch (e: Exception) {
            Date()
        }
    }

    fun formatDate(date: Date): String {
        return DATE_FORMAT.format(date)
    }

    fun formatDisplayDate(dateStr: String): String {
        return try {
            val date = DATE_FORMAT.parse(dateStr) ?: return dateStr
            DISPLAY_DATE_FORMAT.format(date)
        } catch (e: Exception) {
            dateStr
        }
    }

    fun formatShortDate(dateStr: String): String {
        return try {
            val date = DATE_FORMAT.parse(dateStr) ?: return dateStr
            SHORT_DISPLAY_FORMAT.format(date)
        } catch (e: Exception) {
            dateStr
        }
    }

    /**
     * Week-to-date start date (Monday of the week)
     */
    fun getWtdStartDate(dateStr: String): String {
        val cal = Calendar.getInstance().apply {
            time = parseDate(dateStr)
            firstDayOfWeek = Calendar.MONDAY
        }
        val dayOfWeek = cal.get(Calendar.DAY_OF_WEEK)
        // Calendar.MONDAY is 2. Calendar.SUNDAY is 1.
        val daysToSubtract = when (dayOfWeek) {
            Calendar.SUNDAY -> 6
            Calendar.MONDAY -> 0
            Calendar.TUESDAY -> 1
            Calendar.WEDNESDAY -> 2
            Calendar.THURSDAY -> 3
            Calendar.FRIDAY -> 4
            Calendar.SATURDAY -> 5
            else -> 0
        }
        cal.add(Calendar.DAY_OF_MONTH, -daysToSubtract)
        return DATE_FORMAT.format(cal.time)
    }

    /**
     * Month-to-date start date (1st of the current month)
     */
    fun getMtdStartDate(dateStr: String): String {
        val cal = Calendar.getInstance().apply {
            time = parseDate(dateStr)
            set(Calendar.DAY_OF_MONTH, 1)
        }
        return DATE_FORMAT.format(cal.time)
    }

    /**
     * Indian Financial Year (April 1 to March 31).
     * Returns April 1 of the start year.
     * Example: 7 Nov 2026 -> 1 Apr 2026
     * Example: 15 Feb 2027 -> 1 Apr 2026
     */
    fun getYtdStartDate(dateStr: String): String {
        val cal = Calendar.getInstance().apply {
            time = parseDate(dateStr)
        }
        val year = cal.get(Calendar.YEAR)
        val month = cal.get(Calendar.MONTH) // 0-indexed: 0 = Jan, 2 = Mar, 3 = Apr

        val fyStartYear = if (month >= Calendar.APRIL) {
            year
        } else {
            year - 1
        }

        cal.set(Calendar.YEAR, fyStartYear)
        cal.set(Calendar.MONTH, Calendar.APRIL)
        cal.set(Calendar.DAY_OF_MONTH, 1)
        return DATE_FORMAT.format(cal.time)
    }

    fun getFinancialYearLabel(dateStr: String): String {
        val cal = Calendar.getInstance().apply {
            time = parseDate(dateStr)
        }
        val year = cal.get(Calendar.YEAR)
        val month = cal.get(Calendar.MONTH)
        val startYear = if (month >= Calendar.APRIL) year else year - 1
        val endYearShort = (startYear + 1) % 100
        return "FY ${startYear}-${String.format(Locale.US, "%02d", endYearShort)}"
    }

    fun getYesterdayDate(dateStr: String): String {
        val cal = Calendar.getInstance().apply {
            time = parseDate(dateStr)
            add(Calendar.DAY_OF_MONTH, -1)
        }
        return DATE_FORMAT.format(cal.time)
    }

    fun addDays(dateStr: String, days: Int): String {
        val cal = Calendar.getInstance().apply {
            time = parseDate(dateStr)
            add(Calendar.DAY_OF_MONTH, days)
        }
        return DATE_FORMAT.format(cal.time)
    }
}
