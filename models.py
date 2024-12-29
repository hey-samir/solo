from app import db
from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(10), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    name = db.Column(db.String(100))
    gym = db.Column(db.String(100))
    member_since = db.Column(db.DateTime, default=datetime.utcnow)
    profile_photo = db.Column(db.String(255), default='default_profile.png')

    # Add relationship to climbs
    climbs = db.relationship('Climb', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

class Climb(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    color = db.Column(db.String(50), nullable=False)
    caliber = db.Column(db.String(10), nullable=True)
    rating = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), nullable=False)
    attempts = db.Column(db.Integer, default=1, nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # Add user relationship
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f'<Climb {self.color} {self.caliber}>'