import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { doctorAvailabilitySchema } from '@/lib/validators'

// GET /api/doctors/[id]/availability - Get doctor's availability slots
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const slots = await prisma.doctorAvailability.findMany({
      where: { doctorId: params.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Get availability error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/doctors/[id]/availability - Add availability slot
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(['ADMIN', 'DOCTOR'])

    // If doctor, ensure they're managing their own availability
    if (session.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: session.userId },
      })

      if (!doctor || doctor.id !== params.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const validatedData = doctorAvailabilitySchema.parse(body)

    const slot = await prisma.doctorAvailability.create({
      data: {
        doctorId: params.id,
        dayOfWeek: validatedData.dayOfWeek,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        slotDuration: validatedData.slotDuration,
        isActive: validatedData.isActive,
      },
    })

    return NextResponse.json({
      slot,
      message: 'Availability slot added successfully',
    })
  } catch (error) {
    console.error('Add availability error:', error)

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

// DELETE /api/doctors/[id]/availability - Delete availability slot
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth(['ADMIN', 'DOCTOR'])

    const { searchParams } = new URL(request.url)
    const slotId = searchParams.get('slotId')

    if (!slotId) {
      return NextResponse.json(
        { error: 'Slot ID required' },
        { status: 400 }
      )
    }

    await prisma.doctorAvailability.delete({
      where: { id: slotId },
    })

    return NextResponse.json({
      message: 'Availability slot deleted successfully',
    })
  } catch (error) {
    console.error('Delete availability error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
