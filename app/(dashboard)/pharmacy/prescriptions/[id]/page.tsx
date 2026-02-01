'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

interface Medicine {
  name: string
  dosage: string
  frequency: string
  duration: string
}

interface MedicinePrescription {
  id: string
  medicines: Medicine[]
  instructions?: string
  status: string
  createdAt: string
  prescriptionPdfUrl?: string
  fulfillmentNotes?: string
  doctor: {
    user: {
      name: string
      email: string
    }
    specialization: string
  }
  patient: {
    user: {
      name: string
      email: string
    }
  }
  pharmacy: {
    user: {
      name: string
    }
  }
}

export default function PharmacyPrescriptionDetails() {
  const router = useRouter()
  const params = useParams()
  const [prescription, setPrescription] = useState<MedicinePrescription | null>(null)
  const [loading, setLoading] = useState(true)
  const [fulfilling, setFulfilling] = useState(false)
  const [error, setError] = useState('')
  const [fulfillmentNotes, setFulfillmentNotes] = useState('')

  useEffect(() => {
    fetchPrescription()
  }, [params.id])

  async function fetchPrescription() {
    try {
      const response = await fetch(`/api/prescriptions/medicine/${params.id}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setPrescription(data.prescription)
        setFulfillmentNotes(data.prescription.fulfillmentNotes || '')
      } else {
        setError('Failed to load prescription')
      }
    } catch (error) {
      console.error('Failed to fetch prescription:', error)
      setError('Failed to load prescription')
    } finally {
      setLoading(false)
    }
  }

  async function handleFulfill() {
    if (!prescription) return

    setError('')
    setFulfilling(true)

    try {
      const response = await fetch(`/api/prescriptions/medicine/${prescription.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'FULFILLED',
          fulfillmentNotes,
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fulfill prescription')
      }

      router.push('/pharmacy/prescriptions')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fulfill prescription')
    } finally {
      setFulfilling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-white text-lg">Loading prescription...</div>
      </div>
    )
  }

  if (!prescription) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <Card variant="glass">
            <CardContent className="py-12">
              <div className="text-center text-red-600">
                {error || 'Prescription not found'}
              </div>
              <div className="text-center mt-4">
                <Button onClick={() => router.push('/pharmacy/prescriptions')}>
                  Back to Prescriptions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/pharmacy/prescriptions')}
            className="mb-4 text-white"
          >
            ← Back to Prescriptions
          </Button>
          <h1 className="text-3xl font-bold text-white mb-2">Prescription Details</h1>
          <p className="text-white/80">View and fulfill prescription order</p>
        </div>

        {/* Prescription Info */}
        <Card variant="glass" className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Prescription Information</CardTitle>
              <Badge variant={prescription.status === 'FULFILLED' ? 'success' : 'warning'}>
                {prescription.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Patient</div>
                <div className="font-medium text-lg">{prescription.patient.user.name}</div>
                <div className="text-sm text-gray-600">{prescription.patient.user.email}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Prescribed By</div>
                <div className="font-medium text-lg">Dr. {prescription.doctor.user.name}</div>
                <div className="text-sm text-gray-600">{prescription.doctor.specialization}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Prescription Date</div>
                <div className="font-medium">
                  {new Date(prescription.createdAt).toLocaleString()}
                </div>
              </div>

              {prescription.prescriptionPdfUrl && (
                <div>
                  <a
                    href={prescription.prescriptionPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Prescription PDF →
                  </a>
                </div>
              )}

              {prescription.instructions && (
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-500 mb-1">Instructions</div>
                  <p className="text-gray-700">{prescription.instructions}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Medicines List */}
        <Card variant="glass" className="mb-6">
          <CardHeader>
            <CardTitle>Medicines ({prescription.medicines.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prescription.medicines.map((medicine, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/50 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-lg mb-2">
                        {index + 1}. {medicine.name}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Dosage:</span>{' '}
                          <span className="font-medium text-gray-900">{medicine.dosage}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Frequency:</span>{' '}
                          <span className="font-medium text-gray-900">{medicine.frequency}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>{' '}
                          <span className="font-medium text-gray-900">{medicine.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fulfillment Section */}
        {prescription.status === 'PENDING' ? (
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Fulfill Order</CardTitle>
              <CardDescription>
                Add any notes and mark this prescription as fulfilled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Textarea
                  label="Fulfillment Notes (Optional)"
                  placeholder="Add any notes about the order fulfillment..."
                  value={fulfillmentNotes}
                  onChange={(e) => setFulfillmentNotes(e.target.value)}
                  rows={4}
                />

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.push('/pharmacy/prescriptions')}
                    disabled={fulfilling}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    loading={fulfilling}
                    disabled={fulfilling}
                    onClick={handleFulfill}
                  >
                    Mark as Fulfilled
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Order Fulfilled</CardTitle>
            </CardHeader>
            <CardContent>
              {prescription.fulfillmentNotes && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Fulfillment Notes</div>
                  <p className="text-gray-700">{prescription.fulfillmentNotes}</p>
                </div>
              )}
              <div className="mt-4">
                <Button onClick={() => router.push('/pharmacy/prescriptions')}>
                  Back to Prescriptions
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
