'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'
import { ClipboardDocumentListIcon, BuildingStorefrontIcon, UserIcon } from '@heroicons/react/24/outline'

interface Medicine {
  name: string
  dosage: string
  frequency: string
  duration: string
}

interface MedicinePrescription {
  id: string
  medicines: Medicine[]
  notes: string | null
  status: string
  createdAt: string
  doctor: {
    user: {
      name: string
    }
    specialization: string
  }
  pharmacy: {
    pharmacyName: string
    address: string
  }
}

export default function MedicinePrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<MedicinePrescription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const fetchPrescriptions = async () => {
    try {
      const res = await fetch('/api/prescriptions/medicine')
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
        <h1 className="text-2xl font-bold text-gray-900">Medicine Prescriptions</h1>
        <p className="text-sm text-gray-600 mt-1">View your medicine prescriptions</p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-12 border border-white/30 shadow-lg text-center">
          <ClipboardDocumentListIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No prescriptions yet</h3>
          <p className="text-gray-600 text-sm">Your medicine prescriptions will appear here</p>
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
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(prescription.status)}`}>
                  {prescription.status}
                </span>
              </div>

              {/* Pharmacy */}
              <div className="flex items-start gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                <BuildingStorefrontIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{prescription.pharmacy.pharmacyName}</p>
                  <p className="text-xs text-gray-600">{prescription.pharmacy.address}</p>
                </div>
              </div>

              {/* Medicines */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Prescribed Medicines</h4>
                <div className="space-y-2">
                  {prescription.medicines.map((medicine, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{medicine.name}</p>
                          <p className="text-xs text-gray-600">Dosage: {medicine.dosage}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Frequency: {medicine.frequency}</p>
                          <p className="text-xs text-gray-600">Duration: {medicine.duration}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {prescription.notes && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-medium text-blue-900 mb-1">Doctor's Notes</p>
                  <p className="text-sm text-blue-800">{prescription.notes}</p>
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
