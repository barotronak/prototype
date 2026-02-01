import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(['DOCTOR'])

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    // Delete partnership by labId
    await prisma.doctorLabPartnership.deleteMany({
      where: {
        doctorId: doctor.id,
        labId: params.id,
      },
    })

    return NextResponse.json({ message: 'Lab partnership removed successfully' })
  } catch (error) {
    console.error('Error deleting lab partnership:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
