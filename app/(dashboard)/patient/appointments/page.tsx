'use client'

import { useState, useEffect } from 'react'
import { formatDate, formatTime } from '@/lib/utils'
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline'

interface Appointment {
  id: string
  appointmentDate: string
  startTime: string
  endTime: string
  status: string
  reason: string | null
  doctor: {
    user: {
      name: string
    }
    specialization: string
    consultationFee: number
  }
}

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments')
      if (res.ok) {
        const data = await res.json()
        setAppointments(data.appointments || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading appointments...</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-sm text-gray-600 mt-1">View and manage your appointments</p>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-12 border border-white/30 shadow-lg text-center">
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments yet</h3>
          <p className="text-gray-600 text-sm">You don't have any scheduled appointments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white/70 backdrop-blur-md rounded-xl p-5 border border-white/30 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-primary-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{appointment.doctor.user.name}</h3>
                      <p className="text-sm text-gray-600">{appointment.doctor.specialization}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <CalendarIcon className="w-4 h-4 text-gray-500" />
                      <span>{formatDate(appointment.appointmentDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <ClockIcon className="w-4 h-4 text-gray-500" />
                      <span>
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </span>
                    </div>
                  </div>

                  {appointment.reason && (
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2 mb-3">
                      <span className="font-medium">Reason:</span> {appointment.reason}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>
                    <span className="text-sm text-gray-600">
                      Fee: <span className="font-semibold">${appointment.doctor.consultationFee}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
