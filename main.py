import os
import shutil
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
from datetime import datetime, timedelta
from flask import (
    Flask, render_template, request, redirect, url_for, flash,
    send_from_directory, current_app, session, jsonify
)
from flask_login import (
    LoginManager, login_required, current_user,
    login_user, logout_user, UserMixin
)
from werkzeug.utils import secure_filename
from sqlalchemy import func
from flask_wtf.csrf import CSRFProtect

from app import app, db, logger
from models import Gym, Route, Climb, User, Feedback, FeedbackVote, RouteGrade
from forms import LoginForm, RegistrationForm, ProfileForm, FeedbackForm
from migrations import migrate
from errors import (
    LOGIN_ERROR, REGISTRATION_USERNAME_ERROR, REGISTRATION_USERNAME_TAKEN_ERROR,
    REGISTRATION_EMAIL_TAKEN_ERROR, UPDATE_PROFILE_USERNAME_ERROR,
    UPDATE_PROFILE_USERNAME_TAKEN_ERROR, PROFILE_UPDATE_ERROR,
    PROFILE_PHOTO_ERROR, AVATAR_UPDATE_ERROR, SEND_UPDATE_SUCCESS,
    SEND_UPDATE_ERROR, INTERNAL_SERVER_ERROR
)

# Run migrations
migrate()

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Define grade ranking system
grade_rank = {
    '5.0': 1, '5.1': 2, '5.2': 3, '5.3': 4, '5.4': 5,
    '5.5': 6, '5.6': 7, '5.7': 8, '5.8': 9, '5.9': 10,
    '5.10a': 11, '5.10b': 12, '5.10c': 13, '5.10d': 14,
    '5.11a': 15, '5.11b': 16, '5.11c': 17, '5.11d': 18,
    '5.12a': 19, '5.12b': 20, '5.12c': 21, '5.12d': 22,
    '5.13a': 23, '5.13b': 24, '5.13c': 25, '5.13d': 26,
    '5.14a': 27, '5.14b': 28, '5.14c': 29, '5.14d': 30,
    '5.15a': 31, '5.15b': 32, '5.15c': 33, '5.15d': 34
}
rank_to_grade = {v: k for k, v in grade_rank.items()}

# Initialize CSRF protection
csrf = CSRFProtect(app)

# Create static/images directory if it doesn't exist
os.makedirs(os.path.join(app.static_folder, 'images'), exist_ok=True)

# Copy solo-clear.png to static/images
source_logo = os.path.join('attached_assets', 'solo-clear.png')
dest_logo = os.path.join(app.static_folder, 'images', 'solo-clear.png')
if os.path.exists(source_logo) and not os.path.exists(dest_logo):
    shutil.copy2(source_logo, dest_logo)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
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
        return redirect(url_for('sends'))

    form = RegistrationForm()
    if form.validate_on_submit():
        username = form.username.data
        email = form.email.data
        name = form.name.data
        gym_choice = form.gym.data

        if not username.isalnum():
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
            flash('Please submit your gym information through our feedback form.', 'info')
            return redirect(url_for('feedback'))

        try:
            # Create new user with gym
            gym_id = int(gym_choice) if gym_choice and gym_choice != 'feedback' else None

            # Verify gym exists if one was selected
            if gym_id:
                gym = Gym.query.get(gym_id)
                if not gym:
                    flash('Selected gym not found. Please choose a valid gym.', 'error')
                    return render_template('register.html', form=form)

            user = User(
                username=username,
                email=email,
                name=name,
                gym_id=gym_id
            )
            user.set_password(form.password.data)

            db.session.add(user)
            db.session.commit()

            if gym_id:
                logger.info(f"Created user {username} with gym {gym_id}")

            login_user(user)
            flash('Welcome to Solo! Your account has been created successfully.', 'success')
            return redirect(url_for('sends'))

        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating user: {str(e)}")
            flash('An error occurred during registration. Please try again.', 'error')
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
    # Get routes for user's gym
    routes = []
    if current_user.gym_id:
        routes = Route.query\
            .join(RouteGrade)\
            .filter(Route.gym_id == current_user.gym_id)\
            .order_by(RouteGrade.difficulty_rank)\
            .all()

        # Clean up route_id display (remove #)
        for route in routes:
            if route.route_id.startswith('#'):
                route.route_id = route.route_id[1:]

    return render_template('sends.html', routes=routes)

@app.route('/add_climb', methods=['POST'])
@login_required
def add_climb():
    try:
        app.logger.info("Starting add_climb with form data: %s", request.form)

        route_id = request.form.get('route_id')
        if not route_id:
            flash('Please select a route', 'error')
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
        }
    })

@app.route('/sessions')
@login_required
def sessions():
    try:
        app.logger.info(f"Fetching sessions for user {current_user.id}")

        # Get all climbs for the current user, ordered by date and color
        climbs = db.session.query(Climb, Route)\
            .join(Route)\
            .filter(Climb.user_id == current_user.id)\
            .order_by(Climb.created_at.desc(), Route.color.asc())\
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
@login_required
def profile():
    """
    Handle the user's profile page
    """
    logger.debug("Accessing profile page for user: %s", current_user.username if current_user else 'Anonymous')
    try:
        form = ProfileForm(obj=current_user)  # Pre-fill form with current user data

        # Calculate KPI metrics
        climbs = list(current_user.climbs)
        total_ascents = len(climbs)

        # Calculate average grade
        sent_grades = [climb.route.grade for climb in climbs if climb.status and climb.route.grade]
        if sent_grades:
            valid_ranks = [grade_rank.get(grade, 0) for grade in sent_grades if grade in grade_rank]
            if valid_ranks:
                avg_rank = round(sum(valid_ranks) / len(valid_ranks))
                avg_grade = rank_to_grade.get(avg_rank, '--')
            else:
                avg_grade = '--'
        else:
            avg_grade = '--'

        # Calculate total points
        total_points = sum((climb.rating * (10 if climb.status else 5)) for climb in climbs)

        logger.debug("Successfully rendered profile page")
        return render_template('solo-profile.html', 
                          form=form,
                          total_ascents=total_ascents,
                          avg_grade=avg_grade,
                          total_points=total_points)
    except Exception as e:
        logger.error("Error in profile page: %s", str(e))
        flash('An error occurred while loading your profile. Please try again.', 'error')
        return render_template('solo-profile.html', form=ProfileForm())

# Redirect old /solo route to /profile
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
                if not username.isalnum():
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
                        flash('Selected gym not found. Please choose a valid gym.', 'error')
                        return redirect(url_for('profile'))

            db.session.commit()
            flash('Profile updated successfully!', 'success')
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
            flash('Solo photo updated successfully!', 'success')
        return redirect(url_for('profile'))
    except Exception as e:
        logger.error(f"Error updating avatar: {str(e)}")
        flash(AVATAR_UPDATE_ERROR, 'error')
        return redirect(url_for('profile'))
    
    try:
        if 'photo' not in request.files:
            flash('No file uploaded', 'error')
            return redirect(url_for('profile'))

        file = request.files['photo']
        if file.filename == '':
            flash('No file selected', 'error')
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

            flash('Profile photo updated successfully!', 'success')
        else:
            flash('Invalid file type. Please upload a PNG or JPEG image.', 'error')
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

@app.route('/stats')
@login_required
def stats():
    climbs = list(current_user.climbs)
    sends = [c for c in climbs if c.status]
    attempts = [c for c in climbs if not c.status]

    # Points system
    grade_points = {
        '5.0': 10, '5.1': 20, '5.2': 30, '5.3': 40, '5.4': 50,
        '5.5': 60, '5.6': 70, '5.7': 80, '5.8': 100, '5.9': 150,
        '5.10a': 200, '5.10b': 250, '5.10c': 300, '5.10d': 350,
        '5.11a': 400, '5.11b': 500, '5.11c': 600, '5.11d': 700,
        '5.12a': 800, '5.12b': 900, '5.12c': 1000, '5.12d': 1100,
        '5.13a': 1250, '5.13b': 1400, '5.13c': 1550, '5.13d': 1700,
        '5.14a': 2000, '5.14b': 2500, '5.14c': 3000, '5.14d': 3500,
        '5.15a': 4000, '5.15b': 5000, '5.15c': 6000, '5.15d': 7500
    }
    
    GRADE_POINTS = {
        '5.0': 10, '5.1': 20, '5.2': 30, '5.3': 40, '5.4': 50,
        '5.5': 60, '5.6': 70, '5.7': 80, '5.8': 100, '5.9': 150,
        '5.10a': 200, '5.10b': 250, '5.10c': 300, '5.10d': 350,
        '5.11a': 400, '5.11b': 500, '5.11c': 600, '5.11d': 700,
        '5.12a': 800, '5.12b': 900, '5.12c': 1000, '5.12d': 1100,
        '5.13a': 1250, '5.13b': 1400, '5.13c': 1550, '5.13d': 1700,
        '5.14a': 2000, '5.14b': 2500, '5.14c': 3000, '5.14d': 3500,
        '5.15a': 4000, '5.15b': 5000, '5.15c': 6000, '5.15d': 7500
    }
    
    total_sends = sum(1 for c in climbs if c.status)
    def grade_to_points(grade): return GRADE_POINTS.get(grade, 0)

    # Calculate highest grade (most difficult)
    highest_grade = '--'
    max_grade_value = 0
    for climb in climbs:
        if climb.grade and climb.status:  
            grade_value = grade_points.get(climb.grade, 0)
            if grade_value > max_grade_value:
                max_grade_value = grade_value
                highest_grade = climb.grade

    # Calculate average grade using simple ranking
    sent_grades = [climb.grade for climb in climbs if climb.status and climb.grade]  

    # Define grade ranking system
    grade_rank = {
        '5.0': 1, '5.1': 2, '5.2': 3, '5.3': 4, '5.4': 5,
        '5.5': 6, '5.6': 7, '5.7': 8, '5.8': 9, '5.9': 10,
        '5.10a': 11, '5.10b': 12, '5.10c': 13, '5.10d': 14,
        '5.11a': 15, '5.11b': 16, '5.11c': 17, '5.11d': 18,
        '5.12a': 19, '5.12b': 20, '5.12c': 21, '5.12d': 22,
        '5.13a': 23, '5.13b': 24, '5.13c': 25, '5.13d': 26,
        '5.14a': 27, '5.14b': 28, '5.14c': 29, '5.14d': 30,
        '5.15a': 31, '5.15b': 32, '5.15c': 33, '5.15d': 34
    }
    rank_to_grade = {v: k for k, v in grade_rank.items()}
    
    if sent_grades:
        valid_ranks = [grade_rank.get(grade, 0) for grade in sent_grades if grade in grade_rank]
        if valid_ranks:
            avg_rank = round(sum(valid_ranks) / len(valid_ranks))
            avg_grade = rank_to_grade.get(avg_rank, '--')
        else:
            avg_grade = '--'
    else:
        avg_grade = '--'
    
    # Calculate success rate
    success_rate = round((total_sends / len(climbs) * 100) if climbs else 0)
    
    # Calculate total points and tries
    total_points = sum((climb.rating * (10 if climb.status else 5)) for climb in climbs)
    total_tries = sum(climb.tries for climb in climbs)
    
    # Calculate climbs per session
    sessions = {}
    for climb in climbs:
        date = climb.created_at.date()
        sessions[date] = sessions.get(date, 0) + 1
    climbs_per_session = round(sum(sessions.values()) / len(sessions)) if sessions else 0
    
    # Calculate average grade for sends vs attempts
    sent_grades = [climb.grade for climb in climbs if climb.status and climb.grade]
    attempted_grades = [climb.grade for climb in climbs if not climb.status and climb.grade]
    
    def calculate_avg_grade(grades):
        if not grades:
            return 'N/A'
        grade_values = []
        for grade in grades:
            parts = grade.split('.')
            if len(parts) == 2:
                base = parts[1].rstrip('abcd')
                if base.isdigit():
                    modifier = parts[1][len(base):] if len(parts[1]) > len(base) else ''
                    value = float(base) + {'a': 0.0, 'b': 0.25, 'c': 0.5, 'd': 0.75}.get(modifier, 0)
                    grade_values.append(value)
        if grade_values:
            avg = sum(grade_values) / len(grade_values)
            base = int(avg)
            modifier = ''
            decimal = avg - base
            if decimal >= 0.75:
                modifier = 'd'
            elif decimal >= 0.5:
                modifier = 'c'
            elif decimal >= 0.25:
                modifier = 'b'
            else:
                modifier = 'a'
            return f'5.{base}{modifier}'
        return 'N/A'
    
    avg_sent_grade = calculate_avg_grade(sent_grades)
    avg_attempted_grade = calculate_avg_grade(attempted_grades)

    # Prepare data for front-end charts
    recent_date = datetime.now() - timedelta(days=30)
    very_recent_date = datetime.now() - timedelta(days=7)

    # Count recent sends and attempts
    recent_sends = len([c for c in sends if c.created_at >= recent_date])
    very_recent_sends = len([c for c in sends if c.created_at >= very_recent_date])
    recent_attempts = len([c for c in attempts if c.created_at >= recent_date])
    very_recent_attempts = len([c for c in attempts if c.created_at >= very_recent_date])

    # Calculate average attempts per climb
    avg_attempts_per_climb = round(sum(climb.tries for climb in climbs) / len(climbs), 1) if climbs else 0
    
    # Calculate new metrics
    avg_points_per_climb = round(total_points / len(climbs)) if climbs else 0
    
    # Calculate success rate per session by averaging individual session rates
    session_rates = []
    for date in sessions:
        session_climbs = [c for c in climbs if c.created_at.date() == date]
        session_sends = sum(1 for c in session_climbs if c.status)
        if session_climbs:
            session_rate = (session_sends / len(session_climbs)) * 100
            session_rates.append(session_rate)
    success_rate_per_session = round(sum(session_rates) / len(session_rates)) if session_rates else 0

    return render_template('stats.html',
                         total_ascents=len(climbs),
                         total_sends=total_sends,
                         avg_grade=avg_grade,
                         avg_sent_grade=avg_sent_grade,
                         success_rate=success_rate,
                         total_points=total_points,
                         avg_points_per_climb=avg_points_per_climb,
                         climbs_per_session=climbs_per_session,
                         success_rate_per_session=success_rate_per_session,
                         avg_attempts_per_climb=avg_attempts_per_climb)

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
            feedback_items = Feedback.query.join(FeedbackVote, isouter=True)\
                .group_by(Feedback.id)\
                .order_by(func.count(FeedbackVote.id).desc()).all()
        else:  # 'new' is default
            feedback_items = Feedback.query.order_by(Feedback.created_at.desc()).all()

        # Check if there's a pending registration for gym submission
        pending_registration = session.get('pending_registration')
        if pending_registration:
            form.title.data = "New Gym Submission"
            form.description.data = f"Please add my gym to Solo!\n\nGym Name: \nLocation: \nAdditional Details: "
            form.category.data = 'new_gym'

        return render_template('feedback.html', form=form, feedback_items=feedback_items, sort=sort)
    except Exception as e:
        logger.error(f"Error in feedback route: {str(e)}")
        return render_template('404.html'), 404

@app.route('/feedback', methods=['POST'])
def submit_feedback():
    form = FeedbackForm()
    if form.validate_on_submit():
        try:
            # Validate required fields
            if not form.title.data or not form.description.data:
                flash('Title and description are required.', 'error')
                return redirect(url_for('feedback'))

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
                        flash('Invalid file type. Please use PNG, JPG, or JPEG.', 'error')
                        return redirect(url_for('feedback'))

                    try:
                        filename = secure_filename(f"feedback_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{file.filename}")
                        upload_folder = os.path.join(app.static_folder, 'images', 'feedback')
                        os.makedirs(upload_folder, exist_ok=True)

                        file_path = os.path.join(upload_folder, filename)
                        file.save(file_path)
                        feedback.screenshot_url = f"images/feedback/{filename}"
                    except Exception as e:
                        logger.error(f"File upload error: {str(e)}")
                        flash('Error uploading file. Please try again.', 'error')
                        return redirect(url_for('feedback'))

            db.session.add(feedback)
            db.session.commit()

            # Clear pending registration after successful feedback submission
            if 'pending_registration' in session:
                session.pop('pending_registration')

            flash('Your feedback has reached the summit! Thanks for helping us improve.', 'success')
            return redirect(url_for('feedback'))
        except Exception as e:
            logger.error(f"Error submitting feedback: {str(e)}")
            db.session.rollback()
            flash('Database error. Please try again.', 'error')
            return redirect(url_for('feedback'))

    return redirect(url_for('feedback'))

@app.route('/feedback/<int:feedback_id>/vote', methods=['POST'])
@login_required
def vote_feedback(feedback_id):
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

from sqlalchemy import func
import shutil

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)