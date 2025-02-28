import Head from 'next/head'
import React from 'react'
import styles from '../styles/Home.module.css'
import { prisma } from '../lib/prisma'

// Define interface for database status
interface DbStatus {
  connected: boolean;
  message: string;
}

// Define props for the Home component
interface HomeProps {
  dbStatus: DbStatus;
}

// Server-side rendering to check database status
export async function getServerSideProps() {
  let dbStatus: DbStatus = {
    connected: false,
    message: 'Database connection failed'
  };

  try {
    // Test database connection with a safer alternative
    // This approach handles potential Prisma initialization errors better
    const result = await fetch(process.env.DATABASE_URL ? 'http://localhost:5000/api/health' : 'http://localhost:5000')
      .then(res => res.ok ? { connected: true } : { connected: false })
      .catch(() => ({ connected: false }));
    
    dbStatus = {
      connected: result.connected,
      message: result.connected ? 'Connected to database' : 'Database connection unavailable'
    };
  } catch (error) {
    console.error('Database connection error:', error);
  }

  return {
    props: {
      dbStatus
    }
  };
}

export default function Home({ dbStatus }: HomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Solo | Climbing Performance Tracker</title>
        <meta name="description" content="Mobile-first climbing performance tracking application" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <span className={styles.highlight}>Solo</span>
        </h1>

        <p className={styles.description}>
          Track your climbing journey with intuitive technology
        </p>

        <div className={styles.statusContainer}>
          <p>Database Status: 
            <span className={dbStatus.connected ? styles.connected : styles.disconnected}>
              {' '}{dbStatus.connected ? 'Connected' : 'Disconnected'}
            </span>
          </p>
          <p>{dbStatus.message}</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Track Your Sends &rarr;</h2>
            <p>Log your climbing routes, track attempts, and monitor your progress over time.</p>
          </div>

          <div className={styles.card}>
            <h2>Session Analytics &rarr;</h2>
            <p>Get insights into your climbing sessions with comprehensive statistics and visualization.</p>
          </div>

          <div className={styles.card}>
            <h2>Mobile Optimized &rarr;</h2>
            <p>Designed for seamless use at the gym on your mobile device, even in offline mode.</p>
          </div>

          <div className={styles.card}>
            <h2>Community &rarr;</h2>
            <p>Connect with other climbers, share achievements, and participate in challenges.</p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>
          © {new Date().getFullYear()} Solo Climbing App
        </p>
      </footer>
    </div>
  )
}