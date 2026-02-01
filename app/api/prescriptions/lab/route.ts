import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { labPrescriptionSchema } from '@/lib/validators'
import { createNotification } from '@/lib/notifications'

// GET /api/prescriptions/lab - List lab prescriptions (filtered by user role)
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
    } else if (session.role === 'LABORATORY') {
      const lab = await prisma.laboratory.findUnique({
        where: { userId: session.userId },
      })
      if (lab) {
        where.labId = lab.id
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

    const prescriptions = await prisma.labPrescription.findMany({
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
        lab: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        report: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ prescriptions })
  } catch (error) {
    console.error('Get lab prescriptions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/prescriptions/lab - Create lab prescription
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(['DOCTOR'])

    const body = await request.json()
    const validatedData = labPrescriptionSchema.parse(body)

    const prescription = await prisma.labPrescription.create({
      data: {
        doctorId: validatedData.doctorId,
        patientId: validatedData.patientId,
        labId: validatedData.labId,
        testName: validatedData.testName,
        testDetails: validatedData.testDetails,
        instructions: validatedData.instructions,
        urgency: validatedData.urgency,
        prescriptionPdfUrl: validatedData.prescriptionPdfUrl,
      },
      include: {
        lab: {
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

    // Send notification to lab
    await createNotification(
      prescription.lab.userId,
      'PRESCRIPTION',
      'New Lab Test Prescription',
      `Dr. ${prescription.doctor.user.name} prescribed ${prescription.testName} for ${prescription.patient.user.name}`,
      `/laboratory/prescriptions/${prescription.id}`
    )

    return NextResponse.json({
      prescription,
      message: 'Lab prescription created successfully',
    })
  } catch (error) {
    console.error('Create lab prescription error:', error)

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
