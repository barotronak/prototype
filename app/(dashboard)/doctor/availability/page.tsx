'use client'

import { useState, useEffect } from 'react'
import { formatTime } from '@/lib/utils'
import { ClockIcon, CheckIcon, XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Availability {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  slotDuration: number
  isActive: boolean
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_ENUM = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

export default function DoctorAvailabilityPage() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAvailabilities()
  }, [])

  const fetchAvailabilities = async () => {
    try {
      const res = await fetch('/api/doctors/me/availability')
      if (res.ok) {
        const data = await res.json()
        setAvailabilities(data.availabilities || [])
      }
    } catch (error) {
      console.error('Error fetching availabilities:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/doctors/me/availability/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (res.ok) {
        fetchAvailabilities()
      }
    } catch (error) {
      console.error('Error updating availability:', error)
    }
  }

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/doctors/me/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setShowAddForm(false)
        setFormData({
          dayOfWeek: 'MONDAY',
          startTime: '09:00',
          endTime: '17:00',
          slotDuration: 30,
        })
        fetchAvailabilities()
      }
    } catch (error) {
      console.error('Error creating availability:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this availability slot?')) return

    try {
      const res = await fetch(`/api/doctors/me/availability/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchAvailabilities()
      }
    } catch (error) {
      console.error('Error deleting availability:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading availability...</div>
      </div>
    )
  }

  const groupedByDay = DAYS.map((day, index) => ({
    day,
    dayOfWeek: index,
    slots: availabilities.filter((a) => a.dayOfWeek === index),
  }))

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your weekly availability schedule</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add Time Slot
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Availability Slot</h3>
          <form onSubmit={handleAddSlot} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                >
                  {DAY_ENUM.map((day) => (
                    <option key={day} value={day}>
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={formData.slotDuration}
                  onChange={(e) => setFormData({ ...formData, slotDuration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Adding...' : 'Add Slot'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {groupedByDay.map(({ day, dayOfWeek, slots }) => (
          <div
            key={dayOfWeek}
            className="bg-white/70 backdrop-blur-md rounded-xl p-5 border border-white/30 shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{day}</h3>
              {slots.length > 0 && (
                <span className="text-xs text-gray-600">{slots.length} slot{slots.length > 1 ? 's' : ''}</span>
              )}
            </div>

            {slots.length === 0 ? (
              <p className="text-sm text-gray-500">No availability set for this day</p>
            ) : (
              <div className="space-y-2">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      slot.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ClockIcon className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </p>
                        <p className="text-xs text-gray-600">{slot.slotDuration} min slots</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAvailability(slot.id, slot.isActive)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          slot.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                        title={slot.isActive ? 'Disable' : 'Enable'}
                      >
                        {slot.isActive ? (
                          <CheckIcon className="w-4 h-4" />
                        ) : (
                          <XMarkIcon className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        title="Delete slot"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
