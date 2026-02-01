import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/pharmacies - List all pharmacies
export async function GET() {
  try {
    const pharmacies = await prisma.pharmacy.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ pharmacies })
  } catch (error) {
    console.error('Get pharmacies error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
