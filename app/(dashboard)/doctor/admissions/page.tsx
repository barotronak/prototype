'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { ClipboardDocumentListIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'

interface Admission {
  id: string
  admissionDate: string
  dischargeDate: string | null
  status: string
  primaryDiagnosis: string
  wardNumber: string | null
  bedNumber: string | null
  isIcuAdmission: boolean
  patient: {
    id: string
    user: {
      name: string
      email: string
    }
    gender: string
    bloodGroup: string | null
  }
}

export default function DoctorAdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'admitted' | 'discharged'>('admitted')

  useEffect(() => {
    fetchAdmissions()
  }, [])

  const fetchAdmissions = async () => {
    try {
      const res = await fetch('/api/admissions')
      if (res.ok) {
        const data = await res.json()
        setAdmissions(data.admissions || [])
      }
    } catch (error) {
      console.error('Error fetching admissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ADMITTED':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'DISCHARGED':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'TRANSFERRED':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const filteredAdmissions = admissions.filter((adm) => {
    if (filter === 'admitted') return adm.status === 'ADMITTED'
    if (filter === 'discharged') return adm.status === 'DISCHARGED'
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading admissions...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patient Admissions</h1>
        <p className="text-sm text-gray-600 mt-1">Manage admitted patients</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('admitted')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'admitted'
              ? 'bg-primary-500 text-white'
              : 'bg-white/70 text-gray-700 hover:bg-white'
          }`}
        >
          Currently Admitted
        </button>
        <button
          onClick={() => setFilter('discharged')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'discharged'
              ? 'bg-primary-500 text-white'
              : 'bg-white/70 text-gray-700 hover:bg-white'
          }`}
        >
          Discharged
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-white/70 text-gray-700 hover:bg-white'
          }`}
        >
          All
        </button>
      </div>

      {filteredAdmissions.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-12 border border-white/30 shadow-lg text-center">
          <ClipboardDocumentListIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No admissions found</h3>
          <p className="text-gray-600 text-sm">
            {filter === 'admitted' && 'No currently admitted patients'}
            {filter === 'discharged' && 'No discharged patients'}
            {filter === 'all' && 'No patient admissions yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAdmissions.map((admission) => (
            <div
              key={admission.id}
              className="bg-white/70 backdrop-blur-md rounded-xl p-5 border border-white/30 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-primary-700" />
                  </div>
                  <div>
                    <Link
                      href={`/doctor/patients/${admission.patient.id}`}
                      className="font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                    >
                      {admission.patient.user.name}
                    </Link>
                    <p className="text-sm text-gray-600">{admission.patient.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {admission.isIcuAdmission && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                      ICU
                    </span>
                  )}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(admission.status)}`}>
                    {admission.status}
                  </span>
                </div>
              </div>

              <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-1">Primary Diagnosis</p>
                <p className="text-sm text-gray-700">{admission.primaryDiagnosis}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-gray-600">Admitted On</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(admission.admissionDate)}</p>
                </div>
                {admission.dischargeDate && (
                  <div>
                    <p className="text-xs text-gray-600">Discharged On</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(admission.dischargeDate)}</p>
                  </div>
                )}
                {admission.wardNumber && (
                  <div>
                    <p className="text-xs text-gray-600">Ward</p>
                    <p className="text-sm font-medium text-gray-900">{admission.wardNumber}</p>
                  </div>
                )}
                {admission.bedNumber && (
                  <div>
                    <p className="text-xs text-gray-600">Bed</p>
                    <p className="text-sm font-medium text-gray-900">{admission.bedNumber}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
