import { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { prisma } from '../lib/prisma'

interface UserStats {
  totalUsers: number
  totalSends: number
  totalRoutes: number
}

interface SoloPageProps {
  stats: UserStats
}

export async function getServerSideProps() {
  try {
    // Get counts from database using Prisma
    const usersCount = await prisma.user.count()
    const sendsCount = await prisma.send.count()
    const routesCount = await prisma.route.count()

    return {
      props: {
        stats: {
          totalUsers: usersCount,
          totalSends: sendsCount,
          totalRoutes: routesCount
        }
      }
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      props: {
        stats: {
          totalUsers: 0,
          totalSends: 0,
          totalRoutes: 0
        }
      }
    }
  }
}

const SoloPage: NextPage<SoloPageProps> = ({ stats }) => {
  return (
    <Layout title="Solo | Climbing App" description="Mobile-first climbing performance tracking">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to <span className="text-purple-600">Solo</span>
          </h1>
          <p className="text-lg text-gray-600">
            Track your climbing journey with intuitive technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardBody>
              <div className="text-center">
                <p className="text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalUsers}</p>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <div className="text-center">
                <p className="text-gray-600">Total Sends</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalSends}</p>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <div className="text-center">
                <p className="text-gray-600">Available Routes</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalRoutes}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">About Solo</h2>
          </CardHeader>
          <CardBody>
            <p className="mb-4">
              Solo is a mobile-first climbing performance tracking application designed to help
              climbers monitor their progress, track sessions, and engage with their climbing
              journey through intuitive technology.
            </p>
            <p>
              This page demonstrates integration with our Postgres database via Prisma ORM,
              showing live statistics from the climbing community.
            </p>
          </CardBody>
        </Card>

        <div className="flex justify-center">
          <Link href="/" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            Return Home
          </Link>
        </div>
      </div>
    </Layout>
  )
}

export default SoloPage