import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const globalForPrisma = globalThis
const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Inisialisasi database dan buat user admin jika belum ada
async function initializeDatabase() {
  try {
    // Push schema ke database (buat tabel jika belum ada)
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `
    
    // Cek apakah user admin sudah ada
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' }
    })

    // Jika belum ada, buat user admin
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      await prisma.user.create({
        data: {
          id: 'admin-' + Date.now(),
          username: 'admin',
          password: hashedPassword
        }
      })
      console.log('Admin user created')
    }
  } catch (error) {
    console.error('Database initialization error:', error)
  }
}

// Jalankan inisialisasi
initializeDatabase()

export const db = prisma