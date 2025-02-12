from flask_login import UserMixin
from app import db
from datetime import datetime

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    home_gym = db.Column(db.String(128), default="Movement Gowanus")
    member_since = db.Column(db.DateTime, default=datetime.utcnow)
    profile_photo = db.Column(db.String(128), default="/assets/avatars/gray-solo-av.png")