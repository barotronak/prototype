import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

export async function GET() {
  try {
    const session = await requireAuth(['DOCTOR'])

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.userId },
      include: {
        preferredPharmacies: {
          include: {
            pharmacy: {
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

    const pharmacies = doctor.preferredPharmacies.map((partnership) => ({
      id: partnership.pharmacy.id,
      pharmacyName: partnership.pharmacy.pharmacyName,
      address: partnership.pharmacy.address,
      operatingHours: partnership.pharmacy.operatingHours,
    }))

    return NextResponse.json({ pharmacies })
  } catch (error) {
    console.error('Error fetching pharmacy partnerships:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(['DOCTOR'])
    const { pharmacyId } = await req.json()

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    // Check if partnership already exists
    const existing = await prisma.doctorPharmacyPartnership.findUnique({
      where: {
        doctorId_pharmacyId: {
          doctorId: doctor.id,
          pharmacyId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Partnership already exists' }, { status: 409 })
    }

    const partnership = await prisma.doctorPharmacyPartnership.create({
      data: {
        doctorId: doctor.id,
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
      message: 'Pharmacy partnership created successfully'
    })
  } catch (error) {
    console.error('Error creating pharmacy partnership:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
