package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Storefront
import androidx.compose.material3.Badge
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.Store
import com.example.ui.AppMode
import com.example.ui.theme.CobaltPrimary
import com.example.ui.theme.NavyBluePrimary
import com.example.ui.theme.SlateBorder
import com.example.ui.theme.SlateDark
import com.example.ui.theme.SlateMuted
import com.example.util.DateUtils

@Composable
fun TopNavBar(
    currentMode: AppMode,
    selectedDate: String,
    stores: List<Store>,
    selectedStoreFilter: String,
    onModeChange: (AppMode) -> Unit,
    onDateChange: (String) -> Unit,
    onStoreFilterChange: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var storeMenuExpanded by remember { mutableStateOf(false) }

    Surface(
        color = NavyBluePrimary,
        tonalElevation = 4.dp,
        modifier = modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 8.dp)
        ) {
            // Top Row: App branding + Mode Switcher
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // App Title & Mode
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.clickable { onModeChange(AppMode.HOME) }
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = when (currentMode) {
                                AppMode.HOME -> Icons.Default.Home
                                AppMode.STAFF_ENTRY -> Icons.Default.Person
                                AppMode.STORE_MANAGER -> Icons.Default.Storefront
                                AppMode.ADMIN -> Icons.Default.Assessment
                            },
                            contentDescription = "App Mode Icon",
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    Column {
                        Text(
                            text = "Staff Sales MIS",
                            color = Color.White,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = when (currentMode) {
                                AppMode.HOME -> "Portal Home"
                                AppMode.STAFF_ENTRY -> "Staff Entry Mode"
                                AppMode.STORE_MANAGER -> "Store Manager Portal"
                                AppMode.ADMIN -> "Admin Dashboard"
                            },
                            color = Color.White.copy(alpha = 0.8f),
                            fontSize = 11.sp
                        )
                    }
                }

                // Quick Mode Switch Pills
                Row(
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    ModePill(
                        label = "Staff",
                        isSelected = currentMode == AppMode.STAFF_ENTRY,
                        testTag = "mode_staff_pill",
                        onClick = { onModeChange(AppMode.STAFF_ENTRY) }
                    )
                    ModePill(
                        label = "SM",
                        isSelected = currentMode == AppMode.STORE_MANAGER,
                        testTag = "mode_sm_pill",
                        onClick = { onModeChange(AppMode.STORE_MANAGER) }
                    )
                    ModePill(
                        label = "Admin",
                        isSelected = currentMode == AppMode.ADMIN,
                        testTag = "mode_admin_pill",
                        onClick = { onModeChange(AppMode.ADMIN) }
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Second Row: Date navigation (< Date >) + Quick Filter Chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White.copy(alpha = 0.12f), RoundedCornerShape(10.dp))
                    .padding(horizontal = 8.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Previous Day
                IconButton(
                    onClick = { onDateChange(DateUtils.addDays(selectedDate, -1)) },
                    modifier = Modifier
                        .size(32.dp)
                        .testTag("prev_date_button")
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Previous Day",
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                }

                // Date Label
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(horizontal = 4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.CalendarToday,
                        contentDescription = "Selected Date",
                        tint = Color.White,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = DateUtils.formatDisplayDate(selectedDate),
                        color = Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    if (selectedDate == DateUtils.todayDateString()) {
                        Spacer(modifier = Modifier.width(6.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(CobaltPrimary)
                                .padding(horizontal = 5.dp, vertical = 1.dp)
                        ) {
                            Text(
                                text = "TODAY",
                                color = Color.White,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                // Next Day
                IconButton(
                    onClick = { onDateChange(DateUtils.addDays(selectedDate, 1)) },
                    modifier = Modifier
                        .size(32.dp)
                        .testTag("next_date_button")
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = "Next Day",
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Quick date filter chips: Today, Yesterday, This Week, This Month, FY 2026-27 + Store Filter
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                val todayStr = DateUtils.todayDateString()
                val yesterdayStr = DateUtils.getYesterdayDate(todayStr)

                QuickFilterChip(
                    text = "Today",
                    isSelected = selectedDate == todayStr,
                    onClick = { onDateChange(todayStr) }
                )

                QuickFilterChip(
                    text = "Yesterday",
                    isSelected = selectedDate == yesterdayStr,
                    onClick = { onDateChange(yesterdayStr) }
                )

                QuickFilterChip(
                    text = "Week Start",
                    isSelected = selectedDate == DateUtils.getWtdStartDate(todayStr),
                    onClick = { onDateChange(DateUtils.getWtdStartDate(todayStr)) }
                )

                QuickFilterChip(
                    text = "Month Start",
                    isSelected = selectedDate == DateUtils.getMtdStartDate(todayStr),
                    onClick = { onDateChange(DateUtils.getMtdStartDate(todayStr)) }
                )

                QuickFilterChip(
                    text = DateUtils.getFinancialYearLabel(selectedDate),
                    isSelected = false,
                    onClick = { /* Informational label */ }
                )

                // Store filter dropdown trigger
                Box {
                    QuickFilterChip(
                        text = if (selectedStoreFilter.isBlank()) "All Stores ▾" else "$selectedStoreFilter ▾",
                        isSelected = selectedStoreFilter.isNotBlank(),
                        onClick = { storeMenuExpanded = true }
                    )

                    DropdownMenu(
                        expanded = storeMenuExpanded,
                        onDismissRequest = { storeMenuExpanded = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("All Stores") },
                            onClick = {
                                onStoreFilterChange("")
                                storeMenuExpanded = false
                            }
                        )
                        stores.forEach { store ->
                            DropdownMenuItem(
                                text = { Text(store.name) },
                                onClick = {
                                    onStoreFilterChange(store.name)
                                    storeMenuExpanded = false
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ModePill(
    label: String,
    isSelected: Boolean,
    testTag: String,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .testTag(testTag)
            .clip(RoundedCornerShape(16.dp))
            .background(if (isSelected) Color.White else Color.White.copy(alpha = 0.18f))
            .clickable { onClick() }
            .padding(horizontal = 10.dp, vertical = 5.dp)
    ) {
        Text(
            text = label,
            color = if (isSelected) NavyBluePrimary else Color.White,
            fontSize = 11.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
        )
    }
}

@Composable
private fun QuickFilterChip(
    text: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .background(if (isSelected) CobaltPrimary else Color.White.copy(alpha = 0.15f))
            .clickable { onClick() }
            .padding(horizontal = 9.dp, vertical = 4.dp)
    ) {
        Text(
            text = text,
            color = Color.White,
            fontSize = 11.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
        )
    }
}
