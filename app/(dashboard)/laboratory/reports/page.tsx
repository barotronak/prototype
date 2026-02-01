'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface LabReport {
  id: string
  reportPdfUrl?: string
  findings?: string
  recommendations?: string
  completedAt: string
  labPrescription: {
    testName: string
    testDetails?: string
    doctor: {
      user: {
        name: string
      }
      specialization: string
    }
    patient: {
      user: {
        name: string
        email: string
      }
    }
  }
}

export default function LaboratoryReports() {
  const router = useRouter()
  const [reports, setReports] = useState<LabReport[]>([])
  const [filteredReports, setFilteredReports] = useState<LabReport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    filterReports()
  }, [reports, searchQuery])

  async function fetchReports() {
    try {
      const response = await fetch('/api/lab-reports', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setReports(data.reports)
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterReports() {
    if (!searchQuery) {
      setFilteredReports(reports)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = reports.filter(
      (r) =>
        r.labPrescription.testName.toLowerCase().includes(query) ||
        r.labPrescription.patient.user.name.toLowerCase().includes(query) ||
        r.labPrescription.doctor.user.name.toLowerCase().includes(query)
    )
    setFilteredReports(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-white text-lg">Loading reports...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Lab Reports</h1>
          <p className="text-white/80">View all uploaded lab reports</p>
        </div>

        {/* Search */}
        <Card variant="glass" className="mb-6">
          <CardContent className="pt-6">
            <Input
              placeholder="Search by test name, patient, or doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <Card variant="glass">
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                {searchQuery
                  ? 'No reports found matching your search'
                  : 'No reports uploaded yet'}
              </div>
              {!searchQuery && (
                <div className="text-center mt-4">
                  <Button onClick={() => router.push('/laboratory/prescriptions')}>
                    View Pending Prescriptions
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id} variant="glass" className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {report.labPrescription.testName}
                        </h3>
                        <Badge variant="success">Completed</Badge>
                      </div>

                      {report.labPrescription.testDetails && (
                        <p className="text-sm text-gray-600 mb-3">
                          {report.labPrescription.testDetails}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Patient</div>
                          <div className="font-medium text-gray-900">
                            {report.labPrescription.patient.user.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {report.labPrescription.patient.user.email}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-gray-500 mb-1">Prescribed By</div>
                          <div className="font-medium text-gray-900">
                            Dr. {report.labPrescription.doctor.user.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {report.labPrescription.doctor.specialization}
                          </div>
                        </div>
                      </div>

                      {report.findings && (
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">Findings</div>
                          <p className="text-sm text-gray-700">{report.findings}</p>
                        </div>
                      )}

                      {report.recommendations && (
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">Recommendations</div>
                          <p className="text-sm text-gray-700">{report.recommendations}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Completed: {new Date(report.completedAt).toLocaleDateString()} at{' '}
                          {new Date(report.completedAt).toLocaleTimeString()}
                        </span>
                        {report.reportPdfUrl && (
                          <a
                            href={report.reportPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Report PDF →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {reports.length > 0 && (
          <Card variant="glass" className="mt-8">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{reports.length}</div>
                <div className="text-sm text-gray-600">Total Reports Uploaded</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
