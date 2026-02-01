'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface Lab {
  id: string
  labName: string
  address: string
}

interface Patient {
  user: {
    name: string
  }
}

export default function PrescribeLabTestPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [labs, setLabs] = useState<Lab[]>([])
  const [selectedLab, setSelectedLab] = useState('')
  const [testName, setTestName] = useState('')
  const [testDetails, setTestDetails] = useState('')
  const [instructions, setInstructions] = useState('')
  const [urgency, setUrgency] = useState('ROUTINE')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [patientRes, labsRes] = await Promise.all([
        fetch(`/api/patients/${params.id}`),
        fetch('/api/doctors/me/partnerships/labs'),
      ])

      if (patientRes.ok) {
        const patientData = await patientRes.json()
        setPatient(patientData)
      }

      if (labsRes.ok) {
        const labsData = await labsRes.json()
        setLabs(labsData.labs || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedLab || !testName) {
      setError('Please fill all required fields')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/prescriptions/lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: params.id,
          labId: selectedLab,
          testName,
          testDetails,
          instructions,
          urgency,
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
    <div className="max-w-2xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Prescribe Lab Test</h1>
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

        {/* Select Lab */}
        <div className="mb-4">
          <label htmlFor="lab" className="block text-sm font-medium text-gray-700 mb-1.5">
            Select Laboratory <span className="text-red-500">*</span>
          </label>
          <select
            id="lab"
            value={selectedLab}
            onChange={(e) => setSelectedLab(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            required
          >
            <option value="">Choose a laboratory...</option>
            {labs.map((lab) => (
              <option key={lab.id} value={lab.id}>
                {lab.labName} - {lab.address}
              </option>
            ))}
          </select>
        </div>

        {/* Test Name */}
        <div className="mb-4">
          <label htmlFor="testName" className="block text-sm font-medium text-gray-700 mb-1.5">
            Test Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="testName"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            placeholder="e.g., Complete Blood Count (CBC)"
            required
          />
        </div>

        {/* Test Details */}
        <div className="mb-4">
          <label htmlFor="testDetails" className="block text-sm font-medium text-gray-700 mb-1.5">
            Test Details
          </label>
          <textarea
            id="testDetails"
            value={testDetails}
            onChange={(e) => setTestDetails(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm resize-none"
            placeholder="Additional details about the test..."
          />
        </div>

        {/* Instructions */}
        <div className="mb-4">
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1.5">
            Instructions for Patient
          </label>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm resize-none"
            placeholder="e.g., Fasting required - 8-12 hours before test"
          />
        </div>

        {/* Urgency */}
        <div className="mb-6">
          <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1.5">
            Urgency
          </label>
          <select
            id="urgency"
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          >
            <option value="ROUTINE">Routine</option>
            <option value="URGENT">Urgent</option>
            <option value="STAT">STAT (Immediate)</option>
          </select>
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
