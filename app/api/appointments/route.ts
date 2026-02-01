import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { appointmentSchema } from '@/lib/validators'
import { createNotification } from '@/lib/notifications'

// GET /api/appointments - List appointments (filtered by user role)
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let where: any = {}

    // Filter based on user role
    if (session.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: session.userId },
      })
      if (doctor) {
        where.doctorId = doctor.id
      }
    } else if (session.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { userId: session.userId },
      })
      if (patient) {
        where.patientId = patient.id
      }
    }

    if (status) {
      where.status = status
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        patient: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { appointmentDate: 'desc' },
    })

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('Get appointments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/appointments - Create appointment
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(['PATIENT', 'ADMIN'])

    const body = await request.json()

    // Get patient ID from session
    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Validate appointment data
    const validatedData = appointmentSchema.parse({
      ...body,
      patientId: patient.id,
    })

    // Check if slot is already booked
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: validatedData.doctorId,
        appointmentDate: new Date(validatedData.appointmentDate),
        status: {
          not: 'CANCELLED',
        },
      },
    })

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 409 }
      )
    }

    const appointment = await prisma.appointment.create({
      data: {
        doctorId: validatedData.doctorId,
        patientId: patient.id,
        appointmentDate: new Date(validatedData.appointmentDate),
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        reason: validatedData.reason,
      },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
        patient: {
          include: {
            user: true,
          },
        },
      },
    })

    // Send notification to doctor
    await createNotification(
      appointment.doctor.userId,
      'APPOINTMENT',
      'New Appointment Booked',
      `${appointment.patient.user.name} booked an appointment`,
      `/doctor/appointments/${appointment.id}`
    )

    return NextResponse.json({
      appointment,
      message: 'Appointment booked successfully',
    })
  } catch (error) {
    console.error('Create appointment error:', error)

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
