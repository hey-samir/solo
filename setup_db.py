
from app import app, db
from models import User, Climb

def recreate_table():
    with app.app_context():
        # Drop the climb table
        db.session.execute('DROP TABLE IF EXISTS climb')
        db.session.commit()
        
        # Create the table with all columns
        db.session.execute('''
            CREATE TABLE climb (
                id SERIAL PRIMARY KEY,
                color VARCHAR(50) NOT NULL,
                caliber VARCHAR(10),
                rating INTEGER NOT NULL,
                status BOOLEAN NOT NULL,
                attempts INTEGER NOT NULL DEFAULT 1,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                user_id INTEGER REFERENCES "user" (id) NOT NULL
            )
        ''')
        db.session.commit()
        print("Database setup complete!")

if __name__ == "__main__":
    recreate_table()
