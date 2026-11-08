package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.data.db.AppDatabase
import com.example.data.model.SalesEntry
import com.example.data.model.Staff
import com.example.data.model.Store
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

    @Test
    fun `read string from context`() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val appName = context.getString(R.string.app_name)
        assertEquals("Staff Sales MIS", appName)
    }

    @Test
    fun `test database operations`() = runBlocking {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val db = AppDatabase.getInstance(context)
        val dao = db.salesDao()

        val store = Store("STR-TEST", "Test Store", "Test Location")
        dao.insertStore(store)

        val staff = Staff("STF-TEST", "Test Employee", "Test Store")
        dao.insertStaff(staff)

        val entry = SalesEntry(
            date = "2026-11-07",
            staffId = "STF-TEST",
            staffName = "Test Employee",
            storeName = "Test Store",
            dailyTarget = 20000.0,
            dailySales = 22000.0,
            bills = 10,
            quantity = 15
        )
        val id = dao.insertSales(entry)
        val retrieved = dao.getSalesEntryById(id)
        assertNotNull(retrieved)
        assertEquals("Test Employee", retrieved?.staffName)
        assertEquals(22000.0, retrieved?.dailySales ?: 0.0, 0.01)
    }
}
