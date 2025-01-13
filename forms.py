from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField, SelectField, FileField
from wtforms.validators import DataRequired, Length, Email

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
    gym = SelectField('Gym', validators=[DataRequired()], choices=[
        ('', 'Select your gym'),
        ('1', 'Movement Gowanus'),
        ('feedback', 'Submit your gym')
    ])

class ProfileForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired(), Length(max=100)])
    username = StringField('Username', validators=[DataRequired(), Length(min=1, max=9)])
    gym = SelectField('Gym', validators=[DataRequired()], choices=[
        ('', 'Select your gym'),
        ('1', 'Movement Gowanus'),
        ('feedback', 'Submit your gym')
    ])

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
        ('feature', 'Feature')
    ], validators=[DataRequired()])
    screenshot = FileField('Screenshot (Optional)')