import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export default async function DashboardRedirect() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    redirect('/login')
  }

  try {
    const payload = await verifyToken(token)

    if (!payload) {
      redirect('/login')
    }

    // Redirect based on user role
    switch (payload.role) {
      case 'ADMIN':
        redirect('/admin/dashboard')
      case 'DOCTOR':
        redirect('/doctor/dashboard')
      case 'LABORATORY':
        redirect('/laboratory/dashboard')
      case 'PHARMACY':
        redirect('/pharmacy/dashboard')
      case 'PATIENT':
        redirect('/patient/dashboard')
      default:
        redirect('/login')
    }
  } catch (error) {
    redirect('/login')
  }
}
