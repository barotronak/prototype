'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'
import { HeartIcon } from '@heroicons/react/24/outline'

interface VitalRecord {
  id: string
  bloodPressureSystolic: number | null
  bloodPressureDiastolic: number | null
  temperature: number | null
  pulse: number | null
  spo2: number | null
  bloodSugar: number | null
  weight: number | null
  height: number | null
  bmi: number | null
  notes: string | null
  recordedAt: string
  recordedBy: string | null
}

export default function VitalsPage() {
  const [vitals, setVitals] = useState<VitalRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVitals()
  }, [])

  const fetchVitals = async () => {
    try {
      const res = await fetch('/api/vitals')
      if (res.ok) {
        const data = await res.json()
        setVitals(data.vitals || [])
      }
    } catch (error) {
      console.error('Error fetching vitals:', error)
    } finally {
      setLoading(false)
    }
  }

  const getVitalClass = (value: number | null, normal: { min: number; max: number }) => {
    if (value === null) return ''
    if (value < normal.min || value > normal.max) return 'text-red-600 font-semibold'
    return 'text-green-600'
  }

  const normalRanges = {
    systolic: { min: 90, max: 120 },
    diastolic: { min: 60, max: 80 },
    temperature: { min: 97, max: 99 },
    pulse: { min: 60, max: 100 },
    spo2: { min: 95, max: 100 },
    bloodSugar: { min: 70, max: 140 },
    bmi: { min: 18.5, max: 25 },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading vitals...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vital Signs</h1>
        <p className="text-sm text-gray-600 mt-1">Track your vital signs over time</p>
      </div>

      {vitals.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-12 border border-white/30 shadow-lg text-center">
          <HeartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No vital records yet</h3>
          <p className="text-gray-600 text-sm">Your vital signs will be recorded during checkups</p>
        </div>
      ) : (
        <div className="space-y-4">
          {vitals.map((vital) => (
            <div
              key={vital.id}
              className="bg-white/70 backdrop-blur-md rounded-xl p-5 border border-white/30 shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Vital Signs Record</h3>
                  <p className="text-sm text-gray-600">{formatDate(vital.recordedAt)}</p>
                  {vital.recordedBy && (
                    <p className="text-xs text-gray-500 mt-1">Recorded by: {vital.recordedBy}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Blood Pressure */}
                {vital.bloodPressureSystolic && vital.bloodPressureDiastolic && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Blood Pressure</p>
                    <p className="text-lg font-semibold">
                      <span className={getVitalClass(vital.bloodPressureSystolic, normalRanges.systolic)}>
                        {vital.bloodPressureSystolic}
                      </span>
                      /
                      <span className={getVitalClass(vital.bloodPressureDiastolic, normalRanges.diastolic)}>
                        {vital.bloodPressureDiastolic}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">mmHg</p>
                  </div>
                )}

                {/* Temperature */}
                {vital.temperature && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Temperature</p>
                    <p className={`text-lg font-semibold ${getVitalClass(vital.temperature, normalRanges.temperature)}`}>
                      {vital.temperature}°F
                    </p>
                  </div>
                )}

                {/* Pulse */}
                {vital.pulse && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Pulse</p>
                    <p className={`text-lg font-semibold ${getVitalClass(vital.pulse, normalRanges.pulse)}`}>
                      {vital.pulse}
                    </p>
                    <p className="text-xs text-gray-500">bpm</p>
                  </div>
                )}

                {/* SpO2 */}
                {vital.spo2 && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">SpO₂</p>
                    <p className={`text-lg font-semibold ${getVitalClass(vital.spo2, normalRanges.spo2)}`}>
                      {vital.spo2}%
                    </p>
                  </div>
                )}

                {/* Blood Sugar */}
                {vital.bloodSugar && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Blood Sugar</p>
                    <p className={`text-lg font-semibold ${getVitalClass(vital.bloodSugar, normalRanges.bloodSugar)}`}>
                      {vital.bloodSugar}
                    </p>
                    <p className="text-xs text-gray-500">mg/dL</p>
                  </div>
                )}

                {/* Weight */}
                {vital.weight && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Weight</p>
                    <p className="text-lg font-semibold text-gray-900">{vital.weight} kg</p>
                  </div>
                )}

                {/* Height */}
                {vital.height && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Height</p>
                    <p className="text-lg font-semibold text-gray-900">{vital.height} cm</p>
                  </div>
                )}

                {/* BMI */}
                {vital.bmi && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">BMI</p>
                    <p className={`text-lg font-semibold ${getVitalClass(vital.bmi, normalRanges.bmi)}`}>
                      {vital.bmi}
                    </p>
                  </div>
                )}
              </div>

              {vital.notes && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-medium text-blue-900 mb-1">Notes</p>
                  <p className="text-sm text-blue-800">{vital.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
