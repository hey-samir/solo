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
        return redirect(url_for('self'))
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
    # Combine caliber components
    caliber_grade = request.form.get('difficulty_grade')
    caliber_letter = request.form.get('difficulty_letter', '')
    caliber = f"5.{caliber_grade}{caliber_letter}"


    # Validate rating
    try:
        rating = int(request.form.get('rating'))
        if rating not in [1, 2, 3]:
            raise ValueError("Invalid rating value")
    except (TypeError, ValueError):
        flash('Please select a valid rating', 'error')
        return redirect(url_for('sends'))

    climb = Climb(
        color=request.form.get('color'),
        caliber=caliber,
        rating=rating,
        status=request.form.get('status'),
        notes=request.form.get('notes'),
        user_id=current_user.id  # Link climb to current user
    )
    db.session.add(climb)
    db.session.commit()
    flash('Ascent recorded successfully!', 'success')
    return redirect(url_for('sends'))

@app.route('/sessions')
@login_required
def sessions():
    """Display user's climbing sessions grouped by date."""
    try:
        app.logger.info(f"Fetching sessions for user {current_user.id}")

        # Get all climbs for the current user, ordered by date
        climbs = Climb.query.filter_by(user_id=current_user.id)\
            .order_by(Climb.created_at.desc())\
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
    return render_template('self.html', form=form)

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
                return redirect(url_for('self'))
            if User.query.filter_by(username=username).first():
                flash('Username already taken', 'error')
                return redirect(url_for('self'))
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

    return redirect(url_for('self'))

@app.route('/upload_photo', methods=['POST'])
@login_required
def upload_photo():
    """Handle profile photo upload."""
    try:
        if 'photo' not in request.files:
            flash('No file uploaded', 'error')
            return redirect(url_for('self'))

        file = request.files['photo']
        if file.filename == '':
            flash('No file selected', 'error')
            return redirect(url_for('self'))

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

    return redirect(url_for('self'))

@app.route('/stats')
@login_required
def stats():
    """Display climbing statistics and visualizations."""
    # Calculate basic statistics
    total_sends = Climb.query.filter_by(user_id=current_user.id, status='Sent').count()
    total_attempts = Climb.query.filter_by(user_id=current_user.id).count()
    success_rate = round((total_sends / total_attempts * 100) if total_attempts > 0 else 0)

    # Get highest grade
    highest_grade_climb = Climb.query.filter_by(user_id=current_user.id).order_by(
        Climb.caliber.desc()
    ).first()
    highest_grade = highest_grade_climb.caliber if highest_grade_climb else '--'

    # Calculate average grade
    climbs = Climb.query.filter_by(user_id=current_user.id).all()
    if climbs:
        grades = []
        for climb in climbs:
            grade_parts = climb.caliber.split('.')
            if len(grade_parts) == 2:
                grade_num = grade_parts[1]
                if grade_num.isdigit():
                    grades.append(int(grade_num))
        avg_grade = f"5.{round(sum(grades) / len(grades))}" if grades else '--'
    else:
        avg_grade = '--'

    return render_template('stats.html',
                         total_sends=total_sends,
                         highest_grade=highest_grade,
                         avg_grade=avg_grade,
                         success_rate=success_rate)

@app.route('/api/stats')
@login_required
def get_stats():
    """API endpoint for chart data."""
    time_range = request.args.get('timeRange', 'week')

    # Calculate date range
    end_date = datetime.utcnow()
    if time_range == 'week':
        start_date = end_date - timedelta(days=7)
    elif time_range == 'month':
        start_date = end_date - timedelta(days=30)
    elif time_range == 'year':
        start_date = end_date - timedelta(days=365)
    else:  # all time
        start_date = datetime.min

    # Get climbs within date range
    climbs = Climb.query.filter(
        Climb.user_id == current_user.id,
        Climb.created_at >= start_date,
        Climb.created_at <= end_date
    ).order_by(Climb.created_at).all()

    # Prepare progression data
    progression_data = {
        'labels': [],
        'data': []
    }
    current_max = 0
    for climb in climbs:
        date_str = climb.created_at.strftime('%Y-%m-%d')
        grade_num = int(climb.caliber.split('.')[1]) if '.' in climb.caliber else 0
        if grade_num > current_max:
            current_max = grade_num
            progression_data['labels'].append(date_str)
            progression_data['data'].append(grade_num)

    # Prepare frequency data
    frequency_data = {
        'labels': [],
        'data': []
    }
    session_dates = db.session.query(
        func.date(Climb.created_at),
        func.count(Climb.id)
    ).filter(
        Climb.user_id == current_user.id,
        Climb.created_at >= start_date
    ).group_by(func.date(Climb.created_at)).all()

    for date, count in session_dates:
        frequency_data['labels'].append(date.strftime('%Y-%m-%d'))
        frequency_data['data'].append(count)

    # Prepare success rate data
    success_rate_data = {
        'labels': [],
        'data': []
    }
    grades = sorted(set(climb.caliber for climb in climbs))
    for grade in grades:
        attempts = sum(1 for climb in climbs if climb.caliber == grade)
        sends = sum(1 for climb in climbs if climb.caliber == grade and climb.status == 'Sent')
        success_rate = (sends / attempts * 100) if attempts > 0 else 0
        success_rate_data['labels'].append(grade)
        success_rate_data['data'].append(round(success_rate))

    # Prepare distribution data
    distribution_data = {
        'labels': grades,
        'data': [sum(1 for climb in climbs if climb.caliber == grade) for grade in grades]
    }

    return jsonify({
        'progression': progression_data,
        'frequency': frequency_data,
        'successRate': success_rate_data,
        'distribution': distribution_data
    })

@app.route('/squads')
@login_required
def squads():
    """Placeholder for squads feature"""
    return render_template('404.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)