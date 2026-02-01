'use client'

import { useState, useEffect } from 'react'
import { BeakerIcon, BuildingStorefrontIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Lab {
  id: string
  labName: string
  address: string
  servicesOffered: string[]
}

interface Pharmacy {
  id: string
  pharmacyName: string
  address: string
}

export default function DoctorPartnershipsPage() {
  const [labs, setLabs] = useState<Lab[]>([])
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [allLabs, setAllLabs] = useState<Lab[]>([])
  const [allPharmacies, setAllPharmacies] = useState<Pharmacy[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddLab, setShowAddLab] = useState(false)
  const [showAddPharmacy, setShowAddPharmacy] = useState(false)
  const [selectedLabId, setSelectedLabId] = useState('')
  const [selectedPharmacyId, setSelectedPharmacyId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPartnerships()
    fetchAllLabsAndPharmacies()
  }, [])

  const fetchPartnerships = async () => {
    try {
      const [labsRes, pharmaciesRes] = await Promise.all([
        fetch('/api/doctors/me/partnerships/labs'),
        fetch('/api/doctors/me/partnerships/pharmacies'),
      ])

      if (labsRes.ok) {
        const data = await labsRes.json()
        setLabs(data.labs || [])
      }

      if (pharmaciesRes.ok) {
        const data = await pharmaciesRes.json()
        setPharmacies(data.pharmacies || [])
      }
    } catch (error) {
      console.error('Error fetching partnerships:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllLabsAndPharmacies = async () => {
    try {
      const [labsRes, pharmaciesRes] = await Promise.all([
        fetch('/api/laboratories'),
        fetch('/api/pharmacies'),
      ])

      if (labsRes.ok) {
        const data = await labsRes.json()
        setAllLabs(data.laboratories || [])
      }

      if (pharmaciesRes.ok) {
        const data = await pharmaciesRes.json()
        setAllPharmacies(data.pharmacies || [])
      }
    } catch (error) {
      console.error('Error fetching all labs/pharmacies:', error)
    }
  }

  const handleAddLab = async () => {
    if (!selectedLabId) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/doctors/me/partnerships/labs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labId: selectedLabId }),
      })

      if (res.ok) {
        setShowAddLab(false)
        setSelectedLabId('')
        fetchPartnerships()
      }
    } catch (error) {
      console.error('Error adding lab partnership:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveLab = async (labId: string) => {
    if (!confirm('Remove this lab partnership?')) return

    try {
      const res = await fetch(`/api/doctors/me/partnerships/labs/${labId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchPartnerships()
      }
    } catch (error) {
      console.error('Error removing lab partnership:', error)
    }
  }

  const handleAddPharmacy = async () => {
    if (!selectedPharmacyId) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/doctors/me/partnerships/pharmacies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pharmacyId: selectedPharmacyId }),
      })

      if (res.ok) {
        setShowAddPharmacy(false)
        setSelectedPharmacyId('')
        fetchPartnerships()
      }
    } catch (error) {
      console.error('Error adding pharmacy partnership:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemovePharmacy = async (pharmacyId: string) => {
    if (!confirm('Remove this pharmacy partnership?')) return

    try {
      const res = await fetch(`/api/doctors/me/partnerships/pharmacies/${pharmacyId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchPartnerships()
      }
    } catch (error) {
      console.error('Error removing pharmacy partnership:', error)
    }
  }

  const availableLabs = allLabs.filter((lab) => !labs.some((l) => l.id === lab.id))
  const availablePharmacies = allPharmacies.filter((pharmacy) => !pharmacies.some((p) => p.id === pharmacy.id))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading partnerships...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Partnerships</h1>
        <p className="text-sm text-gray-600 mt-1">Your preferred laboratories and pharmacies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Laboratories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BeakerIcon className="w-5 h-5 text-purple-600" />
              <h2 className="font-semibold text-gray-900">Partner Laboratories ({labs.length})</h2>
            </div>
            <button
              onClick={() => setShowAddLab(!showAddLab)}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Add Lab
            </button>
          </div>

          {showAddLab && availableLabs.length > 0 && (
            <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/30 shadow-lg mb-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Add Laboratory Partnership</h3>
              <div className="flex gap-2">
                <select
                  value={selectedLabId}
                  onChange={(e) => setSelectedLabId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select a laboratory...</option>
                  {availableLabs.map((lab) => (
                    <option key={lab.id} value={lab.id}>
                      {lab.labName}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddLab}
                  disabled={!selectedLabId || submitting}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg disabled:opacity-50 transition-colors text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddLab(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {labs.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-md rounded-xl p-8 border border-white/30 shadow-lg text-center">
              <p className="text-sm text-gray-600">No laboratory partnerships yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {labs.map((lab) => (
                <div
                  key={lab.id}
                  className="bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{lab.labName}</h3>
                      <p className="text-sm text-gray-600 mb-2">{lab.address}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveLab(lab.id)}
                      className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      title="Remove partnership"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  {lab.servicesOffered.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {lab.servicesOffered.slice(0, 3).map((service, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs"
                        >
                          {service}
                        </span>
                      ))}
                      {lab.servicesOffered.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          +{lab.servicesOffered.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pharmacies */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BuildingStorefrontIcon className="w-5 h-5 text-green-600" />
              <h2 className="font-semibold text-gray-900">Partner Pharmacies ({pharmacies.length})</h2>
            </div>
            <button
              onClick={() => setShowAddPharmacy(!showAddPharmacy)}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Add Pharmacy
            </button>
          </div>

          {showAddPharmacy && availablePharmacies.length > 0 && (
            <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/30 shadow-lg mb-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Add Pharmacy Partnership</h3>
              <div className="flex gap-2">
                <select
                  value={selectedPharmacyId}
                  onChange={(e) => setSelectedPharmacyId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select a pharmacy...</option>
                  {availablePharmacies.map((pharmacy) => (
                    <option key={pharmacy.id} value={pharmacy.id}>
                      {pharmacy.pharmacyName}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddPharmacy}
                  disabled={!selectedPharmacyId || submitting}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg disabled:opacity-50 transition-colors text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddPharmacy(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {pharmacies.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-md rounded-xl p-8 border border-white/30 shadow-lg text-center">
              <p className="text-sm text-gray-600">No pharmacy partnerships yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pharmacies.map((pharmacy) => (
                <div
                  key={pharmacy.id}
                  className="bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{pharmacy.pharmacyName}</h3>
                      <p className="text-sm text-gray-600">{pharmacy.address}</p>
                    </div>
                    <button
                      onClick={() => handleRemovePharmacy(pharmacy.id)}
                      className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      title="Remove partnership"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
