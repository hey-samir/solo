import os
import logging
import sys
from datetime import datetime, timedelta

# Import both user messages and system errors
from user_messages import get_user_message, MessageType
from errors import ErrorSeverity, ErrorCodes, get_error_details, log_error

# Initialize logging with proper formatting
logging.basicConfig(
    level=logging.DEBUG,  # Changed to DEBUG for more verbose logging
    format='%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Import app and extensions first
try:
    from app import app, db
    logger.info("Successfully imported app and db")
except Exception as e:
    logger.error(f"Failed to import app: {str(e)}", exc_info=True)
    sys.exit(1)

# Flask imports
from flask import render_template, request, redirect, url_for, flash, jsonify, session
from flask_login import login_required, current_user, login_user, logout_user
from werkzeug.utils import secure_filename
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError

# Import models and forms after app initialization
try:
    from models import User, Route, Climb, Feedback, FeedbackVote, RouteGrade, Gym
    from forms import LoginForm, RegistrationForm, ProfileForm, FeedbackForm
    logger.info("Successfully imported models and forms")
except Exception as e:
    logger.error(f"Failed to import models and forms: {str(e)}", exc_info=True)
    sys.exit(1)

# Initialize CSRF protection
from flask_wtf.csrf import CSRFProtect
csrf = CSRFProtect(app)

# File upload configuration
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
            # Enable session persistence
            session.permanent = True
            login_user(user, remember=True)
            next_page = request.args.get('next')
            return redirect(next_page if next_page else url_for('sends'))
        message, type_ = get_user_message('LOGIN_FAILED')
        flash(message, type_)
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
            message, type_ = get_user_message('USERNAME_INVALID')
            flash(message, type_)
            return render_template('register.html', form=form)

        if User.query.filter_by(username=username).first():
            message, type_ = get_user_message('USERNAME_TAKEN')
            flash(message, type_)
            return render_template('register.html', form=form)

        if User.query.filter_by(email=email).first():
            message, type_ = get_user_message('EMAIL_TAKEN')
            flash(message, type_)
            return render_template('register.html', form=form)

        # Handle "Submit your gym" selection
        if gym_choice == 'feedback':
            session['pending_registration'] = {
                'username': username,
                'email': email,
                'name': name,
                'password': form.password.data
            }
            message, type_ = get_user_message('GYM_SUBMISSION')
            flash(message, type_)
            return redirect(url_for('feedback'))

        try:
            gym_id = int(gym_choice) if gym_choice and gym_choice != 'feedback' else None

            # Verify gym exists if one was selected
            if gym_id:
                gym = Gym.query.get(gym_id)
                if not gym:
                    message, type_ = get_user_message('GYM_NOT_FOUND')
                    flash(message, type_)
                    return render_template('register.html', form=form)

            # Create new user
            user = User(
                username=username,
                email=email,
                name=name,
                gym_id=gym_id,
                member_since=datetime.utcnow()
            )
            user.set_password(form.password.data)

            db.session.add(user)
            db.session.commit()

            # Log the user in and redirect to profile
            login_user(user)
            message, type_ = get_user_message('REGISTRATION')
            flash(message, type_)

            # Ensure we redirect to profile
            logger.info(f"Successfully created user {username}, redirecting to profile")
            return redirect(url_for('profile'))

        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating user: {str(e)}")
            message, type_ = get_user_message('DATABASE_ERROR')
            flash(message, type_)
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

        logger.info(f"Fetched {len(routes)} routes for user {current_user.id}")
        return render_template('sends.html', routes=routes)
    except Exception as e:
        logger.error(f"Error in sends route: {str(e)}")
        message, type_ = get_user_message('GENERIC_ERROR')
        flash(message, type_)
        return render_template('sends.html', routes=[])


@app.route('/add_climb', methods=['POST'])
@login_required
def add_climb():
    try:
        app.logger.info("Starting add_climb with form data: %s", request.form)

        route_id = request.form.get('route_id')
        if not route_id:
            message, type_ = get_user_message('NO_ROUTE')
            flash(message, type_)
            return redirect(url_for('sends'))

        route = Route.query.get(route_id)
        if not route:
            message, type_ = get_user_message('NO_ROUTE')
            flash(message, type_)
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

        # Calculate points based on grade, status, rating and tries
        base_points = route.grade_info.points
        star_multiplier = max(0.1, rating / 3)
        status_multiplier = 1 if status else 0.5
        tries_multiplier = max(0.1, 1 / (tries ** 0.5))

        climb_points = round(base_points * star_multiplier * status_multiplier * tries_multiplier)

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
                'message': 'SEND_UPDATE_SUCCESS',
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

        message, type_ = get_user_message('SEND_LOGGED')
        flash(message, type_)
        return redirect(url_for('sends'))

    except Exception as e:
        app.logger.error("Error in add_climb: %s", str(e))
        db.session.rollback()

        # Return JSON error for API requests
        if request.headers.get('Accept') == 'application/json':
            return jsonify({
                'status': 'error',
                'message': 'SEND_UPDATE_ERROR'
            }), 500

        message, type_ = get_user_message('SEND_UPDATE')
        flash(message, type_)
        return redirect(url_for('sends'))

@app.route('/api/stats')
@login_required
def api_stats():
    user = current_user
    climbs = list(user.climbs)
    sends = [c for c in climbs if c.status is True]
    attempts = [c for c in climbs if not c.status]

    # Calculate difficulty data
    difficulty_data = {}
    for climb in sends:
        if climb.route and climb.route.grade:
            difficulty_data[climb.route.grade] = difficulty_data.get(climb.route.grade, 0) + 1

    # Calculate session data
    sessions = {}
    for climb in climbs:
        date = climb.created_at.date()
        sessions[date] = sessions.get(date, 0) + 1

    session_dates = list(sessions.keys())
    session_dates.sort()

    # Calculate success rate by date
    date_stats = {}
    for climb in climbs:
        date = climb.created_at.date()
        if date not in date_stats:
            date_stats[date] = {'sends': 0, 'tries': 0}
        if climb.status:
            date_stats[date]['sends'] += 1
        date_stats[date]['tries'] += climb.tries if climb.tries else 1

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
            message, type_ = get_user_message('LOGIN_REQUIRED')
            flash(message, type_)
            return redirect(url_for('login'))

        # Initialize form for profile editing
        form = ProfileForm(obj=user) if current_user.is_authenticated and current_user.id == user.id else None

        # Calculate KPI metrics without QR code
        climbs = list(user.climbs)
        total_ascents = len(climbs)
        sent_grades = [climb.route.grade_info.grade for climb in climbs if climb.status]
        avg_grade = calculate_avg_grade(sent_grades) if sent_grades else '--'

        # Calculate total points using the standardized formula
        total_points = 0
        for climb in climbs:
            if climb.route and climb.route.grade_info:
                grade = climb.route.grade
                base_points = getGradePoints(grade)
                star_multiplier = max(0.1, climb.rating / 3)
                status_multiplier = 1 if climb.status else 0.5
                tries_multiplier = max(0.1, 1 / (climb.tries ** 0.5))
                climb_points = round(base_points * star_multiplier * status_multiplier * tries_multiplier)
                total_points += climb_points

        is_own_profile = current_user.is_authenticated and current_user.id == user.id

        logger.debug("Successfully rendered profile page")
        return render_template('solo-profile.html',
                                form=form,
                                profile_user=user,
                                total_ascents=total_ascents,
                                avg_grade=avg_grade,
                                total_points=total_points,
                                qr_code=None,
                                is_own_profile=is_own_profile)
    except Exception as e:
        logger.error("Error in profile page: %s", str(e))
        message, type_ = get_user_message('GENERIC_ERROR')
        flash(message, type_)
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
                    message, type_ = get_user_message('USERNAME_INVALID')
                    flash(message, type_)
                    return redirect(url_for('profile'))
                if User.query.filter_by(username=username).first():
                    message, type_ = get_user_message('USERNAME_TAKEN')
                    flash(message, type_)
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
                        message, type_ = get_user_message('GYM_NOT_FOUND')
                        flash(message, type_)
                        return redirect(url_for('profile'))

            db.session.commit()
            message, type_ = get_user_message('PROFILE_UPDATE_SUCCESS')
            flash(message, type_)
            return redirect(url_for('profile'))

        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating profile: {str(e)}")
            message, type_ = get_user_message('PROFILE_UPDATE_ERROR')
            flash(message, type_)
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
            message, type_ = get_user_message('AVATAR_UPDATE_SUCCESS')
            flash(message, type_)
        return redirect(url_for('profile'))
    except Exception as e:
        logger.error(f"Error updating avatar: {str(e)}")
        message, type_ = get_user_message('AVATAR_UPDATE_ERROR')
        flash(message, type_)
        return redirect(url_for('profile'))

    try:
        if 'photo' not in request.files:
            message, type_ = get_user_message('NO_FILE_UPLOADED')
            flash(message, type_)
            return redirect(url_for('profile'))

        file = request.files['photo']
        if file.filename == '':
            message, type_ = get_user_message('NO_FILE_SELECTED')
            flash(message, type_)
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

            message, type_ = get_user_message('PROFILE_PHOTO_UPDATE_SUCCESS')
            flash(message, type_)
        else:
            message, type_ = get_user_message('INVALID_FILE_TYPE')
            flash(message, type_)
    except Exception as e:
        logger.error(f"Error processing photo: {str(e)}")
        message, type_ = get_user_message('PROFILE_PHOTO_ERROR')
        flash(message, type_)
        db.session.rollback()

    return redirect(url_for('profile'))

@app.route('/standings')
@login_required
def standings():
    """Handle the standings page with user rankings"""
    try:
        users = User.query.all()
        leaderboard = []

        for user in users:
            sends = [c for c in user.climbs if c.status is True]
            total_sends = len(sends)

            # Calculate sent grades
            sent_grades = [climb.route.grade_info.grade for climb in sends if climb.route and climb.route.grade_info]
            avg_grade = calculate_avg_grade(sent_grades) if sent_grades else '--'

            # Calculate total points
            total_points = 0
            for climb in user.climbs:
                if climb.route and climb.route.grade_info:
                    base_points = getGradePoints(climb.route.grade_info.grade)
                    star_multiplier = max(0.1, climb.rating / 3)
                    status_multiplier = 1 if climb.status else 0.5
                    tries_multiplier = max(0.1, 1 / (climb.tries ** 0.5))
                    total_points += round(base_points * star_multiplier * status_multiplier * tries_multiplier)

            leaderboard.append({
                'username': user.username,
                'total_sends': total_sends,
                'avg_grade': avg_grade,
                'total_points': total_points
            })

        # Sort by total points
        leaderboard = sorted(leaderboard, key=lambda x: x['total_points'], reverse=True)
        return render_template('standings.html', leaderboard=leaderboard)

    except Exception as e:
        logger.error(f"Error in standings page: {str(e)}")
        message, type_ = get_user_message('GENERIC_ERROR')
        flash(message, type_)
        return render_template('standings.html', leaderboard=[])

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

def getGradePoints(grade):
    """Helper function to calculate points for a grade"""
    if not grade:
        return 0
    try:
        parts = grade.split('.')
        if len(parts) != 2:
            return 0

        # Extract numeric grade and modifier
        base = parts[1].rstrip('abcd')
        modifier = parts[1][-1] if parts[1][-1] in 'abcd' else ''

        if not base.isdigit():
            return 0

        base_points = {
            '5': 50, '6': 60, '7': 70, '8': 80, '9': 100, '10': 150,
            '11': 200, '12': 300, '13': 400, '14': 500, '15': 600
        }

        modifier_multiplier = {
            'a': 1.0, 'b': 1.1, 'c': 1.2, 'd': 1.3, '': 1.0
        }

        return round(base_points.get(base, 0) * modifier_multiplier.get(modifier, 1.0))
    except Exception:
        return 0

def calculate_stats(climbs):
    """Calculate all stats for a list of climbs"""
    try:
        if not climbs:
            return {
                'total_sends': 0,
                'total_points': 0,
                'success_rate': 0,
                'climbs_per_session': 0,
                'avg_points_per_climb': 0,
                'avg_attempts_per_climb': 0,
                'success_rate_per_session': 0,
                'avg_sent_grade': '--'
            }

        # Basic stats
        total_sends = sum(1 for c in climbs if c.status)
        total_points = 0
        for climb in climbs:
            if climb.route and climb.route.grade_info:
                grade = climb.route.grade
                base_points = getGradePoints(grade)
                star_multiplier = max(0.1, climb.rating / 3)
                status_multiplier = 1 if climb.status else 0.5
                tries_multiplier = max(0.1, 1 / (climb.tries ** 0.5))
                total_points += round(base_points * star_multiplier * status_multiplier * tries_multiplier)

        success_rate = round((total_sends / len(climbs) * 100) if climbs else 0)

        # Session stats
        sessions = {}
        for climb in climbs:
            date = climb.created_at.date()
            sessions[date] = sessions.get(date, 0) + 1

        climbs_per_session = round(sum(sessions.values()) / len(sessions)) if sessions else 0
        avg_points_per_climb = round(total_points / len(climbs)) if climbs else 0
        avg_attempts_per_climb = round(sum(climb.tries for climb in climbs) / len(climbs), 1) if climbs else 0

        # Success rate per session
        session_rates = []
        for date in sessions:
            session_climbs = [c for c in climbs if c.created_at.date() == date]
            session_sends = sum(1 for c in session_climbs if c.status)
            if session_climbs:
                session_rate = (session_sends / len(session_climbs)) * 100
                session_rates.append(session_rate)
        success_rate_per_session = round(sum(session_rates) / len(session_rates)) if session_rates else 0

        # Calculate grades
        sent_grades = [climb.route.grade_info.grade for climb in climbs if climb.status and climb.route and climb.route.grade_info]
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
        # Get climbs and ensure they exist
        climbs = list(current_user.climbs)
        if not climbs:
            return render_template('stats.html',
                                 total_ascents=0,
                                 total_sends=0,
                                 total_points=0,
                                 success_rate=0,
                                 climbs_per_session=0,
                                 avg_points_per_climb=0,
                                 avg_attempts_per_climb=0,
                                 success_rate_per_session=0,
                                 avg_sent_grade='--')

        # Calculate stats with error handling
        stats_data = calculate_stats(climbs)
        if not stats_data:
            stats_data = {
                'total_sends': 0,
                'total_points': 0,
                'success_rate': 0,
                'climbs_per_session': 0,
                'avg_points_per_climb': 0,
                'avg_attempts_per_climb': 0,
                'success_rate_per_session': 0,
                'avg_sent_grade': '--'
            }

        return render_template('stats.html',
                             total_ascents=len(climbs),
                             **stats_data)
    except Exception as e:
        logger.error(f"Error in stats page: {str(e)}", exc_info=True)
        return render_template('stats.html',
                             total_ascents=0,
                             total_sends=0,
                             total_points=0,
                             success_rate=0,
                             climbs_per_session=0,
                             avg_points_per_climb=0,
                             avg_attempts_per_climb=0,
                             success_rate_per_session=0,
                             avg_sent_grade='--')

@app.route('/squads')
@login_required
def squads():
        return render_template('404.html')

@app.route('/solo-pro')
def solo_pro():
    """Handle the solo pro page directly"""
    try:
        return render_template('pricing.html')
    except Exception as e:
        logger.error(f"Error rendering pricing page: {str(e)}")
        return render_template('404.html'), 404

@app.route('/pricing')
def pricing():
    """Handle the pricing page"""
    try:
        return render_template('pricing.html')
    except Exception as e:
        logger.error(f"Error rendering pricing page: {str(e)}")
        return render_template('404.html'), 404

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
                    message, type_ = get_user_message('INVALID_FILE_TYPE')
                    flash(message, type_)
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
                    message, type_ = get_user_message('FILE_UPLOAD_ERROR')
                    flash(message, type_)
                    return redirect(url_for('feedback'))

        db.session.add(feedback)
        db.session.commit()

        # Clear pending registration after successful feedback submission
        if 'pending_registration' in session:
            session.pop('pending_registration')

        message, type_ = get_user_message('FEEDBACK_SUBMIT_SUCCESS')
        flash(message, type_)
        return redirect(url_for('feedback'))
    except Exception as e:
        logger.error(f"Error submitting feedback: {str(e)}")
        db.session.rollback()
        message, type_ = get_user_message('DATABASE_ERROR')
        flash(message, type_)
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
            message, type_ = get_user_message('VOTE_REMOVED')
        else:
            # Add new vote
            vote = FeedbackVote(user_id=current_user.id, feedback_id=feedback_id)
            db.session.add(vote)
            message, type_ = get_user_message('VOTE_ADDED')

        db.session.commit()
        flash(message, type_)
    except Exception as e:
        logger.error(f"Error processing vote: {str(e)}")
        db.session.rollback()
        message, type_ = get_user_message('GENERIC_ERROR')
        flash(message, type_)

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
    log_error(logger, ErrorCodes.API_INVALID_RESPONSE[0])
    message, type_ = get_user_message('PAGE_NOT_FOUND')
    return render_template('404.html', error=message), 404

@app.errorhandler(Exception)
def handle_error(error):
    """Global error handler with improved logging"""
    db.session.rollback()

    if isinstance(error, SQLAlchemyError):
        # Log the technical error
        log_error(logger, ErrorCodes.DB_QUERY_ERROR[0], exc_info=True)
        # Get user-friendly message
        message, type_ = get_user_message('DATABASE_ERROR')
    else:
        # Log the technical error
        log_error(logger, ErrorCodes.SYSTEM_RESOURCE_EXHAUSTED[0], exc_info=True)
        # Get user-friendly message
        message, type_ = get_user_message('SYSTEM_ERROR')

    status_code = 500 if type_ == MessageType.ERROR else 400
    return render_template('404.html', error=message), status_code

#Ensure static/images directory exists
os.makedirs(os.path.join(app.static_folder, 'images'), exist_ok=True)

# Copy solo-clear.png to static/images if needed
import shutil
source_logo = os.path.join('attached_assets', 'solo-clear.png')
dest_logo = os.path.join(app.static_folder, 'images', 'solo-clear.png')
if os.path.exists(source_logo) and not os.path.exists(dest_logo):
    try:
        shutil.copy2(source_logo, dest_logo)
    except Exception as e:
        logger.error(f"Failed to copy logo: {str(e)}")

if __name__ == "__main__":
    logger.info("Starting server on 0.0.0.0:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)

def getGradePoints(grade):
    if not grade:
        return 0
    match = grade.split('.')
    if len(match) != 2:
        return 0

    mainGrade = match[1].rstrip('abcd')
    subGrade = match[1][len(mainGrade):]

    basePoints = {
        '5': 50, '6': 60, '7': 70, '8': 80, '9': 100, '10': 150,
        '11': 200, '12': 300, '13': 400, '14': 500, '15': 600
    }

    subGradeMultiplier = {
        'a': 1, 'b': 1.1, 'c': 1.2, 'd': 1.3
    }

    return round((basePoints.get(mainGrade, 0)) * (subGradeMultiplier.get(subGrade, 1)))