import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  dbInitialized: boolean | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Auto-initialize database tables
async function initializeDatabase() {
  if (globalForPrisma.dbInitialized) return
  
  try {
    console.log('Initializing database...')
    
    // Create User table
    await db.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `
    
    // Create Document table
    await db.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Document" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "filename" TEXT NOT NULL,
        "originalName" TEXT NOT NULL,
        "mimeType" TEXT NOT NULL,
        "size" INTEGER NOT NULL,
        "path" TEXT NOT NULL,
        "uploadedBy" INTEGER NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("uploadedBy") REFERENCES "User" ("id") ON DELETE CASCADE
      );
    `
    
    // Create Budget table
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
    
    // Create admin user if not exists
    const existingAdmin = await db.user.findUnique({
      where: { username: 'admin' }
    }).catch(() => null)

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      await db.user.create({
        data: {
          id: 'admin-' + Date.now(),
          username: 'admin',
          password: hashedPassword
        }
      })
      console.log('Admin user created')
    }
    
    // Create sample budget data
    const budgetCount = await db.budget.count().catch(() => 0)
    if (budgetCount === 0) {
      await db.budget.createMany({
        data: [
          { id: '1', category: 'Food', amount: 1000000, spent: 300000, month: 9, year: 2025 },
          { id: '2', category: 'Transport', amount: 500000, spent: 150000, month: 9, year: 2025 },
          { id: '3', category: 'Entertainment', amount: 300000, spent: 100000, month: 9, year: 2025 }
        ]
      })
      console.log('Sample budget data created')
    }
    
    globalForPrisma.dbInitialized = true
    console.log('Database initialized successfully')
    
  } catch (error) {
    console.error('Database initialization error:', error)
  }
}

// Initialize database on first import
initializeDatabase()