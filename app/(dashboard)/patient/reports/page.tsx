'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { DocumentTextIcon, BeakerIcon, UserIcon } from '@heroicons/react/24/outline'

interface LabReport {
  id: string
  findings: string | null
  recommendations: string | null
  completedAt: string
  lab: {
    labName: string
  }
  labPrescription: {
    testName: string
    testDetails: string | null
    doctor: {
      user: {
        name: string
      }
      specialization: string
    }
  }
}

export default function LabReportsPage() {
  const [reports, setReports] = useState<LabReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/lab-reports')
      if (res.ok) {
        const data = await res.json()
        setReports(data.reports || [])
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading reports...</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lab Reports</h1>
        <p className="text-sm text-gray-600 mt-1">View your completed lab test reports</p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-12 border border-white/30 shadow-lg text-center">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports yet</h3>
          <p className="text-gray-600 text-sm">Your lab reports will appear here when ready</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Link
              key={report.id}
              href={`/patient/reports/${report.id}`}
              className="block bg-white/70 backdrop-blur-md rounded-xl p-5 border border-white/30 shadow-lg hover:shadow-xl transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <DocumentTextIcon className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.labPrescription.testName}</h3>
                    <p className="text-sm text-gray-600">{report.lab.labName}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                  Completed
                </span>
              </div>

              {/* Doctor Info */}
              <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                <UserIcon className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-gray-700">
                  Prescribed by <span className="font-medium">{report.labPrescription.doctor.user.name}</span>
                  <span className="text-gray-500"> ({report.labPrescription.doctor.specialization})</span>
                </p>
              </div>

              {/* Test Details */}
              {report.labPrescription.testDetails && (
                <p className="text-sm text-gray-600 mb-3 p-3 bg-white rounded-lg border border-gray-200">
                  {report.labPrescription.testDetails}
                </p>
              )}

              {/* Findings Preview */}
              {report.findings && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Findings:</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{report.findings}</p>
                </div>
              )}

              {/* Date */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Completed on {formatDate(report.completedAt)}</span>
                <span className="text-primary-600 font-medium">View Full Report →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
