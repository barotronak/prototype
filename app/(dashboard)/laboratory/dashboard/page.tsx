'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface LabPrescription {
  id: string
  testName: string
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

interface LabReport {
  id: string
  completedAt: string
  labPrescription: {
    testName: string
    patient: {
      user: {
        name: string
      }
    }
  }
}

export default function LaboratoryDashboard() {
  const router = useRouter()
  const [pendingPrescriptions, setPendingPrescriptions] = useState<LabPrescription[]>([])
  const [recentReports, setRecentReports] = useState<LabReport[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    total: 0,
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      const [prescriptionsRes, reportsRes] = await Promise.all([
        fetch('/api/prescriptions/lab?status=PENDING', { credentials: 'include' }),
        fetch('/api/lab-reports', { credentials: 'include' }),
      ])

      if (prescriptionsRes.ok) {
        const data = await prescriptionsRes.json()
        setPendingPrescriptions(data.prescriptions.slice(0, 5))

        const allPrescriptionsRes = await fetch('/api/prescriptions/lab', { credentials: 'include' })
        if (allPrescriptionsRes.ok) {
          const allData = await allPrescriptionsRes.json()
          setStats({
            pending: data.prescriptions.length,
            completed: allData.prescriptions.filter((p: LabPrescription) => p.status === 'FULFILLED').length,
            total: allData.prescriptions.length,
          })
        }
      }

      if (reportsRes.ok) {
        const data = await reportsRes.json()
        setRecentReports(data.reports.slice(0, 5))
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
      case 'IN_PROGRESS':
        return 'info'
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
          <h1 className="text-3xl font-bold text-white mb-2">Laboratory Dashboard</h1>
          <p className="text-white/80">Manage test prescriptions and upload reports</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Pending Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting results</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-gray-500 mt-1">Reports uploaded</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Prescriptions */}
        <Card variant="glass" className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Test Prescriptions</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/laboratory/prescriptions')}
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
                    onClick={() => router.push(`/laboratory/prescriptions/${prescription.id}`)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {prescription.testName}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Patient: {prescription.patient.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Prescribed by: Dr. {prescription.doctor.user.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusColor(prescription.status)}>
                        {prescription.status}
                      </Badge>
                      <Button size="sm" variant="primary">
                        Upload Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Reports</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/laboratory/reports')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentReports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reports uploaded yet
              </div>
            ) : (
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {report.labPrescription.testName}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Patient: {report.labPrescription.patient.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Completed: {new Date(report.completedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="success">Completed</Badge>
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
