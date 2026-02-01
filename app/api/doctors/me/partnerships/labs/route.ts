import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

export async function GET() {
  try {
    const session = await requireAuth(['DOCTOR'])

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.userId },
      include: {
        preferredLabs: {
          include: {
            laboratory: {
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
        },
      },
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    const labs = doctor.preferredLabs.map((partnership) => ({
      id: partnership.laboratory.id,
      labName: partnership.laboratory.labName,
      address: partnership.laboratory.address,
      servicesOffered: partnership.laboratory.servicesOffered,
      operatingHours: partnership.laboratory.operatingHours,
    }))

    return NextResponse.json({ labs })
  } catch (error) {
    console.error('Error fetching lab partnerships:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(['DOCTOR'])
    const { labId } = await req.json()

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    // Check if partnership already exists
    const existing = await prisma.doctorLabPartnership.findUnique({
      where: {
        doctorId_labId: {
          doctorId: doctor.id,
          labId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Partnership already exists' }, { status: 409 })
    }

    const partnership = await prisma.doctorLabPartnership.create({
      data: {
        doctorId: doctor.id,
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
      message: 'Lab partnership created successfully'
    })
  } catch (error) {
    console.error('Error creating lab partnership:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
