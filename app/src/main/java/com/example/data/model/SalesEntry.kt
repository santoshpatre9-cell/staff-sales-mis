package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "sales_entries")
data class SalesEntry(
    @PrimaryKey(autoGenerate = true) val entryId: Long = 0,
    val date: String, // "yyyy-MM-dd"
    val staffId: String,
    val staffName: String,
    val storeName: String,
    val dailyTarget: Double,
    val dailySales: Double,
    val bills: Int,
    val quantity: Int,
    val remarks: String = "",
    val isDemo: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
