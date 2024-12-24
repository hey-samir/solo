from flask import render_template, request, redirect, url_for, flash
from app import app, db
from models import Climb

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_climb', methods=['POST'])
def add_climb():
    # Combine difficulty components
    difficulty_grade = request.form.get('difficulty_grade')
    difficulty_letter = request.form.get('difficulty_letter', '')
    difficulty = f"5.{difficulty_grade}{difficulty_letter}"

    climb = Climb(
        color=request.form.get('color'),
        difficulty=difficulty,
        rating=request.form.get('rating', type=int),
        status=request.form.get('status'),
        notes=request.form.get('notes')
    )
    db.session.add(climb)
    db.session.commit()
    flash('Ascent recorded successfully!', 'success')
    return redirect(url_for('index'))

@app.route('/profile')
def profile():
    return render_template('index.html')  # Placeholder

@app.route('/trends')
def trends():
    return render_template('index.html')  # Placeholder

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)