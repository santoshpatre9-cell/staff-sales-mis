package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "staff")
data class Staff(
    @PrimaryKey val id: String,
    val name: String,
    val storeName: String,
    val status: String = "ACTIVE"
)
