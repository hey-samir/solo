from flask import render_template, redirect, url_for, flash, request, session
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash
from app import db
from models import User, Gym
from forms import LoginForm, RegistrationForm
from user_messages import get_user_message
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

from auth import bp

@bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('routes.sends'))

    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and user.check_password(form.password.data):
            session.permanent = True
            login_user(user, remember=True)
            next_page = request.args.get('next')
            return redirect(next_page if next_page else url_for('routes.sends'))
        message, type_ = get_user_message('LOGIN_FAILED')
        flash(message, type_)
    return render_template('login.html', form=form)

@bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))

@bp.route('/sign-up', methods=['GET', 'POST'])
def sign_up():
    if current_user.is_authenticated:
        return redirect(url_for('routes.profile'))

    form = RegistrationForm()
    if form.validate_on_submit():
        username = form.username.data
        email = form.email.data
        name = form.name.data
        gym_choice = form.gym.data

        if not username or not username.isalnum():
            message, type_ = get_user_message('USERNAME_INVALID')
            flash(message, type_)
            return render_template('register.html', form=form)

        if User.query.filter_by(username=username).first():
            message, type_ = get_user_message('USERNAME_TAKEN')
            flash(message, type_)
            return render_template('register.html', form=form)

        if User.query.filter_by(email=email).first():
            message, type_ = get_user_message('EMAIL_TAKEN')
            flash(message, type_)
            return render_template('register.html', form=form)

        try:
            gym_id = int(gym_choice) if gym_choice and gym_choice != 'feedback' else None

            if gym_id:
                gym = Gym.query.get(gym_id)
                if not gym:
                    message, type_ = get_user_message('GYM_NOT_FOUND')
                    flash(message, type_)
                    return render_template('register.html', form=form)

            user = User(
                username=username,
                email=email,
                name=name,
                gym_id=gym_id,
                member_since=datetime.utcnow()
            )
            user.set_password(form.password.data)

            db.session.add(user)
            db.session.commit()

            login_user(user)
            message, type_ = get_user_message('REGISTRATION')
            flash(message, type_)

            logger.info(f"Successfully created user {username}")
            return redirect(url_for('routes.profile'))

        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating user: {str(e)}")
            message, type_ = get_user_message('DATABASE_ERROR')
            flash(message, type_)
            return render_template('register.html', form=form)

    return render_template('register.html', form=form)