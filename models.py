from app import db
from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.sql import func

class Gym(db.Model):
    __tablename__ = 'gym'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    location = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    users = db.relationship('User', backref='home_gym', lazy='dynamic')
    routes = db.relationship('Route', backref='gym', lazy='dynamic', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Gym {self.name}>'

class Route(db.Model):
    __tablename__ = 'route'

    id = db.Column(db.Integer, primary_key=True)
    route_id = db.Column(db.String(50), unique=True, nullable=False)  # Unique identifier for the route
    color = db.Column(db.String(50), nullable=False)
    grade = db.Column(db.String(10), nullable=False)
    routesetter = db.Column(db.String(100))
    date_set = db.Column(db.DateTime, nullable=False)
    gym_id = db.Column(db.Integer, db.ForeignKey('gym.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Aggregated rating
    avg_rating = db.Column(db.Float, default=0)
    rating_count = db.Column(db.Integer, default=0)

    # Relationships
    climbs = db.relationship('Climb', backref='route', lazy='dynamic')

    def __repr__(self):
        return f'<Route {self.route_id} - {self.color} {self.grade}>'

    def update_rating(self, new_rating):
        """Update the average rating when a new rating is added"""
        self.avg_rating = ((self.avg_rating * self.rating_count) + new_rating) / (self.rating_count + 1)
        self.rating_count += 1

class User(UserMixin, db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(10), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(100))
    gym_id = db.Column(db.Integer, db.ForeignKey('gym.id'))  # Changed from string to FK
    member_since = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    profile_photo = db.Column(db.String(255), default='white-solo-av.png')

    # Relationships
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
    route_id = db.Column(db.Integer, db.ForeignKey('route.id'), nullable=False)  # Reference to specific route
    rating = db.Column(db.Integer, nullable=False)  # User's 1-5 star rating of the climb
    status = db.Column(db.Boolean, nullable=False, default=False)
    tries = db.Column(db.Integer, nullable=False, default=1)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f'<Climb {self.route.color} {self.route.grade}>'

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