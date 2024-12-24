from flask import render_template, request, redirect, url_for, flash
from app import app, db
from models import Climb
import re

@app.route('/')
def index():
    climbs = Climb.query.order_by(Climb.created_at.desc()).all()
    return render_template('index.html', climbs=climbs)

@app.route('/add_climb', methods=['POST'])
def add_climb():
    # Validate difficulty format
    difficulty = request.form.get('difficulty')
    if not re.match(r'^5\.(1[0-5]|[1-9])[abcd]?$', difficulty):
        flash('Invalid difficulty format. Use format 5.X or 5.XXa/b/c/d', 'error')
        return redirect(url_for('index'))

    climb = Climb(
        color=request.form.get('color'),
        difficulty=difficulty,
        status=request.form.get('status'),
        notes=request.form.get('notes')
    )
    db.session.add(climb)
    db.session.commit()
    flash('Climb added successfully!', 'success')
    return redirect(url_for('index'))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
