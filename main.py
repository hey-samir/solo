import os
from flask import render_template, request, redirect, url_for, flash, send_from_directory, current_app
from flask_login import login_required, current_user, login_user, logout_user
from werkzeug.utils import secure_filename
from app import app, db
from models import Climb, User
from utils.logo_generator import generate_logo, get_logo_path
from flask_wtf.csrf import CSRFProtect
from forms import LoginForm, RegistrationForm, ProfileForm
from migrations import migrate  # Import the migration setup

# Initialize CSRF protection
csrf = CSRFProtect(app)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
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
    # Generate logo on first request if it doesn't exist
    static_image_path = os.path.join(app.static_folder, 'images', 'logo.png')
    if not os.path.exists(static_image_path):
        generate_logo()
    return render_template('index.html')

@app.route('/add_climb', methods=['POST'])
@login_required
def add_climb():
    # Combine difficulty components
    difficulty_grade = request.form.get('difficulty_grade')
    difficulty_letter = request.form.get('difficulty_letter', '')
    difficulty = f"5.{difficulty_grade}{difficulty_letter}"


@app.route('/sessions')
@login_required
def sessions():
    """Temporary sessions page."""
    return render_template('404.html'), 404

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
        difficulty=difficulty,
        rating=rating,
        status=request.form.get('status'),
        notes=request.form.get('notes'),
        user_id=current_user.id  # Link climb to current user
    )
    db.session.add(climb)
    db.session.commit()
    flash('Ascent recorded successfully!', 'success')
    return redirect(url_for('sends'))

@app.route('/solo')
@login_required
def self():
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

@app.route('/generate-logo')
def generate_app_logo():
    """Generate and serve the Solo app logo."""
    logo_path = generate_logo()
    directory = os.path.join(app.static_folder, 'images')
    os.makedirs(directory, exist_ok=True)
    return send_from_directory(directory, os.path.basename(logo_path))

# Ensure the logo is generated when the application starts
with app.app_context():
    static_image_path = os.path.join(app.static_folder, 'images', 'logo.png')
    if not os.path.exists(static_image_path):
        generate_logo()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)