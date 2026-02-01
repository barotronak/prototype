'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface User {
  id: string
  email: string
  name: string
  role: string
  phone?: string | null
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    password: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUser()
  }, [params.id])

  async function fetchUser() {
    try {
      const response = await fetch(`/api/users/${params.id}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setFormData({
          email: data.user.email,
          name: data.user.name,
          phone: data.user.phone || '',
          password: '',
        })
      } else {
        setError('User not found')
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setError('Failed to load user')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const updateData: any = {
        email: formData.email,
        name: formData.name,
        phone: formData.phone || null,
      }

      // Only include password if it's been changed
      if (formData.password) {
        updateData.password = formData.password
      }

      const response = await fetch(`/api/users/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update user')
      }

      router.push('/admin/users')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          <Card variant="glass">
            <CardContent className="py-12 text-center">
              <p className="text-slate-600 mb-4">{error || 'User not found'}</p>
              <Link href="/admin/users">
                <Button variant="primary">Back to Users</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin/users">
            <Button variant="ghost" size="sm" className="mb-4">
              ← Back to Users
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">Edit User</h1>
            <Badge variant={user.role === 'ADMIN' ? 'error' : 'info'}>
              {user.role}
            </Badge>
          </div>
          <p className="text-white/80">Update user information</p>
        </div>

        {/* Form */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Update the details below. Leave password blank to keep current password.
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
                label="Full Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />

              <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-2 font-medium">
                  Role: {user.role}
                </p>
                <p className="text-xs text-slate-500">
                  User role cannot be changed after creation
                </p>
              </div>

              <Input
                label="New Password (optional)"
                name="password"
                type="password"
                placeholder="Leave blank to keep current password"
                value={formData.password}
                onChange={handleChange}
                helperText="Only fill this if you want to change the password"
              />

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={saving}
                  disabled={saving}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
