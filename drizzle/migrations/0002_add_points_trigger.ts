import { sql } from 'drizzle-orm';

export async function up(db) {
  // Drop existing trigger and function if they exist
  await sql`DROP TRIGGER IF EXISTS set_send_points ON sends;`;
  await sql`DROP FUNCTION IF EXISTS calculate_send_points;`;

  // Create function to calculate points
  await sql`
    CREATE OR REPLACE FUNCTION calculate_send_points()
    RETURNS TRIGGER AS $$
    DECLARE
      send_points INTEGER;
      tried_points INTEGER;
    BEGIN
      -- Get both points values from points table based on route grade
      SELECT p.points, p.tried_points 
      INTO send_points, tried_points
      FROM routes r
      JOIN points p ON r.grade = p.grade
      WHERE r.id = NEW.route_id;

      -- Calculate points based on send status
      -- Full points for successful sends, tried_points for attempts
      IF send_points IS NOT NULL THEN
        IF NEW.status = true THEN
          NEW.points := send_points;
        ELSE
          NEW.points := tried_points;
        END IF;
      ELSE
        NEW.points := 0;
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;

  // Create trigger to automatically calculate points on insert/update
  await sql`
    CREATE TRIGGER set_send_points
    BEFORE INSERT OR UPDATE OF status, route_id ON sends
    FOR EACH ROW
    EXECUTE FUNCTION calculate_send_points();
  `;
}

export async function down(db) {
  await sql`DROP TRIGGER IF EXISTS set_send_points ON sends;`;
  await sql`DROP FUNCTION IF EXISTS calculate_send_points;`;
}