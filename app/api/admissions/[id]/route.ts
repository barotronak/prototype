import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { createNotification } from '@/lib/notifications'

// GET /api/admissions/[id] - Get specific admission
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await requireAuth()

    const admission = await prisma.patientAdmission.findUnique({
      where: { id },
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

    if (!admission) {
      return NextResponse.json(
        { error: 'Admission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ admission })
  } catch (error) {
    console.error('Get admission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admissions/[id] - Update admission
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await requireAuth(['DOCTOR'])

    const body = await request.json()
    const { status, dischargeNotes, dischargeDate } = body

    const updateData: any = {}

    if (status !== undefined) {
      updateData.status = status
    }

    if (dischargeNotes !== undefined) {
      updateData.dischargeNotes = dischargeNotes
    }

    if (dischargeDate !== undefined) {
      updateData.dischargeDate = new Date(dischargeDate)
    }

    const admission = await prisma.patientAdmission.update({
      where: { id },
      data: updateData,
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

    // Send notification if discharged
    if (status === 'DISCHARGED') {
      await createNotification(
        admission.patient.userId,
        'GENERAL',
        'Patient Discharged',
        `You have been discharged by Dr. ${admission.doctor.user.name}`,
        `/patient/admissions/${admission.id}`
      )
    }

    return NextResponse.json({
      admission,
      message: 'Admission updated successfully',
    })
  } catch (error) {
    console.error('Update admission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
