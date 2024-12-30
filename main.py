import os
from flask import render_template, request, redirect, url_for, flash, send_from_directory, current_app
from flask_login import login_required, current_user, login_user, logout_user
from werkzeug.utils import secure_filename
from app import app, db
from models import Climb, User
from flask_wtf.csrf import CSRFProtect
from forms import LoginForm, RegistrationForm, ProfileForm
from migrations import migrate
import shutil
from datetime import datetime, timedelta
from sqlalchemy import func
from flask import jsonify

# Initialize CSRF protection
csrf = CSRFProtect(app)

# Create static/images directory if it doesn't exist
os.makedirs(os.path.join(app.static_folder, 'images'), exist_ok=True)

# Copy solo-clear.png to static/images
source_logo = os.path.join('attached_assets', 'solo-clear.png')
dest_logo = os.path.join(app.static_folder, 'images', 'solo-clear.png')
if os.path.exists(source_logo) and not os.path.exists(dest_logo):
    shutil.copy2(source_logo, dest_logo)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
@login_required
def index():
    """Redirect root to /sends"""
    return redirect(url_for('sends'))

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
        flash('Invalid username or password', 'error')
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
        gym = form.gym.data

        if not username.isalnum():
            flash('Username must contain only letters and numbers', 'error')
            return render_template('register.html', form=form)

        if User.query.filter_by(username=username).first():
            flash('Username already taken', 'error')
            return render_template('register.html', form=form)

        if User.query.filter_by(email=email).first():
            flash('Email already registered', 'error')
            return render_template('register.html', form=form)

        user = User(username=username, email=email, name=name, gym=gym)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()

        # Log the user in after registration
        login_user(user)
        return redirect(url_for('solo'))
    return render_template('register.html', form=form)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/sends')
@login_required
def sends():
    return render_template('index.html')

@app.route('/add_climb', methods=['POST'])
@login_required
def add_climb():
    try:
        app.logger.info("Starting add_climb with form data: %s", request.form)

        # Make caliber optional
        caliber = None
        caliber_grade = request.form.get('caliber_grade')
        if caliber_grade:
            caliber_letter = request.form.get('caliber_letter', '')
            caliber = f"5.{caliber_grade}{caliber_letter}"

        # Convert status to boolean (True for 'Sent', False for 'Tried')
        status = request.form.get('status') == 'on'  # Will be True if checked, False if unchecked
        app.logger.info("Status value: %s", status)

        # Validate rating (now 1-5)
        try:
            rating = int(request.form.get('rating', 1))
            if rating not in range(1, 6):
                rating = 1
        except (TypeError, ValueError):
            rating = 1

        # Validate attempts
        try:
            attempts = int(request.form.get('attempts', 1))
            if attempts < 1:
                attempts = 1
        except (TypeError, ValueError):
            attempts = 1

        climb = Climb(
            color=request.form.get('color'),
            caliber=caliber,
            rating=rating,
            status=status,
            attempts=attempts,
            notes=request.form.get('notes'),
            user_id=current_user.id
        )

        db.session.add(climb)
        db.session.commit()
        flash('Ascent recorded successfully!', 'success')
        return redirect(url_for('sends'))

    except Exception as e:
        app.logger.error("Error in add_climb: %s", str(e))
        db.session.rollback()
        flash('Error recording ascent. Please try again.', 'error')
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
        difficulty_data[climb.caliber] = difficulty_data.get(climb.caliber, 0) + 1

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
            date_stats[date] = {'sends': 0, 'attempts': 0}
        if climb.status:
            date_stats[date]['sends'] += 1
        date_stats[date]['attempts'] += 1
    
    # Convert to success rates
    sorted_dates = sorted(date_stats.keys())
    success_rates = []
    for date in sorted_dates:
        stats = date_stats[date]
        rate = (stats['sends'] / stats['attempts']) * 100 if stats['attempts'] > 0 else 0
        success_rates.append(rate)
    
    return jsonify({
        'ascentsByDifficulty': {
            'labels': list(difficulty_data.keys()),
            'data': list(difficulty_data.values())
        },
        'sendsByDate': {
            'labels': ['Last 7 Days', 'Last 30 Days', 'All Time'],
            'sends': [len(sends), len(sends), len(sends)],
            'attempts': [len(attempts), len(attempts), len(attempts)]
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

    return redirect(url_for('sends'))

@app.route('/sessions')
@login_required
def sessions():
    """Display user's climbing sessions grouped by date."""
    try:
        app.logger.info(f"Fetching sessions for user {current_user.id}")

        # Get all climbs for the current user, ordered by date and color
        climbs = Climb.query.filter_by(user_id=current_user.id)\
            .order_by(Climb.created_at.desc(), Climb.color.asc())\
            .all()
        app.logger.info(f"Found {len(climbs)} climbs for user")

        # Group climbs by date
        from itertools import groupby
        from datetime import datetime

        def get_date(climb):
            return climb.created_at.date()

        # Sort climbs by date and group them
        climbs_by_date = {}
        for date, group in groupby(sorted(climbs, key=get_date, reverse=True), key=get_date):
            climbs_by_date[date] = list(group)

        app.logger.info(f"Grouped climbs into {len(climbs_by_date)} sessions")
        return render_template('sessions.html', climbs_by_date=climbs_by_date)

    except Exception as e:
        app.logger.error(f"Error in sessions route: {str(e)}")
        db.session.rollback()  # Rollback any failed transaction
        return render_template('sessions.html', climbs_by_date={})

@app.route('/solo')
@login_required
def solo():
    """User profile page."""
    form = ProfileForm(obj=current_user)  # Pre-fill form with current user data
    return render_template('solo-profile.html', form=form)

@app.route('/update_profile', methods=['POST'])
@login_required
def update_profile():
    """Update user profile information."""
    form = ProfileForm()
    if form.validate_on_submit():
        username = form.username.data
        name = form.name.data
        gym = form.gym.data

        if username and username != current_user.username:
            if not username.isalnum():
                flash('Username must contain only letters and numbers', 'error')
                return redirect(url_for('solo'))
            if User.query.filter_by(username=username).first():
                flash('Username already taken', 'error')
                return redirect(url_for('solo'))
            current_user.username = username

        if name:
            current_user.name = name
        if gym is not None:  # Allow empty string to clear gym
            current_user.gym = gym

        try:
            db.session.commit()
            flash('Profile updated successfully!', 'success')
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Error updating profile: {str(e)}")
            flash('Error updating profile. Please try again.', 'error')
    else:
        for field, errors in form.errors.items():
            for error in errors:
                flash(f'{field}: {error}', 'error')

    return redirect(url_for('solo'))

@app.route('/update_avatar', methods=['POST'])
@login_required
def update_avatar():
    try:
        avatar = request.form.get('avatar')
        if avatar:
            current_user.profile_photo = avatar
            db.session.commit()
            flash('Solo photo updated successfully!', 'success')
        return redirect(url_for('solo'))
    except Exception as e:
        app.logger.error(f"Error updating avatar: {str(e)}")
        flash('Error updating avatar. Please try again.', 'error')
        return redirect(url_for('solo'))
    """Handle profile photo upload."""
    try:
        if 'photo' not in request.files:
            flash('No file uploaded', 'error')
            return redirect(url_for('solo'))

        file = request.files['photo']
        if file.filename == '':
            flash('No file selected', 'error')
            return redirect(url_for('solo'))

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
        app.logger.error(f"Error processing photo: {str(e)}")
        flash('Error processing photo. Please try again.', 'error')
        db.session.rollback()

    return redirect(url_for('solo'))

@app.route('/standings')
@login_required
def standings():
    # Get all users and their climbs
    users = User.query.all()
    leaderboard = []

    for user in users:
        sends = [c for c in user.climbs if c.status is True]
        total_sends = len(sends)

        # Calculate average grade
        sent_grades = []
        for climb in sends:
            grade_parts = climb.caliber.split('.')
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
    """Stats page showing user metrics and trends"""
    # Get user's climbs
    climbs = current_user.climbs
    
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
    
    # Calculate metrics
    total_sends = len([c for c in climbs if c.status])
    
    def grade_to_points(grade):
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
        return grade_points.get(grade, 0)

    # Calculate highest grade (most difficult)
    highest_grade = '--'
    max_points = 0
    for climb in climbs:
        if climb.caliber:
            points = grade_points.get(climb.caliber, 0) * (climb.rating / 5)
            points += (10 if climb.status else 5) * climb.rating
            if points > max_points:
                max_points = points
                highest_grade = climb.caliber

    # Calculate average grade using simple ranking
    sent_grades = [climb.caliber for climb in climbs if climb.status and climb.caliber]
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
    
    # Calculate total points
    total_points = 0
    for climb in climbs:
        if climb.caliber:  # Include all climbs with a grade
            base_points = grade_points.get(climb.caliber, 0)
            points = base_points * (climb.rating / 5)  # Scale by rating
            if not climb.status:  # If not sent, halve the points
                points = points / 2
            total_points += points
    
    # Calculate climbs per session
    sessions = {}
    for climb in climbs:
        date = climb.created_at.date()
        sessions[date] = sessions.get(date, 0) + 1
    climbs_per_session = round(sum(sessions.values()) / len(sessions)) if sessions else 0
    
    return render_template('stats.html',
                         total_sends=total_sends,
                         highest_grade=highest_grade,
                         avg_grade=avg_grade,
                         success_rate=success_rate,
                         total_points=total_points,
                         climbs_per_session=climbs_per_session)

@app.route('/squads')
@login_required
def squads():
    """Placeholder for squads feature"""
    return render_template('404.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)