package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "stores")
data class Store(
    @PrimaryKey val id: String,
    val name: String,
    val location: String,
    val status: String = "ACTIVE"
)
