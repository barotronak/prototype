'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

interface LabReport {
  id: string
  findings: string | null
  recommendations: string | null
  reportPdfUrl: string | null
  structuredData: any
  completedAt: string
  lab: {
    labName: string
    address: string
  }
  labPrescription: {
    testName: string
    testDetails: string | null
    instructions: string | null
    doctor: {
      user: {
        name: string
      }
      specialization: string
    }
  }
}

export default function LabReportDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [report, setReport] = useState<LabReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/lab-reports/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setReport(data)
      }
    } catch (error) {
      console.error('Error fetching report:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading report...</div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="max-w-4xl">
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-12 border border-white/30 shadow-lg text-center">
          <p className="text-gray-600">Report not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Reports
      </button>

      <div className="bg-white/70 backdrop-blur-md rounded-xl border border-white/30 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <DocumentTextIcon className="w-6 h-6 text-green-700" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{report.labPrescription.testName}</h1>
              <p className="text-sm text-gray-600">{report.lab.labName}</p>
              <p className="text-xs text-gray-500 mt-1">Completed on {formatDate(report.completedAt)}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Doctor Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Prescribed By</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{report.labPrescription.doctor.user.name}</p>
              <p className="text-sm text-gray-600">{report.labPrescription.doctor.specialization}</p>
            </div>
          </div>

          {/* Test Details */}
          {report.labPrescription.testDetails && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Test Details</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{report.labPrescription.testDetails}</p>
              </div>
            </div>
          )}

          {/* Structured Data */}
          {report.structuredData && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Test Results</h3>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(report.structuredData, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Findings */}
          {report.findings && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Findings</h3>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700">{report.findings}</p>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Recommendations</h3>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-700">{report.recommendations}</p>
              </div>
            </div>
          )}

          {/* PDF Download */}
          {report.reportPdfUrl && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Report Document</h3>
              <a
                href={report.reportPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors text-sm"
              >
                <DocumentTextIcon className="w-4 h-4" />
                View/Download PDF Report
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
