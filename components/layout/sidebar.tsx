'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { cn } from '@/lib/utils'
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  BeakerIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  ClockIcon,
  HeartIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserPlusIcon,
  BellIcon,
} from '@heroicons/react/24/outline'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export default function Sidebar() {
  const { user } = useAuth()
  const pathname = usePathname()

  const getNavigationItems = (): NavItem[] => {
    switch (user?.role) {
      case 'ADMIN':
        return [
          { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
          { name: 'All Users', href: '/admin/users', icon: UsersIcon },
          { name: 'Doctors', href: '/admin/doctors', icon: UserGroupIcon },
          { name: 'Laboratories', href: '/admin/laboratories', icon: BeakerIcon },
          { name: 'Pharmacies', href: '/admin/pharmacies', icon: BuildingStorefrontIcon },
          { name: 'Patients', href: '/admin/patients', icon: UserGroupIcon },
        ]
      case 'DOCTOR':
        return [
          { name: 'Dashboard', href: '/doctor/dashboard', icon: HomeIcon },
          { name: 'Appointments', href: '/doctor/appointments', icon: CalendarIcon },
          { name: 'Patients', href: '/doctor/patients', icon: UserGroupIcon },
          { name: 'Admissions', href: '/doctor/admissions', icon: ClipboardDocumentListIcon },
          { name: 'Availability', href: '/doctor/availability', icon: ClockIcon },
          { name: 'Partnerships', href: '/doctor/partnerships', icon: Cog6ToothIcon },
        ]
      case 'LABORATORY':
        return [
          { name: 'Dashboard', href: '/laboratory/dashboard', icon: HomeIcon },
          { name: 'Prescriptions', href: '/laboratory/prescriptions', icon: ClipboardDocumentListIcon },
          { name: 'Reports', href: '/laboratory/reports', icon: DocumentTextIcon },
        ]
      case 'PHARMACY':
        return [
          { name: 'Dashboard', href: '/pharmacy/dashboard', icon: HomeIcon },
          { name: 'Prescriptions', href: '/pharmacy/prescriptions', icon: ClipboardDocumentListIcon },
          { name: 'Fulfilled', href: '/pharmacy/fulfilled', icon: DocumentTextIcon },
        ]
      case 'PATIENT':
        return [
          { name: 'Dashboard', href: '/patient/dashboard', icon: HomeIcon },
          { name: 'Book Appointment', href: '/patient/appointments/book', icon: UserPlusIcon },
          { name: 'My Appointments', href: '/patient/appointments', icon: CalendarIcon },
          { name: 'Lab Prescriptions', href: '/patient/prescriptions/lab', icon: BeakerIcon },
          { name: 'Medicines', href: '/patient/prescriptions/medicine', icon: ClipboardDocumentListIcon },
          { name: 'Lab Reports', href: '/patient/reports', icon: DocumentTextIcon },
          { name: 'Medical History', href: '/patient/history', icon: ChartBarIcon },
          { name: 'Vitals', href: '/patient/vitals', icon: HeartIcon },
        ]
      default:
        return []
    }
  }

  const navItems = getNavigationItems()

  return (
    <aside className="w-56 bg-white/70 backdrop-blur-md border-r border-white/30 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200/50">
        <Link href={`/${user?.role?.toLowerCase()}/dashboard`} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <HeartIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-gray-900">HealthCare</h2>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-white/50 hover:text-primary-600'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="p-3 border-t border-gray-200/50">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/50">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 text-xs font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
