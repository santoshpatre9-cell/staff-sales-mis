package com.example.ui.screens

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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Storefront
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
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
import com.example.ui.theme.NavyBluePrimary
import com.example.ui.theme.SlateBorder
import com.example.ui.theme.SlateDark
import com.example.ui.theme.SlateMuted
import com.example.ui.theme.SuccessGreen
import com.example.util.MisCalculator
import com.example.util.StorePerformance

@Composable
fun StoreMisScreen(
    storeList: List<StorePerformance>,
    selectedPeriod: String,
    onPeriodChange: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Header & Period Filter
        item {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Store Performance & Ranking",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = SlateDark
                    )
                    Text(
                        text = "${storeList.size} Stores",
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
                    val periods = listOf(
                        "DAILY" to "Daily Sales",
                        "WTD" to "WTD Sales",
                        "MTD" to "MTD Sales",
                        "YTD" to "YTD Sales",
                        "ACHIEVEMENT" to "Achievement %"
                    )

                    periods.forEach { (code, label) ->
                        FilterChip(
                            selected = selectedPeriod == code,
                            onClick = { onPeriodChange(code) },
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

        if (storeList.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = CardBg)
                ) {
                    Box(modifier = Modifier.padding(24.dp), contentAlignment = Alignment.Center) {
                        Text("No store performance data found.", color = SlateMuted)
                    }
                }
            }
        } else {
            items(storeList, key = { it.storeName }) { store ->
                StoreMisCard(store = store, period = selectedPeriod)
            }
        }
    }
}

@Composable
private fun StoreMisCard(store: StorePerformance, period: String) {
    val activeMetric = when (period) {
        "WTD" -> store.wtd
        "MTD" -> store.mtd
        "YTD" -> store.ytd
        else -> store.daily
    }

    val achPercent = activeMetric.achievementPercent
    val isMet = achPercent >= 100.0

    val rankBadgeColor = when (store.rank) {
        1 -> Color(0xFFF59E0B) // Gold
        2 -> Color(0xFF94A3B8) // Silver
        3 -> Color(0xFFB45309) // Bronze
        else -> Color(0xFF64748B)
    }

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
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(rankBadgeColor),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "#${store.rank}",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }

                Spacer(modifier = Modifier.width(10.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = store.storeName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = SlateDark
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.People,
                            contentDescription = null,
                            tint = SlateMuted,
                            modifier = Modifier.size(12.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "${store.staffCount} Staff Members",
                            fontSize = 11.sp,
                            color = SlateMuted
                        )
                    }
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(if (isMet) Color(0xFFECFDF5) else Color(0xFFFEF2F2))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = MisCalculator.formatPercent(achPercent),
                        color = if (isMet) SuccessGreen else DangerRed,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Primary Sales & Target
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom
            ) {
                Column {
                    Text(
                        text = "$period Sales",
                        fontSize = 11.sp,
                        color = SlateMuted
                    )
                    Text(
                        text = MisCalculator.formatRupees(activeMetric.sales),
                        fontSize = 18.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = NavyBluePrimary
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "$period Target",
                        fontSize = 11.sp,
                        color = SlateMuted
                    )
                    Text(
                        text = MisCalculator.formatRupees(activeMetric.target),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = SlateDark
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            val progress = (achPercent / 100.0).toFloat().coerceIn(0f, 1f)
            LinearProgressIndicator(
                progress = { progress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(5.dp)
                    .clip(RoundedCornerShape(3.dp)),
                color = if (isMet) SuccessGreen else CobaltPrimary,
                trackColor = SlateBorder
            )

            Spacer(modifier = Modifier.height(10.dp))

            // 4-Period Matrix
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFFF8FAFC), RoundedCornerShape(8.dp))
                    .padding(horizontal = 8.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Daily", fontSize = 10.sp, color = SlateMuted)
                    Text(MisCalculator.formatRupees(store.daily.sales), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Text(MisCalculator.formatPercent(store.daily.achievementPercent), fontSize = 9.sp, color = CobaltPrimary)
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("WTD", fontSize = 10.sp, color = SlateMuted)
                    Text(MisCalculator.formatRupees(store.wtd.sales), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Text(MisCalculator.formatPercent(store.wtd.achievementPercent), fontSize = 9.sp, color = CobaltPrimary)
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("MTD", fontSize = 10.sp, color = SlateMuted)
                    Text(MisCalculator.formatRupees(store.mtd.sales), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Text(MisCalculator.formatPercent(store.mtd.achievementPercent), fontSize = 9.sp, color = CobaltPrimary)
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("YTD", fontSize = 10.sp, color = SlateMuted)
                    Text(MisCalculator.formatRupees(store.ytd.sales), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Text(MisCalculator.formatPercent(store.ytd.achievementPercent), fontSize = 9.sp, color = CobaltPrimary)
                }
            }
        }
    }
}
