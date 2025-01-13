from app import app, db
from models import Gym, Route, RouteGrade
from datetime import datetime

def migrate():
    print("Running migrations...")
    with app.app_context():
        # Create all tables
        db.create_all()

        # Initialize route grades if they don't exist
        grades_data = [
            # Solo/Top Rope grades (5.0 - 5.15d)
            {'grade': '5.0', 'climbing_type': 'solo', 'points': 10, 'difficulty_rank': 1},
            {'grade': '5.1', 'climbing_type': 'solo', 'points': 20, 'difficulty_rank': 2},
            {'grade': '5.2', 'climbing_type': 'solo', 'points': 30, 'difficulty_rank': 3},
            {'grade': '5.3', 'climbing_type': 'solo', 'points': 40, 'difficulty_rank': 4},
            {'grade': '5.4', 'climbing_type': 'solo', 'points': 50, 'difficulty_rank': 5},
            {'grade': '5.5', 'climbing_type': 'solo', 'points': 60, 'difficulty_rank': 6},
            {'grade': '5.6', 'climbing_type': 'solo', 'points': 70, 'difficulty_rank': 7},
            {'grade': '5.7', 'climbing_type': 'solo', 'points': 80, 'difficulty_rank': 8},
            {'grade': '5.8', 'climbing_type': 'solo', 'points': 100, 'difficulty_rank': 9},
            {'grade': '5.9', 'climbing_type': 'solo', 'points': 150, 'difficulty_rank': 10},
            {'grade': '5.10a', 'climbing_type': 'solo', 'points': 200, 'difficulty_rank': 11},
            {'grade': '5.10b', 'climbing_type': 'solo', 'points': 250, 'difficulty_rank': 12},
            {'grade': '5.10c', 'climbing_type': 'solo', 'points': 300, 'difficulty_rank': 13},
            {'grade': '5.10d', 'climbing_type': 'solo', 'points': 350, 'difficulty_rank': 14},
            {'grade': '5.11a', 'climbing_type': 'solo', 'points': 400, 'difficulty_rank': 15},
            {'grade': '5.11b', 'climbing_type': 'solo', 'points': 500, 'difficulty_rank': 16},
            {'grade': '5.11c', 'climbing_type': 'solo', 'points': 600, 'difficulty_rank': 17},
            {'grade': '5.11d', 'climbing_type': 'solo', 'points': 700, 'difficulty_rank': 18},
            {'grade': '5.12a', 'climbing_type': 'solo', 'points': 800, 'difficulty_rank': 19},
            {'grade': '5.12b', 'climbing_type': 'solo', 'points': 900, 'difficulty_rank': 20},
            {'grade': '5.12c', 'climbing_type': 'solo', 'points': 1000, 'difficulty_rank': 21},
            {'grade': '5.12d', 'climbing_type': 'solo', 'points': 1100, 'difficulty_rank': 22},
            {'grade': '5.13a', 'climbing_type': 'solo', 'points': 1250, 'difficulty_rank': 23},
            {'grade': '5.13b', 'climbing_type': 'solo', 'points': 1400, 'difficulty_rank': 24},
            {'grade': '5.13c', 'climbing_type': 'solo', 'points': 1550, 'difficulty_rank': 25},
            {'grade': '5.13d', 'climbing_type': 'solo', 'points': 1700, 'difficulty_rank': 26},
            {'grade': '5.14a', 'climbing_type': 'solo', 'points': 2000, 'difficulty_rank': 27},
            {'grade': '5.14b', 'climbing_type': 'solo', 'points': 2500, 'difficulty_rank': 28},
            {'grade': '5.14c', 'climbing_type': 'solo', 'points': 3000, 'difficulty_rank': 29},
            {'grade': '5.14d', 'climbing_type': 'solo', 'points': 3500, 'difficulty_rank': 30},
            {'grade': '5.15a', 'climbing_type': 'solo', 'points': 4000, 'difficulty_rank': 31},
            {'grade': '5.15b', 'climbing_type': 'solo', 'points': 5000, 'difficulty_rank': 32},
            {'grade': '5.15c', 'climbing_type': 'solo', 'points': 6000, 'difficulty_rank': 33},
            {'grade': '5.15d', 'climbing_type': 'solo', 'points': 7500, 'difficulty_rank': 34},
        ]

        for grade_data in grades_data:
            grade = RouteGrade.query.filter_by(
                grade=grade_data['grade'],
                climbing_type=grade_data['climbing_type']
            ).first()

            if not grade:
                grade = RouteGrade(**grade_data)
                db.session.add(grade)

        try:
            db.session.commit()
            print("Added route grades")
        except Exception as e:
            db.session.rollback()
            print(f"Error adding route grades: {str(e)}")

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
                # Find corresponding grade_id
                grade_info = RouteGrade.query.filter_by(
                    grade=grade,
                    climbing_type='solo'
                ).first()

                if not grade_info:
                    print(f"Warning: Grade {grade} not found in RouteGrade table")
                    continue

                route = Route(
                    route_id=route_id,
                    color=color,
                    grade=grade,
                    grade_id=grade_info.id,
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