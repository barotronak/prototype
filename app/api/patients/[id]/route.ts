import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { patientProfileSchema } from '@/lib/validators'

// GET /api/patients/[id] - Get patient by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()

    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        appointments: {
          orderBy: { appointmentDate: 'desc' },
          take: 10,
        },
        labPrescriptions: {
          include: {
            lab: {
              include: {
                user: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        medicinePrescriptions: {
          include: {
            pharmacy: {
              include: {
                user: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        vitalRecords: {
          orderBy: { recordedAt: 'desc' },
          take: 5,
        },
        admissions: {
          orderBy: { admissionDate: 'desc' },
          take: 5,
        },
      },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json({ patient })
  } catch (error) {
    console.error('Get patient error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/patients/[id] - Create patient profile
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(['ADMIN', 'PATIENT'])

    const body = await request.json()
    const validatedData = patientProfileSchema.parse(body)

    // Check if profile already exists
    const existing = await prisma.patient.findUnique({
      where: { id: params.id },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Patient profile already exists' },
        { status: 409 }
      )
    }

    // Create patient profile
    const patient = await prisma.patient.create({
      data: {
        userId: params.id,
        dateOfBirth: new Date(validatedData.dateOfBirth),
        gender: validatedData.gender,
        address: validatedData.address,
        emergencyContact: validatedData.emergencyContact,
        bloodGroup: validatedData.bloodGroup,
        allergies: validatedData.allergies,
        medicalHistory: validatedData.medicalHistory,
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json({
      patient,
      message: 'Patient profile created successfully',
    })
  } catch (error) {
    console.error('Create patient profile error:', error)

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

// PATCH /api/patients/[id] - Update patient profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(['ADMIN', 'PATIENT'])

    const body = await request.json()
    const validatedData = patientProfileSchema.parse(body)

    const patient = await prisma.patient.update({
      where: { id: params.id },
      data: {
        dateOfBirth: new Date(validatedData.dateOfBirth),
        gender: validatedData.gender,
        address: validatedData.address,
        emergencyContact: validatedData.emergencyContact,
        bloodGroup: validatedData.bloodGroup,
        allergies: validatedData.allergies,
        medicalHistory: validatedData.medicalHistory,
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json({
      patient,
      message: 'Patient profile updated successfully',
    })
  } catch (error) {
    console.error('Update patient error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
