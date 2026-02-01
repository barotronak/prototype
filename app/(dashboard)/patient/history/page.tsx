'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'
import {
  CalendarIcon,
  BeakerIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  HeartIcon,
} from '@heroicons/react/24/outline'

interface TimelineEvent {
  id: string
  type: 'appointment' | 'lab_prescription' | 'medicine_prescription' | 'lab_report'
  date: string
  title: string
  description: string
  status?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export default function MedicalHistoryPage() {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      // Fetch all data in parallel
      const [appointmentsRes, labPrescriptionsRes, medicinePrescriptionsRes, reportsRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/prescriptions/lab'),
        fetch('/api/prescriptions/medicine'),
        fetch('/api/lab-reports'),
      ])

      const appointments = appointmentsRes.ok ? (await appointmentsRes.json()).appointments || [] : []
      const labPrescriptions = labPrescriptionsRes.ok ? (await labPrescriptionsRes.json()).prescriptions || [] : []
      const medicinePrescriptions = medicinePrescriptionsRes.ok
        ? (await medicinePrescriptionsRes.json()).prescriptions || []
        : []
      const reports = reportsRes.ok ? (await reportsRes.json()).reports || [] : []

      // Convert to timeline events
      const events: TimelineEvent[] = []

      appointments.forEach((apt: any) => {
        events.push({
          id: apt.id,
          type: 'appointment',
          date: apt.appointmentDate,
          title: `Appointment with ${apt.doctor.user.name}`,
          description: `${apt.doctor.specialization}${apt.reason ? ` - ${apt.reason}` : ''}`,
          status: apt.status,
          icon: CalendarIcon,
          color: 'bg-blue-500',
        })
      })

      labPrescriptions.forEach((prescription: any) => {
        events.push({
          id: prescription.id,
          type: 'lab_prescription',
          date: prescription.createdAt,
          title: `Lab Test: ${prescription.testName}`,
          description: `Prescribed by ${prescription.doctor.user.name} at ${prescription.lab.labName}`,
          status: prescription.status,
          icon: BeakerIcon,
          color: 'bg-purple-500',
        })
      })

      medicinePrescriptions.forEach((prescription: any) => {
        const medicineCount = prescription.medicines.length
        events.push({
          id: prescription.id,
          type: 'medicine_prescription',
          date: prescription.createdAt,
          title: `Medicine Prescription (${medicineCount} medicine${medicineCount > 1 ? 's' : ''})`,
          description: `Prescribed by ${prescription.doctor.user.name} at ${prescription.pharmacy.pharmacyName}`,
          status: prescription.status,
          icon: ClipboardDocumentListIcon,
          color: 'bg-green-500',
        })
      })

      reports.forEach((report: any) => {
        events.push({
          id: report.id,
          type: 'lab_report',
          date: report.completedAt,
          title: `Lab Report: ${report.labPrescription.testName}`,
          description: `Completed by ${report.lab.labName}`,
          icon: DocumentTextIcon,
          color: 'bg-emerald-500',
        })
      })

      // Sort by date descending
      events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setTimeline(events)
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'SCHEDULED':
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'COMPLETED':
      case 'FULFILLED':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading medical history...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Medical History</h1>
        <p className="text-sm text-gray-600 mt-1">Complete timeline of your medical records</p>
      </div>

      {timeline.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-12 border border-white/30 shadow-lg text-center">
          <HeartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No medical history yet</h3>
          <p className="text-gray-600 text-sm">Your medical events will appear here</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {/* Timeline Events */}
          <div className="space-y-4">
            {timeline.map((event) => {
              const Icon = event.icon
              return (
                <div key={`${event.type}-${event.id}`} className="relative pl-12">
                  {/* Icon */}
                  <div className={`absolute left-0 w-10 h-10 ${event.color} rounded-full flex items-center justify-center shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{event.title}</h3>
                      {event.status && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    <p className="text-xs text-gray-500">{formatDate(event.date)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
