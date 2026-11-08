package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.EditNote
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Storefront
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.AppMode
import com.example.ui.theme.CardBg
import com.example.ui.theme.CobaltPrimary
import com.example.ui.theme.DangerRed
import com.example.ui.theme.InfoIndigo
import com.example.ui.theme.NavyBluePrimary
import com.example.ui.theme.SlateBorder
import com.example.ui.theme.SlateDark
import com.example.ui.theme.SlateMuted
import com.example.ui.theme.SuccessGreen
import com.example.util.DateUtils
import com.example.util.MisCalculator
import com.example.util.PerformanceSummary

@Composable
fun HomeScreen(
    selectedDate: String,
    summary: PerformanceSummary,
    onNavigateMode: (AppMode) -> Unit,
    onReloadSampleData: () -> Unit,
    onClearDemoData: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Welcome Banner Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.Transparent)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.horizontalGradient(
                            listOf(NavyBluePrimary, CobaltPrimary)
                        )
                    )
                    .padding(18.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Top
                    ) {
                        Column {
                            Text(
                                text = "Store Manager & Staff",
                                color = Color.White.copy(alpha = 0.85f),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium
                            )
                            Text(
                                text = "MIS Sales Portal",
                                color = Color.White,
                                fontSize = 22.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color.White.copy(alpha = 0.2f))
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = DateUtils.getFinancialYearLabel(selectedDate),
                                color = Color.White,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "Enter daily store & staff sales. System automatically calculates WTD, MTD, YTD & achievement without manual entry.",
                        color = Color.White.copy(alpha = 0.9f),
                        fontSize = 13.sp,
                        lineHeight = 18.sp
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    // Quick Today KPI Pill
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(Color.White.copy(alpha = 0.15f))
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Today's Sales (${DateUtils.formatDisplayDate(selectedDate)})",
                                color = Color.White.copy(alpha = 0.8f),
                                fontSize = 11.sp
                            )
                            Text(
                                text = MisCalculator.formatRupees(summary.daily.sales),
                                color = Color.White,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.ExtraBold
                            )
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = "Target: ${MisCalculator.formatRupees(summary.daily.target)}",
                                color = Color.White.copy(alpha = 0.8f),
                                fontSize = 11.sp
                            )
                            Text(
                                text = "${MisCalculator.formatPercent(summary.daily.achievementPercent)} Achieved",
                                color = if (summary.daily.achievementPercent >= 100.0) SuccessGreen else Color.White,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }

        // Section Title
        Text(
            text = "Select Portal Mode",
            fontSize = 17.sp,
            fontWeight = FontWeight.Bold,
            color = SlateDark
        )

        // Mode 1: Staff Entry Card
        ModeSelectionCard(
            title = "1. Staff Entry",
            badge = "QUICK ENTRY",
            badgeColor = CobaltPrimary,
            description = "For retail sales associates. Large mobile keypad, quick entry of daily sales, target, bills & units with instant confirmation.",
            icon = Icons.Default.Person,
            iconTint = CobaltPrimary,
            testTag = "home_staff_entry_button",
            onClick = { onNavigateMode(AppMode.STAFF_ENTRY) }
        )

        // Mode 2: Store Manager Mobile Entry Portal Card
        ModeSelectionCard(
            title = "2. Store Manager Portal",
            badge = "AUTO MIS",
            badgeColor = InfoIndigo,
            description = "WhatsApp-style rapid reporting workflow. Enter daily figures for any staff/store. Automatically calculates WTD, MTD, YTD & Shortfall.",
            icon = Icons.Default.Storefront,
            iconTint = InfoIndigo,
            testTag = "home_store_manager_button",
            onClick = { onNavigateMode(AppMode.STORE_MANAGER) }
        )

        // Mode 3: Admin Dashboard Card
        ModeSelectionCard(
            title = "3. Admin MIS Dashboard",
            badge = "EXECUTIVE",
            badgeColor = NavyBluePrimary,
            description = "Complete business analytics. Daily trend charts, store/staff performance rankings, reports, CSV export, and entry corrections.",
            icon = Icons.Default.Assessment,
            iconTint = NavyBluePrimary,
            testTag = "home_admin_dashboard_button",
            onClick = { onNavigateMode(AppMode.ADMIN) }
        )

        Spacer(modifier = Modifier.height(6.dp))

        // Demo Data Management Section
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFF1F5F9))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp)
            ) {
                Text(
                    text = "Demo Data Controls",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = SlateDark
                )
                Text(
                    text = "Sample records are loaded for Indian stores (Mumbai, Delhi, Bengaluru, Hyderabad, Chennai). You can reload or clear demo data anytime.",
                    fontSize = 11.sp,
                    color = SlateMuted,
                    lineHeight = 16.sp
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = onReloadSampleData,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("reload_demo_data_button"),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Reload Sample", fontSize = 11.sp)
                    }

                    OutlinedButton(
                        onClick = onClearDemoData,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("clear_demo_data_button"),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = DangerRed)
                    ) {
                        Icon(
                            imageVector = Icons.Default.DeleteSweep,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Clear Demo", fontSize = 11.sp)
                    }
                }
            }
        }
    }
}

@Composable
private fun ModeSelectionCard(
    title: String,
    badge: String,
    badgeColor: Color,
    description: String,
    icon: ImageVector,
    iconTint: Color,
    testTag: String,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag(testTag)
            .border(1.dp, SlateBorder, RoundedCornerShape(14.dp))
            .clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = CardBg),
        shape = RoundedCornerShape(14.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Icon
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(iconTint.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = iconTint,
                    modifier = Modifier.size(26.dp)
                )
            }

            Spacer(modifier = Modifier.width(14.dp))

            // Text Info
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = title,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = SlateDark
                    )
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(badgeColor.copy(alpha = 0.15f))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = badge,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = badgeColor
                        )
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = description,
                    fontSize = 12.sp,
                    color = SlateMuted,
                    lineHeight = 16.sp
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = "Open",
                tint = SlateMuted,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}
