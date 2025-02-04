import { db } from './index';
import { users, routes, sends, gyms, points } from './schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

// Test user credentials
const TEST_USER = {
  username: 'gosolonyc',
  email: 'demo@soloapp.dev',
  password: 'demo123', // This is just for testing
  name: 'Solo Demo',
  gym: 'Movement Gowanus',
  profile_photo: '/assets/avatars/purple-solo.png',
  user_type: 'demo' // Set user type as demo
};

// Sample route colors and grades for variety
const ROUTE_COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'White', 'Black', 'Purple', 'Orange'];
const ROUTE_GRADES = ['5.8', '5.9', '5.10a', '5.10b', '5.10c', '5.10d', '5.11a', '5.11b', '5.11c'];

async function addRandomSend(userId: number, gymId: number, date: Date, routeNumber: number) {
  try {
    // Create a route with all required fields
    const [route] = await db.insert(routes).values({
      gym_id: gymId,
      color: ROUTE_COLORS[Math.floor(Math.random() * ROUTE_COLORS.length)],
      grade: ROUTE_GRADES[Math.floor(Math.random() * ROUTE_GRADES.length)],
      wall_sector: 'Main Wall',
      anchor_number: routeNumber,
      active: true,
      created_at: new Date(date.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    }).returning();

    if (!route) {
      throw new Error('Failed to create route');
    }

    // Create the send
    const isSuccessful = Math.random() > 0.3; // 70% success rate
    const [send] = await db.insert(sends).values({
      user_id: userId,
      route_id: route.id,
      status: isSuccessful,
      tries: isSuccessful ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 5) + 1,
      notes: isSuccessful ? 'Clean send!' : 'Almost had it...',
      points: isSuccessful ? 10 : 5,
      created_at: date
    }).returning();

    return send;
  } catch (error) {
    console.error('Error adding random send:', error);
    throw error;
  }
}

async function seedTestData() {
  try {
    console.log('Starting test data seeding...');

    // Create or get the demo gym
    let gym = await db.select().from(gyms).where(eq(gyms.name, TEST_USER.gym)).limit(1);

    if (gym.length === 0) {
      console.log('Creating demo gym...');
      [gym[0]] = await db.insert(gyms).values({
        name: TEST_USER.gym,
        location: 'Brooklyn, NY',
        created_at: new Date()
      }).returning();
    }

    // Check if demo user already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.username, TEST_USER.username))
      .limit(1);

    let user;
    if (existingUser.length > 0) {
      console.log('Demo user already exists, using existing user');
      user = existingUser[0];
      // Update gym_id if needed
      if (user.gym_id !== gym[0].id) {
        await db.update(users)
          .set({ gym_id: gym[0].id })
          .where(eq(users.id, user.id));
        user.gym_id = gym[0].id;
      }
    } else {
      // Create test user
      const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
      [user] = await db.insert(users).values({
        username: TEST_USER.username,
        email: TEST_USER.email,
        password_hash: hashedPassword,
        name: TEST_USER.name,
        profile_photo: TEST_USER.profile_photo,
        created_at: new Date(),
        member_since: new Date(),
        gym_id: gym[0].id,
        user_type: TEST_USER.user_type
      }).returning();

      console.log('Created test user:', TEST_USER.username);
    }

    try {
      // First, delete all sends for this user
      console.log('Cleaning up existing sends...');
      await db.delete(sends)
        .where(eq(sends.user_id, user.id));

      // Then, delete all routes for the demo gym
      console.log('Cleaning up existing routes...');
      await db.delete(routes)
        .where(eq(routes.gym_id, gym[0].id));

      console.log('Creating new demo sends...');
      let routeCounter = 1;
      // Create sample sends for the last 7 days with more variety
      const now = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        // Generate 5-10 sends per day
        const sendsCount = Math.floor(Math.random() * 6) + 5;

        console.log(`Adding ${sendsCount} sends for ${date.toLocaleDateString()}...`);

        for (let j = 0; j < sendsCount; j++) {
          await addRandomSend(user.id, gym[0].id, date, routeCounter++);
        }
      }

      console.log('\nTest Data Summary:');
      console.log('Test User:', TEST_USER.username);
      console.log('Password:', TEST_USER.password);
      console.log('Email:', TEST_USER.email);
      console.log('Gym:', TEST_USER.gym);
      console.log('User Type:', TEST_USER.user_type);
      console.log('\nSuccessfully added demo sends across 7 days');

    } catch (error) {
      console.error('Error during data cleanup/creation:', error);
      throw error;
    }

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

export { seedTestData };