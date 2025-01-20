import logging
from flask import render_template, redirect, url_for, flash, request, jsonify, session
from flask_login import login_required, current_user
from sqlalchemy import func
from app import db
from models import User, Route, Climb, Feedback, FeedbackVote, RouteGrade, Gym
from forms import ProfileForm, FeedbackForm
from user_messages import get_user_message
from datetime import datetime
from routes import bp

logger = logging.getLogger(__name__)

@bp.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('routes.profile'))
    return redirect(url_for('routes.about'))

@bp.route('/about')
def about():
    return render_template('about.html')

@bp.route('/solo')
@login_required
def solo():
    """
    Redirect /solo route to profile
    """
    return redirect(url_for('routes.profile'))

@bp.route('/profile')
@bp.route('/profile/<username>')
def profile(username=None):
    """Handle the user's profile page with optional username parameter"""
    logger.debug("Accessing profile page for user: %s", username or (current_user.username if current_user.is_authenticated else 'Anonymous'))
    try:
        if username:
            username = username.lstrip('@')
            user = User.query.filter_by(username=username).first_or_404()
        elif current_user.is_authenticated:
            return redirect(url_for('routes.profile', username=current_user.username))
        else:
            message, type_ = get_user_message('LOGIN_REQUIRED')
            flash(message, type_)
            return redirect(url_for('auth.login'))

        form = ProfileForm(obj=user) if current_user.is_authenticated and current_user.id == user.id else None

        # Calculate KPI metrics
        climbs = list(user.climbs)
        total_ascents = len(climbs)
        total_points = sum(climb.points or 0 for climb in climbs)

        is_own_profile = current_user.is_authenticated and current_user.id == user.id

        return render_template('profile.html',
                            form=form,
                            profile_user=user,
                            total_ascents=total_ascents,
                            total_points=total_points,
                            is_own_profile=is_own_profile)

    except Exception as e:
        logger.error("Error in profile page: %s", str(e))
        message, type_ = get_user_message('GENERIC_ERROR')
        flash(message, type_)
        return render_template('404.html'), 404

@bp.route('/sends')
@login_required
def sends():
    """Handle the sends page - display routes for user's gym"""
    try:
        routes = []
        if current_user.gym_id:
            routes = Route.query \
                .join(RouteGrade) \
                .filter(Route.gym_id == current_user.gym_id) \
                .order_by(RouteGrade.difficulty_rank) \
                .all()

        logger.info(f"Fetched {len(routes)} routes for user {current_user.id}")
        return render_template('sends.html', routes=routes)
    except Exception as e:
        logger.error(f"Error in sends route: {str(e)}")
        message, type_ = get_user_message('GENERIC_ERROR')
        flash(message, type_)
        return render_template('sends.html', routes=[])

@bp.route('/standings')
@login_required
def standings():
    """Handle the standings page with user rankings"""
    try:
        users = User.query.all()
        leaderboard = []

        for user in users:
            climbs = list(user.climbs)
            total_ascents = len(climbs)
            total_points = sum(climb.points or 0 for climb in climbs)

            leaderboard.append({
                'username': user.username,
                'total_ascents': total_ascents,
                'total_points': total_points
            })

        # Sort by total points
        leaderboard = sorted(leaderboard, key=lambda x: x['total_points'], reverse=True)
        return render_template('standings.html', leaderboard=leaderboard)

    except Exception as e:
        logger.error(f"Error in standings page: {str(e)}")
        message, type_ = get_user_message('GENERIC_ERROR')
        flash(message, type_)
        return render_template('standings.html', leaderboard=[])

@bp.route('/sessions')
@login_required
def sessions():
    """Handle sessions page"""
    try:
        # Get all climbs for the current user, ordered by date
        climbs = db.session.query(Climb, Route) \
            .join(Route) \
            .filter(Climb.user_id == current_user.id) \
            .order_by(Climb.created_at.desc()) \
            .all()

        # Group climbs by date
        from itertools import groupby
        def get_date(climb_tuple):
            climb, route = climb_tuple
            return climb.created_at.date()

        climbs_by_date = {}
        for date, group in groupby(climbs, key=get_date):
            climbs_by_date[date] = list(group)

        return render_template('sessions.html', climbs_by_date=climbs_by_date)

    except Exception as e:
        logger.error(f"Error in sessions route: {str(e)}")
        return render_template('sessions.html', climbs_by_date={})

@bp.route('/stats')
@login_required
def stats():
    """Handle stats page"""
    try:
        climbs = list(current_user.climbs)
        if not climbs:
            return render_template('stats.html', total_ascents=0)

        total_ascents = len(climbs)
        sends = [c for c in climbs if c.status is True]
        total_sends = len(sends)
        total_points = sum(climb.points or 0 for climb in climbs)

        return render_template('stats.html',
                            total_ascents=total_ascents,
                            total_sends=total_sends,
                            total_points=total_points)

    except Exception as e:
        logger.error(f"Error in stats page: {str(e)}")
        return render_template('stats.html', total_ascents=0)

@bp.route('/squads')
@login_required
def squads():
    return render_template('404.html')

@bp.route('/feedback', methods=['GET'])
def feedback():
    """Handle the feedback page"""
    try:
        form = FeedbackForm()
        sort = request.args.get('sort', 'new')

        # Query feedback items
        if sort == 'top':
            feedback_items = (
                Feedback.query
                .join(FeedbackVote, isouter=True)
                .group_by(Feedback.id)
                .order_by(db.func.count(FeedbackVote.id).desc())
                .all()
            )
        else:  # 'new' is default
            feedback_items = Feedback.query.order_by(Feedback.created_at.desc()).all()

        return render_template('feedback.html', form=form, feedback_items=feedback_items, sort=sort)
    except Exception as e:
        logger.error(f"Error in feedback route: {str(e)}")
        return render_template('404.html'), 404

@bp.route('/solo-pro')
def solo_pro():
    """Handle the solo pro page"""
    try:
        return render_template('pricing.html')
    except Exception as e:
        logger.error(f"Error rendering pricing page: {str(e)}")
        return render_template('404.html'), 404

@bp.route('/pricing')
def pricing():
    """Handle the pricing page"""
    try:
        return render_template('pricing.html')
    except Exception as e:
        logger.error(f"Error rendering pricing page: {str(e)}")
        return render_template('404.html'), 404