'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface MedicinePrescription {
  id: string
  medicines: any
  status: string
  createdAt: string
  doctor: {
    user: {
      name: string
    }
  }
  patient: {
    user: {
      name: string
    }
  }
}

export default function PharmacyDashboard() {
  const router = useRouter()
  const [pendingPrescriptions, setPendingPrescriptions] = useState<MedicinePrescription[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    pending: 0,
    fulfilled: 0,
    total: 0,
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      const [pendingRes, allRes] = await Promise.all([
        fetch('/api/prescriptions/medicine?status=PENDING', { credentials: 'include' }),
        fetch('/api/prescriptions/medicine', { credentials: 'include' }),
      ])

      if (pendingRes.ok) {
        const data = await pendingRes.json()
        setPendingPrescriptions(data.prescriptions.slice(0, 5))
        setStats(prev => ({ ...prev, pending: data.prescriptions.length }))
      }

      if (allRes.ok) {
        const data = await allRes.json()
        const fulfilled = data.prescriptions.filter((p: MedicinePrescription) => p.status === 'FULFILLED').length
        setStats(prev => ({
          ...prev,
          fulfilled,
          total: data.prescriptions.length,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'PENDING':
        return 'warning'
      case 'FULFILLED':
        return 'success'
      default:
        return 'default'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-white text-lg">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Pharmacy Dashboard</h1>
          <p className="text-white/80">Manage medicine prescriptions and orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting fulfillment</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Fulfilled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.fulfilled}</div>
              <p className="text-xs text-gray-500 mt-1">Orders completed</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Prescriptions */}
        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Prescriptions</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/pharmacy/prescriptions')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {pendingPrescriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No pending prescriptions
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPrescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    className="flex items-center justify-between p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors cursor-pointer"
                    onClick={() => router.push(`/pharmacy/prescriptions/${prescription.id}`)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {Array.isArray(prescription.medicines)
                          ? `${prescription.medicines.length} Medicine(s)`
                          : 'Prescription'}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Patient: {prescription.patient.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Prescribed by: Dr. {prescription.doctor.user.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(prescription.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusColor(prescription.status)}>
                        {prescription.status}
                      </Badge>
                      <Button size="sm" variant="primary">
                        Fulfill Order
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
