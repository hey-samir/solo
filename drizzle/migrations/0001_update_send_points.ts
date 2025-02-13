import { sql } from 'drizzle-orm';

export async function up(db) {
  await sql`
    -- First update points directly to ensure data consistency
    UPDATE sends s
    SET points = (
      SELECT 
        CASE 
          WHEN s.status = true THEN p.points  -- Full points for successful sends
          ELSE p.tried_points                 -- Tried points for attempts
        END
      FROM routes r
      JOIN points p ON r.grade = p.grade
      WHERE r.id = s.route_id
    )
    WHERE EXISTS (
      SELECT 1 
      FROM routes r
      JOIN points p ON r.grade = p.grade
      WHERE r.id = s.route_id
    );

    -- Then force trigger to run on all records by updating status
    UPDATE sends s
    SET status = status
    WHERE EXISTS (
      SELECT 1 
      FROM routes r
      JOIN points p ON r.grade = p.grade
      WHERE r.id = s.route_id
    );
  `;
}

export async function down(db) {
  console.log('This migration cannot be reverted as it would lose point calculations');
}