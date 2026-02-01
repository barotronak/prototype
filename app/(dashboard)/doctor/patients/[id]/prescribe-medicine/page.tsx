'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Pharmacy {
  id: string
  pharmacyName: string
  address: string
}

interface Patient {
  user: {
    name: string
  }
}

interface Medicine {
  name: string
  dosage: string
  frequency: string
  duration: string
}

export default function PrescribeMedicinePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [selectedPharmacy, setSelectedPharmacy] = useState('')
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: '', dosage: '', frequency: '', duration: '' },
  ])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [patientRes, pharmaciesRes] = await Promise.all([
        fetch(`/api/patients/${params.id}`),
        fetch('/api/doctors/me/partnerships/pharmacies'),
      ])

      if (patientRes.ok) {
        const patientData = await patientRes.json()
        setPatient(patientData)
      }

      if (pharmaciesRes.ok) {
        const pharmaciesData = await pharmaciesRes.json()
        setPharmacies(pharmaciesData.pharmacies || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }])
  }

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index))
  }

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    const updated = [...medicines]
    updated[index][field] = value
    setMedicines(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedPharmacy) {
      setError('Please select a pharmacy')
      return
    }

    const validMedicines = medicines.filter((m) => m.name && m.dosage && m.frequency && m.duration)
    if (validMedicines.length === 0) {
      setError('Please add at least one complete medicine')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/prescriptions/medicine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: params.id,
          pharmacyId: selectedPharmacy,
          medicines: validMedicines,
          notes,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push(`/doctor/patients/${params.id}`)
      } else {
        setError(data.error || 'Failed to create prescription')
      }
    } catch (error) {
      setError('An error occurred while creating prescription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Prescribe Medicine</h1>
        {patient && (
          <p className="text-sm text-gray-600 mt-1">For patient: {patient.user.name}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-lg">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Select Pharmacy */}
        <div className="mb-6">
          <label htmlFor="pharmacy" className="block text-sm font-medium text-gray-700 mb-1.5">
            Select Pharmacy <span className="text-red-500">*</span>
          </label>
          <select
            id="pharmacy"
            value={selectedPharmacy}
            onChange={(e) => setSelectedPharmacy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            required
          >
            <option value="">Choose a pharmacy...</option>
            {pharmacies.map((pharmacy) => (
              <option key={pharmacy.id} value={pharmacy.id}>
                {pharmacy.pharmacyName} - {pharmacy.address}
              </option>
            ))}
          </select>
        </div>

        {/* Medicines */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Medicines <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={addMedicine}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Add Medicine
            </button>
          </div>

          <div className="space-y-3">
            {medicines.map((medicine, index) => (
              <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-medium text-gray-600">Medicine {index + 1}</span>
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      value={medicine.name}
                      onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                      placeholder="Medicine name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={medicine.dosage}
                      onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                      placeholder="Dosage (e.g., 500mg)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={medicine.frequency}
                      onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                      placeholder="Frequency (e.g., Twice daily)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={medicine.duration}
                      onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                      placeholder="Duration (e.g., 7 days)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1.5">
            Notes for Patient
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm resize-none"
            placeholder="Additional instructions or notes..."
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {loading ? 'Creating...' : 'Create Prescription'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
