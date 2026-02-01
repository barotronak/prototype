'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface LabPrescription {
  id: string
  testName: string
  testDetails?: string
  instructions?: string
  urgency: string
  status: string
  createdAt: string
  prescriptionPdfUrl?: string
  doctor: {
    user: {
      name: string
      email: string
    }
    specialization: string
  }
  patient: {
    user: {
      name: string
      email: string
    }
  }
  report?: {
    id: string
  }
}

export default function LaboratoryPrescriptions() {
  const router = useRouter()
  const [prescriptions, setPrescriptions] = useState<LabPrescription[]>([])
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<LabPrescription[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  useEffect(() => {
    filterPrescriptions()
  }, [prescriptions, statusFilter, searchQuery])

  async function fetchPrescriptions() {
    try {
      const response = await fetch('/api/prescriptions/lab', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setPrescriptions(data.prescriptions)
      }
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterPrescriptions() {
    let filtered = [...prescriptions]

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.testName.toLowerCase().includes(query) ||
          p.patient.user.name.toLowerCase().includes(query) ||
          p.doctor.user.name.toLowerCase().includes(query)
      )
    }

    setFilteredPrescriptions(filtered)
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

  function getUrgencyColor(urgency: string) {
    switch (urgency) {
      case 'URGENT':
        return 'error'
      case 'ROUTINE':
        return 'default'
      default:
        return 'default'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-white text-lg">Loading prescriptions...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Test Prescriptions</h1>
          <p className="text-white/80">View and manage incoming test prescriptions</p>
        </div>

        {/* Filters */}
        <Card variant="glass" className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by test name, patient, or doctor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'ALL' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter('ALL')}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'PENDING' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter('PENDING')}
                >
                  Pending
                </Button>
                <Button
                  variant={statusFilter === 'IN_PROGRESS' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter('IN_PROGRESS')}
                >
                  In Progress
                </Button>
                <Button
                  variant={statusFilter === 'FULFILLED' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter('FULFILLED')}
                >
                  Fulfilled
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions List */}
        {filteredPrescriptions.length === 0 ? (
          <Card variant="glass">
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'No prescriptions found matching your filters'
                  : 'No prescriptions received yet'}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPrescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="cursor-pointer"
                onClick={() => router.push(`/laboratory/prescriptions/${prescription.id}`)}
              >
                <Card
                  variant="glass"
                  className="hover:shadow-lg transition-shadow"
                >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {prescription.testName}
                            </h3>
                            <Badge variant={getUrgencyColor(prescription.urgency)}>
                              {prescription.urgency}
                            </Badge>
                            <Badge variant={getStatusColor(prescription.status)}>
                              {prescription.status}
                            </Badge>
                          </div>

                          {prescription.testDetails && (
                            <p className="text-sm text-gray-600 mb-2">
                              {prescription.testDetails}
                            </p>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Patient</div>
                              <div className="font-medium text-gray-900">
                                {prescription.patient.user.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {prescription.patient.user.email}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-gray-500 mb-1">Prescribed By</div>
                              <div className="font-medium text-gray-900">
                                Dr. {prescription.doctor.user.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {prescription.doctor.specialization}
                              </div>
                            </div>
                          </div>

                          {prescription.instructions && (
                            <div className="mt-4">
                              <div className="text-xs text-gray-500 mb-1">Instructions</div>
                              <p className="text-sm text-gray-700">{prescription.instructions}</p>
                            </div>
                          )}

                          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                            <span>
                              Received: {new Date(prescription.createdAt).toLocaleDateString()}
                            </span>
                            {prescription.prescriptionPdfUrl && (
                              <a
                                href={prescription.prescriptionPdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View Prescription PDF
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      {prescription.status === 'FULFILLED' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/laboratory/reports`)
                          }}
                        >
                          View Report
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/laboratory/prescriptions/${prescription.id}`)
                          }}
                        >
                          Upload Report
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
