import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { requireAuth } from '@/lib/session'
import { registerSchema } from '@/lib/validators'

// GET /api/users - List all users with optional role filter
export async function GET(request: NextRequest) {
  try {
    await requireAuth(['ADMIN'])

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    const users = await prisma.user.findMany({
      where: role ? { role: role as any } : {},
      include: {
        admin: true,
        doctor: true,
        laboratory: true,
        pharmacy: true,
        patient: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Remove passwords from response
    const sanitizedUsers = users.map(user => ({
      ...user,
      password: undefined,
    }))

    return NextResponse.json({ users: sanitizedUsers })
  } catch (error) {
    console.error('Get users error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    await requireAuth(['ADMIN'])

    const body = await request.json()
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
        // Create empty profile based on role
        ...(role === 'ADMIN' && { admin: { create: {} } }),
      },
      include: {
        admin: true,
        doctor: true,
        laboratory: true,
        pharmacy: true,
        patient: true,
      },
    })

    return NextResponse.json({
      user: {
        ...user,
        password: undefined,
      },
      message: 'User created successfully',
    })
  } catch (error) {
    console.error('Create user error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

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
