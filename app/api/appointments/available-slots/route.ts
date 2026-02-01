import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

// GET /api/appointments/available-slots?doctorId=xxx&date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')
    const dateStr = searchParams.get('date')

    if (!doctorId || !dateStr) {
      return NextResponse.json(
        { error: 'doctorId and date are required' },
        { status: 400 }
      )
    }

    const date = new Date(dateStr)
    const dayOfWeek = date.getDay() // 0=Sunday, 1=Monday, ..., 6=Saturday

    // Get doctor's availability for this day
    const availabilities = await prisma.doctorAvailability.findMany({
      where: {
        doctorId,
        dayOfWeek,
        isActive: true,
      },
    })

    if (availabilities.length === 0) {
      return NextResponse.json({ availableSlots: [] })
    }

    // Get all booked appointments for this date
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      select: {
        appointmentDate: true,
      },
    })

    const bookedTimes = new Set(
      bookedAppointments.map((apt) => apt.appointmentDate.toISOString())
    )

    // Generate available slots
    const availableSlots: string[] = []

    for (const availability of availabilities) {
      const [startHour, startMinute] = availability.startTime.split(':').map(Number)
      const [endHour, endMinute] = availability.endTime.split(':').map(Number)

      let currentTime = new Date(date)
      currentTime.setHours(startHour, startMinute, 0, 0)

      const endTime = new Date(date)
      endTime.setHours(endHour, endMinute, 0, 0)

      while (currentTime < endTime) {
        const slotTime = new Date(currentTime)

        // Check if this slot is not booked
        if (!bookedTimes.has(slotTime.toISOString())) {
          availableSlots.push(slotTime.toISOString())
        }

        // Move to next slot
        currentTime = new Date(currentTime.getTime() + availability.slotDuration * 60000)
      }
    }

    return NextResponse.json({ availableSlots })
  } catch (error) {
    console.error('Get available slots error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
