import { cookies } from 'next/headers'
import { verifyToken } from './auth'
import { UserRole } from '@prisma/client'

export interface Session {
  userId: string
  role: UserRole
  iat: number
  exp: number
}

/**
 * Get the current user session from cookies
 * @returns Session data or null if not authenticated
 */
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return null
    }

    return {
      userId: payload.userId,
      role: payload.role as UserRole,
      iat: payload.iat,
      exp: payload.exp,
    }
  } catch (error) {
    return null
  }
}

/**
 * Require authentication and optionally check for specific roles
 * @param allowedRoles - Optional array of roles that are allowed
 * @returns Session data
 * @throws Error if not authenticated or role not allowed
 */
export async function requireAuth(
  allowedRoles?: UserRole[]
): Promise<Session> {
  const session = await getSession()

  if (!session) {
    throw new Error('Unauthorized - Please login')
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new Error('Forbidden - Insufficient permissions')
  }

  return session
}

/**
 * Check if user has a specific role
 * @param session - Current session
 * @param role - Role to check
 * @returns True if user has the role
 */
export function hasRole(session: Session | null, role: UserRole): boolean {
  return session?.role === role
}

/**
 * Check if user has any of the specified roles
 * @param session - Current session
 * @param roles - Roles to check
 * @returns True if user has any of the roles
 */
export function hasAnyRole(
  session: Session | null,
  roles: UserRole[]
): boolean {
  return session ? roles.includes(session.role) : false
}
