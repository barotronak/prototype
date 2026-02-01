import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { pharmacyProfileSchema } from '@/lib/validators'

// GET /api/pharmacies/[id] - Get pharmacy by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!pharmacy) {
      return NextResponse.json({ error: 'Pharmacy not found' }, { status: 404 })
    }

    return NextResponse.json({ pharmacy })
  } catch (error) {
    console.error('Get pharmacy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/pharmacies/[id] - Create pharmacy profile
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await requireAuth(['ADMIN', 'PHARMACY'])

    const body = await request.json()
    const validatedData = pharmacyProfileSchema.parse(body)

    // Check if profile already exists
    const existing = await prisma.pharmacy.findUnique({
      where: { id },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Pharmacy profile already exists' },
        { status: 409 }
      )
    }

    // Create pharmacy profile
    const pharmacy = await prisma.pharmacy.create({
      data: {
        userId: id,
        pharmacyName: validatedData.pharmacyName,
        address: validatedData.address,
        licenseNumber: validatedData.licenseNumber,
        operatingHours: validatedData.operatingHours,
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json({
      pharmacy,
      message: 'Pharmacy profile created successfully',
    })
  } catch (error) {
    console.error('Create pharmacy profile error:', error)

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

// PATCH /api/pharmacies/[id] - Update pharmacy profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await requireAuth(['ADMIN', 'PHARMACY'])

    const body = await request.json()
    const validatedData = pharmacyProfileSchema.parse(body)

    const pharmacy = await prisma.pharmacy.update({
      where: { id },
      data: {
        pharmacyName: validatedData.pharmacyName,
        address: validatedData.address,
        licenseNumber: validatedData.licenseNumber,
        operatingHours: validatedData.operatingHours,
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json({
      pharmacy,
      message: 'Pharmacy profile updated successfully',
    })
  } catch (error) {
    console.error('Update pharmacy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
