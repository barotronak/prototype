'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'
import { BeakerIcon, UserIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface LabPrescription {
  id: string
  testName: string
  testDetails: string | null
  instructions: string | null
  urgency: string | null
  status: string
  createdAt: string
  doctor: {
    user: {
      name: string
    }
    specialization: string
  }
  lab: {
    labName: string
    address: string
  }
  report: {
    id: string
    reportPdfUrl: string | null
    completedAt: string
  } | null
}

export default function LabPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<LabPrescription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const fetchPrescriptions = async () => {
    try {
      const res = await fetch('/api/prescriptions/lab')
      if (res.ok) {
        const data = await res.json()
        setPrescriptions(data.prescriptions || [])
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'FULFILLED':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getUrgencyColor = (urgency: string | null) => {
    switch (urgency) {
      case 'STAT':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'URGENT':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'ROUTINE':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading prescriptions...</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lab Test Prescriptions</h1>
        <p className="text-sm text-gray-600 mt-1">View your lab test prescriptions and reports</p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-12 border border-white/30 shadow-lg text-center">
          <BeakerIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No lab prescriptions yet</h3>
          <p className="text-gray-600 text-sm">Your lab test prescriptions will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="bg-white/70 backdrop-blur-md rounded-xl p-5 border border-white/30 shadow-lg"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-primary-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{prescription.doctor.user.name}</h3>
                    <p className="text-sm text-gray-600">{prescription.doctor.specialization}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {prescription.urgency && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(prescription.urgency)}`}>
                      {prescription.urgency}
                    </span>
                  )}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(prescription.status)}`}>
                    {prescription.status}
                  </span>
                </div>
              </div>

              {/* Laboratory */}
              <div className="flex items-start gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                <BeakerIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{prescription.lab.labName}</p>
                  <p className="text-xs text-gray-600">{prescription.lab.address}</p>
                </div>
              </div>

              {/* Test Details */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Test Information</h4>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm font-semibold text-gray-900 mb-1">{prescription.testName}</p>
                  {prescription.testDetails && (
                    <p className="text-xs text-gray-600 mb-2">{prescription.testDetails}</p>
                  )}
                  {prescription.instructions && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
                      <ExclamationTriangleIcon className="w-4 h-4 text-yellow-700 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-yellow-900">Instructions</p>
                        <p className="text-xs text-yellow-800">{prescription.instructions}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Report Status */}
              {prescription.report ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
                  <p className="text-xs font-medium text-green-900 mb-1">Report Available</p>
                  <p className="text-xs text-green-800">
                    Report completed on {formatDate(prescription.report.completedAt)}
                  </p>
                  <a
                    href={`/patient/reports/${prescription.report.id}`}
                    className="inline-block mt-2 text-xs text-green-700 font-medium hover:underline"
                  >
                    View Report →
                  </a>
                </div>
              ) : (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                  <p className="text-xs font-medium text-blue-900">Report Pending</p>
                  <p className="text-xs text-blue-800">The laboratory will upload your report soon</p>
                </div>
              )}

              {/* Date */}
              <p className="text-xs text-gray-500">
                Prescribed on {formatDate(prescription.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
