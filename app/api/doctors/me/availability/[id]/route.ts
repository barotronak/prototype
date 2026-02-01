import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await requireAuth(['DOCTOR'])
    const { isActive } = await req.json()

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    // Verify this availability belongs to the doctor
    const availability = await prisma.doctorAvailability.findFirst({
      where: {
        id,
        doctorId: doctor.id,
      },
    })

    if (!availability) {
      return NextResponse.json({ error: 'Availability not found' }, { status: 404 })
    }

    const updated = await prisma.doctorAvailability.update({
      where: { id },
      data: { isActive },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await requireAuth(['DOCTOR'])

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    // Verify this availability belongs to the doctor
    const availability = await prisma.doctorAvailability.findFirst({
      where: {
        id,
        doctorId: doctor.id,
      },
    })

    if (!availability) {
      return NextResponse.json({ error: 'Availability not found' }, { status: 404 })
    }

    await prisma.doctorAvailability.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Availability slot deleted successfully' })
  } catch (error) {
    console.error('Error deleting availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
