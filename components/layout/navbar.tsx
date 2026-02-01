'use client'

import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { BellIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
  const { logout, user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <header className="h-14 bg-white/60 backdrop-blur-md border-b border-white/30 flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          {user?.role ? `${user.role.charAt(0) + user.role.slice(1).toLowerCase()} Portal` : 'Dashboard'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-white/50 transition-colors">
          <BellIcon className="w-5 h-5 text-gray-700" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  )
}
