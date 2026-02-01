import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { laboratoryProfileSchema } from '@/lib/validators'

// GET /api/laboratories/[id] - Get laboratory by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const laboratory = await prisma.laboratory.findUnique({
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
      },
    })

    if (!laboratory) {
      return NextResponse.json({ error: 'Laboratory not found' }, { status: 404 })
    }

    return NextResponse.json({ laboratory })
  } catch (error) {
    console.error('Get laboratory error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/laboratories/[id] - Create laboratory profile
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(['ADMIN', 'LABORATORY'])

    const body = await request.json()
    const validatedData = laboratoryProfileSchema.parse(body)

    // Check if profile already exists
    const existing = await prisma.laboratory.findUnique({
      where: { id: params.id },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Laboratory profile already exists' },
        { status: 409 }
      )
    }

    // Create laboratory profile
    const laboratory = await prisma.laboratory.create({
      data: {
        userId: params.id,
        labName: validatedData.labName,
        address: validatedData.address,
        licenseNumber: validatedData.licenseNumber,
        servicesOffered: validatedData.servicesOffered,
        operatingHours: validatedData.operatingHours,
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json({
      laboratory,
      message: 'Laboratory profile created successfully',
    })
  } catch (error) {
    console.error('Create laboratory profile error:', error)

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

// PATCH /api/laboratories/[id] - Update laboratory profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(['ADMIN', 'LABORATORY'])

    const body = await request.json()
    const validatedData = laboratoryProfileSchema.parse(body)

    const laboratory = await prisma.laboratory.update({
      where: { id: params.id },
      data: {
        labName: validatedData.labName,
        address: validatedData.address,
        licenseNumber: validatedData.licenseNumber,
        servicesOffered: validatedData.servicesOffered,
        operatingHours: validatedData.operatingHours,
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json({
      laboratory,
      message: 'Laboratory profile updated successfully',
    })
  } catch (error) {
    console.error('Update laboratory error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
