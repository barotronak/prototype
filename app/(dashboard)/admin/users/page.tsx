'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { DeleteConfirmationModal } from '@/components/ui/modal'
import { formatDateTime } from '@/lib/utils'

interface User {
  id: string
  email: string
  name: string
  role: string
  phone?: string | null
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (roleFilter === 'ALL') {
      setFilteredUsers(users)
    } else {
      setFilteredUsers(users.filter(user => user.role === roleFilter))
    }
  }, [roleFilter, users])

  async function fetchUsers() {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setFilteredUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleDeleteClick(user: User) {
    setUserToDelete(user)
    setDeleteModalOpen(true)
  }

  async function handleDeleteConfirm() {
    if (!userToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userToDelete.id))
        setDeleteModalOpen(false)
        setUserToDelete(null)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  function getRoleBadgeVariant(role: string) {
    switch (role) {
      case 'ADMIN':
        return 'error'
      case 'DOCTOR':
        return 'info'
      case 'LABORATORY':
        return 'warning'
      case 'PHARMACY':
        return 'success'
      case 'PATIENT':
        return 'default'
      default:
        return 'default'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Users</h1>
            <p className="text-white/80">
              Manage all users across the system
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/dashboard">
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
            <Link href="/admin/users/create">
              <Button variant="primary">Create User</Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card variant="glass">
            <CardContent className="p-4">
              <div className="text-sm text-slate-600 mb-1">Total Users</div>
              <div className="text-2xl font-bold text-slate-900">
                {users.length}
              </div>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4">
              <div className="text-sm text-slate-600 mb-1">Doctors</div>
              <div className="text-2xl font-bold text-slate-900">
                {users.filter(u => u.role === 'DOCTOR').length}
              </div>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4">
              <div className="text-sm text-slate-600 mb-1">Labs</div>
              <div className="text-2xl font-bold text-slate-900">
                {users.filter(u => u.role === 'LABORATORY').length}
              </div>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4">
              <div className="text-sm text-slate-600 mb-1">Pharmacies</div>
              <div className="text-2xl font-bold text-slate-900">
                {users.filter(u => u.role === 'PHARMACY').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card variant="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Users</CardTitle>
              <div className="w-48">
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'All Roles' },
                    { value: 'ADMIN', label: 'Admins' },
                    { value: 'DOCTOR', label: 'Doctors' },
                    { value: 'LABORATORY', label: 'Laboratories' },
                    { value: 'PHARMACY', label: 'Pharmacies' },
                    { value: 'PATIENT', label: 'Patients' },
                  ]}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No users found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>{formatDateTime(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(user)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete User"
          message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
          loading={deleting}
        />
      </div>
    </div>
  )
}
