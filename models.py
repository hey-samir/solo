from app import db
from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(UserMixin, db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(10), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(100))
    gym = db.Column(db.String(100))
    member_since = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    profile_photo = db.Column(db.String(255), default='white-solo-av.png')

    climbs = db.relationship('Climb', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    feedback = db.relationship('Feedback', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    feedback_votes = db.relationship('FeedbackVote', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

class Climb(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    color = db.Column(db.String(50), nullable=False)
    grade = db.Column(db.String(10), nullable=True)  # Stores the climbing grade (e.g., "5.10a")
    rating = db.Column(db.Integer, nullable=False)  # User's 1-5 star rating of the climb
    status = db.Column(db.Boolean, nullable=False, default=False)
    tries = db.Column(db.Integer, nullable=False, default=1)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f'<Climb {self.color} {self.grade}>'

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    screenshot_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    votes = db.relationship('FeedbackVote', backref='feedback', lazy='dynamic', cascade='all, delete-orphan')

    @property
    def vote_count(self):
        return self.votes.count()

    def __repr__(self):
        return f'<Feedback {self.title}>'

class FeedbackVote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    feedback_id = db.Column(db.Integer, db.ForeignKey('feedback.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Ensure one vote per user per feedback item
    __table_args__ = (db.UniqueConstraint('user_id', 'feedback_id', name='unique_user_feedback_vote'),)

    def __repr__(self):
        return f'<FeedbackVote user_id={self.user_id} feedback_id={self.feedback_id}>'