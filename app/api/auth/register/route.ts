import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword, signToken } from '@/lib/auth'
import { registerSchema } from '@/lib/validators'
import { requireAuth } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    // Only admins can create new users
    // For the first user (admin), this check can be bypassed
    const userCount = await prisma.user.count()

    if (userCount > 0) {
      // If there are existing users, require admin authentication
      try {
        const session = await requireAuth(['ADMIN'])
        if (!session) {
          return NextResponse.json(
            { error: 'Unauthorized - Admin access required' },
            { status: 401 }
          )
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Unauthorized - Admin access required' },
          { status: 401 }
        )
      }
    }

    const body = await request.json()

    // Validate input
    const validatedData = registerSchema.parse(body)
    const { email, password, name, role, phone } = validatedData

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user with role-specific profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        phone,
        // Create role-specific profile
        ...(role === 'ADMIN' && {
          admin: {
            create: {},
          },
        }),
      },
      include: {
        admin: true,
        doctor: true,
        laboratory: true,
        pharmacy: true,
        patient: true,
      },
    })

    // For the first user (admin), automatically log them in
    if (userCount === 0) {
      const token = await signToken({
        userId: user.id,
        role: user.role,
      })

      const response = NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
        },
        message: 'Admin account created successfully',
      })

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })

      return response
    }

    // For other users, just return success
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      message: 'User created successfully',
    })
  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
