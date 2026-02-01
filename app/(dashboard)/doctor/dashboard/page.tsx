'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function DoctorDashboard() {
  const { user, logout } = useAuth()
  const [doctor, setDoctor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [needsProfile, setNeedsProfile] = useState(false)

  useEffect(() => {
    fetchDoctorProfile()
  }, [user])

  async function fetchDoctorProfile() {
    if (!user) return

    try {
      // First check if doctor profile exists by trying to get all doctors
      const response = await fetch('/api/doctors', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        const myDoctor = data.doctors.find((d: any) => d.userId === user.id)

        if (myDoctor) {
          setDoctor(myDoctor)
          setNeedsProfile(false)
        } else {
          setNeedsProfile(true)
        }
      }
    } catch (error) {
      console.error('Failed to fetch doctor profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (needsProfile) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card variant="glass" className="max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">Welcome, Dr. {user?.name}!</CardTitle>
            <CardDescription>
              Let's set up your doctor profile to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-slate-600 mb-6">
              You need to complete your doctor profile before you can access the dashboard.
              This includes your specialization, license number, qualifications, and more.
            </p>
            <Link href="/doctor/profile/setup">
              <Button variant="primary" size="lg">
                Complete Your Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Doctor Dashboard
            </h1>
            <p className="text-white/80">
              Welcome back, Dr. {user?.name}!
            </p>
          </div>
          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>

        {/* Profile Summary */}
        <Card variant="glass" className="mb-6">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-slate-600">Specialization:</span>
                <p className="text-slate-900">{doctor?.specialization}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">License Number:</span>
                <p className="text-slate-900">{doctor?.licenseNumber}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Qualification:</span>
                <p className="text-slate-900">{doctor?.qualification}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Experience:</span>
                <p className="text-slate-900">{doctor?.experience} years</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Consultation Fee:</span>
                <p className="text-slate-900">${doctor?.consultationFee}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card variant="glass" hover>
            <CardHeader>
              <CardTitle className="text-lg">Availability</CardTitle>
              <CardDescription>Manage your schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/doctor/availability">
                <Button variant="primary" className="w-full">
                  Manage Availability
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card variant="glass" hover>
            <CardHeader>
              <CardTitle className="text-lg">Partnerships</CardTitle>
              <CardDescription>Labs & Pharmacies</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/doctor/partnerships">
                <Button variant="primary" className="w-full">
                  Manage Partnerships
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card variant="glass" hover>
            <CardHeader>
              <CardTitle className="text-lg">Profile</CardTitle>
              <CardDescription>Edit your information</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/doctor/profile/${doctor?.id}`}>
                <Button variant="secondary" className="w-full">
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 text-center text-white/60 text-sm">
          <p>🎉 Doctor Module Active!</p>
          <p className="mt-2">Profile ✅ | Availability ⏳ | Partnerships ⏳ | Appointments ⏳</p>
        </div>
      </div>
    </div>
  )
}
