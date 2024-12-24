from app import db
from datetime import datetime

class Climb(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    color = db.Column(db.String(50), nullable=False)
    difficulty = db.Column(db.String(10), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)