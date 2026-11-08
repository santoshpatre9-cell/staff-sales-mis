package com.example.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.nativeCanvas
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

@Composable
fun DailySalesTrendChart(
    entries: List<SalesEntry>,
    selectedDate: String,
    modifier: Modifier = Modifier
) {
    // Take past 7 days up to selectedDate
    val dates = (6 downTo 0).map { DateUtils.addDays(selectedDate, -it) }
    val grouped = entries.groupBy { it.date }

    val dailyData = dates.map { date ->
        val list = grouped[date] ?: emptyList()
        val sales = list.sumOf { it.dailySales }
        val target = list.sumOf { it.dailyTarget }
        Triple(date, sales, target)
    }

    val maxVal = dailyData.maxOfOrNull { maxOf(it.second, it.third) }?.takeIf { it > 0 } ?: 100000.0

    Card(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, SlateBorder, RoundedCornerShape(14.dp)),
        colors = CardDefaults.cardColors(containerColor = CardBg),
        shape = RoundedCornerShape(14.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Daily Sales Trend (7-Day)",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = SlateDark
                    )
                    Text(
                        text = "Sales vs Target across stores",
                        fontSize = 11.sp,
                        color = SlateMuted
                    )
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(CobaltPrimary)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Sales", fontSize = 10.sp, color = SlateMuted)
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(DangerRed)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Target", fontSize = 10.sp, color = SlateMuted)
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Canvas Bar Chart
            Canvas(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(140.dp)
            ) {
                val canvasWidth = size.width
                val canvasHeight = size.height
                val bottomLabelSpace = 25f
                val chartHeight = canvasHeight - bottomLabelSpace
                val barCount = dailyData.size
                val itemWidth = canvasWidth / barCount
                val barWidth = itemWidth * 0.45f

                // Draw background grid lines
                val gridLines = 3
                for (i in 0..gridLines) {
                    val y = chartHeight * (i.toFloat() / gridLines)
                    drawLine(
                        color = Color(0xFFF1F5F9),
                        start = Offset(0f, y),
                        end = Offset(canvasWidth, y),
                        strokeWidth = 1f
                    )
                }

                dailyData.forEachIndexed { index, item ->
                    val date = item.first
                    val sales = item.second
                    val target = item.third

                    val salesHeight = ((sales / maxVal) * chartHeight).toFloat().coerceIn(4f, chartHeight)
                    val targetHeight = ((target / maxVal) * chartHeight).toFloat().coerceIn(4f, chartHeight)

                    val centerX = index * itemWidth + itemWidth / 2f
                    val barLeft = centerX - barWidth / 2f
                    val barTop = chartHeight - salesHeight

                    // Draw Sales bar
                    val barColor = if (sales >= target && target > 0) SuccessGreen else CobaltPrimary
                    drawRoundRect(
                        color = barColor,
                        topLeft = Offset(barLeft, barTop),
                        size = Size(barWidth, salesHeight),
                        cornerRadius = CornerRadius(6f, 6f)
                    )

                    // Draw Target indicator tick line
                    if (target > 0) {
                        val targetY = chartHeight - targetHeight
                        drawLine(
                            color = DangerRed,
                            start = Offset(barLeft - 2f, targetY),
                            end = Offset(barLeft + barWidth + 2f, targetY),
                            strokeWidth = 3f
                        )
                    }

                    // Draw date text
                    val shortDate = DateUtils.formatShortDate(date).substring(0, 5) // "07/11"
                    drawContext.canvas.nativeCanvas.apply {
                        val paint = android.graphics.Paint().apply {
                            color = android.graphics.Color.DKGRAY
                            textSize = 24f
                            textAlign = android.graphics.Paint.Align.CENTER
                            isAntiAlias = true
                        }
                        drawText(
                            shortDate,
                            centerX,
                            canvasHeight - 4f,
                            paint
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun StaffRankingMiniChart(
    staffList: List<StaffPerformance>,
    periodLabel: String,
    modifier: Modifier = Modifier
) {
    val topStaff = staffList.take(5)
    val maxSales = topStaff.maxOfOrNull { it.daily.sales }?.takeIf { it > 0 } ?: 50000.0

    Card(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, SlateBorder, RoundedCornerShape(14.dp)),
        colors = CardDefaults.cardColors(containerColor = CardBg),
        shape = RoundedCornerShape(14.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Top Performers ($periodLabel)",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = SlateDark
                )
                Text(
                    text = "${topStaff.size} staff listed",
                    fontSize = 11.sp,
                    color = SlateMuted
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            topStaff.forEachIndexed { index, staff ->
                val sales = when (periodLabel) {
                    "WTD" -> staff.wtd.sales
                    "MTD" -> staff.mtd.sales
                    "YTD" -> staff.ytd.sales
                    else -> staff.daily.sales
                }
                val achPercent = when (periodLabel) {
                    "WTD" -> staff.wtd.achievementPercent
                    "MTD" -> staff.mtd.achievementPercent
                    "YTD" -> staff.ytd.achievementPercent
                    else -> staff.daily.achievementPercent
                }

                val rankBadgeColor = when (index) {
                    0 -> Color(0xFFF59E0B) // Gold
                    1 -> Color(0xFF94A3B8) // Silver
                    2 -> Color(0xFFB45309) // Bronze
                    else -> Color(0xFFE2E8F0)
                }

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Rank badge
                    Box(
                        modifier = Modifier
                            .size(24.dp)
                            .clip(CircleShape)
                            .background(rankBadgeColor),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "#${index + 1}",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (index < 3) Color.White else SlateDark
                        )
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = staff.staffName,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = SlateDark
                            )
                            Text(
                                text = MisCalculator.formatRupees(sales),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = NavyBluePrimary
                            )
                        }

                        Spacer(modifier = Modifier.height(3.dp))

                        // Progress Bar
                        val fraction = (sales / maxSales).toFloat().coerceIn(0.05f, 1f)
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(5.dp)
                                .clip(RoundedCornerShape(3.dp))
                                .background(SlateBorder)
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth(fraction)
                                    .height(5.dp)
                                    .clip(RoundedCornerShape(3.dp))
                                    .background(if (achPercent >= 100.0) SuccessGreen else CobaltPrimary)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    Text(
                        text = MisCalculator.formatPercent(achPercent),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (achPercent >= 100.0) SuccessGreen else SlateMuted
                    )
                }
            }
        }
    }
}
