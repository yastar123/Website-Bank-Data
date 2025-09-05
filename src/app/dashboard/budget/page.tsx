'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock
} from 'lucide-react'

interface Budget {
  id: number
  activity: string
  planned: number
  realized: number
  date: string
  createdAt: string
  updatedAt: string
  user: {
    username: string
  }
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  
  const [formData, setFormData] = useState({
    activity: '',
    planned: '',
    realized: '',
    date: ''
  })

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/budgets')
      if (response.ok) {
        const data = await response.json()
        setBudgets(data)
      }
    } catch (error) {
      console.error('Error fetching budgets:', error)
      setError('Failed to fetch budgets')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.activity || !formData.planned || !formData.date) {
      setError('Please fill in all required fields')
      return
    }

    try {
      const url = editingBudget ? `/api/budgets/${editingBudget.id}` : '/api/budgets'
      const method = editingBudget ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity: formData.activity,
          planned: parseFloat(formData.planned),
          realized: parseFloat(formData.realized) || 0,
          date: formData.date
        })
      })

      if (response.ok) {
        await fetchBudgets()
        setIsDialogOpen(false)
        setEditingBudget(null)
        setFormData({
          activity: '',
          planned: '',
          realized: '',
          date: ''
        })
      } else {
        const data = await response.json()
        setError(data.error || 'Operation failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this budget?')) {
      return
    }

    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchBudgets()
      } else {
        const data = await response.json()
        setError(data.error || 'Delete failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setFormData({
      activity: budget.activity,
      planned: budget.planned.toString(),
      realized: budget.realized.toString(),
      date: budget.date.split('T')[0]
    })
    setIsDialogOpen(true)
  }

  const getTotalPlanned = () => budgets.reduce((sum, budget) => sum + budget.planned, 0)
  const getTotalRealized = () => budgets.reduce((sum, budget) => sum + budget.realized, 0)
  const getRealizationPercentage = () => {
    const planned = getTotalPlanned()
    const realized = getTotalRealized()
    return planned > 0 ? (realized / planned) * 100 : 0
  }

  const getStatusBadge = (planned: number, realized: number) => {
    if (realized === 0) {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Belum Realisasi</Badge>
    } else if (realized >= planned) {
      return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Sudah Realisasi</Badge>
    } else {
      return <Badge variant="outline"><TrendingUp className="w-3 h-3 mr-1" />Partial</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Anggaran</h1>
          <p className="text-gray-600">Kelola realisasi anggaran kegiatan</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Anggaran
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingBudget ? 'Edit Anggaran' : 'Tambah Anggaran Baru'}
              </DialogTitle>
              <DialogDescription>
                {editingBudget ? 'Edit data anggaran yang sudah ada' : 'Masukkan data anggaran untuk kegiatan baru'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activity">Nama Kegiatan</Label>
                <Input
                  id="activity"
                  value={formData.activity}
                  onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="planned">Anggaran Rencana</Label>
                <Input
                  id="planned"
                  type="number"
                  value={formData.planned}
                  onChange={(e) => setFormData({ ...formData, planned: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="realized">Realisasi</Label>
                <Input
                  id="realized"
                  type="number"
                  value={formData.realized}
                  onChange={(e) => setFormData({ ...formData, realized: e.target.value })}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button type="submit">
                  {editingBudget ? 'Update' : 'Simpan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rencana</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalPlanned())}</div>
            <p className="text-xs text-muted-foreground">
              Total anggaran direncanakan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Realisasi</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalRealized())}</div>
            <p className="text-xs text-muted-foreground">
              Total anggaran terealisasi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Persentase Realisasi</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getRealizationPercentage().toFixed(1)}%</div>
            <Progress value={getRealizationPercentage()} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Budget Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Anggaran</CardTitle>
          <CardDescription>
            Semua data anggaran dan realisasi kegiatan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kegiatan</TableHead>
                  <TableHead>Rencana</TableHead>
                  <TableHead>Realisasi</TableHead>
                  <TableHead>Persentase</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((budget) => {
                  const percentage = budget.planned > 0 ? (budget.realized / budget.planned) * 100 : 0
                  return (
                    <TableRow key={budget.id}>
                      <TableCell className="font-medium">
                        {budget.activity}
                      </TableCell>
                      <TableCell>{formatCurrency(budget.planned)}</TableCell>
                      <TableCell>{formatCurrency(budget.realized)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={percentage} className="w-16" />
                          <span className="text-sm">{percentage.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(budget.date).toLocaleDateString('id-ID')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(budget.planned, budget.realized)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(budget)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(budget.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
          
          {budgets.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">Belum ada data anggaran</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}