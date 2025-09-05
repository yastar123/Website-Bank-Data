import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface FileTypeStats {
  type: string
  count: number
}

export async function GET() {
  try {
    const fileTypeStats = await db.$queryRaw<FileTypeStats[]>`
      SELECT 
        CASE 
          WHEN filePath LIKE '%.pdf' THEN 'PDF'
          WHEN filePath LIKE '%.doc' THEN 'DOC'
          WHEN filePath LIKE '%.docx' THEN 'DOCX'
          WHEN filePath LIKE '%.xls' THEN 'XLS'
          WHEN filePath LIKE '%.xlsx' THEN 'XLSX'
          WHEN filePath LIKE '%.jpg' THEN 'JPG'
          WHEN filePath LIKE '%.jpeg' THEN 'JPEG'
          WHEN filePath LIKE '%.png' THEN 'PNG'
          ELSE 'OTHER'
        END as type,
        COUNT(*) as count
      FROM documents
      GROUP BY type
      ORDER BY count DESC
    `

    return NextResponse.json(fileTypeStats)
  } catch (error) {
    console.error('Error fetching file type stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}