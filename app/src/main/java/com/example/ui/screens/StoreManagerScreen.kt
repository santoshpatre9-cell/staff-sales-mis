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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Storefront
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.SalesEntry
import com.example.data.model.Staff
import com.example.data.model.Store
import com.example.ui.StoreManagerFormState
import com.example.ui.theme.CardBg
import com.example.ui.theme.CobaltPrimary
import com.example.ui.theme.DangerRed
import com.example.ui.theme.DangerRedBg
import com.example.ui.theme.InfoIndigo
import com.example.ui.theme.NavyBluePrimary
import com.example.ui.theme.SlateBorder
import com.example.ui.theme.SlateDark
import com.example.ui.theme.SlateMuted
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.SuccessGreenBg
import com.example.util.DateUtils
import com.example.util.MisCalculator
import kotlin.math.max

@Composable
fun StoreManagerScreen(
    formState: StoreManagerFormState,
    allStores: List<Store>,
    allStaff: List<Staff>,
    allSales: List<SalesEntry>,
    todayEntries: List<SalesEntry>,
    onSelectStore: (Store) -> Unit,
    onSelectStaff: (Staff) -> Unit,
    onUpdateDate: (String) -> Unit,
    onUpdateTarget: (String) -> Unit,
    onUpdateSales: (String) -> Unit,
    onUpdateBills: (String) -> Unit,
    onUpdateQuantity: (String) -> Unit,
    onUpdateRemarks: (String) -> Unit,
    onSubmit: () -> Unit,
    onClear: () -> Unit,
    modifier: Modifier = Modifier
) {
    var storeMenuExpanded by remember { mutableStateOf(false) }
    var staffMenuExpanded by remember { mutableStateOf(false) }

    // Filter staff for selected store (or all staff if no store selected)
    val availableStaff = if (formState.storeName.isNotBlank()) {
        allStaff.filter { it.storeName == formState.storeName }
    } else {
        allStaff
    }

    // Live calculations for the active staff member being entered
    val inputSales = formState.sales.toDoubleOrNull() ?: 0.0
    val inputTarget = formState.target.toDoubleOrNull() ?: 0.0
    val liveDailyAchPercent = MisCalculator.calculateAchievementPercent(inputSales, inputTarget)
    val liveShortfall = max(0.0, inputTarget - inputSales)
    val liveExcess = max(0.0, inputSales - inputTarget)

    // Calculate live cumulative WTD, MTD, YTD for this staff member (including what's currently in input)
    val wtdStart = DateUtils.getWtdStartDate(formState.date)
    val mtdStart = DateUtils.getMtdStartDate(formState.date)
    val ytdStart = DateUtils.getYtdStartDate(formState.date)

    val pastStaffEntries = allSales.filter {
        it.staffId == formState.staffId && it.date != formState.date && it.date <= formState.date
    }

    val pastWtdSales = pastStaffEntries.filter { it.date >= wtdStart }.sumOf { it.dailySales }
    val pastWtdTarget = pastStaffEntries.filter { it.date >= wtdStart }.sumOf { it.dailyTarget }

    val pastMtdSales = pastStaffEntries.filter { it.date >= mtdStart }.sumOf { it.dailySales }
    val pastMtdTarget = pastStaffEntries.filter { it.date >= mtdStart }.sumOf { it.dailyTarget }

    val pastYtdSales = pastStaffEntries.filter { it.date >= ytdStart }.sumOf { it.dailySales }
    val pastYtdTarget = pastStaffEntries.filter { it.date >= ytdStart }.sumOf { it.dailyTarget }

    val liveWtdSales = pastWtdSales + inputSales
    val liveWtdTarget = pastWtdTarget + inputTarget
    val liveWtdAchPercent = MisCalculator.calculateAchievementPercent(liveWtdSales, liveWtdTarget)

    val liveMtdSales = pastMtdSales + inputSales
    val liveMtdTarget = pastMtdTarget + inputTarget
    val liveMtdAchPercent = MisCalculator.calculateAchievementPercent(liveMtdSales, liveMtdTarget)

    val liveYtdSales = pastYtdSales + inputSales
    val liveYtdTarget = pastYtdTarget + inputTarget
    val liveYtdAchPercent = MisCalculator.calculateAchievementPercent(liveYtdSales, liveYtdTarget)

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Card: WhatsApp / MIS Style Daily Entry
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, SlateBorder, RoundedCornerShape(14.dp)),
                colors = CardDefaults.cardColors(containerColor = CardBg),
                shape = RoundedCornerShape(14.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    // Header
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Store Manager Rapid Entry",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = NavyBluePrimary
                            )
                            Text(
                                text = "Enter daily numbers — WTD, MTD, YTD compute automatically",
                                fontSize = 11.sp,
                                color = SlateMuted
                            )
                        }

                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(InfoIndigo.copy(alpha = 0.12f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Storefront,
                                contentDescription = null,
                                tint = InfoIndigo,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }

                    // Success Feedback Banner
                    if (formState.successMessage != null) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(SuccessGreenBg)
                                .border(1.dp, SuccessGreen.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                                .padding(10.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.CheckCircle,
                                    contentDescription = null,
                                    tint = SuccessGreen,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = formState.successMessage,
                                    color = SuccessGreen,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }

                    // Error Feedback Banner
                    if (formState.errorMessage != null) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(DangerRedBg)
                                .border(1.dp, DangerRed.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                                .padding(10.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.ErrorOutline,
                                    contentDescription = null,
                                    tint = DangerRed,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = formState.errorMessage,
                                    color = DangerRed,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Date Field
                    OutlinedTextField(
                        value = formState.date,
                        onValueChange = onUpdateDate,
                        label = { Text("Date (YYYY-MM-DD)") },
                        leadingIcon = {
                            Icon(Icons.Default.CalendarMonth, contentDescription = null, tint = InfoIndigo)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("sm_input_date"),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = InfoIndigo,
                            unfocusedBorderColor = SlateBorder
                        )
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    // Store Selector Dropdown
                    Box(modifier = Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                            value = formState.storeName,
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Store *") },
                            placeholder = { Text("Select Store") },
                            leadingIcon = {
                                Icon(Icons.Default.Storefront, contentDescription = null, tint = InfoIndigo)
                            },
                            trailingIcon = {
                                Text("Choose ▾", fontSize = 12.sp, color = InfoIndigo, modifier = Modifier.padding(end = 12.dp))
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { storeMenuExpanded = true }
                                .testTag("sm_select_store_trigger"),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = InfoIndigo,
                                unfocusedBorderColor = SlateBorder
                            )
                        )

                        DropdownMenu(
                            expanded = storeMenuExpanded,
                            onDismissRequest = { storeMenuExpanded = false },
                            modifier = Modifier.fillMaxWidth(0.9f)
                        ) {
                            allStores.forEach { store ->
                                DropdownMenuItem(
                                    text = {
                                        Column {
                                            Text(store.name, fontWeight = FontWeight.Bold)
                                            Text(store.location, fontSize = 11.sp, color = SlateMuted)
                                        }
                                    },
                                    onClick = {
                                        onSelectStore(store)
                                        storeMenuExpanded = false
                                    }
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Staff Selector Dropdown
                    Box(modifier = Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                            value = if (formState.staffName.isNotBlank()) "${formState.staffName} (${formState.staffId})" else "",
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Staff Member *") },
                            placeholder = { Text("Select Staff") },
                            leadingIcon = {
                                Icon(Icons.Default.Person, contentDescription = null, tint = InfoIndigo)
                            },
                            trailingIcon = {
                                Text("Choose ▾", fontSize = 12.sp, color = InfoIndigo, modifier = Modifier.padding(end = 12.dp))
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { staffMenuExpanded = true }
                                .testTag("sm_select_staff_trigger"),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = InfoIndigo,
                                unfocusedBorderColor = SlateBorder
                            )
                        )

                        DropdownMenu(
                            expanded = staffMenuExpanded,
                            onDismissRequest = { staffMenuExpanded = false },
                            modifier = Modifier.fillMaxWidth(0.9f)
                        ) {
                            availableStaff.forEach { staff ->
                                DropdownMenuItem(
                                    text = {
                                        Column {
                                            Text(staff.name, fontWeight = FontWeight.Bold)
                                            Text("${staff.id} • ${staff.storeName}", fontSize = 11.sp, color = SlateMuted)
                                        }
                                    },
                                    onClick = {
                                        onSelectStaff(staff)
                                        staffMenuExpanded = false
                                    }
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Target & Sales Input (Side by side)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedTextField(
                            value = formState.target,
                            onValueChange = onUpdateTarget,
                            label = { Text("Daily Target (₹) *") },
                            placeholder = { Text("30000") },
                            leadingIcon = { Text("₹", fontWeight = FontWeight.Bold, color = SlateMuted) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            modifier = Modifier
                                .weight(1f)
                                .testTag("sm_input_target"),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = InfoIndigo,
                                unfocusedBorderColor = SlateBorder
                            )
                        )

                        OutlinedTextField(
                            value = formState.sales,
                            onValueChange = onUpdateSales,
                            label = { Text("Daily Sales (₹) *") },
                            placeholder = { Text("25000") },
                            leadingIcon = { Text("₹", fontWeight = FontWeight.Bold, color = CobaltPrimary) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            modifier = Modifier
                                .weight(1f)
                                .testTag("sm_input_sales"),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = InfoIndigo,
                                unfocusedBorderColor = SlateBorder
                            )
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Bills & Quantity Input
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedTextField(
                            value = formState.bills,
                            onValueChange = onUpdateBills,
                            label = { Text("Bills (Count)") },
                            placeholder = { Text("12") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            modifier = Modifier
                                .weight(1f)
                                .testTag("sm_input_bills"),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = InfoIndigo,
                                unfocusedBorderColor = SlateBorder
                            )
                        )

                        OutlinedTextField(
                            value = formState.quantity,
                            onValueChange = onUpdateQuantity,
                            label = { Text("Quantity (Units)") },
                            placeholder = { Text("18") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            modifier = Modifier
                                .weight(1f)
                                .testTag("sm_input_quantity"),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = InfoIndigo,
                                unfocusedBorderColor = SlateBorder
                            )
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = formState.remarks,
                        onValueChange = onUpdateRemarks,
                        label = { Text("Daily Remarks") },
                        placeholder = { Text("Footfall, campaign, notes") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("sm_input_remarks"),
                        maxLines = 2,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = InfoIndigo,
                            unfocusedBorderColor = SlateBorder
                        )
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    // -------------------------------------------------------------
                    // LIVE AUTOMATIC MIS PREVIEW BOX (HIGHLIGHT FEATURE)
                    // -------------------------------------------------------------
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFFEEF2FF))
                            .border(1.dp, InfoIndigo.copy(alpha = 0.25f), RoundedCornerShape(12.dp))
                            .padding(12.dp)
                    ) {
                        Column {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.AutoAwesome,
                                        contentDescription = null,
                                        tint = InfoIndigo,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "LIVE AUTOMATIC MIS CALCULATION",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = InfoIndigo
                                    )
                                }

                                Text(
                                    text = "Zero manual math",
                                    fontSize = 10.sp,
                                    color = SlateMuted
                                )
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            // Daily metrics: Achievement % & Shortfall / Excess
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text("Daily Achievement", fontSize = 11.sp, color = SlateMuted)
                                    Text(
                                        text = MisCalculator.formatPercent(liveDailyAchPercent),
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = if (liveDailyAchPercent >= 100.0) SuccessGreen else if (liveDailyAchPercent >= 80.0) CobaltPrimary else DangerRed
                                    )
                                }

                                Column(horizontalAlignment = Alignment.End) {
                                    if (liveShortfall > 0) {
                                        Text("Daily Shortfall", fontSize = 11.sp, color = SlateMuted)
                                        Text(
                                            text = MisCalculator.formatRupees(liveShortfall),
                                            fontSize = 15.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = DangerRed
                                        )
                                    } else {
                                        Text("Daily Excess", fontSize = 11.sp, color = SlateMuted)
                                        Text(
                                            text = MisCalculator.formatRupees(liveExcess),
                                            fontSize = 15.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = SuccessGreen
                                        )
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            // Cumulative WTD, MTD, YTD Table
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(Color.White, RoundedCornerShape(8.dp))
                                    .padding(horizontal = 10.dp, vertical = 8.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                AutoMisColumn(
                                    period = "WTD",
                                    sales = liveWtdSales,
                                    target = liveWtdTarget,
                                    achPercent = liveWtdAchPercent
                                )
                                AutoMisColumn(
                                    period = "MTD",
                                    sales = liveMtdSales,
                                    target = liveMtdTarget,
                                    achPercent = liveMtdAchPercent
                                )
                                AutoMisColumn(
                                    period = "YTD",
                                    sales = liveYtdSales,
                                    target = liveYtdTarget,
                                    achPercent = liveYtdAchPercent
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Buttons
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedButton(
                            onClick = onClear,
                            modifier = Modifier
                                .weight(0.35f)
                                .height(50.dp)
                                .testTag("sm_clear_button"),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.Clear, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Clear", fontSize = 13.sp)
                        }

                        Button(
                            onClick = onSubmit,
                            enabled = !formState.isSubmitting,
                            modifier = Modifier
                                .weight(0.65f)
                                .height(50.dp)
                                .testTag("sm_submit_button"),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = InfoIndigo)
                        ) {
                            if (formState.isSubmitting) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(20.dp),
                                    color = Color.White,
                                    strokeWidth = 2.dp
                                )
                            } else {
                                Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Submit & Auto-Calculate",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }

        // Section: Today's Store Status entries
        item {
            Text(
                text = "Today's Logged Sales (${todayEntries.size})",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = SlateDark
            )
        }

        if (todayEntries.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC))
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No records logged for today yet.",
                            fontSize = 12.sp,
                            color = SlateMuted
                        )
                    }
                }
            }
        } else {
            items(todayEntries, key = { it.entryId }) { entry ->
                val ach = MisCalculator.calculateAchievementPercent(entry.dailySales, entry.dailyTarget)
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
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(entry.staffName, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text("${entry.storeName} • ID: ${entry.staffId}", fontSize = 11.sp, color = SlateMuted)
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = MisCalculator.formatRupees(entry.dailySales),
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 15.sp,
                                color = NavyBluePrimary
                            )
                            Text(
                                text = "Tgt: ${MisCalculator.formatRupees(entry.dailyTarget)} (${MisCalculator.formatPercent(ach)})",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (ach >= 100.0) SuccessGreen else DangerRed
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun AutoMisColumn(
    period: String,
    sales: Double,
    target: Double,
    achPercent: Double
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = period,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = SlateDark
        )
        Text(
            text = MisCalculator.formatRupees(sales),
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = NavyBluePrimary
        )
        Text(
            text = MisCalculator.formatPercent(achPercent),
            fontSize = 10.sp,
            fontWeight = FontWeight.SemiBold,
            color = if (achPercent >= 100.0) SuccessGreen else CobaltPrimary
        )
    }
}
