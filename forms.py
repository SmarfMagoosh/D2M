from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from wtforms import StringField, SubmitField, PasswordField, EmailField, TextAreaField
from wtforms.validators import Length, InputRequired, Optional, EqualTo, Email, ValidationError
# from app import User

class SettingsForm(FlaskForm):
    username = StringField("Username", validators=[InputRequired(), Length(max=64)])
    bio = TextAreaField("Biography", validators=[Optional(), Length(max=1024)])
    
    icon = FileField("Profile Picture", validators=[FileAllowed(['jpg', 'png', 'gif'], "Please choose an image file")])
    banner = FileField("Banner", validators=[FileAllowed(['jpg', 'png', 'gif'], "Please choose an image file")])
    
    backup_email = EmailField("Backup Email", validators=[Email()])
    change_password = PasswordField("New Password", validators=[Optional(), Length(min=8, max=256)])
    confirm_password = PasswordField("Confirm New Password", validators=[EqualTo('new_password')])
    old_password = PasswordField("Current Password", validators=[Optional(), Length(min=8, max=256)])
    submit = SubmitField("Apply Changes")