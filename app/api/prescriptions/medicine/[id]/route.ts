import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { createNotification } from '@/lib/notifications'

// GET /api/prescriptions/medicine/[id] - Get specific medicine prescription
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()

    const prescription = await prisma.medicinePrescription.findUnique({
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
        pharmacy: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!prescription) {
      return NextResponse.json(
        { error: 'Prescription not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ prescription })
  } catch (error) {
    console.error('Get medicine prescription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/prescriptions/medicine/[id] - Update prescription status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(['PHARMACY', 'DOCTOR'])

    const body = await request.json()
    const { status, fulfillmentNotes } = body

    const prescription = await prisma.medicinePrescription.update({
      where: { id: params.id },
      data: {
        status,
        fulfillmentNotes: fulfillmentNotes || undefined,
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        pharmacy: {
          include: {
            user: true,
          },
        },
      },
    })

    // Send notification to patient if status is FULFILLED
    if (status === 'FULFILLED') {
      await createNotification(
        prescription.patient.userId,
        'PRESCRIPTION',
        'Medicine Ready for Pickup',
        `Your prescription from ${prescription.pharmacy.user.name} is ready`,
        `/patient/prescriptions/medicine/${prescription.id}`
      )
    }

    return NextResponse.json({
      prescription,
      message: 'Prescription status updated',
    })
  } catch (error) {
    console.error('Update prescription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
