from app import app, db
from models import Gym, Route
from datetime import datetime

def migrate():
    print("Running migrations...")
    with app.app_context():
        # Only create tables that don't exist
        db.create_all()

        # Add Movement Gowanus if it doesn't exist
        movement_gowanus = Gym.query.filter_by(name='Movement Gowanus').first()
        if not movement_gowanus:
            movement_gowanus = Gym(
                name='Movement Gowanus',
                location='Brooklyn, NY'
            )
            db.session.add(movement_gowanus)
            db.session.commit()

            # Initial routes for Movement Gowanus (all set on 10/28/2024)
            routes_data = [
                ('MG001', 'Pink', '5.5'),
                ('MG002', 'Red', '5.10d'),
                ('MG003', 'Blue', '5.9'),
                ('MG004', 'White', '5.11b'),
                ('MG005', 'Orange', '5.7'),
                ('MG006', 'Pink', '5.8'),
                ('MG007', 'Black', '5.11d'),
                ('MG008', 'Green', '5.11c'),
                ('MG009', 'Yellow', '5.10b'),
                ('MG010', 'Blue', '5.12a'),
                ('MG011', 'Red', '5.9'),
                ('MG012', 'Orange', '5.10a'),
                ('MG013', 'White', '5.11a')
            ]

            set_date = datetime(2024, 10, 28)
            for route_id, color, grade in routes_data:
                route = Route(
                    route_id=route_id,
                    color=color,
                    grade=grade,
                    date_set=set_date,
                    gym_id=movement_gowanus.id
                )
                db.session.add(route)

            try:
                db.session.commit()
                print("Added Movement Gowanus and its initial routes")
            except Exception as e:
                db.session.rollback()
                print(f"Error adding routes: {str(e)}")

        print("Database migration completed successfully")