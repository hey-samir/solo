import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

type HealthStatus = {
  status: string
  timestamp: string
  database: {
    connected: boolean
    message: string
  }
  environment: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthStatus>
) {
  let dbConnected = false
  let dbMessage = 'Database connection failed'

  try {
    // Attempt a simple database query
    try {
      // Use a different approach to avoid template literal issues
      await prisma.$executeRaw`SELECT 1`
      dbConnected = true
      dbMessage = 'Connected to database'
    } catch (e) {
      console.error('Database connection error:', e)
    }

    const healthStatus: HealthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        message: dbMessage
      },
      environment: process.env.NODE_ENV || 'development'
    }

    res.status(200).json(healthStatus)
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        message: 'Health check failed'
      },
      environment: process.env.NODE_ENV || 'development'
    })
  }
}
