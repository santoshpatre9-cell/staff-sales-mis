package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.db.AppDatabase
import com.example.data.repository.SalesRepository
import com.example.ui.AppMode
import com.example.ui.MainViewModel
import com.example.ui.MainViewModelFactory
import com.example.ui.components.TopNavBar
import com.example.ui.screens.AdminScreen
import com.example.ui.screens.HomeScreen
import com.example.ui.screens.StaffEntryScreen
import com.example.ui.screens.StoreManagerScreen
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.SlateBg

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val db = AppDatabase.getInstance(applicationContext)
        val repository = SalesRepository(db.salesDao())
        val viewModel: MainViewModel by viewModels { MainViewModelFactory(repository) }

        // Check if intent contains mode query parameter (e.g., from deep link or web ?mode=staff, ?mode=sm, ?mode=admin)
        val modeQuery = intent?.data?.getQueryParameter("mode") ?: intent?.getStringExtra("mode")
        when (modeQuery?.lowercase()) {
            "staff" -> viewModel.setMode(AppMode.STAFF_ENTRY)
            "sm" -> viewModel.setMode(AppMode.STORE_MANAGER)
            "admin" -> viewModel.setMode(AppMode.ADMIN)
            else -> { /* defaults to HOME */ }
        }

        setContent {
            MyApplicationTheme {
                MainAppContent(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun MainAppContent(viewModel: MainViewModel) {
    val currentMode by viewModel.currentMode.collectAsStateWithLifecycle()
    val adminTab by viewModel.adminTab.collectAsStateWithLifecycle()
    val selectedDate by viewModel.selectedDate.collectAsStateWithLifecycle()
    val selectedStoreFilter by viewModel.selectedStoreFilter.collectAsStateWithLifecycle()
    val rankingPeriod by viewModel.rankingPeriod.collectAsStateWithLifecycle()
    val searchQuery by viewModel.searchQuery.collectAsStateWithLifecycle()
    val editingEntry by viewModel.editingEntry.collectAsStateWithLifecycle()
    val entryToDelete by viewModel.entryToDelete.collectAsStateWithLifecycle()
    val snackbarMessage by viewModel.snackbarMessage.collectAsStateWithLifecycle()

    val staffFormState by viewModel.staffFormState.collectAsStateWithLifecycle()
    val smFormState by viewModel.smFormState.collectAsStateWithLifecycle()

    val allSales by viewModel.allSales.collectAsStateWithLifecycle()
    val allStaff by viewModel.allStaff.collectAsStateWithLifecycle()
    val allStores by viewModel.allStores.collectAsStateWithLifecycle()
    val filteredEntries by viewModel.filteredEntries.collectAsStateWithLifecycle()
    val performanceSummary by viewModel.performanceSummary.collectAsStateWithLifecycle()
    val staffPerformances by viewModel.staffPerformances.collectAsStateWithLifecycle()
    val storePerformances by viewModel.storePerformances.collectAsStateWithLifecycle()
    val todaySubmissions by viewModel.todaySubmissions.collectAsStateWithLifecycle()

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(snackbarMessage) {
        snackbarMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearSnackbar()
        }
    }

    // Handle Back Press to return to Home screen
    if (currentMode != AppMode.HOME) {
        BackHandler {
            viewModel.setMode(AppMode.HOME)
        }
    }

    Scaffold(
        topBar = {
            TopNavBar(
                currentMode = currentMode,
                selectedDate = selectedDate,
                stores = allStores,
                selectedStoreFilter = selectedStoreFilter,
                onModeChange = { viewModel.setMode(it) },
                onDateChange = { viewModel.setSelectedDate(it) },
                onStoreFilterChange = { viewModel.setStoreFilter(it) }
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
        modifier = Modifier
            .fillMaxSize()
            .background(SlateBg)
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(SlateBg)
        ) {
            when (currentMode) {
                AppMode.HOME -> {
                    HomeScreen(
                        selectedDate = selectedDate,
                        summary = performanceSummary,
                        onNavigateMode = { viewModel.setMode(it) },
                        onReloadSampleData = { viewModel.reseedDemoData() },
                        onClearDemoData = { viewModel.clearDemoData() }
                    )
                }
                AppMode.STAFF_ENTRY -> {
                    StaffEntryScreen(
                        formState = staffFormState,
                        allStaff = allStaff,
                        todayEntries = todaySubmissions,
                        onUpdateDate = { viewModel.updateStaffFormDate(it) },
                        onSelectStaff = { viewModel.updateStaffFormStaff(it) },
                        onUpdateSales = { viewModel.updateStaffFormSales(it) },
                        onUpdateTarget = { viewModel.updateStaffFormTarget(it) },
                        onUpdateBills = { viewModel.updateStaffFormBills(it) },
                        onUpdateQuantity = { viewModel.updateStaffFormQuantity(it) },
                        onUpdateRemarks = { viewModel.updateStaffFormRemarks(it) },
                        onSubmit = { viewModel.submitStaffForm() },
                        onClear = { viewModel.clearStaffForm() }
                    )
                }
                AppMode.STORE_MANAGER -> {
                    StoreManagerScreen(
                        formState = smFormState,
                        allStores = allStores,
                        allStaff = allStaff,
                        allSales = allSales,
                        todayEntries = todaySubmissions,
                        onSelectStore = { viewModel.updateSmStore(it) },
                        onSelectStaff = { viewModel.updateSmStaff(it) },
                        onUpdateDate = { viewModel.updateSmDate(it) },
                        onUpdateTarget = { viewModel.updateSmTarget(it) },
                        onUpdateSales = { viewModel.updateSmSales(it) },
                        onUpdateBills = { viewModel.updateSmBills(it) },
                        onUpdateQuantity = { viewModel.updateSmQuantity(it) },
                        onUpdateRemarks = { viewModel.updateSmRemarks(it) },
                        onSubmit = { viewModel.submitSmForm() },
                        onClear = { viewModel.clearSmForm() }
                    )
                }
                AppMode.ADMIN -> {
                    AdminScreen(
                        currentTab = adminTab,
                        selectedDate = selectedDate,
                        summary = performanceSummary,
                        allSales = allSales,
                        filteredEntries = filteredEntries,
                        staffRankings = staffPerformances,
                        storeRankings = storePerformances,
                        rankingPeriod = rankingPeriod,
                        searchQuery = searchQuery,
                        editingEntry = editingEntry,
                        entryToDelete = entryToDelete,
                        totalStaffCount = allStaff.size,
                        totalStoreCount = allStores.size,
                        onTabChange = { viewModel.setAdminTab(it) },
                        onPeriodChange = { viewModel.setRankingPeriod(it) },
                        onSearchChange = { viewModel.setSearchQuery(it) },
                        onStartEdit = { viewModel.startEditingEntry(it) },
                        onDismissEdit = { viewModel.dismissEditingEntry() },
                        onSaveEdit = { viewModel.saveEditedEntry(it) },
                        onConfirmDelete = { viewModel.confirmDeleteEntry(it) },
                        onDismissDelete = { viewModel.dismissDeleteConfirm() },
                        onExecuteDelete = { viewModel.executeDeleteEntry() },
                        onShowMessage = { viewModel.showSnackbar(it) }
                    )
                }
            }
        }
    }
}
