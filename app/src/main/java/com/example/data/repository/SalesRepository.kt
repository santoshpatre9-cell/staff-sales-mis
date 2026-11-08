package com.example.data.repository

import com.example.data.SampleDataSeeder
import com.example.data.db.SalesDao
import com.example.data.model.SalesEntry
import com.example.data.model.Staff
import com.example.data.model.Store
import kotlinx.coroutines.flow.Flow

class SalesRepository(private val salesDao: SalesDao) {

    val allSales: Flow<List<SalesEntry>> = salesDao.getAllSales()
    val allStaff: Flow<List<Staff>> = salesDao.getAllStaff()
    val allStores: Flow<List<Store>> = salesDao.getAllStores()

    fun getSalesByDate(date: String): Flow<List<SalesEntry>> {
        return salesDao.getSalesByDate(date)
    }

    suspend fun getEntryForStaffAndDate(staffId: String, date: String): SalesEntry? {
        return salesDao.getEntryForStaffAndDate(staffId, date)
    }

    suspend fun insertSales(entry: SalesEntry): Long {
        return salesDao.insertSales(entry)
    }

    suspend fun updateSales(entry: SalesEntry) {
        salesDao.updateSales(entry)
    }

    suspend fun deleteSales(entry: SalesEntry) {
        salesDao.deleteSales(entry)
    }

    suspend fun deleteSalesById(id: Long) {
        salesDao.deleteSalesById(id)
    }

    suspend fun clearDemoData() {
        salesDao.clearDemoSales()
    }

    suspend fun clearAllData() {
        salesDao.clearAllSales()
    }

    suspend fun reseedDemoData(referenceDate: String) {
        salesDao.clearAllSales()
        SampleDataSeeder.seedDemoSales(salesDao, referenceDate)
    }

    suspend fun insertStaff(staff: Staff) {
        salesDao.insertStaff(staff)
    }

    suspend fun insertStore(store: Store) {
        salesDao.insertStore(store)
    }

    suspend fun initializeDatabase() {
        SampleDataSeeder.seedIfEmpty(salesDao)
    }
}
