from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from flask_uploads import UploadSet, IMAGES
from wtforms import StringField, SubmitField, PasswordField, EmailField
from wtforms.validators import Length, InputRequired, Optional, EqualTo, Email, ValidationError
from app import User

images = UploadSet('images', IMAGES)

class SettingsForm(FlaskForm):
    username = StringField("Name", validators=[InputRequired()])
    bio = StringField("Biography")
    
    icon = FileField("Profile Picture", validators=[FileAllowed(images, "Please choose an image file")])
    banner = FileField("Profile Picture", validators=[FileAllowed(images, "Please choose an image file")])
    
    backup_email = EmailField("Email", validators=[Email()])
    change_password = PasswordField("New Password", validators=[Optional(), Length(min=8, max=256)])
    confirm_password = PasswordField("Confirm New Password", validators=[EqualTo('new_password')])
    # the old_password field will be invisible if there isn't an old password
    old_password = PasswordField("Current Password", validators=[Optional(), Length(min=8, max=256)])
    submit = SubmitField("Apply Changes")
    
def validate_username(self, username):
    user = User.query.filter_by(username=username.data).first()
    if user:
        raise ValidationError('That username is taken. Please choose another.')