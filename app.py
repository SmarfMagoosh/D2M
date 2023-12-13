import os, sys, hashlib, json
from flask import Flask, session, render_template, url_for, redirect, request
from flask_sqlalchemy import SQLAlchemy
from forms import *
from sqlalchemy import Integer, String, JSON, Boolean

# add the script directory to the python path
scriptdir = os.path.abspath(os.path.dirname(__file__))
sys.path.append(scriptdir)
dbfile = os.path.join(scriptdir, "database.sqlite3")

# initializing the app
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['SECRET_KEY'] = 'privatizestamppulverizeunwell' # made using dice ware
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{dbfile}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# DATABASE SETUP
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

#define db classes and tables here

class User(db.Model) :
    __tablename__ = 'Users'
    username = db.Column(db.String, primary_key = True)
    email = db.Column(db.String, nullable = False)
    passwordHash = db.Column(db.String, nullable = False)
    reputationID = db.Column(db.Integer, db.ForeignKey('UserReputations.reputationID'))
    userSettingsID = db.Column(db.Integer, db.ForeignKey('UserSettings.userSettingsID'))

class UserReputation(db.Model) :
    __tablename__ = 'UserReputations'
    reputationID = db.Column(db.Integer, primary_key = True)
    timesReported = db.Column(db.Integer, nullable = False)
    numReports = db.Column(db.Integer, nullable = False)

class UserSetting(db.Model) :
    __tablename__ = 'UserSettings'
    userSettingsID = db.Column(db.Integer, primary_key = True)
    pfp = db.Column(db.String, nullable = False)
    banner = db.Column(db.String, nullable = False)

class Post(db.Model) :
    __tablename__ = 'Posts'
    postID = db.Column(db.Integer, primary_key = True)
    spacing = db.Column(db.Integer, nullable = False)
    title = db.Column(db.String, nullable = False)
    backImage = db.Column(db.String, nullable = False)
    username = db.Column(db.String, db.ForeignKey('Users.username'))

class ExtraPostImage(db.Model) :
    __tablename__ = 'ExtraPostImages'
    imageID = db.Column(db.Integer, primary_key = True)
    url = db.Column(db.String, nullable = False)
    size = db.Column(db.Float, nullable = False)
    postition = db.Column(db.String, nullable = False)
    orientation = db.Column(db.String, nullable = False)
    postID = db.Column(db.Integer, db.ForeignKey('Posts.postID'))

class TextBox(db.Model) :
    __tablename__ = 'TextBoxes'
    textBoxID = db.Column(db.Integer, primary_key = True)
    orientation = db.Column(db.String, nullable = False)
    shadowColor = db.Column(db.String, nullable = False)
    color = db.Column(db.String, nullable = False)
    position = db.Column(db.String, nullable = False)
    font = db.Column(db.String, nullable = False)
    fontSize = db.Column(db.Float, nullable = False)
    content = db.Column(db.String, nullable = False)
    postID = db.Column(db.Integer, db.ForeignKey('Posts.postID'))

class Comment(db.Model) :
    __tablename__ = 'Comments'
    commentID = db.Column(db.Integer, primary_key = True)
    content = db.Column(db.String, nullable = False)
    timePosted = db.Column(db.String, nullable = False)
    username = db.Column(db.String, db.ForeignKey('Users.username'))
    postID = db.Column(db.Integer, db.ForeignKey('Posts.postID'))


with app.app_context():
    db.create_all()

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# GET ROUTES (return an html document)
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# TODO: most of these routes need a way of knowing who the current logged in user is, though that will probably be handled on that end
@app.get("/")
def index():
    return redirect(url_for("get_home"))

@app.get("/create/")
def get_create():
    return render_template("create.html")

@app.get("/home/")
def get_home():
    return render_template("home.html")

@app.get("/login/")
def get_login():
    return render_template("login.html")

@app.get("/post/<int:post_id>/")
def get_post(post_id):
    # get the post with the id and pass the relevant data along to the frontend
    return render_template("post.html")

@app.get("/profile/")
@app.get("/profile/<int:user_id>/")
def get_profile(user_id = -1):
    # if(user_id > -1) # load a different person's profile
    return render_template("profile.html")

# need to get their current settings, but also needs to work if someone navigates by back arrow/typing in /settings
@app.get("/settings/")
def get_settings():
    return render_template("settings.html")


# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# POST ROUTES (return a redirect)
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# QUERY/API ROUTES (return a json object)
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# returns a JSON object containing the post ids of the most recent (TODO:number) posts
# start_id is an optional field, specifies the post id to start from
#       this is used if the user approaches the end of the pre-loaded content on the page to get posts below the final one
@app.get("/API/recent/")
@app.get("/API/recent/<int:start_id>/")
def get_recent(start_id=-1):
    # return json with most recent non-deleted post ids
    return

# returns a JSON object containing all of the data necessary to reproduce the post specified
@app.get("/API/getpostdata/<int:post_id>/")
def get_post(post_id):
    # return json with image link, text boxes + box settings, filters, extra image links/postitions/etc., number of likes
    return

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# MAIN
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
if __name__ == "__main__":
    app.run(debug = True)