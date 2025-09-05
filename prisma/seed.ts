import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Seeding database...')

  // Create users
  const hashedAdminPassword = await bcrypt.hash('admin123', 10)
  const hashedUserPassword = await bcrypt.hash('user123', 10)

  const admin = await db.user.create({
    data: {
      username: 'admin',
      password: hashedAdminPassword,
    },
  })

  const user1 = await db.user.create({
    data: {
      username: 'user1',
      password: hashedUserPassword,
    },
  })

  console.log('Created users:', { admin, user1 })

  // Create documents
  const documents = await Promise.all([
    db.document.create({
      data: {
        title: 'Laporan Keuangan Q1',
        description: 'Laporan triwulan pertama',
        filePath: '/uploads/laporan_q1.pdf',
        uploaderId: admin.id,
      },
    }),
    db.document.create({
      data: {
        title: 'Proposal Proyek A',
        description: 'Proposal pembangunan proyek A',
        filePath: '/uploads/proposal_a.docx',
        uploaderId: user1.id,
      },
    }),
    db.document.create({
      data: {
        title: 'Dokumentasi Rapat',
        description: 'Notulen rapat mingguan',
        filePath: '/uploads/rapat_maret.pdf',
        uploaderId: admin.id,
      },
    }),
  ])

  console.log('Created documents:', documents)

  // Create budgets
  const budgets = await Promise.all([
    db.budget.create({
      data: {
        activity: 'Pelatihan SDM',
        planned: 10000000,
        realized: 8000000,
        date: new Date('2025-01-20'),
        userId: admin.id,
      },
    }),
    db.budget.create({
      data: {
        activity: 'Pengadaan Laptop',
        planned: 5000000,
        realized: 0,
        date: new Date('2025-02-10'),
        userId: user1.id,
      },
    }),
    db.budget.create({
      data: {
        activity: 'Rapat Koordinasi',
        planned: 2000000,
        realized: 2000000,
        date: new Date('2025-03-01'),
        userId: admin.id,
      },
    }),
  ])

  console.log('Created budgets:', budgets)
  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })