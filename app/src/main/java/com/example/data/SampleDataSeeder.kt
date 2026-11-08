package com.example.data

import com.example.data.db.SalesDao
import com.example.data.model.SalesEntry
import com.example.data.model.Staff
import com.example.data.model.Store
import com.example.util.DateUtils
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object SampleDataSeeder {

    val sampleStores = listOf(
        Store("STR-01", "Mumbai - Phoenix Palladium", "Lower Parel, Mumbai"),
        Store("STR-02", "Delhi - Connaught Place", "Inner Circle, New Delhi"),
        Store("STR-03", "Bengaluru - Indiranagar", "100ft Road, Bengaluru"),
        Store("STR-04", "Hyderabad - Inorbit Mall", "Madhapur, Hyderabad"),
        Store("STR-05", "Chennai - Express Avenue", "Royapettah, Chennai")
    )

    val sampleStaff = listOf(
        Staff("STF-101", "Rahul Sharma", "Mumbai - Phoenix Palladium"),
        Staff("STF-102", "Priya Patel", "Mumbai - Phoenix Palladium"),
        Staff("STF-103", "Amit Verma", "Delhi - Connaught Place"),
        Staff("STF-104", "Neha Gupta", "Delhi - Connaught Place"),
        Staff("STF-105", "Karthik Raja", "Bengaluru - Indiranagar"),
        Staff("STF-106", "Sneha Reddy", "Bengaluru - Indiranagar"),
        Staff("STF-107", "Vikram Singh", "Hyderabad - Inorbit Mall"),
        Staff("STF-108", "Ananya Nair", "Chennai - Express Avenue")
    )

    suspend fun seedIfEmpty(dao: SalesDao) {
        withContext(Dispatchers.IO) {
            dao.insertAllStores(sampleStores)
            dao.insertAllStaff(sampleStaff)

            // Check if sales entries exist
            // If empty, generate realistic demo records around today's date
            val today = DateUtils.todayDateString()
            val existing = dao.getEntryForStaffAndDate("STF-101", today)
            if (existing == null) {
                seedDemoSales(dao, today)
            }
        }
    }

    suspend fun seedDemoSales(dao: SalesDao, referenceDate: String) {
        withContext(Dispatchers.IO) {
            val entries = mutableListOf<SalesEntry>()

            // 1. Reference Day (Today) entries
            val todayEntries = listOf(
                SalesEntry(
                    date = referenceDate,
                    staffId = "STF-101",
                    staffName = "Rahul Sharma",
                    storeName = "Mumbai - Phoenix Palladium",
                    dailyTarget = 30000.0,
                    dailySales = 28500.0,
                    bills = 14,
                    quantity = 22,
                    remarks = "Evening footfall was strong",
                    isDemo = true
                ),
                SalesEntry(
                    date = referenceDate,
                    staffId = "STF-102",
                    staffName = "Priya Patel",
                    storeName = "Mumbai - Phoenix Palladium",
                    dailyTarget = 32000.0,
                    dailySales = 35200.0,
                    bills = 18,
                    quantity = 29,
                    remarks = "Exceeded target on new arrivals",
                    isDemo = true
                ),
                SalesEntry(
                    date = referenceDate,
                    staffId = "STF-103",
                    staffName = "Amit Verma",
                    storeName = "Delhi - Connaught Place",
                    dailyTarget = 28000.0,
                    dailySales = 25000.0,
                    bills = 12,
                    quantity = 19,
                    remarks = "Shortfall by ₹3,000",
                    isDemo = true
                ),
                SalesEntry(
                    date = referenceDate,
                    staffId = "STF-104",
                    staffName = "Neha Gupta",
                    storeName = "Delhi - Connaught Place",
                    dailyTarget = 35000.0,
                    dailySales = 39800.0,
                    bills = 21,
                    quantity = 34,
                    remarks = "Top bill value of the day",
                    isDemo = true
                ),
                SalesEntry(
                    date = referenceDate,
                    staffId = "STF-105",
                    staffName = "Karthik Raja",
                    storeName = "Bengaluru - Indiranagar",
                    dailyTarget = 30000.0,
                    dailySales = 31500.0,
                    bills = 16,
                    quantity = 25,
                    remarks = "Good accessory add-on conversions",
                    isDemo = true
                ),
                SalesEntry(
                    date = referenceDate,
                    staffId = "STF-106",
                    staffName = "Sneha Reddy",
                    storeName = "Bengaluru - Indiranagar",
                    dailyTarget = 26000.0,
                    dailySales = 22800.0,
                    bills = 11,
                    quantity = 16,
                    remarks = "Slow afternoon conversion",
                    isDemo = true
                ),
                SalesEntry(
                    date = referenceDate,
                    staffId = "STF-107",
                    staffName = "Vikram Singh",
                    storeName = "Hyderabad - Inorbit Mall",
                    dailyTarget = 34000.0,
                    dailySales = 36500.0,
                    bills = 19,
                    quantity = 30,
                    remarks = "Corporate gifting bulk purchase",
                    isDemo = true
                ),
                SalesEntry(
                    date = referenceDate,
                    staffId = "STF-108",
                    staffName = "Ananya Nair",
                    storeName = "Chennai - Express Avenue",
                    dailyTarget = 25000.0,
                    dailySales = 27400.0,
                    bills = 15,
                    quantity = 23,
                    remarks = "Solid festive ethnic sales",
                    isDemo = true
                )
            )
            entries.addAll(todayEntries)

            // 2. Past 5 days of this week
            for (dayOffset in 1..5) {
                val pastDate = DateUtils.addDays(referenceDate, -dayOffset)
                sampleStaff.forEachIndexed { idx, staff ->
                    val baseTarget = 26000.0 + (idx % 4) * 3000.0
                    val variance = ((idx * 7 + dayOffset * 13) % 21 - 10) / 100.0 // -10% to +10%
                    val sales = (baseTarget * (1.0 + variance)).coerceAtLeast(15000.0)
                    val bills = 10 + ((idx * 3 + dayOffset) % 12)
                    val qty = (bills * 1.6).toInt()

                    entries.add(
                        SalesEntry(
                            date = pastDate,
                            staffId = staff.id,
                            staffName = staff.name,
                            storeName = staff.storeName,
                            dailyTarget = baseTarget,
                            dailySales = sales,
                            bills = bills,
                            quantity = qty,
                            remarks = "Standard daily sales",
                            isDemo = true
                        )
                    )
                }
            }

            // 3. Past representative days across the Financial Year (starting from April 1)
            // Seed a sample day for each past month to provide substantial MTD & YTD figures
            val fyStart = DateUtils.getYtdStartDate(referenceDate)
            // E.g., 2026-04-15, 2026-05-15, 2026-06-15, 2026-07-15, 2026-08-15, 2026-09-15, 2026-10-15
            val pastMonths = listOf(
                "2026-04-15", "2026-05-15", "2026-06-15",
                "2026-07-15", "2026-08-15", "2026-09-15", "2026-10-15"
            )

            for (mDate in pastMonths) {
                if (mDate < fyStart || mDate >= referenceDate) continue

                sampleStaff.forEachIndexed { idx, staff ->
                    // 15 days of representative volume in each month
                    val monthTarget = 400000.0 + (idx * 20000.0)
                    val monthSales = monthTarget * (0.92 + ((idx * 5) % 17) / 100.0)
                    val bills = 180 + (idx * 15)
                    val qty = (bills * 1.8).toInt()

                    entries.add(
                        SalesEntry(
                            date = mDate,
                            staffId = staff.id,
                            staffName = staff.name,
                            storeName = staff.storeName,
                            dailyTarget = monthTarget,
                            dailySales = monthSales,
                            bills = bills,
                            quantity = qty,
                            remarks = "Monthly consolidated audit log",
                            isDemo = true
                        )
                    )
                }
            }

            dao.insertAllSales(entries)
        }
    }
}
