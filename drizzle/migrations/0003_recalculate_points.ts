import { sql } from 'drizzle-orm';

export async function up(db) {
  await sql`
    -- First temporarily set all tries to -1 to force an update
    UPDATE sends SET tries = -1;

    -- Then restore the original tries value to trigger recalculation
    UPDATE sends s
    SET tries = CASE 
      WHEN tries = -1 THEN 1  -- Default to 1 if it was somehow null
      ELSE tries
    END,
    status = status;  -- This will retrigger points calculation

    -- Double check: Update points directly for successful sends
    UPDATE sends s
    SET points = p.points
    FROM routes r
    JOIN points p ON r.grade = p.grade
    WHERE r.id = s.route_id
    AND s.status = true;

    -- And update points for attempts
    UPDATE sends s
    SET points = p.tried_points
    FROM routes r
    JOIN points p ON r.grade = p.grade
    WHERE r.id = s.route_id
    AND s.status = false;
  `;
}

export async function down(db) {
  // This migration cannot be reverted as it would lose point calculations
  console.log('Points recalculation cannot be reverted');
}