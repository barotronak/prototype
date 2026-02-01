import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

// GET /api/doctors/[id]/partnerships/labs - Get doctor's lab partnerships
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const partnerships = await prisma.doctorLabPartnership.findMany({
      where: { doctorId: id },
      include: {
        laboratory: {
          include: {
            user: true,
          },
        },
      },
    })

    return NextResponse.json({ partnerships })
  } catch (error) {
    console.error('Get lab partnerships error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/doctors/[id]/partnerships/labs - Add lab partnership
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
    const { labId } = body

    if (!labId) {
      return NextResponse.json(
        { error: 'Lab ID required' },
        { status: 400 }
      )
    }

    // Check if partnership already exists
    const existing = await prisma.doctorLabPartnership.findUnique({
      where: {
        doctorId_labId: {
          doctorId: id,
          labId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Partnership already exists' },
        { status: 409 }
      )
    }

    const partnership = await prisma.doctorLabPartnership.create({
      data: {
        doctorId: id,
        labId,
      },
      include: {
        laboratory: {
          include: {
            user: true,
          },
        },
      },
    })

    return NextResponse.json({
      partnership,
      message: 'Lab partnership added successfully',
    })
  } catch (error) {
    console.error('Add lab partnership error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/doctors/[id]/partnerships/labs - Remove lab partnership
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth(['ADMIN', 'DOCTOR'])

    const { searchParams } = new URL(request.url)
    const labId = searchParams.get('labId')

    if (!labId) {
      return NextResponse.json(
        { error: 'Lab ID required' },
        { status: 400 }
      )
    }

    const { pathname } = new URL(request.url)
    const doctorId = pathname.split('/')[3]

    await prisma.doctorLabPartnership.delete({
      where: {
        doctorId_labId: {
          doctorId,
          labId,
        },
      },
    })

    return NextResponse.json({
      message: 'Lab partnership removed successfully',
    })
  } catch (error) {
    console.error('Delete lab partnership error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
