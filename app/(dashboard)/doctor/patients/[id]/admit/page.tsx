'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface Patient {
  user: {
    name: string
  }
}

export default function AdmitPatientPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [wardNumber, setWardNumber] = useState('')
  const [bedNumber, setBedNumber] = useState('')
  const [isIcuAdmission, setIsIcuAdmission] = useState(false)
  const [treatmentPlan, setTreatmentPlan] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPatient()
  }, [])

  const fetchPatient = async () => {
    try {
      const res = await fetch(`/api/patients/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setPatient(data)
      }
    } catch (error) {
      console.error('Error fetching patient:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!primaryDiagnosis) {
      setError('Primary diagnosis is required')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: params.id,
          primaryDiagnosis,
          secondaryDiagnoses: [],
          symptoms,
          wardNumber,
          bedNumber,
          isIcuAdmission,
          treatmentPlan,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/doctor/admissions')
      } else {
        setError(data.error || 'Failed to admit patient')
      }
    } catch (error) {
      setError('An error occurred while admitting patient')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admit Patient</h1>
        {patient && (
          <p className="text-sm text-gray-600 mt-1">Admitting: {patient.user.name}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-lg">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Primary Diagnosis */}
        <div className="mb-4">
          <label htmlFor="primaryDiagnosis" className="block text-sm font-medium text-gray-700 mb-1.5">
            Primary Diagnosis <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="primaryDiagnosis"
            value={primaryDiagnosis}
            onChange={(e) => setPrimaryDiagnosis(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            placeholder="e.g., Acute Respiratory Infection"
            required
          />
        </div>

        {/* Symptoms */}
        <div className="mb-4">
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1.5">
            Symptoms
          </label>
          <textarea
            id="symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm resize-none"
            placeholder="Describe symptoms..."
          />
        </div>

        {/* Ward and Bed */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="wardNumber" className="block text-sm font-medium text-gray-700 mb-1.5">
              Ward Number
            </label>
            <input
              type="text"
              id="wardNumber"
              value={wardNumber}
              onChange={(e) => setWardNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              placeholder="e.g., General Ward"
            />
          </div>
          <div>
            <label htmlFor="bedNumber" className="block text-sm font-medium text-gray-700 mb-1.5">
              Bed Number
            </label>
            <input
              type="text"
              id="bedNumber"
              value={bedNumber}
              onChange={(e) => setBedNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              placeholder="e.g., A-101"
            />
          </div>
        </div>

        {/* ICU Admission */}
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isIcuAdmission}
              onChange={(e) => setIsIcuAdmission(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">ICU Admission</span>
          </label>
        </div>

        {/* Treatment Plan */}
        <div className="mb-6">
          <label htmlFor="treatmentPlan" className="block text-sm font-medium text-gray-700 mb-1.5">
            Treatment Plan
          </label>
          <textarea
            id="treatmentPlan"
            value={treatmentPlan}
            onChange={(e) => setTreatmentPlan(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm resize-none"
            placeholder="Describe the treatment plan..."
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {loading ? 'Admitting...' : 'Admit Patient'}
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
