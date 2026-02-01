import { hash, compare } from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

/**
 * Hash a password using bcryptjs
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

/**
 * Verify a password against a hash
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns True if password matches
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword)
}

/**
 * Get JWT secret as Uint8Array
 */
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables')
  }
  return new TextEncoder().encode(secret)
}

/**
 * Sign a JWT token
 * @param payload - Data to include in token (userId, role)
 * @returns JWT token string
 */
export async function signToken(payload: {
  userId: string
  role: string
}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Token valid for 7 days
    .sign(getJwtSecret())
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload as { userId: string; role: string; iat: number; exp: number }
  } catch (error) {
    return null
  }
}
