from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.sql import func
from app import db

class RouteGrade(db.Model):
    __tablename__ = 'route_grade'

    id = db.Column(db.Integer, primary_key=True)
    grade = db.Column(db.String(10), nullable=False)
    climbing_type = db.Column(db.String(20), nullable=False)  # solo, belay, boulder
    points = db.Column(db.Integer, nullable=False)  # Points for sending
    difficulty_rank = db.Column(db.Integer, nullable=False)  # For ordering
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    routes = db.relationship('Route', backref='grade_info', lazy='dynamic')

    @property
    def attempt_points(self):
        """Points awarded for attempting but not sending"""
        return self.points // 2

    def __repr__(self):
        return f'<RouteGrade {self.grade} ({self.climbing_type})>'

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
    route_id = db.Column(db.String(50), nullable=False)  # Unique identifier for the route
    color = db.Column(db.String(50), nullable=False)
    grade = db.Column(db.String(10), nullable=False)
    grade_id = db.Column(db.Integer, db.ForeignKey('route_grade.id'), nullable=False)
    routesetter = db.Column(db.String(100))
    date_set = db.Column(db.DateTime, nullable=False)
    gym_id = db.Column(db.Integer, db.ForeignKey('gym.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # New fields for better route identification
    wall_sector = db.Column(db.String(50), nullable=False, default='Main Wall')  # Location within gym
    route_type = db.Column(db.String(20), nullable=False, default='top_rope')  # top_rope, lead, auto_belay
    height_meters = db.Column(db.Float)  # Height of the route
    active = db.Column(db.Boolean, default=True)  # Whether the route is currently set
    anchor_number = db.Column(db.Integer)  # Physical anchor/station number
    hold_style = db.Column(db.String(50))  # Type of holds used (crimps, jugs, etc)
    tags = db.Column(db.String(200))  # Comma-separated tags for route characteristics

    # Aggregated rating
    avg_rating = db.Column(db.Float, default=0)
    rating_count = db.Column(db.Integer, default=0)

    # Relationships
    climbs = db.relationship('Climb', backref='route', lazy='dynamic')

    # Add unique constraint for route_id within each gym
    __table_args__ = (
        db.UniqueConstraint('route_id', 'gym_id', name='unique_route_per_gym'),
    )

    def __repr__(self):
        return f'<Route {self.route_id} - {self.color} {self.grade} ({self.wall_sector})>'

    def update_rating(self, new_rating):
        """Update the average rating when a new rating is added"""
        self.avg_rating = ((self.avg_rating * self.rating_count) + new_rating) / (self.rating_count + 1)
        self.rating_count += 1

class User(UserMixin, db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(100))
    gym_id = db.Column(db.Integer, db.ForeignKey('gym.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
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
    __tablename__ = 'climb'

    id = db.Column(db.Integer, primary_key=True)
    route_id = db.Column(db.Integer, db.ForeignKey('route.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    status = db.Column(db.Boolean, nullable=False, default=False)
    tries = db.Column(db.Integer, nullable=False, default=1)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    points = db.Column(db.Integer, default=0)  # Add points field

    def __repr__(self):
        return f'<Climb {self.route.color} {self.route.grade}>'

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    screenshot_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
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