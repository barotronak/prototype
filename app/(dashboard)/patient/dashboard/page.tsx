'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Appointment {
  id: string
  appointmentDate: string
  status: string
  reason: string
  doctor: {
    user: {
      name: string
    }
    specialization: string
  }
}

interface LabReport {
  id: string
  completedAt: string
  labPrescription: {
    testName: string
  }
}

export default function PatientDashboard() {
  const router = useRouter()
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [recentReports, setRecentReports] = useState<LabReport[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    appointments: 0,
    prescriptions: 0,
    reports: 0,
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      const [appointmentsRes, reportsRes, labPrescriptionsRes, medPrescriptionsRes] = await Promise.all([
        fetch('/api/appointments', { credentials: 'include' }),
        fetch('/api/lab-reports', { credentials: 'include' }),
        fetch('/api/prescriptions/lab', { credentials: 'include' }),
        fetch('/api/prescriptions/medicine', { credentials: 'include' }),
      ])

      if (appointmentsRes.ok) {
        const data = await appointmentsRes.json()
        const upcoming = data.appointments
          .filter((a: Appointment) => new Date(a.appointmentDate) >= new Date() && a.status !== 'CANCELLED')
          .slice(0, 3)
        setUpcomingAppointments(upcoming)
        setStats(prev => ({ ...prev, appointments: data.appointments.length }))
      }

      if (reportsRes.ok) {
        const data = await reportsRes.json()
        setRecentReports(data.reports.slice(0, 3))
        setStats(prev => ({ ...prev, reports: data.reports.length }))
      }

      let totalPrescriptions = 0
      if (labPrescriptionsRes.ok) {
        const data = await labPrescriptionsRes.json()
        totalPrescriptions += data.prescriptions.length
      }
      if (medPrescriptionsRes.ok) {
        const data = await medPrescriptionsRes.json()
        totalPrescriptions += data.prescriptions.length
      }
      setStats(prev => ({ ...prev, prescriptions: totalPrescriptions }))

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
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
          <h1 className="text-3xl font-bold text-white mb-2">Patient Dashboard</h1>
          <p className="text-white/80">Welcome to your health portal</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">My Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.appointments}</div>
              <p className="text-xs text-gray-500 mt-1">Total appointments</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.prescriptions}</div>
              <p className="text-xs text-gray-500 mt-1">Lab & Medicine</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Lab Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.reports}</div>
              <p className="text-xs text-gray-500 mt-1">Available reports</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card variant="glass" className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/patient/appointments/book')}
                className="w-full"
              >
                Book Appointment
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => router.push('/patient/reports')}
                className="w-full"
              >
                View Lab Reports
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => router.push('/patient/medical-history')}
                className="w-full"
              >
                Medical History
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card variant="glass" className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Appointments</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/patient/appointments')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No upcoming appointments</p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => router.push('/patient/appointments/book')}
                >
                  Book an Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors cursor-pointer"
                    onClick={() => router.push(`/patient/appointments`)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        Dr. {appointment.doctor.user.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {appointment.doctor.specialization}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(appointment.appointmentDate).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Reason: {appointment.reason}
                      </div>
                    </div>
                    <Badge variant="info">{appointment.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Lab Reports */}
        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Lab Reports</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/patient/reports')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentReports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No lab reports available yet
              </div>
            ) : (
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors cursor-pointer"
                    onClick={() => router.push(`/patient/reports/${report.id}`)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {report.labPrescription.testName}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Completed: {new Date(report.completedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="success">Available</Badge>
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
