from flask import jsonify, request
from flask_login import current_user, login_required
from . import bp
from models import User, Route, Climb
from database import db

@bp.route('/user/<username>')
def get_user(username):
    """Get user profile data"""
    try:
        user = User.query.filter_by(username=username).first_or_404()
        return jsonify({
            'id': user.id,
            'username': user.username,
            'name': user.name,
            'profile_photo': user.profile_photo,
            'member_since': user.member_since.isoformat() if user.member_since else None,
            'gym_id': user.gym_id
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@bp.route('/routes')
@login_required
def get_routes():
    """Get routes for user's gym"""
    try:
        if not current_user.gym_id:
            return jsonify([])
            
        routes = Route.query \
            .filter(Route.gym_id == current_user.gym_id) \
            .all()
            
        return jsonify([{
            'id': route.id,
            'route_id': route.route_id,
            'color': route.color,
            'grade': route.grade,
            'rating': route.rating,
            'date_set': route.date_set.isoformat() if route.date_set else None
        } for route in routes])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/climbs')
@login_required
def get_climbs():
    """Get user's climbs"""
    try:
        climbs = Climb.query \
            .filter(Climb.user_id == current_user.id) \
            .order_by(Climb.created_at.desc()) \
            .all()
            
        return jsonify([{
            'id': climb.id,
            'route_id': climb.route_id,
            'status': climb.status,
            'rating': climb.rating,
            'tries': climb.tries,
            'notes': climb.notes,
            'points': climb.points,
            'created_at': climb.created_at.isoformat()
        } for climb in climbs])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
