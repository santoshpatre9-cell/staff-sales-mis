package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.ListAlt
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.PieChart
import androidx.compose.material.icons.filled.Storefront
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.SalesEntry
import com.example.ui.AdminTab
import com.example.ui.theme.CardBg
import com.example.ui.theme.CobaltPrimary
import com.example.ui.theme.NavyBluePrimary
import com.example.ui.theme.SlateBorder
import com.example.ui.theme.SlateDark
import com.example.ui.theme.SlateMuted
import com.example.util.PerformanceSummary
import com.example.util.StaffPerformance
import com.example.util.StorePerformance

@Composable
fun AdminScreen(
    currentTab: AdminTab,
    selectedDate: String,
    summary: PerformanceSummary,
    allSales: List<SalesEntry>,
    filteredEntries: List<SalesEntry>,
    staffRankings: List<StaffPerformance>,
    storeRankings: List<StorePerformance>,
    rankingPeriod: String,
    searchQuery: String,
    editingEntry: SalesEntry?,
    entryToDelete: SalesEntry?,
    totalStaffCount: Int,
    totalStoreCount: Int,
    onTabChange: (AdminTab) -> Unit,
    onPeriodChange: (String) -> Unit,
    onSearchChange: (String) -> Unit,
    onStartEdit: (SalesEntry) -> Unit,
    onDismissEdit: () -> Unit,
    onSaveEdit: (SalesEntry) -> Unit,
    onConfirmDelete: (SalesEntry) -> Unit,
    onDismissDelete: () -> Unit,
    onExecuteDelete: () -> Unit,
    onShowMessage: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = CardBg,
                tonalElevation = 8.dp,
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, SlateBorder)
            ) {
                NavigationBarItem(
                    selected = currentTab == AdminTab.OVERVIEW,
                    onClick = { onTabChange(AdminTab.OVERVIEW) },
                    icon = { Icon(Icons.Default.Assessment, contentDescription = "Overview", modifier = Modifier.size(20.dp)) },
                    label = { Text("Overview", fontSize = 10.sp, fontWeight = FontWeight.SemiBold) },
                    colors = navItemColors(),
                    modifier = Modifier.testTag("admin_nav_overview")
                )

                NavigationBarItem(
                    selected = currentTab == AdminTab.STAFF_MIS,
                    onClick = { onTabChange(AdminTab.STAFF_MIS) },
                    icon = { Icon(Icons.Default.People, contentDescription = "Staff", modifier = Modifier.size(20.dp)) },
                    label = { Text("Staff MIS", fontSize = 10.sp, fontWeight = FontWeight.SemiBold) },
                    colors = navItemColors(),
                    modifier = Modifier.testTag("admin_nav_staff")
                )

                NavigationBarItem(
                    selected = currentTab == AdminTab.STORE_MIS,
                    onClick = { onTabChange(AdminTab.STORE_MIS) },
                    icon = { Icon(Icons.Default.Storefront, contentDescription = "Store", modifier = Modifier.size(20.dp)) },
                    label = { Text("Store MIS", fontSize = 10.sp, fontWeight = FontWeight.SemiBold) },
                    colors = navItemColors(),
                    modifier = Modifier.testTag("admin_nav_store")
                )

                NavigationBarItem(
                    selected = currentTab == AdminTab.ENTRIES_LOG,
                    onClick = { onTabChange(AdminTab.ENTRIES_LOG) },
                    icon = { Icon(Icons.Default.ListAlt, contentDescription = "Log", modifier = Modifier.size(20.dp)) },
                    label = { Text("Log & Edit", fontSize = 10.sp, fontWeight = FontWeight.SemiBold) },
                    colors = navItemColors(),
                    modifier = Modifier.testTag("admin_nav_log")
                )

                NavigationBarItem(
                    selected = currentTab == AdminTab.REPORTS,
                    onClick = { onTabChange(AdminTab.REPORTS) },
                    icon = { Icon(Icons.Default.PieChart, contentDescription = "Reports", modifier = Modifier.size(20.dp)) },
                    label = { Text("Reports", fontSize = 10.sp, fontWeight = FontWeight.SemiBold) },
                    colors = navItemColors(),
                    modifier = Modifier.testTag("admin_nav_reports")
                )
            }
        },
        modifier = modifier.fillMaxSize()
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (currentTab) {
                AdminTab.OVERVIEW -> {
                    AdminOverviewScreen(
                        selectedDate = selectedDate,
                        summary = summary,
                        allSales = allSales,
                        staffRankings = staffRankings,
                        totalStaffCount = totalStaffCount,
                        totalStoreCount = totalStoreCount
                    )
                }
                AdminTab.STAFF_MIS -> {
                    StaffMisScreen(
                        staffList = staffRankings,
                        selectedPeriod = rankingPeriod,
                        onPeriodChange = onPeriodChange
                    )
                }
                AdminTab.STORE_MIS -> {
                    StoreMisScreen(
                        storeList = storeRankings,
                        selectedPeriod = rankingPeriod,
                        onPeriodChange = onPeriodChange
                    )
                }
                AdminTab.ENTRIES_LOG -> {
                    EntriesLogScreen(
                        entries = filteredEntries,
                        searchQuery = searchQuery,
                        editingEntry = editingEntry,
                        entryToDelete = entryToDelete,
                        onSearchChange = onSearchChange,
                        onStartEdit = onStartEdit,
                        onDismissEdit = onDismissEdit,
                        onSaveEdit = onSaveEdit,
                        onConfirmDelete = onConfirmDelete,
                        onDismissDelete = onDismissDelete,
                        onExecuteDelete = onExecuteDelete
                    )
                }
                AdminTab.REPORTS -> {
                    ReportsScreen(
                        selectedDate = selectedDate,
                        allSales = allSales,
                        staffList = staffRankings,
                        storeList = storeRankings,
                        onShowMessage = onShowMessage
                    )
                }
            }
        }
    }
}

@Composable
private fun navItemColors() = NavigationBarItemDefaults.colors(
    selectedIconColor = NavyBluePrimary,
    selectedTextColor = NavyBluePrimary,
    unselectedIconColor = SlateMuted,
    unselectedTextColor = SlateMuted,
    indicatorColor = CobaltPrimary.copy(alpha = 0.15f)
)
