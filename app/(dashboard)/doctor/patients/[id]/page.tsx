'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatTime, calculateAge } from '@/lib/utils'
import {
  ArrowLeftIcon,
  UserIcon,
  CalendarIcon,
  BeakerIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  BuildingOfficeIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'

interface PatientDetails {
  id: string
  user: {
    name: string
    email: string
    phone: string | null
  }
  dateOfBirth: string
  gender: string
  bloodGroup: string | null
  address: string | null
  emergencyContact: string | null
  allergies: string[]
  appointments: any[]
  labPrescriptions: any[]
  medicinePrescriptions: any[]
  vitalRecords: any[]
  admissions: any[]
}

export default function PatientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [patient, setPatient] = useState<PatientDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPatient()
  }, [id])

  const fetchPatient = async () => {
    try {
      const res = await fetch(`/api/patients/${id}`)
      if (res.ok) {
        const data = await res.json()
        setPatient(data.patient)
      }
    } catch (error) {
      console.error('Error fetching patient:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading patient details...</div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="max-w-6xl">
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-12 border border-white/30 shadow-lg text-center">
          <p className="text-gray-600">Patient not found</p>
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
        Back to Patients
      </button>

      {/* Patient Info Card */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-lg mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-primary-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patient.user.name}</h1>
              <p className="text-sm text-gray-600 mt-1">{patient.user.email}</p>
              {patient.user.phone && <p className="text-sm text-gray-600">{patient.user.phone}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/doctor/patients/${patient.id}/prescribe-lab`}
              className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Prescribe Lab Test
            </Link>
            <Link
              href={`/doctor/patients/${patient.id}/prescribe-medicine`}
              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Prescribe Medicine
            </Link>
            <Link
              href={`/doctor/patients/${patient.id}/admit`}
              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Admit Patient
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-600">Age</p>
            <p className="text-sm font-semibold text-gray-900">{calculateAge(patient.dateOfBirth)} years</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Gender</p>
            <p className="text-sm font-semibold text-gray-900">{patient.gender}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Blood Group</p>
            <p className="text-sm font-semibold text-gray-900">{patient.bloodGroup || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Emergency Contact</p>
            <p className="text-sm font-semibold text-gray-900">{patient.emergencyContact || 'N/A'}</p>
          </div>
        </div>

        {patient.allergies.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs font-semibold text-red-900 mb-1">Allergies</p>
            <p className="text-sm text-red-800">{patient.allergies.join(', ')}</p>
          </div>
        )}

        {patient.address && (
          <div className="mt-4">
            <p className="text-xs text-gray-600">Address</p>
            <p className="text-sm text-gray-900">{patient.address}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Appointments */}
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-5 border border-white/30 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900">Appointments ({patient.appointments.length})</h2>
          </div>
          {patient.appointments.length === 0 ? (
            <p className="text-sm text-gray-600">No appointments</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {patient.appointments.slice(0, 5).map((apt: any) => (
                <div key={apt.id} className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{formatDate(apt.appointmentDate)}</p>
                  <p className="text-xs text-gray-600">{formatTime(apt.startTime)} - {formatTime(apt.endTime)}</p>
                  {apt.reason && <p className="text-xs text-gray-600 mt-1">{apt.reason}</p>}
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vital Records */}
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-5 border border-white/30 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <HeartIcon className="w-5 h-5 text-red-600" />
            <h2 className="font-semibold text-gray-900">Latest Vitals</h2>
          </div>
          {patient.vitalRecords.length === 0 ? (
            <p className="text-sm text-gray-600">No vital records</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {patient.vitalRecords[0].bloodPressureSystolic && (
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600">BP</p>
                  <p className="text-sm font-semibold">
                    {patient.vitalRecords[0].bloodPressureSystolic}/{patient.vitalRecords[0].bloodPressureDiastolic}
                  </p>
                </div>
              )}
              {patient.vitalRecords[0].temperature && (
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600">Temp</p>
                  <p className="text-sm font-semibold">{patient.vitalRecords[0].temperature}°F</p>
                </div>
              )}
              {patient.vitalRecords[0].pulse && (
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600">Pulse</p>
                  <p className="text-sm font-semibold">{patient.vitalRecords[0].pulse} bpm</p>
                </div>
              )}
              {patient.vitalRecords[0].spo2 && (
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600">SpO₂</p>
                  <p className="text-sm font-semibold">{patient.vitalRecords[0].spo2}%</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lab Prescriptions */}
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-5 border border-white/30 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <BeakerIcon className="w-5 h-5 text-purple-600" />
            <h2 className="font-semibold text-gray-900">Lab Prescriptions ({patient.labPrescriptions.length})</h2>
          </div>
          {patient.labPrescriptions.length === 0 ? (
            <p className="text-sm text-gray-600">No lab prescriptions</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {patient.labPrescriptions.slice(0, 5).map((prescription: any) => (
                <div key={prescription.id} className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{prescription.testName}</p>
                  <p className="text-xs text-gray-600">{prescription.lab.labName}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    prescription.status === 'FULFILLED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {prescription.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Medicine Prescriptions */}
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-5 border border-white/30 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardDocumentListIcon className="w-5 h-5 text-green-600" />
            <h2 className="font-semibold text-gray-900">Medicine Prescriptions ({patient.medicinePrescriptions.length})</h2>
          </div>
          {patient.medicinePrescriptions.length === 0 ? (
            <p className="text-sm text-gray-600">No medicine prescriptions</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {patient.medicinePrescriptions.slice(0, 5).map((prescription: any) => (
                <div key={prescription.id} className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{prescription.medicines.length} medicines</p>
                  <p className="text-xs text-gray-600">{prescription.pharmacy.pharmacyName}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    prescription.status === 'FULFILLED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {prescription.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
