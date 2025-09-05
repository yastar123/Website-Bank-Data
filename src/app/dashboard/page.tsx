'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, DollarSign, Upload, Users } from 'lucide-react'

interface DashboardStats {
  totalDocuments: number
  totalBudget: number
  totalRealized: number
  totalUsers: number
  recentUploads: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    totalBudget: 0,
    totalRealized: 0,
    totalUsers: 0,
    recentUploads: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const budgetRealizationPercentage = stats.totalBudget > 0 
    ? (stats.totalRealized / stats.totalBudget) * 100 
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-600">Ringkasan data Bank Data</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dokumen</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Dokumen terupload
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Anggaran</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : formatCurrency(stats.totalBudget)}
            </div>
            <p className="text-xs text-muted-foreground">
              Anggaran direncanakan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realisasi</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : formatCurrency(stats.totalRealized)}
            </div>
            <p className="text-xs text-muted-foreground">
              {budgetRealizationPercentage.toFixed(1)}% terealisasi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengguna</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Total pengguna terdaftar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Realization Card */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Realisasi Anggaran</CardTitle>
          <CardDescription>
            Perbandingan antara anggaran yang direncanakan dengan yang terealisasi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Anggaran Direncanakan</span>
                <span className="font-medium">{formatCurrency(stats.totalBudget)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Anggaran Terealisasi</span>
                <span className="font-medium">{formatCurrency(stats.totalRealized)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span>Sisa Anggaran</span>
                <span>{formatCurrency(stats.totalBudget - stats.totalRealized)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress Realisasi</span>
                <span className="font-medium">{budgetRealizationPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(budgetRealizationPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Manajemen Dokumen
            </CardTitle>
            <CardDescription>
              Upload, download, dan kelola dokumen
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Monitoring Upload
            </CardTitle>
            <CardDescription>
              Pantau statistik upload dokumen
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Manajemen Anggaran
            </CardTitle>
            <CardDescription>
              Kelola realisasi anggaran
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}