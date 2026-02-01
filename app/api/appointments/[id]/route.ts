import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { createNotification } from '@/lib/notifications'

// GET /api/appointments/[id] - Get specific appointment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
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
        labPrescriptions: {
          include: {
            lab: {
              include: {
                user: true,
              },
            },
            report: true,
          },
        },
        medicinePrescriptions: {
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

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error('Get appointment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/appointments/[id] - Update appointment status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(['DOCTOR', 'PATIENT', 'ADMIN'])

    const body = await request.json()
    const { status, notes } = body

    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        status,
        notes: notes || undefined,
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

    // Send notification based on status change
    if (status === 'COMPLETED') {
      await createNotification(
        appointment.patient.userId,
        'APPOINTMENT',
        'Appointment Completed',
        `Your appointment with Dr. ${appointment.doctor.user.name} has been completed`,
        `/patient/appointments/${appointment.id}`
      )
    } else if (status === 'CANCELLED') {
      const notifyUserId = session.role === 'DOCTOR'
        ? appointment.patient.userId
        : appointment.doctor.userId
      const notifyMessage = session.role === 'DOCTOR'
        ? `Dr. ${appointment.doctor.user.name} cancelled your appointment`
        : `${appointment.patient.user.name} cancelled their appointment`

      await createNotification(
        notifyUserId,
        'APPOINTMENT',
        'Appointment Cancelled',
        notifyMessage,
        `/appointments/${appointment.id}`
      )
    }

    return NextResponse.json({
      appointment,
      message: 'Appointment updated successfully',
    })
  } catch (error) {
    console.error('Update appointment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/appointments/[id] - Delete appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(['ADMIN'])

    await prisma.appointment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Appointment deleted successfully',
    })
  } catch (error) {
    console.error('Delete appointment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
