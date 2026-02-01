import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { doctorAvailabilitySchema } from '@/lib/validators'

export async function GET() {
  try {
    const session = await requireAuth(['DOCTOR'])

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    const availabilities = await prisma.doctorAvailability.findMany({
      where: { doctorId: doctor.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })

    return NextResponse.json({ availabilities })
  } catch (error) {
    console.error('Error fetching availabilities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(['DOCTOR'])

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    const body = await req.json()
    const validatedData = doctorAvailabilitySchema.parse(body)

    const availability = await prisma.doctorAvailability.create({
      data: {
        doctorId: doctor.id,
        dayOfWeek: getDayNumber(validatedData.dayOfWeek),
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        slotDuration: validatedData.slotDuration,
        isActive: validatedData.isActive ?? true,
      },
    })

    return NextResponse.json({ availability, message: 'Availability slot created successfully' })
  } catch (error) {
    console.error('Error creating availability:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getDayNumber(day: string): number {
  const days: Record<string, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  }
  return days[day] || 0
}
