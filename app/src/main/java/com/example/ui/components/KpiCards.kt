package com.example.ui.components

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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.CardBg
import com.example.ui.theme.CobaltPrimary
import com.example.ui.theme.DangerRed
import com.example.ui.theme.DangerRedBg
import com.example.ui.theme.NavyBluePrimary
import com.example.ui.theme.SlateBorder
import com.example.ui.theme.SlateDark
import com.example.ui.theme.SlateMuted
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.SuccessGreenBg
import com.example.ui.theme.WarningAmber
import com.example.ui.theme.WarningAmberBg
import com.example.util.MisCalculator
import com.example.util.MisMetric

@Composable
fun KpiCard(
    title: String,
    subtitle: String,
    metric: MisMetric,
    modifier: Modifier = Modifier
) {
    val achPercent = metric.achievementPercent
    val isTargetMet = achPercent >= 100.0
    val isNearTarget = achPercent in 80.0..99.99

    val statusColor = when {
        isTargetMet -> SuccessGreen
        isNearTarget -> WarningAmber
        else -> DangerRed
    }

    val statusBg = when {
        isTargetMet -> SuccessGreenBg
        isNearTarget -> WarningAmberBg
        else -> DangerRedBg
    }

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
            // Header: Title & Achievement % Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = title,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = SlateDark
                    )
                    Text(
                        text = subtitle,
                        fontSize = 11.sp,
                        color = SlateMuted
                    )
                }

                // Achievement Badge
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(statusBg)
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = when {
                                isTargetMet -> Icons.Default.CheckCircle
                                isNearTarget -> Icons.Default.ArrowUpward
                                else -> Icons.Default.ArrowDownward
                            },
                            contentDescription = null,
                            tint = statusColor,
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = MisCalculator.formatPercent(achPercent),
                            color = statusColor,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Main KPI Value (Sales)
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.Bottom,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "Sales Achieved",
                        fontSize = 11.sp,
                        color = SlateMuted
                    )
                    Text(
                        text = MisCalculator.formatRupees(metric.sales),
                        fontSize = 22.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = NavyBluePrimary
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "Target",
                        fontSize = 11.sp,
                        color = SlateMuted
                    )
                    Text(
                        text = MisCalculator.formatRupees(metric.target),
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = SlateDark
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Progress Bar
            val progress = (achPercent / 100.0).toFloat().coerceIn(0f, 1f)
            LinearProgressIndicator(
                progress = { progress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(RoundedCornerShape(3.dp)),
                color = statusColor,
                trackColor = SlateBorder
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Sub-metrics: Shortfall/Excess + Bills + Quantity
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFFF8FAFC), RoundedCornerShape(8.dp))
                    .padding(horizontal = 8.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Shortfall or Excess
                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (metric.shortfall > 0) {
                        Text(
                            text = "Shortfall: ",
                            fontSize = 11.sp,
                            color = SlateMuted
                        )
                        Text(
                            text = MisCalculator.formatRupees(metric.shortfall),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = DangerRed
                        )
                    } else {
                        Text(
                            text = "Excess: ",
                            fontSize = 11.sp,
                            color = SlateMuted
                        )
                        Text(
                            text = MisCalculator.formatRupees(metric.excess),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = SuccessGreen
                        )
                    }
                }

                // Bills & Units
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.ReceiptLong,
                            contentDescription = "Bills",
                            tint = CobaltPrimary,
                            modifier = Modifier.size(12.dp)
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Text(
                            text = "${metric.bills} bills",
                            fontSize = 11.sp,
                            color = SlateDark
                        )
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.ShoppingBag,
                            contentDescription = "Units",
                            tint = CobaltPrimary,
                            modifier = Modifier.size(12.dp)
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Text(
                            text = "${metric.quantity} units",
                            fontSize = 11.sp,
                            color = SlateDark
                        )
                    }
                }
            }
        }
    }
}
