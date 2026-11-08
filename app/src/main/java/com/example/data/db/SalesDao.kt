package com.example.data.db

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.model.SalesEntry
import com.example.data.model.Staff
import com.example.data.model.Store
import kotlinx.coroutines.flow.Flow

@Dao
interface SalesDao {

    // --- Sales Entries ---
    @Query("SELECT * FROM sales_entries ORDER BY date DESC, entryId DESC")
    fun getAllSales(): Flow<List<SalesEntry>>

    @Query("SELECT * FROM sales_entries WHERE date = :date ORDER BY entryId DESC")
    fun getSalesByDate(date: String): Flow<List<SalesEntry>>

    @Query("SELECT * FROM sales_entries WHERE date >= :startDate AND date <= :endDate ORDER BY date ASC")
    fun getSalesBetweenDates(startDate: String, endDate: String): Flow<List<SalesEntry>>

    @Query("SELECT * FROM sales_entries WHERE staffId = :staffId AND date = :date LIMIT 1")
    suspend fun getEntryForStaffAndDate(staffId: String, date: String): SalesEntry?

    @Query("SELECT * FROM sales_entries WHERE entryId = :id LIMIT 1")
    suspend fun getSalesEntryById(id: Long): SalesEntry?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSales(entry: SalesEntry): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAllSales(entries: List<SalesEntry>)

    @Update
    suspend fun updateSales(entry: SalesEntry)

    @Delete
    suspend fun deleteSales(entry: SalesEntry)

    @Query("DELETE FROM sales_entries WHERE entryId = :id")
    suspend fun deleteSalesById(id: Long)

    @Query("DELETE FROM sales_entries WHERE isDemo = 1")
    suspend fun clearDemoSales()

    @Query("DELETE FROM sales_entries")
    suspend fun clearAllSales()

    // --- Staff ---
    @Query("SELECT * FROM staff ORDER BY name ASC")
    fun getAllStaff(): Flow<List<Staff>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStaff(staff: Staff)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAllStaff(staffList: List<Staff>)

    @Query("DELETE FROM staff")
    suspend fun clearStaff()

    // --- Stores ---
    @Query("SELECT * FROM stores ORDER BY name ASC")
    fun getAllStores(): Flow<List<Store>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStore(store: Store)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAllStores(storesList: List<Store>)

    @Query("DELETE FROM stores")
    suspend fun clearStores()
}
