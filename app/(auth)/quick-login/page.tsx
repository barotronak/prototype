'use client'

import { useState } from 'react'
import Link from 'next/link'

const SEEDED_USERS = [
  { email: 'admin@healthcare.com', password: 'admin123', role: 'Admin', name: 'Admin User' },
  { email: 'dr.smith@healthcare.com', password: 'doctor123', role: 'Doctor', name: 'Dr. John Smith (Cardiology)' },
  { email: 'dr.johnson@healthcare.com', password: 'doctor123', role: 'Doctor', name: 'Dr. Emily Johnson (Pediatrics)' },
  { email: 'dr.williams@healthcare.com', password: 'doctor123', role: 'Doctor', name: 'Dr. Michael Williams (Orthopedics)' },
  { email: 'dr.brown@healthcare.com', password: 'doctor123', role: 'Doctor', name: 'Dr. Sarah Brown (General Medicine)' },
  { email: 'contact@citylab.com', password: 'lab123', role: 'Laboratory', name: 'City Diagnostic Lab' },
  { email: 'info@healthlab.com', password: 'lab123', role: 'Laboratory', name: 'Health Plus Lab' },
  { email: 'support@advancedlab.com', password: 'lab123', role: 'Laboratory', name: 'Advanced Diagnostics' },
  { email: 'contact@citypharmacy.com', password: 'pharmacy123', role: 'Pharmacy', name: 'City Pharmacy' },
  { email: 'info@healthmart.com', password: 'pharmacy123', role: 'Pharmacy', name: 'HealthMart' },
  { email: 'support@wellnesspharm.com', password: 'pharmacy123', role: 'Pharmacy', name: 'Wellness Pharmacy' },
  { email: 'john.doe@email.com', password: 'patient123', role: 'Patient', name: 'John Doe' },
  { email: 'jane.smith@email.com', password: 'patient123', role: 'Patient', name: 'Jane Smith' },
  { email: 'bob.wilson@email.com', password: 'patient123', role: 'Patient', name: 'Bob Wilson' },
  { email: 'alice.brown@email.com', password: 'patient123', role: 'Patient', name: 'Alice Brown' },
]

export default function QuickLoginPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleQuickLogin(email: string, password: string) {
    setLoading(email)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        const data = await res.json()
        // Redirect based on role
        const roleRedirects: Record<string, string> = {
          ADMIN: '/admin/dashboard',
          DOCTOR: '/doctor/dashboard',
          LABORATORY: '/laboratory/dashboard',
          PHARMACY: '/pharmacy/dashboard',
          PATIENT: '/patient/dashboard',
        }
        const redirectPath = roleRedirects[data.user.role] || '/dashboard'
        // Small delay to ensure cookie is set
        setTimeout(() => {
          window.location.href = redirectPath
        }, 100)
      } else {
        const data = await res.json()
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred during login')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white/70 backdrop-blur-md rounded-2xl p-8 border border-white/30 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quick Login - Testing</h1>
        <p className="text-gray-700 mb-6">Click any user to login instantly for testing purposes</p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {['Admin', 'Doctor', 'Laboratory', 'Pharmacy', 'Patient'].map((role) => (
          <div key={role} className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{role}s</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {SEEDED_USERS.filter((u) => u.role === role).map((user) => (
                <button
                  key={user.email}
                  onClick={() => handleQuickLogin(user.email, user.password)}
                  disabled={loading === user.email}
                  className="bg-white/60 backdrop-blur-sm p-4 rounded-lg text-left hover:bg-white/90 transition-all border border-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-600 truncate">{user.email}</div>
                  {loading === user.email && (
                    <div className="text-xs text-primary-600 mt-1">Logging in...</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-8 text-center">
          <Link href="/login" className="text-primary-600 hover:text-primary-700 hover:underline font-medium">
            Back to Normal Login
          </Link>
        </div>
      </div>
    </div>
  )
}
