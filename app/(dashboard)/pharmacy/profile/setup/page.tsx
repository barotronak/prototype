'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function PharmacyProfileSetup() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    pharmacyName: '',
    address: '',
    licenseNumber: '',
    operatingHours: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const response = await fetch(`/api/pharmacies/${user?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create profile')
      }

      router.push('/pharmacy/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
    } finally {
      setSaving(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Complete Your Pharmacy Profile</h1>

        <Card variant="glass">
          <CardHeader>
            <CardTitle>Pharmacy Information</CardTitle>
            <CardDescription>
              Fill in your pharmacy details to complete your profile
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
                label="Pharmacy Name"
                name="pharmacyName"
                placeholder="e.g., City Pharmacy"
                value={formData.pharmacyName}
                onChange={handleChange}
                required
                autoFocus
              />

              <Textarea
                label="Address"
                name="address"
                placeholder="Full pharmacy address..."
                value={formData.address}
                onChange={handleChange}
                required
              />

              <Input
                label="License Number"
                name="licenseNumber"
                placeholder="e.g., PHARM-12345"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
              />

              <Input
                label="Operating Hours"
                name="operatingHours"
                placeholder="e.g., Mon-Sat: 8 AM - 10 PM, Sun: 9 AM - 6 PM"
                value={formData.operatingHours}
                onChange={handleChange}
                required
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
