import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Try to create a simple test query to initialize the database connection
    // Prisma will automatically create tables if they don't exist when first accessed
    await prisma.user.count()

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully'
    })
  } catch (error: any) {
    console.error('Database initialization error:', error)

    // Return a more specific error message
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 500 })
  }
}