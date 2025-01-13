from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField, SelectField, FileField
from wtforms.validators import DataRequired, Length, Email
from models import Gym

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=1, max=10)])
    password = PasswordField('Password', validators=[DataRequired()])

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[
        DataRequired(), 
        Length(min=1, max=9, message="Username must be 1-9 characters (@ will be added automatically)")
    ])
    name = StringField('Name', validators=[DataRequired(), Length(max=100)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])

    def __init__(self, *args, **kwargs):
        super(RegistrationForm, self).__init__(*args, **kwargs)
        # Get all gyms from database
        gyms = Gym.query.order_by(Gym.name).all()
        gym_choices = [(str(gym.id), gym.name) for gym in gyms]
        gym_choices.insert(0, ('', 'Select your home gym'))
        self.gym.choices = gym_choices

    gym = SelectField('Home Gym', validators=[DataRequired()])

class ProfileForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired(), Length(max=100)])
    username = StringField('Username', validators=[DataRequired(), Length(min=1, max=9)])

    def __init__(self, *args, **kwargs):
        super(ProfileForm, self).__init__(*args, **kwargs)
        # Get all gyms from database
        gyms = Gym.query.order_by(Gym.name).all()
        gym_choices = [(str(gym.id), gym.name) for gym in gyms]
        gym_choices.insert(0, ('', 'Select your home gym'))
        self.gym.choices = gym_choices

    gym = SelectField('Home Gym', validators=[DataRequired()])

class FeedbackForm(FlaskForm):
    title = StringField('Title', validators=[
        DataRequired(), 
        Length(max=100, message="Title must be 100 characters or less")
    ])
    description = TextAreaField('Description', validators=[
        DataRequired(),
        Length(max=1000, message="Description must be 1000 characters or less")
    ])
    category = SelectField('Category', choices=[
        ('bugfix', 'Bugfix'),
        ('enhancement', 'Enhancement'),
        ('feature', 'Feature'),
        ('new_gym', 'New Gym Request')
    ], validators=[DataRequired()])
    screenshot = FileField('Screenshot (Optional)')