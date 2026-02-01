'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatTime } from '@/lib/utils'
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  BeakerIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

interface Appointment {
  id: string
  appointmentDate: string
  startTime: string
  endTime: string
  status: string
  reason: string | null
  notes: string | null
  doctor: {
    user: {
      name: string
    }
  }
  patient: {
    id: string
    user: {
      name: string
      email: string
      phone: string | null
    }
  }
  labPrescriptions: Array<{
    id: string
    testName: string
    status: string
    createdAt: string
    lab: {
      user: {
        name: string
      }
    }
    report: {
      id: string
      findings: string | null
      recommendations: string | null
      completedAt: string
    } | null
  }>
  medicinePrescriptions: Array<{
    id: string
    medicines: any
    status: string
    createdAt: string
    pharmacy: {
      user: {
        name: string
      }
    }
  }>
}

export default function AppointmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchAppointment()
  }, [params.id])

  const fetchAppointment = async () => {
    try {
      const res = await fetch(`/api/appointments/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setAppointment(data.appointment)
      }
    } catch (error) {
      console.error('Error fetching appointment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkCompleted = async () => {
    if (!confirm('Mark this appointment as completed?')) return

    setActionLoading(true)
    try {
      const res = await fetch(`/api/appointments/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      })

      if (res.ok) {
        fetchAppointment()
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Cancel this appointment?')) return

    setActionLoading(true)
    try {
      const res = await fetch(`/api/appointments/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })

      if (res.ok) {
        fetchAppointment()
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading appointment details...</div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="max-w-2xl">
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-8 border border-white/30 shadow-lg text-center">
          <p className="text-gray-600">Appointment not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Appointments
      </button>

      <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-lg mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
            <p className="text-sm text-gray-600 mt-1">
              {formatDate(appointment.appointmentDate)} at {formatTime(appointment.startTime)}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              appointment.status === 'COMPLETED'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : appointment.status === 'SCHEDULED'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : appointment.status === 'CANCELLED'
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            {appointment.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Patient</p>
            <p className="text-sm font-medium text-gray-900">{appointment.patient.user.name}</p>
            <p className="text-xs text-gray-600">{appointment.patient.user.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Time</p>
            <p className="text-sm font-medium text-gray-900">
              {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
            </p>
          </div>
        </div>

        {appointment.reason && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-1">Reason for Visit</p>
            <p className="text-sm text-gray-900">{appointment.reason}</p>
          </div>
        )}

        {appointment.notes && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-medium text-blue-900 mb-1">Notes</p>
            <p className="text-sm text-blue-700">{appointment.notes}</p>
          </div>
        )}

        {appointment.status === 'SCHEDULED' && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleMarkCompleted}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <CheckCircleIcon className="w-5 h-5" />
              Mark as Completed
            </button>
            <Link
              href={`/doctor/appointments/${appointment.id}/prescribe-lab?patientId=${appointment.patient.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors"
            >
              <BeakerIcon className="w-5 h-5" />
              Prescribe Lab Test
            </Link>
            <Link
              href={`/doctor/appointments/${appointment.id}/prescribe-medicine?patientId=${appointment.patient.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            >
              <ClipboardDocumentListIcon className="w-5 h-5" />
              Prescribe Medicine
            </Link>
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <XCircleIcon className="w-5 h-5" />
              Cancel Appointment
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <BeakerIcon className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Lab Prescriptions</h2>
            <span className="text-sm text-gray-600">({appointment.labPrescriptions.length})</span>
          </div>
          {appointment.labPrescriptions.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-4">No lab prescriptions for this appointment</p>
          ) : (
            <div className="space-y-3">
              {appointment.labPrescriptions.map((prescription) => (
                <div key={prescription.id} className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{prescription.testName}</p>
                      <p className="text-xs text-gray-600">{prescription.lab.user.name}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        prescription.status === 'FULFILLED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {prescription.status}
                    </span>
                  </div>
                  {prescription.report && (
                    <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                      <p className="text-xs font-medium text-green-900">Report Available</p>
                      {prescription.report.findings && (
                        <p className="text-xs text-green-700 mt-1">{prescription.report.findings}</p>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Prescribed on {formatDate(prescription.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardDocumentListIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Medicine Prescriptions</h2>
            <span className="text-sm text-gray-600">({appointment.medicinePrescriptions.length})</span>
          </div>
          {appointment.medicinePrescriptions.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-4">No medicine prescriptions for this appointment</p>
          ) : (
            <div className="space-y-3">
              {appointment.medicinePrescriptions.map((prescription) => (
                <div key={prescription.id} className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {prescription.medicines?.length || 0} medicine(s)
                      </p>
                      <p className="text-xs text-gray-600">{prescription.pharmacy.user.name}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        prescription.status === 'FULFILLED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {prescription.status}
                    </span>
                  </div>
                  {prescription.medicines && Array.isArray(prescription.medicines) && (
                    <div className="mt-2 space-y-1">
                      {prescription.medicines.map((med: any, idx: number) => (
                        <div key={idx} className="text-xs text-gray-700 p-2 bg-gray-50 rounded">
                          <span className="font-medium">{med.name}</span> - {med.dosage} ({med.frequency} for {med.duration})
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Prescribed on {formatDate(prescription.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
