import { db } from './index';
import { users, routes, climbs } from './schema';
import bcrypt from 'bcryptjs';

// Test user credentials
const TEST_USER = {
  username: 'gosolonyc',
  email: 'demo@soloapp.dev',
  password: 'demo123', // This is just for testing
  gym: 'Movement Gowanus',
  profilePhoto: '/static/images/avatar-purple.svg'
};

// Sample route colors and grades for variety
const ROUTE_COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'White', 'Black', 'Purple', 'Orange'];
const ROUTE_GRADES = ['5.8', '5.9', '5.10a', '5.10b', '5.10c', '5.10d', '5.11a', '5.11b', '5.11c'];

// Function to generate a random send for a specific date
export async function addRandomSend(userId: number, date: Date) {
  try {
    // First, ensure we have a route to attach the send to
    const [route] = await db.insert(routes).values({
      routeId: `TR-${Math.floor(Math.random() * 1000)}`,
      color: ROUTE_COLORS[Math.floor(Math.random() * ROUTE_COLORS.length)],
      grade: ROUTE_GRADES[Math.floor(Math.random() * ROUTE_GRADES.length)],
      rating: Math.floor(Math.random() * 5) + 1,
      dateSet: new Date(date.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      gymId: 1 // Default gym ID
    }).returning();

    if (!route) {
      throw new Error('Failed to create route');
    }

    // Create the climb/send
    const isSuccessful = Math.random() > 0.3; // 70% success rate
    const [climb] = await db.insert(climbs).values({
      userId,
      routeId: route.id,
      status: isSuccessful,
      rating: Math.floor(Math.random() * 5) + 1,
      tries: isSuccessful ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 5) + 1,
      notes: isSuccessful ? 'Clean send!' : 'Almost had it...',
      points: isSuccessful ? 10 : 5,
      createdAt: date
    }).returning();

    return climb;
  } catch (error) {
    console.error('Error adding random send:', error);
    throw error;
  }
}

async function seedTestData() {
  try {
    console.log('Starting test data seeding...');

    // Create test user
    const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
    const [user] = await db.insert(users).values({
      username: TEST_USER.username,
      email: TEST_USER.email,
      passwordHash: hashedPassword,
      profilePhoto: TEST_USER.profilePhoto,
      memberSince: new Date(),
      gymId: 1 // Default gym ID
    }).returning();

    console.log('Created test user:', TEST_USER.username);

    // Create sample sends for the last 7 days
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const sendsCount = Math.floor(Math.random() * 5) + 1; // 1-5 sends per day

      for (let j = 0; j < sendsCount; j++) {
        await addRandomSend(user.id, date);
      }
    }

    console.log('Created sample sends for the last 7 days');
    console.log('\nTest Data Summary:');
    console.log('Test User:', TEST_USER.username);
    console.log('Password:', TEST_USER.password);
    console.log('Email:', TEST_USER.email);
    console.log('Gym:', TEST_USER.gym);

  } catch (error) {
    console.error('Error seeding test data:', error);
    throw error;
  }
}

// Only run if executed directly
if (require.main === module) {
  seedTestData()
    .then(() => {
      console.log('Test data seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to seed test data:', error);
      process.exit(1);
    });
}

export { seedTestData, addRandomSend };