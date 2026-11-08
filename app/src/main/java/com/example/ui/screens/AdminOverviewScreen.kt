package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material.icons.filled.Storefront
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.SalesEntry
import com.example.ui.components.DailySalesTrendChart
import com.example.ui.components.KpiCard
import com.example.ui.components.StaffRankingMiniChart
import com.example.ui.theme.CardBg
import com.example.ui.theme.CobaltPrimary
import com.example.ui.theme.InfoIndigo
import com.example.ui.theme.NavyBluePrimary
import com.example.ui.theme.SlateBorder
import com.example.ui.theme.SlateDark
import com.example.ui.theme.SlateMuted
import com.example.util.DateUtils
import com.example.util.MisCalculator
import com.example.util.PerformanceSummary
import com.example.util.StaffPerformance

@Composable
fun AdminOverviewScreen(
    selectedDate: String,
    summary: PerformanceSummary,
    allSales: List<SalesEntry>,
    staffRankings: List<StaffPerformance>,
    totalStaffCount: Int,
    totalStoreCount: Int,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // High Level Metrics Grid (Staff count, Store count, Average Ticket Value, UPT)
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                AdminStatCard(
                    title = "Stores Active",
                    value = "$totalStoreCount Stores",
                    icon = Icons.Default.Storefront,
                    iconColor = CobaltPrimary,
                    modifier = Modifier.weight(1f)
                )

                AdminStatCard(
                    title = "Retail Staff",
                    value = "$totalStaffCount Staff",
                    icon = Icons.Default.People,
                    iconColor = InfoIndigo,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                AdminStatCard(
                    title = "Avg Ticket Value (ATV)",
                    value = MisCalculator.formatRupees(summary.daily.averageBillValue),
                    icon = Icons.Default.Calculate,
                    iconColor = NavyBluePrimary,
                    modifier = Modifier.weight(1f)
                )

                AdminStatCard(
                    title = "Units/Txn (UPT)",
                    value = String.format(java.util.Locale.US, "%.1f units", summary.daily.unitsPerTransaction),
                    icon = Icons.Default.ShoppingBag,
                    iconColor = Color(0xFF0D9488),
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Section Title: Executive Performance Cards
        item {
            Text(
                text = "MIS Performance Summary",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = SlateDark
            )
        }

        // 1. Daily Card
        item {
            KpiCard(
                title = "Daily Performance",
                subtitle = DateUtils.formatDisplayDate(selectedDate),
                metric = summary.daily
            )
        }

        // 2. WTD Card
        item {
            KpiCard(
                title = "WTD (Week to Date)",
                subtitle = "${DateUtils.formatDisplayDate(DateUtils.getWtdStartDate(selectedDate))} to ${DateUtils.formatDisplayDate(selectedDate)}",
                metric = summary.wtd
            )
        }

        // 3. MTD Card
        item {
            KpiCard(
                title = "MTD (Month to Date)",
                subtitle = "${DateUtils.formatDisplayDate(DateUtils.getMtdStartDate(selectedDate))} to ${DateUtils.formatDisplayDate(selectedDate)}",
                metric = summary.mtd
            )
        }

        // 4. YTD Card
        item {
            KpiCard(
                title = "YTD (${DateUtils.getFinancialYearLabel(selectedDate)})",
                subtitle = "${DateUtils.formatDisplayDate(DateUtils.getYtdStartDate(selectedDate))} to ${DateUtils.formatDisplayDate(selectedDate)}",
                metric = summary.ytd
            )
        }

        // Section: Visual MIS Charts
        item {
            Text(
                text = "Visual Analytics & Trends",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = SlateDark
            )
        }

        item {
            DailySalesTrendChart(
                entries = allSales,
                selectedDate = selectedDate
            )
        }

        item {
            StaffRankingMiniChart(
                staffList = staffRankings,
                periodLabel = "Daily"
            )
        }
    }
}

@Composable
private fun AdminStatCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.border(1.dp, SlateBorder, RoundedCornerShape(12.dp)),
        colors = CardDefaults.cardColors(containerColor = CardBg),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(iconColor.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconColor,
                    modifier = Modifier.size(18.dp)
                )
            }

            Spacer(modifier = Modifier.width(10.dp))

            Column {
                Text(
                    text = title,
                    fontSize = 11.sp,
                    color = SlateMuted
                )
                Text(
                    text = value,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = SlateDark
                )
            }
        }
    }
}
