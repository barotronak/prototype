import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

export async function GET() {
  try {
    const session = await requireAuth(['DOCTOR'])

    // Get the doctor record
    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    // Get all unique patients who have appointments with this doctor
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
      },
      select: {
        patientId: true,
      },
      distinct: ['patientId'],
    })

    const patientIds = appointments.map((apt) => apt.patientId)

    // Get patient details with counts
    const patients = await prisma.patient.findMany({
      where: {
        id: {
          in: patientIds,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            appointments: true,
            labPrescriptions: true,
            medicinePrescriptions: true,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    })

    return NextResponse.json({ patients })
  } catch (error) {
    console.error('Error fetching doctor patients:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
