import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

type ErrorResponse = {
  message: string
  error?: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
) {
  switch (req.method) {
    case 'GET':
      return await getUsers(req, res)
    case 'POST':
      return await createUser(req, res)
    default:
      return res.status(405).json({ message: 'Method not allowed' })
  }
}

// Get users with optional filtering
async function getUsers(req: NextApiRequest, res: NextApiResponse<any | ErrorResponse>) {
  try {
    const { gymId, limit = 10, offset = 0 } = req.query
    
    const where = gymId ? { gymId: Number(gymId) } : {}
    
    const users = await prisma.user.findMany({
      take: Number(limit),
      skip: Number(offset),
      where,
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        profilePhoto: true,
        memberSince: true,
        createdAt: true,
        gym: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        points: 'desc',
      },
    })
    
    const total = await prisma.user.count({ where })
    
    return res.status(200).json({
      users,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    })
  } catch (error) {
    console.error('Error getting users:', error)
    return res.status(500).json({ message: 'Error getting users', error })
  }
}

// Create a new user
async function createUser(req: NextApiRequest, res: NextApiResponse<any | ErrorResponse>) {
  try {
    const { username, email, displayName, profilePhoto, gymId } = req.body
    
    // Check if user with email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    })
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      })
    }
    
    const user = await prisma.user.create({
      data: {
        username,
        email,
        displayName,
        profilePhoto,
        ...(gymId && { gymId: Number(gymId) }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        profilePhoto: true,
        memberSince: true,
        createdAt: true,
        gym: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    
    return res.status(201).json(user)
  } catch (error) {
    console.error('Error creating user:', error)
    return res.status(500).json({ message: 'Error creating user', error })
  }
}