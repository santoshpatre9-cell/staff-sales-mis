package com.example.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.data.model.SalesEntry
import com.example.data.model.Staff
import com.example.data.model.Store
import com.example.data.repository.SalesRepository
import com.example.util.DateUtils
import com.example.util.MisCalculator
import com.example.util.PerformanceSummary
import com.example.util.StaffPerformance
import com.example.util.StorePerformance
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

enum class AppMode {
    HOME,
    STAFF_ENTRY,
    STORE_MANAGER,
    ADMIN
}

enum class AdminTab {
    OVERVIEW,
    STAFF_MIS,
    STORE_MIS,
    ENTRIES_LOG,
    REPORTS
}

data class StaffFormState(
    val date: String = DateUtils.todayDateString(),
    val staffId: String = "",
    val staffName: String = "",
    val storeName: String = "",
    val sales: String = "",
    val target: String = "",
    val bills: String = "",
    val quantity: String = "",
    val remarks: String = "",
    val isSubmitting: Boolean = false,
    val successMessage: String? = null,
    val errorMessage: String? = null
)

data class StoreManagerFormState(
    val date: String = DateUtils.todayDateString(),
    val storeName: String = "",
    val staffId: String = "",
    val staffName: String = "",
    val target: String = "",
    val sales: String = "",
    val bills: String = "",
    val quantity: String = "",
    val remarks: String = "",
    val isSubmitting: Boolean = false,
    val successMessage: String? = null,
    val errorMessage: String? = null
)

class MainViewModel(private val repository: SalesRepository) : ViewModel() {

    // Current navigation mode
    private val _currentMode = MutableStateFlow(AppMode.HOME)
    val currentMode: StateFlow<AppMode> = _currentMode

    // Admin active sub-tab
    private val _adminTab = MutableStateFlow(AdminTab.OVERVIEW)
    val adminTab: StateFlow<AdminTab> = _adminTab

    // Selected MIS date (defaults to today)
    private val _selectedDate = MutableStateFlow(DateUtils.todayDateString())
    val selectedDate: StateFlow<String> = _selectedDate

    // Filter by store (empty = all)
    private val _selectedStoreFilter = MutableStateFlow("")
    val selectedStoreFilter: StateFlow<String> = _selectedStoreFilter

    // Filter by period for rankings ("DAILY", "WTD", "MTD", "YTD", "ACHIEVEMENT")
    private val _rankingPeriod = MutableStateFlow("DAILY")
    val rankingPeriod: StateFlow<String> = _rankingPeriod

    // Search query
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery

    // Active entry being edited
    private val _editingEntry = MutableStateFlow<SalesEntry?>(null)
    val editingEntry: StateFlow<SalesEntry?> = _editingEntry

    // Confirm delete entry
    private val _entryToDelete = MutableStateFlow<SalesEntry?>(null)
    val entryToDelete: StateFlow<SalesEntry?> = _entryToDelete

    // Notification snackbar message
    private val _snackbarMessage = MutableStateFlow<String?>(null)
    val snackbarMessage: StateFlow<String?> = _snackbarMessage

    // Form states
    private val _staffFormState = MutableStateFlow(StaffFormState())
    val staffFormState: StateFlow<StaffFormState> = _staffFormState

    private val _smFormState = MutableStateFlow(StoreManagerFormState())
    val smFormState: StateFlow<StoreManagerFormState> = _smFormState

    // Data streams from Repository
    val allSales: StateFlow<List<SalesEntry>> = repository.allSales
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val allStaff: StateFlow<List<Staff>> = repository.allStaff
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val allStores: StateFlow<List<Store>> = repository.allStores
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Overall summary for the selected date
    val performanceSummary: StateFlow<PerformanceSummary> = combine(
        allSales,
        _selectedDate,
        _selectedStoreFilter
    ) { sales, date, storeFilter ->
        val relevantSales = if (storeFilter.isBlank()) sales else sales.filter { it.storeName == storeFilter }
        MisCalculator.calculateSummary(relevantSales, date)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), PerformanceSummary())

    // Staff performance list with ranking
    val staffPerformances: StateFlow<List<StaffPerformance>> = combine(
        allSales,
        _selectedDate,
        _rankingPeriod,
        _selectedStoreFilter
    ) { sales, date, period, storeFilter ->
        val relevantSales = if (storeFilter.isBlank()) sales else sales.filter { it.storeName == storeFilter }
        MisCalculator.calculateStaffPerformance(relevantSales, date, period)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Store performance list with ranking
    val storePerformances: StateFlow<List<StorePerformance>> = combine(
        allSales,
        _selectedDate,
        _rankingPeriod
    ) { sales, date, period ->
        MisCalculator.calculateStorePerformance(sales, date, period)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Filtered entries for Log & Search
    val filteredEntries: StateFlow<List<SalesEntry>> = combine(
        allSales,
        _searchQuery,
        _selectedStoreFilter,
        _selectedDate
    ) { sales, query, storeFilter, date ->
        sales.filter { entry ->
            val matchStore = storeFilter.isBlank() || entry.storeName == storeFilter
            val matchQuery = query.isBlank() ||
                    entry.staffName.contains(query, ignoreCase = true) ||
                    entry.staffId.contains(query, ignoreCase = true) ||
                    entry.storeName.contains(query, ignoreCase = true) ||
                    entry.date.contains(query, ignoreCase = true) ||
                    entry.remarks.contains(query, ignoreCase = true)
            matchStore && matchQuery
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Today's submitted entries
    val todaySubmissions: StateFlow<List<SalesEntry>> = combine(
        allSales,
        _selectedDate
    ) { sales, date ->
        sales.filter { it.date == date }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        viewModelScope.launch {
            repository.initializeDatabase()
        }
    }

    // --- Mode Navigation ---
    fun setMode(mode: AppMode) {
        _currentMode.value = mode
    }

    fun setAdminTab(tab: AdminTab) {
        _adminTab.value = tab
    }

    fun setSelectedDate(date: String) {
        _selectedDate.value = date
        // Also update form dates to keep in sync
        _staffFormState.value = _staffFormState.value.copy(date = date)
        _smFormState.value = _smFormState.value.copy(date = date)
    }

    fun setStoreFilter(storeName: String) {
        _selectedStoreFilter.value = storeName
    }

    fun setRankingPeriod(period: String) {
        _rankingPeriod.value = period
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun clearSnackbar() {
        _snackbarMessage.value = null
    }

    fun showSnackbar(message: String) {
        _snackbarMessage.value = message
    }

    // --- Staff Form Actions ---
    fun updateStaffFormDate(date: String) {
        _staffFormState.value = _staffFormState.value.copy(date = date, successMessage = null, errorMessage = null)
    }

    fun updateStaffFormStaff(staff: Staff) {
        _staffFormState.value = _staffFormState.value.copy(
            staffId = staff.id,
            staffName = staff.name,
            storeName = staff.storeName,
            successMessage = null,
            errorMessage = null
        )
    }

    fun updateStaffFormSales(sales: String) {
        _staffFormState.value = _staffFormState.value.copy(sales = sales, errorMessage = null)
    }

    fun updateStaffFormTarget(target: String) {
        _staffFormState.value = _staffFormState.value.copy(target = target, errorMessage = null)
    }

    fun updateStaffFormBills(bills: String) {
        _staffFormState.value = _staffFormState.value.copy(bills = bills, errorMessage = null)
    }

    fun updateStaffFormQuantity(quantity: String) {
        _staffFormState.value = _staffFormState.value.copy(quantity = quantity, errorMessage = null)
    }

    fun updateStaffFormRemarks(remarks: String) {
        _staffFormState.value = _staffFormState.value.copy(remarks = remarks)
    }

    fun clearStaffForm() {
        val currentDate = _staffFormState.value.date
        _staffFormState.value = StaffFormState(date = currentDate)
    }

    fun submitStaffForm() {
        val state = _staffFormState.value
        if (state.isSubmitting) return

        // Validation
        if (state.staffId.isBlank() || state.staffName.isBlank()) {
            _staffFormState.value = state.copy(errorMessage = "Please select your Staff Name / ID")
            return
        }
        val salesVal = state.sales.toDoubleOrNull()
        if (salesVal == null || salesVal < 0) {
            _staffFormState.value = state.copy(errorMessage = "Sales amount cannot be negative or empty")
            return
        }
        val targetVal = state.target.toDoubleOrNull() ?: 0.0
        if (targetVal < 0) {
            _staffFormState.value = state.copy(errorMessage = "Target cannot be negative")
            return
        }
        val billsVal = state.bills.toIntOrNull() ?: 0
        if (billsVal < 0) {
            _staffFormState.value = state.copy(errorMessage = "Bills cannot be negative")
            return
        }
        val qtyVal = state.quantity.toIntOrNull() ?: 0
        if (qtyVal < 0) {
            _staffFormState.value = state.copy(errorMessage = "Quantity cannot be negative")
            return
        }

        _staffFormState.value = state.copy(isSubmitting = true, errorMessage = null)

        viewModelScope.launch {
            try {
                // Check if existing entry exists for this staff and date to prevent accidental duplicates
                val existing = repository.getEntryForStaffAndDate(state.staffId, state.date)
                val entryToSave = if (existing != null) {
                    existing.copy(
                        storeName = state.storeName,
                        dailyTarget = targetVal,
                        dailySales = salesVal,
                        bills = billsVal,
                        quantity = qtyVal,
                        remarks = state.remarks,
                        updatedAt = System.currentTimeMillis()
                    )
                } else {
                    SalesEntry(
                        date = state.date,
                        staffId = state.staffId,
                        staffName = state.staffName,
                        storeName = state.storeName,
                        dailyTarget = targetVal,
                        dailySales = salesVal,
                        bills = billsVal,
                        quantity = qtyVal,
                        remarks = state.remarks,
                        isDemo = false
                    )
                }

                if (existing != null) {
                    repository.updateSales(entryToSave)
                } else {
                    repository.insertSales(entryToSave)
                }

                _staffFormState.value = StaffFormState(
                    date = state.date,
                    isSubmitting = false,
                    successMessage = "Sales data successfully saved for ${state.staffName}!"
                )
                _snackbarMessage.value = "Entry recorded successfully!"
            } catch (e: Exception) {
                _staffFormState.value = state.copy(
                    isSubmitting = false,
                    errorMessage = "Failed to save: ${e.localizedMessage ?: "Unknown error"}"
                )
            }
        }
    }

    // --- Store Manager Form Actions ---
    fun updateSmStore(store: Store) {
        _smFormState.value = _smFormState.value.copy(
            storeName = store.name,
            staffId = "",
            staffName = "",
            successMessage = null,
            errorMessage = null
        )
    }

    fun updateSmStaff(staff: Staff) {
        _smFormState.value = _smFormState.value.copy(
            staffId = staff.id,
            staffName = staff.name,
            storeName = staff.storeName,
            successMessage = null,
            errorMessage = null
        )
    }

    fun updateSmDate(date: String) {
        _smFormState.value = _smFormState.value.copy(date = date, successMessage = null, errorMessage = null)
    }

    fun updateSmTarget(target: String) {
        _smFormState.value = _smFormState.value.copy(target = target, errorMessage = null)
    }

    fun updateSmSales(sales: String) {
        _smFormState.value = _smFormState.value.copy(sales = sales, errorMessage = null)
    }

    fun updateSmBills(bills: String) {
        _smFormState.value = _smFormState.value.copy(bills = bills, errorMessage = null)
    }

    fun updateSmQuantity(quantity: String) {
        _smFormState.value = _smFormState.value.copy(quantity = quantity, errorMessage = null)
    }

    fun updateSmRemarks(remarks: String) {
        _smFormState.value = _smFormState.value.copy(remarks = remarks)
    }

    fun clearSmForm() {
        val curDate = _smFormState.value.date
        val curStore = _smFormState.value.storeName
        _smFormState.value = StoreManagerFormState(date = curDate, storeName = curStore)
    }

    fun submitSmForm() {
        val state = _smFormState.value
        if (state.isSubmitting) return

        if (state.storeName.isBlank()) {
            _smFormState.value = state.copy(errorMessage = "Please select a Store")
            return
        }
        if (state.staffId.isBlank()) {
            _smFormState.value = state.copy(errorMessage = "Please select a Staff member")
            return
        }
        val salesVal = state.sales.toDoubleOrNull()
        if (salesVal == null || salesVal < 0) {
            _smFormState.value = state.copy(errorMessage = "Sales amount cannot be negative or empty")
            return
        }
        val targetVal = state.target.toDoubleOrNull() ?: 0.0
        if (targetVal < 0) {
            _smFormState.value = state.copy(errorMessage = "Daily Target cannot be negative")
            return
        }
        val billsVal = state.bills.toIntOrNull() ?: 0
        if (billsVal < 0) {
            _smFormState.value = state.copy(errorMessage = "Bills cannot be negative")
            return
        }
        val qtyVal = state.quantity.toIntOrNull() ?: 0
        if (qtyVal < 0) {
            _smFormState.value = state.copy(errorMessage = "Quantity cannot be negative")
            return
        }

        _smFormState.value = state.copy(isSubmitting = true, errorMessage = null)

        viewModelScope.launch {
            try {
                val existing = repository.getEntryForStaffAndDate(state.staffId, state.date)
                val entryToSave = if (existing != null) {
                    existing.copy(
                        storeName = state.storeName,
                        dailyTarget = targetVal,
                        dailySales = salesVal,
                        bills = billsVal,
                        quantity = qtyVal,
                        remarks = state.remarks,
                        updatedAt = System.currentTimeMillis()
                    )
                } else {
                    SalesEntry(
                        date = state.date,
                        staffId = state.staffId,
                        staffName = state.staffName,
                        storeName = state.storeName,
                        dailyTarget = targetVal,
                        dailySales = salesVal,
                        bills = billsVal,
                        quantity = qtyVal,
                        remarks = state.remarks,
                        isDemo = false
                    )
                }

                if (existing != null) {
                    repository.updateSales(entryToSave)
                } else {
                    repository.insertSales(entryToSave)
                }

                _smFormState.value = StoreManagerFormState(
                    date = state.date,
                    storeName = state.storeName,
                    isSubmitting = false,
                    successMessage = "Daily sales of ${MisCalculator.formatRupees(salesVal)} recorded for ${state.staffName}!"
                )
                _snackbarMessage.value = "Daily sales recorded & WTD/MTD/YTD updated!"
            } catch (e: Exception) {
                _smFormState.value = state.copy(
                    isSubmitting = false,
                    errorMessage = "Failed to save: ${e.localizedMessage ?: "Unknown error"}"
                )
            }
        }
    }

    // --- Entry Edit & Delete ---
    fun startEditingEntry(entry: SalesEntry) {
        _editingEntry.value = entry
    }

    fun dismissEditingEntry() {
        _editingEntry.value = null
    }

    fun saveEditedEntry(entry: SalesEntry) {
        viewModelScope.launch {
            repository.updateSales(entry.copy(updatedAt = System.currentTimeMillis()))
            _editingEntry.value = null
            _snackbarMessage.value = "Entry updated! MIS metrics recalculated."
        }
    }

    fun confirmDeleteEntry(entry: SalesEntry) {
        _entryToDelete.value = entry
    }

    fun dismissDeleteConfirm() {
        _entryToDelete.value = null
    }

    fun executeDeleteEntry() {
        val entry = _entryToDelete.value ?: return
        viewModelScope.launch {
            repository.deleteSales(entry)
            _entryToDelete.value = null
            _snackbarMessage.value = "Entry deleted! MIS metrics recalculated."
        }
    }

    // --- Demo Data Management ---
    fun clearDemoData() {
        viewModelScope.launch {
            repository.clearDemoData()
            _snackbarMessage.value = "Demo data cleared."
        }
    }

    fun reseedDemoData() {
        viewModelScope.launch {
            repository.reseedDemoData(_selectedDate.value)
            _snackbarMessage.value = "Sample data reloaded successfully!"
        }
    }
}

class MainViewModelFactory(private val repository: SalesRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(MainViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return MainViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
