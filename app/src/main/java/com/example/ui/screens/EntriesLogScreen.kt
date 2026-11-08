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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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

@Composable
fun EntriesLogScreen(
    entries: List<SalesEntry>,
    searchQuery: String,
    editingEntry: SalesEntry?,
    entryToDelete: SalesEntry?,
    onSearchChange: (String) -> Unit,
    onStartEdit: (SalesEntry) -> Unit,
    onDismissEdit: () -> Unit,
    onSaveEdit: (SalesEntry) -> Unit,
    onConfirmDelete: (SalesEntry) -> Unit,
    onDismissDelete: () -> Unit,
    onExecuteDelete: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Global Instant Search Bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = onSearchChange,
            placeholder = { Text("Search by Staff, ID, Store or Date...", fontSize = 13.sp) },
            leadingIcon = {
                Icon(Icons.Default.Search, contentDescription = "Search", tint = CobaltPrimary)
            },
            trailingIcon = {
                if (searchQuery.isNotEmpty()) {
                    IconButton(onClick = { onSearchChange("") }) {
                        Icon(Icons.Default.Clear, contentDescription = "Clear search", tint = SlateMuted)
                    }
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .testTag("global_search_input"),
            shape = RoundedCornerShape(12.dp),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = CobaltPrimary,
                unfocusedBorderColor = SlateBorder
            )
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Sales Entries Log (${entries.size})",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = SlateDark
            )
            Text(
                text = "Tap to edit or delete",
                fontSize = 11.sp,
                color = SlateMuted
            )
        }

        if (entries.isEmpty()) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = CardBg)
            ) {
                Box(modifier = Modifier.padding(30.dp), contentAlignment = Alignment.Center) {
                    Text("No sales entries match the search or filter.", color = SlateMuted)
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(entries, key = { it.entryId }) { entry ->
                    EntryLogItem(
                        entry = entry,
                        onEdit = { onStartEdit(entry) },
                        onDelete = { onConfirmDelete(entry) }
                    )
                }
            }
        }
    }

    // Edit Entry Dialog
    if (editingEntry != null) {
        EditEntryDialog(
            entry = editingEntry,
            onDismiss = onDismissEdit,
            onSave = onSaveEdit
        )
    }

    // Delete Confirmation Dialog
    if (entryToDelete != null) {
        AlertDialog(
            onDismissRequest = onDismissDelete,
            icon = {
                Icon(Icons.Default.Warning, contentDescription = null, tint = DangerRed)
            },
            title = {
                Text("Confirm Delete Entry?", fontWeight = FontWeight.Bold)
            },
            text = {
                Text(
                    "Are you sure you want to delete the sales record for ${entryToDelete.staffName} on ${entryToDelete.date} (₹${MisCalculator.formatRupees(entryToDelete.dailySales)})?\n\nThis will automatically recalculate WTD, MTD, and YTD figures."
                )
            },
            confirmButton = {
                Button(
                    onClick = onExecuteDelete,
                    colors = ButtonDefaults.buttonColors(containerColor = DangerRed),
                    modifier = Modifier.testTag("confirm_delete_button")
                ) {
                    Text("Delete Record")
                }
            },
            dismissButton = {
                OutlinedButton(onClick = onDismissDelete) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun EntryLogItem(
    entry: SalesEntry,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    val ach = MisCalculator.calculateAchievementPercent(entry.dailySales, entry.dailyTarget)
    val isMet = ach >= 100.0

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
                .padding(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = entry.staffName,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = SlateDark
                        )
                        if (entry.isDemo) {
                            Spacer(modifier = Modifier.width(6.dp))
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(Color(0xFFE2E8F0))
                                    .padding(horizontal = 5.dp, vertical = 1.dp)
                            ) {
                                Text("DEMO", fontSize = 9.sp, color = SlateMuted, fontWeight = FontWeight.Bold)
                            }
                        }
                    }

                    Text(
                        text = "${entry.storeName} • ID: ${entry.staffId}",
                        fontSize = 11.sp,
                        color = SlateMuted
                    )
                    Text(
                        text = "Date: ${DateUtils.formatDisplayDate(entry.date)}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = CobaltPrimary
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = MisCalculator.formatRupees(entry.dailySales),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = NavyBluePrimary
                    )
                    Text(
                        text = "Tgt: ${MisCalculator.formatRupees(entry.dailyTarget)} (${MisCalculator.formatPercent(ach)})",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (isMet) SuccessGreen else DangerRed
                    )
                }
            }

            if (entry.remarks.isNotBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Remarks: ${entry.remarks}",
                    fontSize = 11.sp,
                    color = SlateDark
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Action Row: Edit & Delete buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${entry.bills} bills • ${entry.quantity} units",
                    fontSize = 11.sp,
                    color = SlateMuted
                )

                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    IconButton(
                        onClick = onEdit,
                        modifier = Modifier
                            .size(32.dp)
                            .testTag("edit_entry_${entry.entryId}")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = "Edit Entry",
                            tint = CobaltPrimary,
                            modifier = Modifier.size(16.dp)
                        )
                    }

                    IconButton(
                        onClick = onDelete,
                        modifier = Modifier
                            .size(32.dp)
                            .testTag("delete_entry_${entry.entryId}")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = "Delete Entry",
                            tint = DangerRed,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun EditEntryDialog(
    entry: SalesEntry,
    onDismiss: () -> Unit,
    onSave: (SalesEntry) -> Unit
) {
    var date by remember { mutableStateOf(entry.date) }
    var sales by remember { mutableStateOf(entry.dailySales.toInt().toString()) }
    var target by remember { mutableStateOf(entry.dailyTarget.toInt().toString()) }
    var bills by remember { mutableStateOf(entry.bills.toString()) }
    var quantity by remember { mutableStateOf(entry.quantity.toString()) }
    var remarks by remember { mutableStateOf(entry.remarks) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text("Edit Sales Entry", fontWeight = FontWeight.Bold, fontSize = 17.sp)
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = "${entry.staffName} (${entry.storeName})",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = CobaltPrimary
                )

                if (errorMessage != null) {
                    Text(text = errorMessage!!, color = DangerRed, fontSize = 11.sp)
                }

                OutlinedTextField(
                    value = date,
                    onValueChange = { date = it },
                    label = { Text("Date (YYYY-MM-DD)") },
                    singleLine = true
                )

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    OutlinedTextField(
                        value = sales,
                        onValueChange = { sales = it },
                        label = { Text("Sales (₹)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = target,
                        onValueChange = { target = it },
                        label = { Text("Target (₹)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    OutlinedTextField(
                        value = bills,
                        onValueChange = { bills = it },
                        label = { Text("Bills") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = quantity,
                        onValueChange = { quantity = it },
                        label = { Text("Units") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                }

                OutlinedTextField(
                    value = remarks,
                    onValueChange = { remarks = it },
                    label = { Text("Remarks") },
                    maxLines = 2
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val sVal = sales.toDoubleOrNull()
                    val tVal = target.toDoubleOrNull()
                    val bVal = bills.toIntOrNull()
                    val qVal = quantity.toIntOrNull()

                    if (sVal == null || sVal < 0) {
                        errorMessage = "Sales amount cannot be negative"
                        return@Button
                    }
                    if (tVal == null || tVal < 0) {
                        errorMessage = "Target cannot be negative"
                        return@Button
                    }
                    if (bVal == null || bVal < 0) {
                        errorMessage = "Bills cannot be negative"
                        return@Button
                    }
                    if (qVal == null || qVal < 0) {
                        errorMessage = "Quantity cannot be negative"
                        return@Button
                    }

                    onSave(
                        entry.copy(
                            date = date,
                            dailySales = sVal,
                            dailyTarget = tVal,
                            bills = bVal,
                            quantity = qVal,
                            remarks = remarks
                        )
                    )
                },
                modifier = Modifier.testTag("save_edit_button")
            ) {
                Text("Save Changes")
            }
        },
        dismissButton = {
            OutlinedButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
