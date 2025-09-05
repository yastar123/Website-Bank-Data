'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { 
  Upload, 
  FileText, 
  Users, 
  Calendar,
  TrendingUp
} from 'lucide-react'

interface MonthlyUpload {
  month: string
  count: number
}

interface TopUploader {
  username: string
  count: number
}

interface FileTypeStats {
  type: string
  count: number
}

export default function MonitoringPage() {
  const [monthlyUploads, setMonthlyUploads] = useState<MonthlyUpload[]>([])
  const [topUploaders, setTopUploaders] = useState<TopUploader[]>([])
  const [fileTypeStats, setFileTypeStats] = useState<FileTypeStats[]>([])
  const [loading, setLoading] = useState(true)

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  useEffect(() => {
    fetchMonitoringData()
  }, [])

  const fetchMonitoringData = async () => {
    try {
      const [monthlyRes, uploadersRes, fileTypeRes] = await Promise.all([
        fetch('/api/monitoring/monthly-uploads'),
        fetch('/api/monitoring/top-uploaders'),
        fetch('/api/monitoring/file-types')
      ])

      if (monthlyRes.ok) {
        const monthlyData = await monthlyRes.json()
        setMonthlyUploads(monthlyData)
      }

      if (uploadersRes.ok) {
        const uploadersData = await uploadersRes.json()
        setTopUploaders(uploadersData)
      }

      if (fileTypeRes.ok) {
        const fileTypeData = await fileTypeRes.json()
        setFileTypeStats(fileTypeData)
      }
    } catch (error) {
      console.error('Error fetching monitoring data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01')
    return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
  }

  const totalDocuments = monthlyUploads.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monitoring Upload Dokumen</h1>
        <p className="text-gray-600">Statistik dan visualisasi data upload dokumen</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dokumen</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Dokumen terupload
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Uploader</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : (topUploaders[0]?.username || 'N/A')}
            </div>
            <p className="text-xs text-muted-foreground">
              {topUploaders[0]?.count || 0} dokumen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bulan Aktif</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : (monthlyUploads.length || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Bulan dengan upload
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Uploads Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Dokumen per Bulan</CardTitle>
            <CardDescription>
              Jumlah dokumen yang diupload setiap bulan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">Loading...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyUploads}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={formatMonth}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => formatMonth(value as string)}
                  />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* File Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Tipe File</CardTitle>
            <CardDescription>
              Persentase tipe file yang diupload
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">Loading...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={fileTypeStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {fileTypeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Uploaders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Uploaders</CardTitle>
          <CardDescription>
            Pengguna dengan jumlah upload dokumen terbanyak
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              {topUploaders.map((uploader, index) => (
                <div key={uploader.username} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{uploader.username}</p>
                      <p className="text-sm text-gray-500">{uploader.count} dokumen</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">
                      {((uploader.count / totalDocuments) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
              
              {topUploaders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">Belum ada data upload</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Trend Upload Dokumen</CardTitle>
          <CardDescription>
            Perkembangan jumlah upload dokumen dari waktu ke waktu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">Loading...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyUploads}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={formatMonth}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => formatMonth(value as string)}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}