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
  const { id } = req.query

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: 'Invalid user ID' })
  }

  const userId = parseInt(id, 10)

  if (isNaN(userId)) {
    return res.status(400).json({ message: 'User ID must be a number' })
  }

  switch (req.method) {
    case 'GET':
      return await getUser(userId, res)
    case 'PUT':
      return await updateUser(userId, req, res)
    case 'DELETE':
      return await deleteUser(userId, res)
    default:
      return res.status(405).json({ message: 'Method not allowed' })
  }
}

// Get a specific user by ID
async function getUser(userId: number, res: NextApiResponse<any | ErrorResponse>) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        profilePhoto: true,
        memberSince: true,
        createdAt: true,
        points: true,
        gym: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(200).json(user)
  } catch (error) {
    console.error('Error getting user:', error)
    return res.status(500).json({ message: 'Error getting user', error })
  }
}

// Update a user
async function updateUser(userId: number, req: NextApiRequest, res: NextApiResponse<any | ErrorResponse>) {
  try {
    const { username, email, displayName, profilePhoto, gymId } = req.body

    // Check if username or email is being changed and if it conflicts with existing users
    if (username || email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            username ? { username } : {},
            email ? { email } : {},
          ],
          NOT: {
            id: userId,
          },
        },
      })

      if (existingUser) {
        return res.status(400).json({ 
          message: 'Username or email already in use by another user' 
        })
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        ...(email && { email }),
        ...(displayName !== undefined && { displayName }),
        ...(profilePhoto !== undefined && { profilePhoto }),
        ...(gymId !== undefined && { gymId: gymId ? Number(gymId) : null }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        profilePhoto: true,
        memberSince: true,
        createdAt: true,
        points: true,
        gym: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return res.status(200).json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return res.status(500).json({ message: 'Error updating user', error })
  }
}

// Delete a user
async function deleteUser(userId: number, res: NextApiResponse<any | ErrorResponse>) {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: userId },
    })

    return res.status(200).json({ message: 'User successfully deleted' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return res.status(500).json({ message: 'Error deleting user', error })
  }
}