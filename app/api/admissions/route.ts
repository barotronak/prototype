import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { admissionSchema } from '@/lib/validators'
import { createNotification } from '@/lib/notifications'

// GET /api/admissions - List admissions (filtered by user role)
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

    const admissions = await prisma.patientAdmission.findMany({
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
      },
      orderBy: { admissionDate: 'desc' },
    })

    return NextResponse.json({ admissions })
  } catch (error) {
    console.error('Get admissions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admissions - Create admission
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(['DOCTOR'])

    const body = await request.json()
    const validatedData = admissionSchema.parse(body)

    const admission = await prisma.patientAdmission.create({
      data: {
        doctorId: validatedData.doctorId,
        patientId: validatedData.patientId,
        diagnosis: validatedData.diagnosis,
        symptoms: validatedData.symptoms,
        ward: validatedData.ward,
        bedNumber: validatedData.bedNumber,
        isIcu: validatedData.isIcu || false,
        treatmentPlan: validatedData.treatmentPlan,
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

    // Send notification to patient
    await createNotification(
      admission.patient.userId,
      'ADMISSION',
      'Hospital Admission',
      `You have been admitted by Dr. ${admission.doctor.user.name}`,
      `/patient/admissions/${admission.id}`
    )

    return NextResponse.json({
      admission,
      message: 'Patient admitted successfully',
    })
  } catch (error) {
    console.error('Create admission error:', error)

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
