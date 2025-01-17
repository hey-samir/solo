# Flask and extensions
from flask import (
    Flask, render_template, request, redirect, url_for, flash,
    send_from_directory, current_app, session, jsonify
)
from flask_login import (
    login_required, current_user,
    login_user, logout_user, UserMixin
)
from werkzeug.utils import secure_filename
from sqlalchemy import func, text
from flask_wtf.csrf import CSRFProtect

# Standard library imports
import os
import shutil
import logging
import sys
import base64
from io import BytesIO
from datetime import datetime, timedelta

# Third-party imports
try:
    import qrcode
    from qrcode import QRCode, constants
except ImportError:
    logging.error("QRCode package not properly installed")
    qrcode = None

# Local imports
from app import app, db, logger
from forms import LoginForm, RegistrationForm, ProfileForm, FeedbackForm
from models import User, Route, Climb, Feedback, FeedbackVote, RouteGrade, Gym
from errors import *

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize CSRF protection
csrf = CSRFProtect(app)

def check_database_connection():
    """Check database connection status"""
    if not os.environ.get('DATABASE_URL'):
        logger.error("DATABASE_URL environment variable is not set")
        return False

    try:
        with app.app_context():
            # Execute a simple query to check connection
            db.session.execute(text('SELECT 1'))
            db.session.commit()
            logger.info("Database connection successful")
            return True
    except Exception as e:
        logger.error(f"Database connection check failed: {str(e)}")
        return False

def initialize_database():
    """Initialize database and create tables"""
    try:
        with app.app_context():
            # Import models to ensure they're registered with SQLAlchemy
            import models  # noqa: F401

            # Create all tables
            db.create_all()
            logger.info("Database tables created successfully")
            return True
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")
        return False

@app.route('/health')
def health_check():
    """Health check endpoint to verify application and database status"""
    try:
        # Check database connection
        is_connected = check_database_connection()
        response = {
            'status': 'healthy' if is_connected else 'unhealthy',
            'database': 'connected' if is_connected else 'disconnected',
            'timestamp': datetime.utcnow().isoformat()
        }
        if not is_connected:
            response['error'] = 'Database connection failed'
            return jsonify(response), 500
        return jsonify(response)
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('profile'))
    return redirect(url_for('about'))

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('sends'))

    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and user.check_password(form.password.data):
            login_user(user)
            next_page = request.args.get('next')
            return redirect(next_page if next_page else url_for('sends'))
        flash(LOGIN_ERROR, 'error')
    return render_template('login.html', form=form)

@app.route('/sign-up', methods=['GET', 'POST'])
def sign_up():
    if current_user.is_authenticated:
        return redirect(url_for('profile'))

    form = RegistrationForm()
    if form.validate_on_submit():
        username = form.username.data
        email = form.email.data
        name = form.name.data
        gym_choice = form.gym.data

        if not username or not username.isalnum():
            flash(REGISTRATION_USERNAME_ERROR, 'error')
            return render_template('register.html', form=form)

        if User.query.filter_by(username=username).first():
            flash(REGISTRATION_USERNAME_TAKEN_ERROR, 'error')
            return render_template('register.html', form=form)

        if User.query.filter_by(email=email).first():
            flash(REGISTRATION_EMAIL_TAKEN_ERROR, 'error')
            return render_template('register.html', form=form)

        # Handle "Submit your gym" selection
        if gym_choice == 'feedback':
            session['pending_registration'] = {
                'username': username,
                'email': email,
                'name': name,
                'password': form.password.data
            }
            flash(GYM_SUBMISSION_INFO, 'info')
            return redirect(url_for('feedback'))

        try:
            gym_id = int(gym_choice) if gym_choice and gym_choice != 'feedback' else None

            # Verify gym exists if one was selected
            if gym_id:
                gym = Gym.query.get(gym_id)
                if not gym:
                    flash(GYM_NOT_FOUND, 'error')
                    return render_template('register.html', form=form)

            # Create new user
            user = User(
                username=username,
                email=email,
                name=name,
                gym_id=gym_id,
                member_since=datetime.utcnow()  # Set member_since explicitly
            )
            user.set_password(form.password.data)

            db.session.add(user)
            db.session.commit()

            # Log the user in and redirect to profile
            login_user(user)
            flash(REGISTRATION_SUCCESS, 'success')

            # Ensure we redirect to profile
            logger.info(f"Successfully created user {username}, redirecting to profile")
            return redirect(url_for('profile'))

        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating user: {str(e)}")
            flash(DATABASE_ERROR, 'error')
            return render_template('register.html', form=form)

    return render_template('register.html', form=form)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/sends')
@login_required
def sends():
    """
    Handle the sends page - display routes for user's gym
    """
    try:
        routes = []
        if current_user.gym_id:
            routes = Route.query \
                .join(RouteGrade) \
                .filter(Route.gym_id == current_user.gym_id) \
                .order_by(RouteGrade.difficulty_rank) \
                .all()

            # Clean up route_id display (remove #)
            for route in routes:
                if route.route_id and route.route_id.startswith('#'):
                    route.route_id = route.route_id[1:]

        return render_template('sends.html', routes=routes)
    except Exception as e:
        logger.error(f"Error in sends route: {str(e)}")
        flash('An error occurred while loading routes. Please try again.', 'error')
        return render_template('sends.html', routes=[])


@app.route('/add_climb', methods=['POST'])
@login_required
def add_climb():
    try:
        app.logger.info("Starting add_climb with form data: %s", request.form)

        route_id = request.form.get('route_id')
        if not route_id:
            flash(NO_ROUTE_SELECTED, 'error')
            return redirect(url_for('sends'))

        route = Route.query.get(route_id)
        if not route:
            flash('Invalid route selected', 'error')
            return redirect(url_for('sends'))

        # Convert status to boolean (True for 'Sent', False for 'Tried')
        status = request.form.get('status') == 'on'
        app.logger.info("Status value: %s", status)

        # Get rating (1-5)
        rating = int(request.form.get('rating', 3))
        if rating not in range(1, 6):
            rating = 3

        # Get tries count
        tries = int(request.form.get('tries', 1))
        if tries < 1:
            tries = 1

        # Calculate points based on grade_info
        climb_points = route.grade_info.points if status else route.grade_info.attempt_points

        climb = Climb(
            route_id=route.id,
            rating=rating,
            status=status,
            tries=tries,
            notes=request.form.get('notes'),
            user_id=current_user.id,
            points=climb_points
        )

        # Update route's aggregate rating
        route.update_rating(rating)

        db.session.add(climb)
        db.session.commit()

        # Return JSON response for API requests
        if request.headers.get('Accept') == 'application/json':
            return jsonify({
                'status': 'success',
                'message': SEND_UPDATE_SUCCESS,
                'climb': {
                    'id': climb.id,
                    'route': {
                        'color': route.color,
                        'grade': route.grade,
                        'route_id': route.route_id
                    },
                    'rating': climb.rating,
                    'status': climb.status,
                    'tries': climb.tries,
                    'points': climb_points,
                    'notes': climb.notes,
                    'created_at': climb.created_at.isoformat()
                }
            })

        flash(SEND_UPDATE_SUCCESS, 'success')
        return redirect(url_for('sends'))

    except Exception as e:
        app.logger.error("Error in add_climb: %s", str(e))
        db.session.rollback()

        # Return JSON error for API requests
        if request.headers.get('Accept') == 'application/json':
            return jsonify({
                'status': 'error',
                'message': SEND_UPDATE_ERROR
            }), 500

        flash(SEND_UPDATE_ERROR, 'error')
        return redirect(url_for('sends'))

@app.route('/api/stats')
@login_required
def api_stats():
    user = current_user
    sends = [c for c in user.climbs if c.status is True]
    attempts = [c for c in user.climbs if not c.status]

    # Prepare data for charts
    difficulty_data = {}
    for climb in sends:
        difficulty_data[climb.grade] = difficulty_data.get(climb.grade, 0) + 1

    # Format data for front-end
    # Calculate climbs per session data
    sessions = {}
    for climb in current_user.climbs:
        date = climb.created_at.date()
        sessions[date] = sessions.get(date, 0) + 1

    session_dates = list(sessions.keys())
    session_dates.sort()

    # Calculate success rate by date
    date_stats = {}
    for climb in current_user.climbs:
        date = climb.created_at.date()
        if date not in date_stats:
            date_stats[date] = {'sends': 0, 'tries': 0}
        if climb.status:
            date_stats[date]['sends'] += 1
        date_stats[date]['tries'] += climb.tries

    # Convert to success rates
    sorted_dates = sorted(date_stats.keys())
    success_rates = []
    for date in sorted_dates:
        stats = date_stats[date]
        rate = (stats['sends'] / stats['tries']) * 100 if stats['tries'] > 0 else 0
        success_rates.append(rate)

    # Calculate send rate by color
    color_stats = {}
    for climb in current_user.climbs:
        color = climb.route.color
        if color not in color_stats:
            color_stats[color] = {'sends': 0, 'total': 0}
        if climb.status:
            color_stats[color]['sends'] += 1
        color_stats[color]['total'] += 1

    # Convert to percentages
    color_send_rates = {
        color: (stats['sends'] / stats['total'] * 100) if stats['total'] > 0 else 0
        for color, stats in color_stats.items()
    }

    return jsonify({
        'ascentsByDifficulty': {
            'labels': list(difficulty_data.keys()),
            'data': list(difficulty_data.values())
        },
        'sendsByDate': {
            'labels': sorted(date_stats.keys()),
            'sends': [date_stats[date]['sends'] for date in sorted(date_stats.keys())],
            'attempts': [date_stats[date]['tries'] - date_stats[date]['sends'] for date in sorted(date_stats.keys())]
        },
        'metricsOverTime': {
            'labels': [d.strftime('%Y-%m-%d') for d in sorted_dates],
            'metrics': [{
                'name': 'Success Rate',
                'data': success_rates,
                'color': '#410f70'
            }]
        },
        'climbsPerSession': {
            'labels': [d.strftime('%Y-%m-%d') for d in session_dates],
            'data': [sessions[d] for d in session_dates]
        },
        'sendRateByColor': {
            'labels': list(color_send_rates.keys()),
            'data': list(color_send_rates.values())
        }
    })

@app.route('/sessions')
@login_required
def sessions():
    try:
        app.logger.info(f"Fetching sessions for user {current_user.id}")

        # Get all climbs for the current user, ordered by date and color
        climbs = db.session.query(Climb, Route) \
            .join(Route) \
            .filter(Climb.user_id == current_user.id) \
            .order_by(Climb.created_at.desc(), Route.color.asc()) \
            .all()

        app.logger.info(f"Found {len(climbs)} climbs for user")

        # Group climbs by date
        from itertools import groupby
        from datetime import datetime

        def get_date(climb_tuple):
            climb, route = climb_tuple
            return climb.created_at.date()

        # Sort climbs by date and group them
        climbs_by_date = {}
        for date, group in groupby(sorted(climbs, key=get_date, reverse=True), key=get_date):
            climbs_by_date[date] = [(climb, route) for climb, route in group]

        app.logger.info(f"Grouped climbs into {len(climbs_by_date)} sessions")
        return render_template('sessions.html', climbs_by_date=climbs_by_date)

    except Exception as e:
        app.logger.error(f"Error in sessions route: {str(e)}")
        db.session.rollback()
        return render_template('sessions.html', climbs_by_date={})

@app.route('/profile')
@app.route('/profile/<username>')
def profile(username=None):
    """
    Handle the user's profile page with optional username parameter for public viewing
    """
    logger.debug("Accessing profile page for user: %s", username or (current_user.username if current_user.is_authenticated else 'Anonymous'))
    try:
        if username:
            # Remove @ symbol if present in the URL
            username = username.lstrip('@')
            # Public profile view
            user = User.query.filter_by(username=username).first_or_404()
        elif current_user.is_authenticated:
            # Personal profile view - redirect to /profile/username
            return redirect(url_for('profile', username=current_user.username))
        else:
            # No username specified and not logged in
            flash('Please log in to view your profile.', 'error')
            return redirect(url_for('login'))

        form = ProfileForm(obj=user)  # Pre-fill form with user data

        # Calculate KPI metrics
        climbs = list(user.climbs)
        total_ascents = len(climbs)

        # Calculate sent grades
        sent_grades = [climb.route.grade_info.grade for climb in climbs if climb.status]
        avg_grade = calculate_avg_grade(sent_grades) if sent_grades else '--'

        # Calculate total points
        total_points = sum(climb.points for climb in climbs)

        # Generate QR code for profile sharing
        try:
            if qrcode:
                qr = qrcode.QRCode(
                    version=1,
                    error_correction=qrcode.constants.ERROR_CORRECT_L,
                    box_size=10,
                    border=4,
                )
                profile_url = f"gosolo.nyc/profile/@{user.username}"
                qr.add_data(profile_url)
                qr.make(fit=True)

                # Create QR code image
                img_buffer = BytesIO()
                qr_image = qr.make_image(fill_color="black", back_color="white")
                qr_image.save(img_buffer, format='PNG')
                img_buffer.seek(0)
                qr_code = base64.b64encode(img_buffer.getvalue()).decode()
            else:
                qr_code = None
        except Exception as e:
            logger.error(f"Error generating QR code: {str(e)}")
            qr_code = None

        is_own_profile = current_user.is_authenticated and current_user.id == user.id

        logger.debug("Successfully rendered profile page")
        return render_template('solo-profile.html',
                               form=form,
                               profile_user=user,
                               total_ascents=total_ascents,
                               avg_grade=avg_grade,
                               total_points=total_points,
                               qr_code=qr_code,
                               is_own_profile=is_own_profile)
    except Exception as e:
        logger.error("Error in profile page: %s", str(e))
        flash('An error occurred while loading the profile. Please try again.', 'error')
        return render_template('404.html'), 404

@app.route('/solo')
@login_required
def solo():
    """
    Redirect old /solo route to /profile
    """
    return redirect(url_for('profile'))


@app.route('/update_profile', methods=['POST'])
@login_required
def update_profile():
    form = ProfileForm()
    if form.validate_on_submit():
        username = form.username.data
        name = form.name.data
        gym_choice = form.gym.data

        try:
            # Update username if changed and valid
            if username and username != current_user.username:
                if not username or not username.isalnum():
                    flash(UPDATE_PROFILE_USERNAME_ERROR, 'error')
                    return redirect(url_for('profile'))
                if User.query.filter_by(username=username).first():
                    flash(UPDATE_PROFILE_USERNAME_TAKEN_ERROR, 'error')
                    return redirect(url_for('profile'))
                current_user.username = username

            # Update name if provided
            if name:
                current_user.name = name

            # Handle gym selection
            if gym_choice == 'feedback':
                return redirect(url_for('feedback'))
            elif gym_choice:
                if gym_choice.isdigit():
                    gym = Gym.query.get(int(gym_choice))
                    if gym:
                        current_user.gym_id = gym.id
                        logger.info(f"Updated gym to {gym.id} ({gym.name}) for user {current_user.username}")
                    else:
                        flash(GYM_NOT_FOUND, 'error')
                        return redirect(url_for('profile'))

            db.session.commit()
            flash(PROFILE_UPDATE_SUCCESS, 'success')
            return redirect(url_for('profile'))

        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating profile: {str(e)}")
            flash(PROFILE_UPDATE_ERROR, 'error')
            return redirect(url_for('profile'))

    return redirect(url_for('profile'))

@app.route('/update_avatar', methods=['POST'])
@login_required
def update_avatar():
    try:
        avatar = request.form.get('avatar')
        if avatar:
            current_user.profile_photo = avatar
            db.session.commit()
            flash(AVATAR_UPDATE_SUCCESS, 'success')
        return redirect(url_for('profile'))
    except Exception as e:
        logger.error(f"Error updating avatar: {str(e)}")
        flash(AVATAR_UPDATE_ERROR, 'error')
        return redirect(url_for('profile'))

    try:
        if 'photo' not in request.files:
            flash(NO_FILE_UPLOADED, 'error')
            return redirect(url_for('profile'))

        file = request.files['photo']
        if file.filename == '':
            flash(NO_FILE_SELECTED, 'error')
            return redirect(url_for('profile'))

        if file and allowed_file(file.filename):
            from PIL import Image

            # Read and process the image
            image = Image.open(file)

            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')

            # Create a square crop
            width, height = image.size
            size = min(width, height)
            left = (width - size) // 2
            top = (height - size) // 2
            right = left + size
            bottom = top + size
            image = image.crop((left, top, right, bottom))

            # Resize to standard size
            image = image.resize((400, 400), Image.Resampling.LANCZOS)

            # Prepare filename and save
            filename = secure_filename(f"profile_{current_user.id}.jpg")
            upload_folder = os.path.join(app.static_folder, 'images', 'profiles')
            os.makedirs(upload_folder, exist_ok=True)

            save_path = os.path.join(upload_folder, filename)
            image.save(save_path, 'JPEG', quality=85)

            # Update user's profile photo field
            current_user.profile_photo = f"profiles/{filename}"
            db.session.commit()

            flash(PROFILE_PHOTO_UPDATE_SUCCESS, 'success')
        else:
            flash(INVALID_FILE_TYPE, 'error')
    except Exception as e:
        logger.error(f"Error processing photo: {str(e)}")
        flash(PROFILE_PHOTO_ERROR, 'error')
        db.session.rollback()

    return redirect(url_for('profile'))

@app.route('/standings')
@login_required
def standings():
    users = User.query.all()
    leaderboard = []

    for user in users:
        sends = [c for c in user.climbs if c.status is True]
        total_sends = len(sends)

        # Calculate average grade
        sent_grades = []
        for climb in sends:
            if climb.grade:
                grade_parts = climb.grade.split('.')
                if len(grade_parts) == 2:
                    grade_num = grade_parts[1].rstrip('abcd')
                    if grade_num.isdigit():
                        sent_grades.append(int(grade_num))
        avg_grade = f"5.{round(sum(sent_grades) / len(sent_grades))}" if sent_grades else '--'

        # Calculate total points
        total_points = sum(climb.rating * (10 if climb.status else 5) for climb in user.climbs)

        leaderboard.append({
            'username': user.username,
            'total_sends': total_sends,
            'avg_grade': avg_grade,
            'total_points': total_points
        })

    # Sort by total points
    leaderboard = sorted(leaderboard, key=lambda x: x['total_points'], reverse=True)

    return render_template('standings.html', leaderboard=leaderboard)

# Stats calculation functions
def calculate_avg_grade(grades):
    """Helper function to calculate average grade"""
    try:
        valid_grades = []
        for grade in grades:
            if grade and isinstance(grade, str):
                parts = grade.split('.')
                if len(parts) == 2:
                    base = parts[1].rstrip('abcd')
                    if base.isdigit():
                        valid_grades.append(float(base))

        if valid_grades:
            avg = sum(valid_grades) / len(valid_grades)
            return f"5.{round(avg)}"
        return '--'
    except Exception:
        return '--'

def calculate_stats(climbs):
    """Calculate all stats for a list of climbs"""
    try:
        total_sends = sum(1 for c in climbs if c.status)
        total_points = sum(climb.points for climb in climbs)
        success_rate = round((total_sends / len(climbs) * 100) if climbs else 0)

        # Calculate session stats
        sessions = {}
        for climb in climbs:
            date = climb.created_at.date()
            sessions[date] = sessions.get(date, 0) + 1

        climbs_per_session = round(sum(sessions.values()) / len(sessions)) if sessions else 0
        avg_points_per_climb = round(total_points / len(climbs)) if climbs else 0
        avg_attempts_per_climb = round(sum(climb.tries for climb in climbs) / len(climbs), 1) if climbs else 0

        # Calculate success rate per session
        session_rates = []
        for date in sessions:
            session_climbs = [c for c in climbs if c.created_at.date() == date]
            session_sends = sum(1 for c in session_climbs if c.status)
            if session_climbs:
                session_rate = (session_sends / len(session_climbs)) * 100
                session_rates.append(session_rate)
        success_rate_per_session = round(sum(session_rates) / len(session_rates)) if session_rates else 0

        # Calculate grades
        sent_grades = [climb.grade for climb in climbs if climb.status and climb.grade]
        avg_sent_grade = calculate_avg_grade(sent_grades)

        return {
            'total_sends': total_sends,
            'total_points': total_points,
            'success_rate': success_rate,
            'climbs_per_session': climbs_per_session,
            'avg_points_per_climb': avg_points_per_climb,
            'avg_attempts_per_climb': avg_attempts_per_climb,
            'success_rate_per_session': success_rate_per_session,
            'avg_sent_grade': avg_sent_grade
        }
    except Exception as e:
        logger.error(f"Error calculating stats: {str(e)}")
        return {}

@app.route('/stats')
@login_required
def stats():
    """Handle stats page"""
    try:
        climbs = list(current_user.climbs)
        stats_data = calculate_stats(climbs)

        return render_template('stats.html',
                               total_ascents=len(climbs),
                               **stats_data)
    except Exception as e:
        logger.error(f"Error in stats page: {str(e)}")
        flash('An error occurred while loading stats. Please try again.', 'error')
        return render_template('stats.html')

@app.route('/squads')
@login_required
def squads():
    return render_template('404.html')

@app.route('/feedback', methods=['GET'])
def feedback():
    """
    The feedback route is accessible without login to allow new gym submissions
    """
    try:
        form = FeedbackForm()
        sort = request.args.get('sort', 'new')

        # Query feedback items
        if sort == 'top':
            feedback_items = (
                Feedback.query
                .join(FeedbackVote, isouter=True)
                .group_by(Feedback.id)
                .order_by(func.count(FeedbackVote.id).desc())
                .all()
            )
        else:  # 'new' is default
            feedback_items = Feedback.query.order_by(Feedback.created_at.desc()).all()

        # Check if there's a pending registration for gym submission
        pending_registration = session.get('pending_registration')
        if pending_registration:
            form.title.data = "New Gym Submission"
            form.description.data = f"Please add mygym to Solo!\n\nGym Name: \nLocation: \nAdditional Details: "
            form.category.data = 'new_gym'

        return render_template('feedback.html', form=form, feedback_items=feedback_items, sort=sort)
    except Exception as e:
        logger.error(f"Error in feedback route: {str(e)}")
        return render_template('404.html'), 404

@app.route('/feedback', methods=['POST'])
def submit_feedback():
    from forms import FeedbackForm
    from models import Feedback
    from werkzeug.utils import secure_filename
    from datetime import datetime

    form = FeedbackForm()
    if not form.validate_on_submit():
        for field, errors in form.errors.items():
            for error in errors:
                flash(f'{field}: {error}', 'error')
        return redirect(url_for('feedback'))

    try:
        # Create new feedback
        feedback = Feedback(
            title=form.title.data,
            description=form.description.data,
            user_id=current_user.id if current_user.is_authenticated else None
        )

        # Handle screenshot upload if provided
        if form.screenshot.data:
            file = form.screenshot.data
            if file.filename != '':
                if not allowed_file(file.filename):
                    flash(INVALID_FILE_TYPE, 'error')
                    return redirect(url_for('feedback'))

                try:
                    filename = secure_filename(
                        f"feedback_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{file.filename}")
                    upload_folder = os.path.join(app.static_folder, 'images', 'feedback')
                    os.makedirs(upload_folder, exist_ok=True)

                    file_path = os.path.join(upload_folder, filename)
                    file.save(file_path)
                    feedback.screenshot_url = f"images/feedback/{filename}"
                except Exception as e:
                    logger.error(f"File upload error: {str(e)}")
                    flash(FILE_UPLOAD_ERROR, 'error')
                    return redirect(url_for('feedback'))

        db.session.add(feedback)
        db.session.commit()

        # Clear pending registration after successful feedback submission
        if 'pending_registration' in session:
            session.pop('pending_registration')

        flash(FEEDBACK_SUBMIT_SUCCESS, 'success')
        return redirect(url_for('feedback'))
    except Exception as e:
        logger.error(f"Error submitting feedback: {str(e)}")
        db.session.rollback()
        flash(DATABASE_ERROR, 'error')
        return redirect(url_for('feedback'))

    return redirect(url_for('feedback'))

@app.route('/feedback/<int:feedback_id>/vote', methods=['POST'])
@login_required
def vote_feedback(feedback_id):
    from models import FeedbackVote
    try:
        # Check if user has already voted
        existing_vote = FeedbackVote.query.filter_by(
            user_id=current_user.id,
            feedback_id=feedback_id
        ).first()

        if existing_vote:
            # Remove vote if already voted
            db.session.delete(existing_vote)
            message = 'Vote removed'
        else:
            # Add new vote
            vote = FeedbackVote(user_id=current_user.id, feedback_id=feedback_id)
            db.session.add(vote)
            message = 'Vote added'

        db.session.commit()
        flash(message, 'success')
    except Exception as e:
        logger.error(f"Error processing vote: {str(e)}")
        db.session.rollback()
        flash('Error processing vote. Please try again.', 'error')

    return redirect(url_for('feedback'))

# Add this route after your other routes
@app.route('/offline.html')
def offline():
    return render_template('offline.html')

@app.route('/store')
@app.route('/coming-soon')
def coming_soon():
    """Handle store/coming soon page"""
    return render_template('404.html'), 404

@app.route('/error_404')
def error_404():
    """Handle 404 errors"""
    return render_template('404.html'), 404

@app.errorhandler(404)
def page_not_found(e):
    """Global 404 error handler"""
    return render_template('404.html'), 404

@app.errorhandler(Exception)
def handle_error(error):
    """Global error handler"""
    db.session.rollback()
    logger.error(f'Error: {str(error)}')
    return render_template('404.html', error="Internal Server Error"), 500

#Ensure static/images directory exists
os.makedirs(os.path.join(app.static_folder, 'images'), exist_ok=True)

# Copy solo-clear.png to static/images if needed
source_logo = os.path.join('attached_assets', 'solo-clear.png')
dest_logo = os.path.join(app.static_folder, 'images', 'solo-clear.png')
if os.path.exists(source_logo) and not os.path.exists(dest_logo):
    shutil.copy2(source_logo, dest_logo)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

if __name__ == "__main__":
    try:
        logger.info("Starting Flask server...")

        # Verify DATABASE_URL is set
        if not os.environ.get('DATABASE_URL'):
            logger.error("DATABASE_URL environment variable is not set")
            sys.exit(1)

        # Check database connection
        if not check_database_connection():
            logger.error("Database connection check failed")
            sys.exit(1)

        logger.info("Database connection verified successfully")

        # Initialize database if needed
        if not initialize_database():
            logger.error("Database initialization failed")
            sys.exit(1)

        # Start Flask server
        app.run(host='0.0.0.0', port=5000, debug=True)
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        sys.exit(1)