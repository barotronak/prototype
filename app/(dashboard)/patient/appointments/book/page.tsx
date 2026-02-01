'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatTime } from '@/lib/utils'

interface Doctor {
  id: string
  specialization: string
  consultationFee: number
  user: {
    name: string
    email: string
  }
}

export default function BookAppointmentPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState('')

  // Fetch doctors on mount
  useEffect(() => {
    fetchDoctors()
  }, [])

  // Fetch available slots when doctor and date change
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots()
    } else {
      setAvailableSlots([])
      setSelectedSlot('')
    }
  }, [selectedDoctor, selectedDate])

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/doctors')
      if (res.ok) {
        const data = await res.json()
        setDoctors(data.doctors || [])
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
    }
  }

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true)
    setAvailableSlots([])
    setSelectedSlot('')

    try {
      const res = await fetch(
        `/api/appointments/available-slots?doctorId=${selectedDoctor}&date=${selectedDate}`
      )
      if (res.ok) {
        const data = await res.json()
        setAvailableSlots(data.availableSlots || [])
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      setError('Please fill all required fields')
      return
    }

    setLoading(true)

    try {
      const appointmentDateTime = new Date(selectedSlot)
      const endDateTime = new Date(appointmentDateTime.getTime() + 30 * 60000) // 30 min appointment

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctor,
          appointmentDate: appointmentDateTime.toISOString(),
          startTime: appointmentDateTime.toTimeString().slice(0, 5),
          endTime: endDateTime.toTimeString().slice(0, 5),
          reason,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/patient/appointments')
      } else {
        setError(data.error || 'Failed to book appointment')
      }
    } catch (error) {
      setError('An error occurred while booking')
    } finally {
      setLoading(false)
    }
  }

  const selectedDoctorInfo = doctors.find((d) => d.id === selectedDoctor)

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-sm text-gray-600 mt-1">Schedule an appointment with a doctor</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-lg">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Select Doctor */}
        <div className="mb-4">
          <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-1.5">
            Select Doctor <span className="text-red-500">*</span>
          </label>
          <select
            id="doctor"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            required
            disabled={loadingSlots}
          >
            <option value="">Choose a doctor...</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.user.name} - {doctor.specialization} (${doctor.consultationFee})
              </option>
            ))}
          </select>
        </div>

        {/* Loading Indicator */}
        {loadingSlots && selectedDoctor && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-blue-700 font-medium">Loading doctor availability...</p>
            </div>
          </div>
        )}

        {/* Selected Doctor Info */}
        {selectedDoctorInfo && !loadingSlots && (
          <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-900">{selectedDoctorInfo.user.name}</h3>
            <p className="text-xs text-gray-600 mt-0.5">{selectedDoctorInfo.specialization}</p>
            <p className="text-xs text-gray-700 mt-1">
              Consultation Fee: <span className="font-semibold">${selectedDoctorInfo.consultationFee}</span>
            </p>
          </div>
        )}

        {/* Select Date */}
        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1.5">
            Appointment Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={today}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            required
            disabled={!selectedDoctor || loadingSlots}
          />
        </div>

        {/* Available Slots */}
        {selectedDoctor && selectedDate && !loadingSlots && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Available Time Slots <span className="text-red-500">*</span>
            </label>
            {availableSlots.length === 0 ? (
              <div className="text-sm text-gray-600 py-4 text-center bg-gray-50 rounded-lg border border-gray-200">
                No available slots for this date. Please try another date.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map((slot) => {
                  const slotDate = new Date(slot)
                  const timeStr = slotDate.toTimeString().slice(0, 5)
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        selectedSlot === slot
                          ? 'bg-primary-500 text-white border-primary-600'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-600'
                      }`}
                    >
                      {formatTime(timeStr)}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Reason */}
        <div className="mb-6">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1.5">
            Reason for Visit (Optional)
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm resize-none"
            placeholder="Describe your symptoms or reason for consultation..."
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !selectedSlot}
            className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {loading ? 'Booking...' : 'Book Appointment'}
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
