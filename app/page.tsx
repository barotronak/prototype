'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user role
      switch (user.role) {
        case 'ADMIN':
          router.push('/admin/dashboard')
          break
        case 'DOCTOR':
          router.push('/doctor/dashboard')
          break
        case 'LABORATORY':
          router.push('/laboratory/dashboard')
          break
        case 'PHARMACY':
          router.push('/pharmacy/dashboard')
          break
        case 'PATIENT':
          router.push('/patient/dashboard')
          break
        default:
          router.push('/login')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-white">Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <Card variant="strong" className="fade-in text-center p-8">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 mb-6">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4 gradient-text">
              Healthcare Management System
            </h1>
            <p className="text-xl text-slate-600 mb-2">
              Production-Ready Healthcare Platform
            </p>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Comprehensive healthcare management with role-based access for Admins,
              Doctors, Laboratories, Pharmacies, and Patients. Manage appointments,
              prescriptions, lab reports, patient admissions, and vitals tracking.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">5 User Roles</h3>
              <p className="text-sm text-slate-600">Admin, Doctor, Lab, Pharmacy, Patient</p>
            </div>

            <div className="p-6 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40">
              <div className="w-12 h-12 rounded-lg bg-accent-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Smart Workflows</h3>
              <p className="text-sm text-slate-600">Automated prescription & report sharing</p>
            </div>

            <div className="p-6 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Vitals Tracking</h3>
              <p className="text-sm text-slate-600">Complete patient monitoring & ICU data</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button variant="primary" size="lg">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary" size="lg">
                Create Admin Account
              </Button>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-sm text-slate-600">
              <span className="font-medium">Demo:</span> admin@healthcare.com / admin123
            </p>
          </div>
        </Card>

        <div className="mt-8 text-center text-sm text-white/80">
          <p>© 2026 Healthcare Management System · Built with Next.js 16 & Prisma 7</p>
          <p className="mt-2">Production-Ready · Secure · HIPAA Compliant · Glassmorphism UI</p>
        </div>
      </div>
    </div>
  )
}
