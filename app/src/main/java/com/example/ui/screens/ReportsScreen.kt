package com.example.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Print
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.SalesEntry
import com.example.ui.theme.CardBg
import com.example.ui.theme.CobaltPrimary
import com.example.ui.theme.DangerRed
import com.example.ui.theme.NavyBluePrimary
import com.example.ui.theme.SlateBorder
import com.example.ui.theme.SlateDark
import com.example.ui.theme.SlateMuted
import com.example.ui.theme.SuccessGreen
import com.example.util.DateUtils
import com.example.util.MisCalculator
import com.example.util.StaffPerformance
import com.example.util.StorePerformance

enum class ReportType {
    DAILY,
    WTD,
    MTD,
    YTD,
    STAFF_WISE,
    STORE_WISE
}

@Composable
fun ReportsScreen(
    selectedDate: String,
    allSales: List<SalesEntry>,
    staffList: List<StaffPerformance>,
    storeList: List<StorePerformance>,
    onShowMessage: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var reportType by remember { mutableStateOf(ReportType.DAILY) }

    val wtdStart = DateUtils.getWtdStartDate(selectedDate)
    val mtdStart = DateUtils.getMtdStartDate(selectedDate)
    val ytdStart = DateUtils.getYtdStartDate(selectedDate)

    // Filtered sales for the report period
    val periodEntries = when (reportType) {
        ReportType.DAILY -> allSales.filter { it.date == selectedDate }
        ReportType.WTD -> allSales.filter { it.date in wtdStart..selectedDate }
        ReportType.MTD -> allSales.filter { it.date in mtdStart..selectedDate }
        ReportType.YTD -> allSales.filter { it.date in ytdStart..selectedDate }
        ReportType.STAFF_WISE, ReportType.STORE_WISE -> allSales.filter { it.date <= selectedDate }
    }

    val totalSales = periodEntries.sumOf { it.dailySales }
    val totalTarget = periodEntries.sumOf { it.dailyTarget }
    val totalBills = periodEntries.sumOf { it.bills }
    val totalQty = periodEntries.sumOf { it.quantity }
    val achPercent = MisCalculator.calculateAchievementPercent(totalSales, totalTarget)

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Section Header & Selector
        item {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Executive MIS Reports",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = SlateDark
                    )
                    Text(
                        text = DateUtils.formatDisplayDate(selectedDate),
                        fontSize = 12.sp,
                        color = SlateMuted
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    ReportType.entries.forEach { type ->
                        val label = when (type) {
                            ReportType.DAILY -> "Daily"
                            ReportType.WTD -> "WTD"
                            ReportType.MTD -> "MTD"
                            ReportType.YTD -> "YTD"
                            ReportType.STAFF_WISE -> "Staff-wise"
                            ReportType.STORE_WISE -> "Store-wise"
                        }

                        FilterChip(
                            selected = reportType == type,
                            onClick = { reportType = type },
                            label = { Text(label, fontSize = 11.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = CobaltPrimary,
                                selectedLabelColor = Color.White
                            )
                        )
                    }
                }
            }
        }

        // Summary Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, SlateBorder, RoundedCornerShape(12.dp)),
                colors = CardDefaults.cardColors(containerColor = CardBg),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp)
                ) {
                    Text(
                        text = "${reportType.name} CONSOLIDATED AUDIT",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = CobaltPrimary
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Bottom
                    ) {
                        Column {
                            Text("Total Sales Achieved", fontSize = 11.sp, color = SlateMuted)
                            Text(
                                text = MisCalculator.formatRupees(totalSales),
                                fontSize = 20.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = NavyBluePrimary
                            )
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text("Target: ${MisCalculator.formatRupees(totalTarget)}", fontSize = 11.sp, color = SlateMuted)
                            Text(
                                text = "${MisCalculator.formatPercent(achPercent)} Target Met",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (achPercent >= 100.0) SuccessGreen else DangerRed
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFF8FAFC), RoundedCornerShape(8.dp))
                            .padding(8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Total Bills: $totalBills", fontSize = 11.sp, color = SlateDark)
                        Text("Total Units: $totalQty", fontSize = 11.sp, color = SlateDark)
                        val avg = if (totalBills > 0) totalSales / totalBills else 0.0
                        Text("Avg ATV: ${MisCalculator.formatRupees(avg)}", fontSize = 11.sp, color = CobaltPrimary, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Action Buttons: Export CSV & Copy Print Report
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = {
                        val csv = generateCsv(reportType, periodEntries, staffList, storeList)
                        shareCsv(context, csv, "MIS_Report_${reportType.name}_$selectedDate.csv")
                        onShowMessage("CSV report ready for export / sharing!")
                    },
                    modifier = Modifier
                        .weight(1f)
                        .testTag("export_csv_button"),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = CobaltPrimary)
                ) {
                    Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Export CSV", fontSize = 12.sp)
                }

                OutlinedButton(
                    onClick = {
                        val text = generatePrintableText(reportType, selectedDate, totalSales, totalTarget, achPercent, periodEntries, staffList, storeList)
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        val clip = ClipData.newPlainText("MIS Report", text)
                        clipboard.setPrimaryClip(clip)
                        onShowMessage("Printable MIS report copied to clipboard!")
                    },
                    modifier = Modifier
                        .weight(1f)
                        .testTag("copy_print_report_button"),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Copy Report", fontSize = 12.sp)
                }
            }
        }

        // Section: Detailed Table / List
        item {
            Text(
                text = "Report Breakdown Table",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = SlateDark
            )
        }

        when (reportType) {
            ReportType.STAFF_WISE -> {
                items(staffList, key = { it.staffId }) { staff ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, SlateBorder, RoundedCornerShape(10.dp)),
                        colors = CardDefaults.cardColors(containerColor = CardBg),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("#${staff.rank} ${staff.staffName}", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                Text(MisCalculator.formatRupees(staff.daily.sales), fontWeight = FontWeight.Bold, color = NavyBluePrimary)
                            }
                            Text("${staff.storeName} • ID: ${staff.staffId}", fontSize = 11.sp, color = SlateMuted)
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("WTD: ${MisCalculator.formatRupees(staff.wtd.sales)}", fontSize = 11.sp, color = SlateDark)
                                Text("MTD: ${MisCalculator.formatRupees(staff.mtd.sales)}", fontSize = 11.sp, color = SlateDark)
                                Text("YTD: ${MisCalculator.formatRupees(staff.ytd.sales)}", fontSize = 11.sp, color = SlateDark)
                            }
                        }
                    }
                }
            }
            ReportType.STORE_WISE -> {
                items(storeList, key = { it.storeName }) { store ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, SlateBorder, RoundedCornerShape(10.dp)),
                        colors = CardDefaults.cardColors(containerColor = CardBg),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("#${store.rank} ${store.storeName}", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                Text(MisCalculator.formatRupees(store.daily.sales), fontWeight = FontWeight.Bold, color = NavyBluePrimary)
                            }
                            Text("${store.staffCount} Staff", fontSize = 11.sp, color = SlateMuted)
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("WTD: ${MisCalculator.formatRupees(store.wtd.sales)}", fontSize = 11.sp, color = SlateDark)
                                Text("MTD: ${MisCalculator.formatRupees(store.mtd.sales)}", fontSize = 11.sp, color = SlateDark)
                                Text("YTD: ${MisCalculator.formatRupees(store.ytd.sales)}", fontSize = 11.sp, color = SlateDark)
                            }
                        }
                    }
                }
            }
            else -> {
                items(periodEntries, key = { it.entryId }) { entry ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, SlateBorder, RoundedCornerShape(10.dp)),
                        colors = CardDefaults.cardColors(containerColor = CardBg),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(10.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("${entry.date} • ${entry.staffName}", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                Text(entry.storeName, fontSize = 11.sp, color = SlateMuted)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text(MisCalculator.formatRupees(entry.dailySales), fontWeight = FontWeight.Bold, color = NavyBluePrimary)
                                Text("Tgt: ${MisCalculator.formatRupees(entry.dailyTarget)}", fontSize = 10.sp, color = SlateMuted)
                            }
                        }
                    }
                }
            }
        }
    }
}

private fun generateCsv(
    type: ReportType,
    entries: List<SalesEntry>,
    staffList: List<StaffPerformance>,
    storeList: List<StorePerformance>
): String {
    val sb = StringBuilder()
    when (type) {
        ReportType.STAFF_WISE -> {
            sb.append("Rank,Staff ID,Staff Name,Store,Daily Sales,Daily Target,Daily Ach %,WTD Sales,MTD Sales,YTD Sales\n")
            staffList.forEach { s ->
                sb.append("${s.rank},\"${s.staffId}\",\"${s.staffName}\",\"${s.storeName}\",${s.daily.sales},${s.daily.target},${s.daily.achievementPercent},${s.wtd.sales},${s.mtd.sales},${s.ytd.sales}\n")
            }
        }
        ReportType.STORE_WISE -> {
            sb.append("Rank,Store Name,Staff Count,Daily Sales,Daily Target,Daily Ach %,WTD Sales,MTD Sales,YTD Sales\n")
            storeList.forEach { st ->
                sb.append("${st.rank},\"${st.storeName}\",${st.staffCount},${st.daily.sales},${st.daily.target},${st.daily.achievementPercent},${st.wtd.sales},${st.mtd.sales},${st.ytd.sales}\n")
            }
        }
        else -> {
            sb.append("Entry ID,Date,Staff ID,Staff Name,Store,Daily Sales,Daily Target,Bills,Quantity,Remarks\n")
            entries.forEach { e ->
                sb.append("${e.entryId},${e.date},\"${e.staffId}\",\"${e.staffName}\",\"${e.storeName}\",${e.dailySales},${e.dailyTarget},${e.bills},${e.quantity},\"${e.remarks}\"\n")
            }
        }
    }
    return sb.toString()
}

private fun generatePrintableText(
    type: ReportType,
    date: String,
    totalSales: Double,
    totalTarget: Double,
    achPercent: Double,
    entries: List<SalesEntry>,
    staffList: List<StaffPerformance>,
    storeList: List<StorePerformance>
): String {
    val sb = StringBuilder()
    sb.append("==================================================\n")
    sb.append("STAFF SALES TRACKER & STORE MANAGER MIS PORTAL\n")
    sb.append("REPORT: ${type.name} | DATE: $date\n")
    sb.append("==================================================\n")
    sb.append("Total Sales:   ${MisCalculator.formatRupees(totalSales)}\n")
    sb.append("Total Target:  ${MisCalculator.formatRupees(totalTarget)}\n")
    sb.append("Achievement:   ${MisCalculator.formatPercent(achPercent)}\n")
    sb.append("--------------------------------------------------\n")

    when (type) {
        ReportType.STAFF_WISE -> {
            staffList.forEach { s ->
                sb.append("#${s.rank} ${s.staffName} (${s.storeName}) - Sales: ${MisCalculator.formatRupees(s.daily.sales)} | WTD: ${MisCalculator.formatRupees(s.wtd.sales)} | MTD: ${MisCalculator.formatRupees(s.mtd.sales)} | YTD: ${MisCalculator.formatRupees(s.ytd.sales)}\n")
            }
        }
        ReportType.STORE_WISE -> {
            storeList.forEach { st ->
                sb.append("#${st.rank} ${st.storeName} - Daily: ${MisCalculator.formatRupees(st.daily.sales)} | WTD: ${MisCalculator.formatRupees(st.wtd.sales)} | MTD: ${MisCalculator.formatRupees(st.mtd.sales)} | YTD: ${MisCalculator.formatRupees(st.ytd.sales)}\n")
            }
        }
        else -> {
            entries.forEach { e ->
                sb.append("${e.date} | ${e.staffName} | ${e.storeName} | Sales: ${MisCalculator.formatRupees(e.dailySales)} (Tgt: ${MisCalculator.formatRupees(e.dailyTarget)})\n")
            }
        }
    }
    sb.append("==================================================\n")
    return sb.toString()
}

private fun shareCsv(context: Context, csvData: String, fileName: String) {
    try {
        val sendIntent = Intent().apply {
            action = Intent.ACTION_SEND
            putExtra(Intent.EXTRA_TEXT, csvData)
            putExtra(Intent.EXTRA_TITLE, fileName)
            type = "text/csv"
        }
        val shareIntent = Intent.createChooser(sendIntent, "Export Sales MIS Report")
        context.startActivity(shareIntent)
    } catch (e: Exception) {
        // Fallback: Copy to clipboard if no share sheet handler available
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        val clip = ClipData.newPlainText("MIS CSV", csvData)
        clipboard.setPrimaryClip(clip)
    }
}
