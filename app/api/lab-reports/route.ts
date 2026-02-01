import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { labReportSchema } from '@/lib/validators'
import { createNotification } from '@/lib/notifications'

// GET /api/lab-reports - List lab reports
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    let where: any = {}

    // Filter based on user role
    if (session.role === 'LABORATORY') {
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

    const reports = await prisma.labReport.findMany({
      where,
      include: {
        labPrescription: {
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
        },
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
      },
      orderBy: { completedAt: 'desc' },
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Get lab reports error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/lab-reports - Create lab report
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(['LABORATORY'])

    const body = await request.json()
    const validatedData = labReportSchema.parse(body)

    // Check if report already exists for this prescription
    const existing = await prisma.labReport.findUnique({
      where: { labPrescriptionId: validatedData.labPrescriptionId },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Report already exists for this prescription' },
        { status: 409 }
      )
    }

    const report = await prisma.labReport.create({
      data: {
        labPrescriptionId: validatedData.labPrescriptionId,
        labId: validatedData.labId,
        patientId: validatedData.patientId,
        reportPdfUrl: validatedData.reportPdfUrl,
        structuredData: validatedData.structuredData,
        findings: validatedData.findings,
        recommendations: validatedData.recommendations,
      },
      include: {
        labPrescription: {
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
        },
      },
    })

    // Update prescription status to FULFILLED
    await prisma.labPrescription.update({
      where: { id: validatedData.labPrescriptionId },
      data: { status: 'FULFILLED' },
    })

    // Send notifications to patient and doctor
    await createNotification(
      report.labPrescription.patient.userId,
      'LAB_REPORT',
      'Lab Report Available',
      `Your ${report.labPrescription.testName} report is ready`,
      `/patient/reports/${report.id}`
    )

    await createNotification(
      report.labPrescription.doctor.userId,
      'LAB_REPORT',
      'Lab Report Uploaded',
      `${report.labPrescription.testName} report for ${report.labPrescription.patient.user.name} is ready`,
      `/doctor/reports/${report.id}`
    )

    return NextResponse.json({
      report,
      message: 'Lab report uploaded successfully',
    })
  } catch (error) {
    console.error('Create lab report error:', error)

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
