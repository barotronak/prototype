import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { doctorProfileSchema } from '@/lib/validators'

// GET /api/doctors/[id] - Get doctor by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        availableSlots: true,
        preferredLabs: {
          include: {
            laboratory: {
              include: {
                user: true,
              },
            },
          },
        },
        preferredPharmacies: {
          include: {
            pharmacy: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    return NextResponse.json({ doctor })
  } catch (error) {
    console.error('Get doctor error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/doctors/[id] - Update doctor profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(['ADMIN', 'DOCTOR'])

    // If doctor, ensure they're updating their own profile
    const doctor = await prisma.doctor.findUnique({
      where: { id: params.id },
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    if (session.role === 'DOCTOR') {
      const userDoctor = await prisma.doctor.findUnique({
        where: { userId: session.userId },
      })

      if (!userDoctor || userDoctor.id !== params.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const validatedData = doctorProfileSchema.parse(body)

    // Update doctor profile
    const updatedDoctor = await prisma.doctor.update({
      where: { id: params.id },
      data: {
        specialization: validatedData.specialization,
        licenseNumber: validatedData.licenseNumber,
        qualification: validatedData.qualification,
        experience: validatedData.experience,
        consultationFee: validatedData.consultationFee,
        bio: validatedData.bio,
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json({
      doctor: updatedDoctor,
      message: 'Profile updated successfully',
    })
  } catch (error) {
    console.error('Update doctor error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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

// POST /api/doctors/[id] - Create doctor profile (for users created without profile)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(['ADMIN', 'DOCTOR'])

    const body = await request.json()
    const validatedData = doctorProfileSchema.parse(body)

    // Check if doctor profile already exists
    const existingDoctor = await prisma.doctor.findUnique({
      where: { id: params.id },
    })

    if (existingDoctor) {
      return NextResponse.json(
        { error: 'Doctor profile already exists' },
        { status: 409 }
      )
    }

    // Get user by userId (params.id is userId here)
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!user || user.role !== 'DOCTOR') {
      return NextResponse.json(
        { error: 'User not found or not a doctor' },
        { status: 404 }
      )
    }

    // Create doctor profile
    const doctor = await prisma.doctor.create({
      data: {
        userId: params.id,
        specialization: validatedData.specialization,
        licenseNumber: validatedData.licenseNumber,
        qualification: validatedData.qualification,
        experience: validatedData.experience,
        consultationFee: validatedData.consultationFee,
        bio: validatedData.bio,
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json({
      doctor,
      message: 'Doctor profile created successfully',
    })
  } catch (error) {
    console.error('Create doctor profile error:', error)

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
