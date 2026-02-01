'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function DoctorProfileSetup() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    specialization: '',
    licenseNumber: '',
    qualification: '',
    experience: 0,
    consultationFee: 0,
    bio: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const response = await fetch(`/api/doctors/${user?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create profile')
      }

      router.push('/doctor/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
    } finally {
      setSaving(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Complete Your Doctor Profile</h1>

        <Card variant="glass">
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
            <CardDescription>
              Fill in your professional details to complete your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Specialization"
                name="specialization"
                placeholder="e.g., Cardiology, Pediatrics, Orthopedics"
                value={formData.specialization}
                onChange={handleChange}
                required
                autoFocus
              />

              <Input
                label="License Number"
                name="licenseNumber"
                placeholder="e.g., DOC-12345"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
              />

              <Input
                label="Qualification"
                name="qualification"
                placeholder="e.g., MBBS, MD, MS"
                value={formData.qualification}
                onChange={handleChange}
                required
              />

              <Input
                label="Years of Experience"
                name="experience"
                type="number"
                min="0"
                placeholder="e.g., 10"
                value={formData.experience || ''}
                onChange={handleChange}
                required
              />

              <Input
                label="Consultation Fee ($)"
                name="consultationFee"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 150.00"
                value={formData.consultationFee || ''}
                onChange={handleChange}
                required
              />

              <Textarea
                label="Bio (Optional)"
                name="bio"
                placeholder="Tell patients about yourself and your expertise..."
                value={formData.bio}
                onChange={handleChange}
                helperText="This will be visible to patients"
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={saving}
                  disabled={saving}
                >
                  Complete Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
