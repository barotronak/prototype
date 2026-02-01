import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/laboratories - List all laboratories
export async function GET() {
  try {
    const laboratories = await prisma.laboratory.findMany({
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

    return NextResponse.json({ laboratories })
  } catch (error) {
    console.error('Get laboratories error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
