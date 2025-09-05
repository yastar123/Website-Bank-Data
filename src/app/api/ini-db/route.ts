import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    console.log('Manual database initialization...')
    
    // Force create all tables
    await db.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `
    
    await db.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Document" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "filename" TEXT NOT NULL,
        "originalName" TEXT NOT NULL,
        "mimeType" TEXT NOT NULL,
        "size" INTEGER NOT NULL,
        "path" TEXT NOT NULL,
        "uploadedBy" INTEGER NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `
    
    await db.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Budget" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "category" TEXT NOT NULL,
        "amount" REAL NOT NULL,
        "spent" REAL NOT NULL DEFAULT 0,
        "month" INTEGER NOT NULL,
        "year" INTEGER NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await db.$executeRaw`
      INSERT OR IGNORE INTO "User" (id, username, password, createdAt)
      VALUES ('admin-1', 'admin', ${hashedPassword}, datetime('now'))
    `
    
    // Create sample data
    await db.$executeRaw`
      INSERT OR IGNORE INTO "Budget" (id, category, amount, spent, month, year, createdAt)
      VALUES 
        ('budget-1', 'Food', 1000000, 300000, 9, 2025, datetime('now')),
        ('budget-2', 'Transport', 500000, 150000, 9, 2025, datetime('now')),
        ('budget-3', 'Entertainment', 300000, 100000, 9, 2025, datetime('now'))
    `
    
    // Verify tables exist
    const tables = await db.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table'
    `
    
    return NextResponse.json({
      message: 'Database initialized successfully',
      tables: tables
    })
    
  } catch (error: any) {
    console.error('Manual DB init error:', error)
    return NextResponse.json({
      error: 'Failed to initialize database: ' + error.message
    }, { status: 500 })
  }
}