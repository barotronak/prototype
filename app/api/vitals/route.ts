import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { vitalRecordSchema } from '@/lib/validators'

// GET /api/vitals - List vitals (filtered by patientId or admissionId)
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    let where: any = {}

    if (patientId) {
      where.patientId = patientId
    } else if (session.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { userId: session.userId },
      })
      if (patient) {
        where.patientId = patient.id
      }
    }

    const vitals = await prisma.vitalRecord.findMany({
      where,
      include: {
        patient: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { recordedAt: 'desc' },
    })

    return NextResponse.json({ vitals })
  } catch (error) {
    console.error('Get vitals error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/vitals - Create vital record
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(['DOCTOR', 'ADMIN'])

    const body = await request.json()
    const validatedData = vitalRecordSchema.parse(body)

    // Calculate BMI if weight and height are provided
    let bmi = validatedData.bmi
    if (!bmi && validatedData.weight && validatedData.height) {
      const heightInMeters = validatedData.height / 100
      bmi = parseFloat((validatedData.weight / (heightInMeters * heightInMeters)).toFixed(2))
    }

    const vital = await prisma.vitalRecord.create({
      data: {
        patientId: validatedData.patientId,
        bloodPressureSystolic: validatedData.bloodPressureSystolic,
        bloodPressureDiastolic: validatedData.bloodPressureDiastolic,
        temperature: validatedData.temperature,
        pulse: validatedData.pulse,
        spo2: validatedData.spo2,
        bloodSugar: validatedData.bloodSugar,
        weight: validatedData.weight,
        height: validatedData.height,
        bmi,
        heartRateData: validatedData.heartRateData,
        notes: validatedData.notes,
        recordedBy: validatedData.recordedBy,
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    })

    return NextResponse.json({
      vital,
      message: 'Vital record created successfully',
    })
  } catch (error) {
    console.error('Create vital record error:', error)

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
