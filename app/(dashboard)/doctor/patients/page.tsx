'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { UserGroupIcon, CalendarIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'

interface Patient {
  id: string
  user: {
    name: string
    email: string
    phone: string | null
  }
  dateOfBirth: string
  gender: string
  bloodGroup: string | null
  _count: {
    appointments: number
    labPrescriptions: number
    medicinePrescriptions: number
  }
}

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/doctors/me/patients')
      if (res.ok) {
        const data = await res.json()
        setPatients(data.patients || [])
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter((patient) =>
    patient.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const calculateAge = (dateOfBirth: string) => {
    const dob = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }
    return age
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading patients...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
        <p className="text-sm text-gray-600 mt-1">Manage and view patient information</p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search patients by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
        />
      </div>

      {filteredPatients.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-12 border border-white/30 shadow-lg text-center">
          <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No patients found' : 'No patients yet'}
          </h3>
          <p className="text-gray-600 text-sm">
            {searchTerm ? 'Try a different search term' : 'Patients who book appointments with you will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPatients.map((patient) => (
            <Link
              key={patient.id}
              href={`/doctor/patients/${patient.id}`}
              className="bg-white/70 backdrop-blur-md rounded-xl p-5 border border-white/30 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-semibold text-lg">
                    {patient.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{patient.user.name}</h3>
                  <p className="text-sm text-gray-600 truncate">{patient.user.email}</p>
                  {patient.user.phone && (
                    <p className="text-xs text-gray-500 mt-0.5">{patient.user.phone}</p>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                    <span>{calculateAge(patient.dateOfBirth)} yrs</span>
                    <span>•</span>
                    <span>{patient.gender}</span>
                    {patient.bloodGroup && (
                      <>
                        <span>•</span>
                        <span className="font-medium">{patient.bloodGroup}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-600">{patient._count.appointments} appointments</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ClipboardDocumentListIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-600">
                        {patient._count.labPrescriptions + patient._count.medicinePrescriptions} prescriptions
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
