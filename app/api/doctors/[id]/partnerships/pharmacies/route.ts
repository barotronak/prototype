import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

// GET /api/doctors/[id]/partnerships/pharmacies - Get doctor's pharmacy partnerships
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const partnerships = await prisma.doctorPharmacyPartnership.findMany({
      where: { doctorId: id },
      include: {
        pharmacy: {
          include: {
            user: true,
          },
        },
      },
    })

    return NextResponse.json({ partnerships })
  } catch (error) {
    console.error('Get pharmacy partnerships error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/doctors/[id]/partnerships/pharmacies - Add pharmacy partnership
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await requireAuth(['ADMIN', 'DOCTOR'])

    // If doctor, ensure they're managing their own partnerships
    if (session.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: session.userId },
      })

      if (!doctor || doctor.id !== id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const { pharmacyId } = body

    if (!pharmacyId) {
      return NextResponse.json(
        { error: 'Pharmacy ID required' },
        { status: 400 }
      )
    }

    // Check if partnership already exists
    const existing = await prisma.doctorPharmacyPartnership.findUnique({
      where: {
        doctorId_pharmacyId: {
          doctorId: id,
          pharmacyId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Partnership already exists' },
        { status: 409 }
      )
    }

    const partnership = await prisma.doctorPharmacyPartnership.create({
      data: {
        doctorId: id,
        pharmacyId,
      },
      include: {
        pharmacy: {
          include: {
            user: true,
          },
        },
      },
    })

    return NextResponse.json({
      partnership,
      message: 'Pharmacy partnership added successfully',
    })
  } catch (error) {
    console.error('Add pharmacy partnership error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/doctors/[id]/partnerships/pharmacies - Remove pharmacy partnership
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth(['ADMIN', 'DOCTOR'])

    const { searchParams } = new URL(request.url)
    const pharmacyId = searchParams.get('pharmacyId')

    if (!pharmacyId) {
      return NextResponse.json(
        { error: 'Pharmacy ID required' },
        { status: 400 }
      )
    }

    const { pathname } = new URL(request.url)
    const doctorId = pathname.split('/')[3]

    await prisma.doctorPharmacyPartnership.delete({
      where: {
        doctorId_pharmacyId: {
          doctorId,
          pharmacyId,
        },
      },
    })

    return NextResponse.json({
      message: 'Pharmacy partnership removed successfully',
    })
  } catch (error) {
    console.error('Delete pharmacy partnership error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
