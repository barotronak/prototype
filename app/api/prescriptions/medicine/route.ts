import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { medicinePrescriptionSchema } from '@/lib/validators'
import { createNotification } from '@/lib/notifications'

// GET /api/prescriptions/medicine - List medicine prescriptions (filtered by user role)
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
    } else if (session.role === 'PHARMACY') {
      const pharmacy = await prisma.pharmacy.findUnique({
        where: { userId: session.userId },
      })
      if (pharmacy) {
        where.pharmacyId = pharmacy.id
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

    const prescriptions = await prisma.medicinePrescription.findMany({
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
        pharmacy: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ prescriptions })
  } catch (error) {
    console.error('Get medicine prescriptions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/prescriptions/medicine - Create medicine prescription
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(['DOCTOR'])

    const body = await request.json()
    const validatedData = medicinePrescriptionSchema.parse(body)

    const prescription = await prisma.medicinePrescription.create({
      data: {
        doctorId: validatedData.doctorId,
        patientId: validatedData.patientId,
        pharmacyId: validatedData.pharmacyId,
        medicines: validatedData.medicines,
        notes: validatedData.instructions,
        prescriptionPdfUrl: validatedData.prescriptionPdfUrl,
      },
      include: {
        pharmacy: {
          include: {
            user: true,
          },
        },
        patient: {
          include: {
            user: true,
          },
        },
        doctor: {
          include: {
            user: true,
          },
        },
      },
    })

    // Send notification to pharmacy
    await createNotification(
      prescription.pharmacy.userId,
      'PRESCRIPTION',
      'New Medicine Prescription',
      `Dr. ${prescription.doctor.user.name} prescribed medicines for ${prescription.patient.user.name}`,
      `/pharmacy/prescriptions/${prescription.id}`
    )

    return NextResponse.json({
      prescription,
      message: 'Medicine prescription created successfully',
    })
  } catch (error) {
    console.error('Create medicine prescription error:', error)

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
