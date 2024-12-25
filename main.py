from flask import render_template, request, redirect, url_for, flash, send_from_directory
from app import app, db
from models import Climb
from utils.logo_generator import generate_logo, get_logo_path
import os

@app.route('/')
def index():
    """Redirect root to /sends"""
    return redirect(url_for('sends'))

@app.route('/sends')
def sends():
    # Generate logo on first request if it doesn't exist
    static_image_path = os.path.join(app.static_folder, 'images', 'logo.png')
    if not os.path.exists(static_image_path):
        generate_logo()
    return render_template('index.html', get_logo_path=get_logo_path)

@app.route('/add_climb', methods=['POST'])
def add_climb():
    # Combine difficulty components
    difficulty_grade = request.form.get('difficulty_grade')
    difficulty_letter = request.form.get('difficulty_letter', '')
    difficulty = f"5.{difficulty_grade}{difficulty_letter}"

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
        notes=request.form.get('notes')
    )
    db.session.add(climb)
    db.session.commit()
    flash('Ascent recorded successfully!', 'success')
    return redirect(url_for('sends'))

@app.route('/self')
def self():
    return render_template('index.html', get_logo_path=get_logo_path)

@app.route('/stats')
def stats():
    return render_template('index.html', get_logo_path=get_logo_path)

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