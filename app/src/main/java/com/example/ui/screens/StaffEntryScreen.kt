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
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ReceiptLong
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.SalesEntry
import com.example.data.model.Staff
import com.example.ui.StaffFormState
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
import com.example.util.DateUtils
import com.example.util.MisCalculator

@Composable
fun StaffEntryScreen(
    formState: StaffFormState,
    allStaff: List<Staff>,
    todayEntries: List<SalesEntry>,
    onUpdateDate: (String) -> Unit,
    onSelectStaff: (Staff) -> Unit,
    onUpdateSales: (String) -> Unit,
    onUpdateTarget: (String) -> Unit,
    onUpdateBills: (String) -> Unit,
    onUpdateQuantity: (String) -> Unit,
    onUpdateRemarks: (String) -> Unit,
    onSubmit: () -> Unit,
    onClear: () -> Unit,
    modifier: Modifier = Modifier
) {
    var staffDropdownExpanded by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Section Header
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
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column {
                            Text(
                                text = "Staff Daily Sales Entry",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = NavyBluePrimary
                            )
                            Text(
                                text = "Submit your daily retail counter performance",
                                fontSize = 12.sp,
                                color = SlateMuted
                            )
                        }

                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(CobaltPrimary.copy(alpha = 0.12f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.ReceiptLong,
                                contentDescription = null,
                                tint = CobaltPrimary,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }

                    // Success Feedback Banner
                    if (formState.successMessage != null) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(SuccessGreenBg)
                                .border(1.dp, SuccessGreen.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                                .padding(12.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.CheckCircle,
                                    contentDescription = null,
                                    tint = SuccessGreen,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
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
                        Spacer(modifier = Modifier.height(12.dp))
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(DangerRedBg)
                                .border(1.dp, DangerRed.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                                .padding(12.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.ErrorOutline,
                                    contentDescription = null,
                                    tint = DangerRed,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = formState.errorMessage,
                                    color = DangerRed,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // 1. Date Field
                    OutlinedTextField(
                        value = formState.date,
                        onValueChange = onUpdateDate,
                        label = { Text("Date (YYYY-MM-DD)") },
                        leadingIcon = {
                            Icon(Icons.Default.CalendarMonth, contentDescription = null, tint = CobaltPrimary)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("staff_input_date"),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = CobaltPrimary,
                            unfocusedBorderColor = SlateBorder
                        )
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    // 2. Staff Selector Dropdown
                    Box(modifier = Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                            value = if (formState.staffName.isNotBlank()) "${formState.staffName} (${formState.staffId})" else "",
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Select Staff Name / ID *") },
                            placeholder = { Text("Tap to select yourself") },
                            leadingIcon = {
                                Icon(Icons.Default.Person, contentDescription = null, tint = CobaltPrimary)
                            },
                            trailingIcon = {
                                Text("Select ▾", fontSize = 12.sp, color = CobaltPrimary, modifier = Modifier.padding(end = 12.dp))
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { staffDropdownExpanded = true }
                                .testTag("staff_select_dropdown_trigger"),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = CobaltPrimary,
                                unfocusedBorderColor = SlateBorder
                            )
                        )

                        DropdownMenu(
                            expanded = staffDropdownExpanded,
                            onDismissRequest = { staffDropdownExpanded = false },
                            modifier = Modifier.fillMaxWidth(0.9f)
                        ) {
                            allStaff.forEach { staff ->
                                DropdownMenuItem(
                                    text = {
                                        Column {
                                            Text(staff.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                            Text("ID: ${staff.id} • ${staff.storeName}", fontSize = 11.sp, color = SlateMuted)
                                        }
                                    },
                                    onClick = {
                                        onSelectStaff(staff)
                                        staffDropdownExpanded = false
                                    }
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // 3. Store Name (Auto-filled)
                    OutlinedTextField(
                        value = formState.storeName,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Store Name") },
                        leadingIcon = {
                            Icon(Icons.Default.Storefront, contentDescription = null, tint = CobaltPrimary)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("staff_input_store"),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = CobaltPrimary,
                            unfocusedBorderColor = SlateBorder
                        )
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    // 4. Sales Amount & Target Fields (Side by side)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedTextField(
                            value = formState.sales,
                            onValueChange = onUpdateSales,
                            label = { Text("Daily Sales (₹) *") },
                            placeholder = { Text("e.g. 25000") },
                            leadingIcon = {
                                Text("₹", fontWeight = FontWeight.Bold, color = CobaltPrimary)
                            },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            modifier = Modifier
                                .weight(1f)
                                .testTag("staff_input_sales"),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = CobaltPrimary,
                                unfocusedBorderColor = SlateBorder
                            )
                        )

                        OutlinedTextField(
                            value = formState.target,
                            onValueChange = onUpdateTarget,
                            label = { Text("Daily Target (₹)") },
                            placeholder = { Text("e.g. 30000") },
                            leadingIcon = {
                                Text("₹", fontWeight = FontWeight.Bold, color = SlateMuted)
                            },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            modifier = Modifier
                                .weight(1f)
                                .testTag("staff_input_target"),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = CobaltPrimary,
                                unfocusedBorderColor = SlateBorder
                            )
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // 5. Bills & Quantity (Side by side)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedTextField(
                            value = formState.bills,
                            onValueChange = onUpdateBills,
                            label = { Text("Bills (Count)") },
                            placeholder = { Text("e.g. 15") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            modifier = Modifier
                                .weight(1f)
                                .testTag("staff_input_bills"),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = CobaltPrimary,
                                unfocusedBorderColor = SlateBorder
                            )
                        )

                        OutlinedTextField(
                            value = formState.quantity,
                            onValueChange = onUpdateQuantity,
                            label = { Text("Quantity (Units)") },
                            placeholder = { Text("e.g. 24") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            modifier = Modifier
                                .weight(1f)
                                .testTag("staff_input_quantity"),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = CobaltPrimary,
                                unfocusedBorderColor = SlateBorder
                            )
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // 6. Remarks
                    OutlinedTextField(
                        value = formState.remarks,
                        onValueChange = onUpdateRemarks,
                        label = { Text("Remarks (Optional)") },
                        placeholder = { Text("Footfall, top sellers, offers, etc.") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("staff_input_remarks"),
                        maxLines = 2,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = CobaltPrimary,
                            unfocusedBorderColor = SlateBorder
                        )
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Action Buttons (Submit & Clear)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedButton(
                            onClick = onClear,
                            modifier = Modifier
                                .weight(0.35f)
                                .height(50.dp)
                                .testTag("staff_clear_button"),
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
                                .testTag("staff_submit_button"),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = CobaltPrimary)
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
                                    text = "Submit Daily Sales",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }

        // Section 2: Today's Submitted Entries
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Today's Submissions (${todayEntries.size})",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = SlateDark
                )
                Text(
                    text = DateUtils.formatDisplayDate(formState.date),
                    fontSize = 11.sp,
                    color = SlateMuted
                )
            }
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
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No sales entries submitted yet for today.\nFill the form above to record your numbers.",
                            fontSize = 12.sp,
                            color = SlateMuted,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                    }
                }
            }
        } else {
            items(todayEntries, key = { it.entryId }) { entry ->
                TodaySubmissionItem(entry = entry)
            }
        }
    }
}

@Composable
private fun TodaySubmissionItem(entry: SalesEntry) {
    val achPercent = MisCalculator.calculateAchievementPercent(entry.dailySales, entry.dailyTarget)
    val isMet = achPercent >= 100.0

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
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = entry.staffName,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = SlateDark
                )
                Text(
                    text = "${entry.storeName} • ID: ${entry.staffId}",
                    fontSize = 11.sp,
                    color = SlateMuted
                )
                if (entry.remarks.isNotBlank()) {
                    Text(
                        text = "\"${entry.remarks}\"",
                        fontSize = 11.sp,
                        color = CobaltPrimary
                    )
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = MisCalculator.formatRupees(entry.dailySales),
                    fontSize = 15.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = NavyBluePrimary
                )
                Text(
                    text = "Tgt: ${MisCalculator.formatRupees(entry.dailyTarget)} • ${MisCalculator.formatPercent(achPercent)}",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = if (isMet) SuccessGreen else DangerRed
                )
                Text(
                    text = "${entry.bills} bills • ${entry.quantity} units",
                    fontSize = 10.sp,
                    color = SlateMuted
                )
            }
        }
    }
}
