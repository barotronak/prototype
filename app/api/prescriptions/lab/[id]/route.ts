import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

// GET /api/prescriptions/lab/[id] - Get specific lab prescription
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await requireAuth()

    const prescription = await prisma.labPrescription.findUnique({
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
        lab: {
          include: {
            user: true,
          },
        },
        report: true,
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
    console.error('Get lab prescription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/prescriptions/lab/[id] - Update prescription status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await requireAuth(['LABORATORY', 'DOCTOR'])

    const body = await request.json()
    const { status } = body

    const prescription = await prisma.labPrescription.update({
      where: { id },
      data: { status },
    })

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
