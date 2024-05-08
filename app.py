from datetime import datetime, timedelta
from flask import session
import os, sys, json
import string
import secrets
import re

from flask import Flask, session, render_template, url_for, redirect, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from sqlalchemy import event
from apscheduler.schedulers.background import BackgroundScheduler
from io import BytesIO
from PIL import Image
import base64
import atexit
import time
import math
import bcrypt

import base64

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

"""
set FLASK_APP=app.py
python -m flask run --host=0.0.0.0 --port=80
"""

# for easy changing of defaults
DEFAULT_POSTS_LOADED = 100
MINUTES_BETWEEN_REFRESH = 10

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

# setup queue for sorting by likes
update_times = [0, 0, 0]
like_milestones = [10, 25, 50, 100, 250, 500, 1000]

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# NON-ROUTE FUNCTIONS
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

def update_like_backend():
    with app.app_context():
        db.session.execute(text('UPDATE Posts SET numLikesD3 = numLikesD2'))
        db.session.execute(text('UPDATE Posts SET numLikesD2 = numLikesD1'))
        db.session.execute(text('UPDATE Posts SET numLikesD1 = numLikes'))
        db.session.commit()
        
    global update_times
    update_times.append(math.floor(time.time()))
    update_times.pop(0)
    
    #check for posts crossing like thresholds
    global like_milestones
    with app.app_context():
        for milestone in like_milestones:
            passed = Post.query.filter(Post.numLikesD1 >= milestone, Post.numLikesD2 < milestone).all()
            for post in passed:
                create_notification(post.owner.gccEmail, f"{post.title} has gained {milestone} likes!", post.title, f"/post/{post.postID}")

def create_like(username, post, up):
    with app.app_context():
        like = Like(username = username, postID = post, positive=up)
        db.session.add(like)
        db.session.commit()
        

def create_notification(email, text, title, link = "#"):
    with app.app_context():
        time = datetime.now().strftime("%m/%d/%Y %I:%M %p")
        notif = Notification(userEmail = email, text = text, title=title, time=time, link=link)
        db.session.add(notif)
        db.session.commit()

def create_tag(tag):
    if tag == "" or Tag.query.filter_by(tag=tag).first() is not None:
        return
    with app.app_context():
        ret = Tag(tag = tag)
        db.session.add(ret)
        db.session.commit()
        
# takes in the byte data of an image, and saves the thumbnail version
def create_thumbnail(image_data, filepath, dimensions = (400, 800)):
    img = Image.open(BytesIO(base64.b64decode(image_data)))
    img.thumbnail(dimensions)
    img.save(filepath)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# DATABASE SETUP
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

with app.app_context():
    #db.drop_all()
    db.create_all()

#define db classes and tables here


class User(db.Model) :
    __tablename__ = 'Users'
    username = db.Column(db.String, unique = True)
    gccEmail = db.Column(db.String, primary_key = True)
    
    bio = db.Column(db.String, nullable = True)
    
    backupEmail = db.Column(db.String, default = "")
    backupPasswordHash = db.Column(db.String, nullable = True)
    passwordResetToken = db.Column(db.String, nullable = True)
    timesReported = db.Column(db.Integer, default = 0)
    
    # classes that use this class for a foreign key, allows access to list
    # also allows the classes that use the foreign key to use <class>.owner
    postList = db.relationship('Post', backref='owner')
    commentList = db.relationship('Comment', backref='owner')
    reportList = db.relationship('Report', backref='reporter')
    likeList = db.relationship('Like', backref='user')
    bookmarkList = db.relationship('Bookmark', backref='user')
    notificationList = db.relationship('Notification', backref='user')
    # advanced backref to deal with multiple references to the same table
    followList = db.relationship('Follow', back_populates='follower', foreign_keys='Follow.user1')
    followerList = db.relationship('Follow', back_populates='followed', foreign_keys='Follow.user2')
    blockList = db.relationship('Block', back_populates='blocker', foreign_keys='Block.user1')
    

    def postlist_to_json(self):
        return {
            "posts": [p.render_json() for p in self.postList]
		}
    
    def likelist_to_json(self):
        return {
            "posts": [l.render_json() for l in self.likeList]
		}
    
    def get_user_info(self):
        return {
            "username": self.username,
            "gccEmail": self.gccEmail,
            "bio": self.bio,
            "backupEmail": self.backupEmail,
        }
        
    def search_result_json(self):
        pfp = "/static/images/default-pfp.png"
        if os.path.isfile(f"static/images/users/{self.gccEmail}/pfp.png"):
            pfp = f"/static/images/users/{self.gccEmail}/pfp.png"
        return{
            "username": self.username,
            "pfp": pfp,
        }
    
    def profile_json(self):
        pfp = "/static/images/default-pfp.png"
        banner = "/static/images/default-banner.png"
        if os.path.isfile(f"static/images/users/{self.gccEmail}/pfp.png"):
            pfp = f"/static/images/users/{self.gccEmail}/pfp.png"
            banner = f"/static/images/users/{self.gccEmail}/banner.png"
        return{
            "username": self.username,
            "pfp": pfp,
            "banner": banner
        }
    
    def profile_json(self):
        pfp = "/static/images/default-pfp.png"
        banner = "/static/images/default-banner.png"
        if os.path.isfile(f"static/images/users/{self.gccEmail}/pfp.png"):
            pfp = f"/static/images/users/{self.gccEmail}/pfp.png"
            banner = f"/static/images/users/{self.gccEmail}/banner.png"
        return{
            "username": self.username,
            "pfp": pfp,
            "banner": banner
        }
   
    
    

class Report(db.Model) :
    __tablename__ = 'Reports'
    reportID = db.Column(db.Integer, primary_key = True)
    userEmail = db.Column(db.String, db.ForeignKey('Users.gccEmail'))
    postID = db.Column(db.Integer, db.ForeignKey('Posts.postID'))
    reason = db.Column(db.String, nullable = False)
    def to_json(self):
        return {
            "reason": self.reason,
            "postID" : self.postID,
            "userEmail" : self.userEmail,
            "id" : self.reportID
		}
    
class Notification(db.Model) :
    __tablename__ = 'Notifications'
    NotificationID = db.Column(db.Integer, primary_key = True)
    userEmail = db.Column(db.String, db.ForeignKey('Users.gccEmail'))
    title = db.Column(db.String)
    text = db.Column(db.String)
    link = db.Column(db.String)
    # format: mm/dd/yy hh:mm AM/PM
    # ex: 3/7/24 5:30 AM
    time = db.Column(db.String)
    def to_json(self):
        return {
            "title": self.title,
            "text" : self.text,
            "time" : self.time,
            "id" : self.NotificationID,
            "link": self.link 
		}

class Like(db.Model):
    __tablename__ = 'Likes'
    # using a ID primary key so that we can sort by most recent like
    likeID = db.Column(db.Integer, primary_key = True, autoincrement = True)
    positive = db.Column(db.Boolean, default=True)
    userEmail = db.Column(db.String, db.ForeignKey('Users.gccEmail'))
    postID = db.Column(db.Integer, db.ForeignKey('Posts.postID'))
    
class Bookmark(db.Model):
    __tablename__ = 'Bookmarks'
    # using a ID primary key so that we can sort by most recent bookmark
    bookmarkID = db.Column(db.Integer, primary_key = True, autoincrement = True)
    userEmail = db.Column(db.String, db.ForeignKey('Users.gccEmail'))
    postID = db.Column(db.Integer, db.ForeignKey('Posts.postID'))
    
class Follow(db.Model):
    __tablename__ = 'Follows'
    # user1 follows user2
    user1 = db.Column(db.String, db.ForeignKey('Users.gccEmail'), primary_key=True)
    user2 = db.Column(db.String, db.ForeignKey('Users.gccEmail'), primary_key=True)
    # advanced backref because of 2 foreign keys from same table
    follower = db.relationship('User', back_populates='followList', foreign_keys=[user1])
    followed = db.relationship('User', back_populates='followerList', foreign_keys=[user2])

class Block(db.Model):
    __tablename__ = 'Blocks'
    # user1 blocks user2
    user1 = db.Column(db.String, db.ForeignKey('Users.gccEmail'), primary_key=True)
    user2 = db.Column(db.String, db.ForeignKey('Users.gccEmail'), primary_key=True)
    # advanced backref because of 2 foreign keys from same table
    blocker = db.relationship('User', back_populates='blockList', foreign_keys=[user1])

class Tag(db.Model):
    __tablename__ = 'Tags'
    tag = db.Column(db.String, primary_key=True)

class Post(db.Model) :
    __tablename__ = 'Posts'
    postID = db.Column(db.Integer, primary_key = True, autoincrement = True)
    spacing = db.Column(db.Float, nullable = False, default = 0.0)
    space_arrangement = db.Column(db.Float, default = 0.0)
    title = db.Column(db.String)
    backImage = db.Column(db.String, nullable = False)
    timePosted = db.Column(db.DateTime)
    username = db.Column(db.String, db.ForeignKey('Users.username'))
    draw = db.Column(db.String)
    numLikes = db.Column(db.Integer, default=0)
    numLikesD1 = db.Column(db.Integer) # [0,10) min ago
    numLikesD2 = db.Column(db.Integer) # [10,20) min ago
    numLikesD3 = db.Column(db.Integer) # [20,30) min ago
    tag = db.Column(db.String, db.ForeignKey('Tags.tag'))
    template = db.Column(db.Boolean, default = False)

    # objects that use this class for a foreign key, allows access to list
    # also allows the classes that use the foreign key to use <class>.parentPost
    comments = db.relationship('Comment', backref='parentPost')
    textBoxes = db.relationship('TextBox', backref='parentPost')
    extraImage = db.relationship('ExtraImage', backref='parentPost')
    reportsList = db.relationship('Report', backref='post')
    likeUsers = db.relationship('Like', backref='post')
    bookmarkUsers = db.relationship('Bookmark', backref='post')

    def remix_json(self):
        return {
            "spacing": self.spacing,
            "space_arrangement": self.space_arrangement,
            "title": "Remix of " + self.title,
            "backImage": self.backImage,
            "textBoxes": [t.to_json() for t in self.textBoxes],
            "extraImages": [i.to_json() for i in self.extraImage],
            "draw": self.draw,
            "template": self.template
        }
    def render_json(self):
        return {
            "id": self.postID,
            "title": self.title,
            "thumbnail": f"/images/thumbnails/{self.postID}.png",
            "username": self.username,
            "numLikes": self.numLikes,
        }
    def page_json(self):
        return {
            "id": self.postID,
            "title": self.title,
            "username": self.username,
            "backImage": self.backImage,
            "thumbnail": f"images/thumbnails/{self.postID}.png",
            "thumbnail": f"images/thumbnails/{self.postID}.png",
            "numLikes": self.numLikes,
            "comments": [c.to_json() for c in self.comments],
            "textBoxes": [t.to_json() for t in self.textBoxes],# see above TODO 
        }
    def to_json(self):
        return {
            "id": self.postID,
            "spacing": self.spacing,
            "title": self.title,
            "backImage": self.backImage,
            "thumbnail": f"images/thumbnails/{self.postID}.png",
            "username": self.username,
            "numLikes": self.numLikes,
            "comments": [c.to_json() for c in self.comments],
            "textBoxes": [t.to_json() for t in self.textBoxes],
            "reportsList": [r.to_json() for r in self.reportsList],
            "tag": self.tag
        }
    def thumbnail(self):
        return f"images/thumbnails/{self.postID}.png"
    def search_result_json(self):
        return{
            "id": self.postID,
            "title": self.title,
            "thumbnail": f"/static/images/thumbnails/{self.postID}.png",
            "tag": self.tag,
            "poster": self.owner.username,
        }

class TextBox(db.Model) :
    __tablename__ = 'TextBoxes'
    textBoxID = db.Column(db.Integer, primary_key = True)
    postID = db.Column(db.Integer, db.ForeignKey('Posts.postID'))
    alignment = db.Column(db.String)
    fontSize = db.Column(db.Integer)
    font = db.Column(db.String)
    shadowColor = db.Column(db.String)
    color = db.Column(db.String)
    decorations = db.Column(db.String)
    width = db.Column(db.Integer)
    height = db.Column(db.Integer)
    top = db.Column(db.Integer)
    left = db.Column(db.Integer)
    content = db.Column(db.String)
    
    def to_json(self):
	    return {
			"id": self.textBoxID,
			"alignment": self.alignment,
            "fontSize": self.fontSize,
            "font": self.font,
            "shadowColor": self.shadowColor,
            "color": self.color,
            "decorations": [x == "1" for x in self.decorations.split(" ")],
            "width": self.width,
            "height": self.height,
            "top": self.top,
            "left": self.left,
            "content": self.content
		}
    
class ExtraImage(db.Model):
    __tablename__ = 'ExtraImages'
    extraImageId = db.Column(db.Integer, primary_key = True)
    postID = db.Column(db.Integer, db.ForeignKey('Posts.postID'))
    left = db.Column(db.Integer)
    top = db.Column(db.Integer)
    width = db.Column(db.Integer)
    height = db.Column(db.Integer)
    src = db.Column(db.String)
    
    def to_json(self):
	    return {
            "image": self.src,
            "left": self.left,
            "top": self.top,
            "width": self.width,
            "height": self.height
		}

class Comment(db.Model) :
    __tablename__ = 'Comments'
    commentID = db.Column(db.Integer, primary_key = True, autoincrement=True)
    content = db.Column(db.String(200), nullable = False)
    # highly recommended to use ISO format, is possible to use db.DateTime instead of db.String
    timePosted = db.Column(db.String, nullable = False)
    username = db.Column(db.String, db.ForeignKey('Users.username'))
    postID = db.Column(db.Integer, db.ForeignKey('Posts.postID'))
    
    def to_json(self):
	    return {
			"id": self.commentID,
			"content": self.content,
			"timePosted": self.timePosted,
			"username": self.username,
			"parentPost": self.postID,
		}

with app.app_context():
    #db.drop_all()
    db.create_all()

    # tag1 = Tag(tag="tag1")
    # tag2 = Tag(tag="tag2")
    # tag3 = Tag(tag="tag3")
    # tag4 = Tag(tag="tag4")
    # tag5 = Tag(tag="jeff")
    # tag6 = Tag(tag="bottom-text")
    
    # u1 = User(username="u1", gccEmail = "u1@gcc.edu", backupPasswordHash = bcrypt.hashpw("u1".encode('utf-8'), bcrypt.gensalt()))
    # u2 = User(username="u2", gccEmail = "u2@gcc.edu", backupPasswordHash = bcrypt.hashpw("u2".encode('utf-8'), bcrypt.gensalt()))
    # u3 = User(username="u3", gccEmail = "u3@gcc.edu", backupPasswordHash = bcrypt.hashpw("u3".encode('utf-8'), bcrypt.gensalt()))
    # u4 = User(username="u4", gccEmail = "u4@gcc.edu", backupPasswordHash = bcrypt.hashpw("u4".encode('utf-8'), bcrypt.gensalt()))
    # u5 = User(username="u5", gccEmail = "u5@gcc.edu", backupPasswordHash = bcrypt.hashpw("u5".encode('utf-8'), bcrypt.gensalt()))

    # post1 = Post(postID= 1, spacing = 0 , title="excel is not a valid database!!!",
    #              backImage = "4 rules.png", owner = u2, numLikes=10, tag=tag1.tag)
    # post2 = Post(postID= 2, spacing = 0 , title="get gimbal locked idiot",
    #              backImage = "Gimbal_Lock_Plane.gif", owner = u1, numLikes=1)
    # post3 = Post(postID= 3, spacing = 0 , title="why must I do this?",
    #              backImage = "Stop doing databases.png", owner = u3, numLikes=100)
    # like11 = Like(user=u1, postID=1)
    # like12 = Like(user=u1, postID=3)
    # like13 = Like(user=u1, postID=2, positive=False)
    # bm11 = Bookmark(user=u1, postID=1)
    # bm12 = Bookmark(user=u1, postID=3)
    # bm13 = Bookmark(user=u1, postID=2)
    # notif = Notification(user = u1, title="Title", text="really long text that I don't feel like typing", time="3/13/2024 9:23 PM")

    # # Add all of these records to the session and commit changes
    # db.session.add_all((u4, u5))
    # db.session.add_all((post1, post2, post3))
    # db.session.add_all((like11,like12,like13))
    # db.session.add_all((bm11,bm12,bm13))
    # db.session.add(notif)
    # db.session.add_all((tag1,tag2,tag3,tag4,tag5,tag6))
    # db.session.commit()


# for the update to like counts every 10 minutes
scheduler = BackgroundScheduler()
scheduler.add_job(func=update_like_backend, trigger="interval", minutes=MINUTES_BETWEEN_REFRESH)
scheduler.start()
atexit.register(lambda: scheduler.shutdown())
# preliminary copy
update_like_backend()

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# GET ROUTES (return an html document)
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# TODO: most of these routes need a way of knowing who the current logged in user is, though that will probably be handled on that end
# actually seems like the session variable will be necessary
@app.get("/")
def index():
    return redirect(url_for("get_home"))

@app.get("/resetPassword")
def get_resetPassword():
    return render_template("resetPassword.html")

@app.get("/create/")
def get_create():
    user = load_user(session.get("customIdToken"))
    return render_template(
        "create.html", 
        templates = [url_for('static', filename = f"template-thumbnails/{file}") for file in os.listdir("./static/template-thumbnails")], 
        loggedInUser = user)


@app.get("/create/<int:post_id>")
def get_remix(post_id):
    post = Post.query.get(post_id).remix_json()
    return render_template("create.html", templates = [url_for('static', filename = f"template-thumbnails/{file}") for file in os.listdir("./static/template-thumbnails")], loggedInUser = load_user(session.get('customIdToken')), post = post)


@app.get("/home/")
def get_home():
    # gets the most recent posts and sends them to the frontend
    recent = Post.query.order_by(Post.postID.desc()) \
                        .limit(DEFAULT_POSTS_LOADED) \
                        .all()
    return render_template("home.html", posts=[p.render_json() for p in recent], loggedInUser = load_user(session.get('customIdToken')))

# render the signin page html
@app.get("/signin-oidc/")
def get_login():
    return render_template("signin-oidc.html")


@app.get("/post/<int:post_id>/")
def get_post(post_id):
    # get the post with the id and pass the relevant data along to the frontend
    # just plain get might work better, not sure, but it would return None with a failure rather than aborting
    post = Post.query.get_or_404(post_id)
    user = load_user(session.get('customIdToken'))
    if user:
        has_liked = Like.query.filter_by(postID=post_id, userEmail= user.gccEmail, positive=True).first() is not None
        has_disliked = Like.query.filter_by(postID=post_id, userEmail=user.gccEmail, positive=False).first() is not None
        has_bookmarked = Bookmark.query.filter_by(postID=post_id, userEmail=user.gccEmail).first() is not None
    else:
        has_liked = False
        has_disliked = False
        has_bookmarked = False

    return render_template("post.html", post=post.to_json(), loggedInUser = user, has_liked=has_liked,has_disliked = has_disliked, has_bookmarked=has_bookmarked)

@app.get("/profile/")
@app.get("/profile/<string:username>/")
def get_profile(username = None):
    blocked = False
    following = False
    if(username == None):
        user = load_user(session.get('customIdToken'))
        liked_post_ids = [like.postID for like in Like.query.filter_by(userEmail=user.gccEmail).all()]
        # Get the bookmarked posts associated with the user
        bookmarked_post_ids = [bookmark.postID for bookmark in Bookmark.query.filter_by(userEmail=user.gccEmail).all()]
        # Fetch the liked posts
        liked_posts = Post.query.filter(Post.postID.in_(liked_post_ids)).all()
        # Fetch the bookmarked posts
        bookmarked_posts = Post.query.filter(Post.postID.in_(bookmarked_post_ids)).all()
        created_posts = reversed(user.postList)
        return render_template("profile.html", loggedInUser=user, user=user, liked_posts=liked_posts, bookmarked_posts=bookmarked_posts, created_posts = created_posts)
    else:
        loggedInUser = load_user(session.get('customIdToken'))
        user = User.query.filter_by(username=username).first()
        if loggedInUser:
            if Follow.query.filter_by(user1=loggedInUser.gccEmail, user2=user.gccEmail).first():
                following = True
            if Block.query.filter_by(user1=loggedInUser.gccEmail, user2=user.gccEmail).first():
                blocked = True
                
        # Get the liked posts associated with the user
        liked_post_ids = [like.postID for like in Like.query.filter_by(userEmail=user.gccEmail).all()]
        # Get the bookmarked posts associated with the user
        bookmarked_post_ids = [bookmark.postID for bookmark in Bookmark.query.filter_by(userEmail=user.gccEmail).all()]
        # Fetch the liked posts
        liked_posts = Post.query.filter(Post.postID.in_(liked_post_ids)).all()
        # Fetch the bookmarked posts
        bookmarked_posts = Post.query.filter(Post.postID.in_(bookmarked_post_ids)).all()
        created_posts = reversed(user.postList)
        return render_template("profile.html", loggedInUser=load_user(session.get('customIdToken')), user=user, blocked=blocked, following=following, liked_posts=liked_posts, bookmarked_posts=bookmarked_posts , created_posts = created_posts)
        
@app.get('/getCurrentSettings/')
def getCurrentSettings():
    email = request.args.get('email')
    return redirect(url_for('get_settings')+ "email=" + str(email))

# need to get their current settings, but also needs to work if someone navigates by back arrow/typing in /settings
@app.get("/settings/")
# @login_required
def get_settings():
    #get curr user
    user = load_user(session.get('customIdToken'))
    if user:
        pfp = "#"
        banner = "#"
        if os.path.isfile(f"static/images/users/{user.gccEmail}/pfp.png"):
            pfp = url_for('static', filename=f'images/users/{user.gccEmail}/pfp.png')
        if os.path.isfile(f"static/images/users/{user.gccEmail}/banner.png"):
            banner = url_for('static', filename=f'images/users/{user.gccEmail}/banner.png')
        return render_template('settings.html', user=user, pfp=pfp, banner=banner, loggedInUser=user)
    else:
        redirect(url_for("get_home"))
        return {'loggedout': True}

# this post route updates the user settings based on the inputed values on the settings page
@app.route("/settings/", methods=["POST"])
def post_settings():
    json_data = request.json
    user = load_user(session.get('customIdToken'))
    
    returnVal = {}

    # indicate if new username already exists or not
    if json_data.get('username') != user.username and User.query.filter_by(username=json_data.get('username')).first():
        returnVal['usernameUnique'] = False
    else:
        returnVal['usernameUnique'] = True


    backupEmail = json_data.get('backup_email')
    regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
    
    # indicate is new backup email is of valid email form
    returnVal['validEmail'] = (backupEmail == "") or (True if re.fullmatch(regex, backupEmail) else False)

    # indicate if the password is being updated
    returnVal['passwordUpdate'] = json_data.get('old_password') != "" or json_data['change_password'] != "" or json_data['confirm_password'] != ""
    # indicate the current passwords match
    returnVal['oldPasswordMatch'] = bcrypt.checkpw(json_data.get('old_password').encode('utf-8'), user.backupPasswordHash)
    # indicate if the new password is valid
    returnVal['newPasswordValid'] = len(json_data.get('change_password')) >= 8
    # indicate if the new passwords match
    returnVal['newPasswordMatch'] = json_data.get('change_password') == json_data.get('confirm_password')

    # indicate if info was successfully updated
    returnVal['success'] = returnVal['usernameUnique'] and returnVal['validEmail']
    returnVal['success'] = returnVal['success'] and (not returnVal['passwordUpdate'] or (returnVal['oldPasswordMatch'] and returnVal['newPasswordValid'] and returnVal['newPasswordMatch']))
    
    #don't update any values if anything fails validation
    if returnVal['success'] == False:
        return jsonify(returnVal)
    
    newUname = json_data.get('username')
    if user.username != newUname:
        for post in user.postList:
            post.username = newUname
        for comment in user.commentList:
            comment.username = newUname
    user.username = newUname
    
    user.bio = json_data.get('bio')
    
    icon = json_data.get("icon")
    print(icon[0:10])
    if icon[0:10] == "data:image":
        create_thumbnail(icon[icon.index(',')+1:], f"./static/images/users/{user.gccEmail}/pfp.png", dimensions = (300, 300))
    banner = json_data.get("banner")
    if banner[0:10] == "data:image":
        create_thumbnail(banner[banner.index(',')+1:], f"./static/images/users/{user.gccEmail}/banner.png", dimensions = (1200, 400))
    
    user.backupEmail = json_data.get('backup_email')

    newPassword = json_data.get('change_password')

    user.backupPasswordHash = bcrypt.hashpw(newPassword.encode('utf-8'), bcrypt.gensalt())

    db.session.commit()
    return jsonify(returnVal)

# get a user object
def load_user(userEmail):
    if userEmail != None:
        return User.query.get(userEmail)
    else:
        return None
    
@app.get('/genResetToken/')
def genResetToken():
    name = request.args.get('username')
    self = User.query.filter_by(username=name).first()
    if self:
        token_length = 32
        expiration_minutes = 15

        user_info = f"{self.username}~"

        # Use a secure random string for additional randomness
        random_string = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(token_length))

        # Concatenate user-specific info and random string to create the token
        token = user_info + random_string

        # Calculate expiration timestamp
        expiration_time = datetime.utcnow() + timedelta(minutes=expiration_minutes)
        expiration_timestamp = expiration_time.timestamp()

        # Append expiration timestamp to the token
        token_with_expiration = f"{token}~{expiration_timestamp}"

        return jsonify({'token': token_with_expiration})
    else:
        return jsonify({'token': False})

@app.get('/validate_reset_token/')
def validate_reset_token():
    token = request.args.get('token')

    # Split token and expiration timestamp
    token_parts = token.split('~')

    username, token, expiration_timestamp = token_parts

    # Convert expiration timestamp to datetime
    expiration_time = datetime.fromtimestamp(float(expiration_timestamp))

    # Check if token has expired
    if  datetime.utcnow() > expiration_time:
        return jsonify({'valid': False})

    return jsonify({'valid': True})

@app.get('/sendResetEmail/')
def sendResetEmail():
    username = request.args.get('username')
    token = request.args.get('token')
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'success': False})

    user.passwordResetToken = token
    db.session.commit()


    # Email configuration
    primary = sendEmailTo(user.gccEmail)
    
    if(user.backupEmail and user.backupEmail != ""):
        if(primary and sendEmailTo(user.backupEmail)):
            return jsonify({'success': True})
        else:
            return jsonify({'success': False})

    if(primary):
        return jsonify({'success': True})
    else:
        return jsonify({'success': False})

def sendEmailTo(email: str): 
    username = request.args.get('username')
    token = request.args.get('token')
    user = User.query.filter_by(username=username).first()
    if not user:
        return False

    user.passwordResetToken = token
    db.session.commit()

    # Email configuration
    sender_email = 'svc_CS_D2M@gcc.edu'
    receiver_email = email
    password = 'Laq86937'

    # Create message container
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = 'D2M Password Reset Request'
    

    resetLink = request.base_url.replace("sendResetEmail", "") + 'resetPassword?token=' + token
    # Email body
    body = f"""
    Dear {user.username},

    We have received a request to reset your password for your account at D2M. To reset your password, please click on the following link:
    {resetLink}
    If you did not request this password reset, you can safely ignore this email. Your password will remain unchanged.

    Thank you,
    The D2M Team
    """

    msg.attach(MIMEText(body, 'plain'))

    # Connect to SMTP server
    try:
        with smtplib.SMTP('smtp.office365.com', 587, timeout=10) as server:
            server = smtplib.SMTP('smtp.office365.com', 587)
            server.starttls()  # Secure the connection
            server.login(sender_email, password)
            text = msg.as_string()
            server.sendmail(sender_email, receiver_email, text)
            server.quit()  # Quit the SMTP server   
            return True
    except smtplib.SMTPException as e:
        print("SMTP error:", e)
        return False
    except TimeoutError:
        print("SMTP connection timed out")
        return False
    except Exception as e:
        print("Other error:", e)
        return False

@app.get('/setPassword/')
def setPassword():
    token = request.args.get('token')
    newPassword = request.args.get('password')

    # Split token and expiration timestamp
    token_parts = token.split('~')

    username, secretString, expiration_timestamp = token_parts

    user = User.query.filter_by(username=username).first()

    if not user or token != user.passwordResetToken:
        return jsonify({'success': False})

    user.backupPasswordHash = bcrypt.hashpw(newPassword.encode('utf-8'), bcrypt.gensalt())
    db.session.commit()

    return jsonify({'success': True, 'email': user.gccEmail})

# this route corresponds to the follow button
@app.route('/toggle_follow_status', methods=['POST'])
def toggle_follow_status():
    data = request.get_json()
    otherUserEmail = data.get('otherUserEmail')
    otherUser = load_user(otherUserEmail)
    currUser = load_user(session.get('customIdToken'))

    if currUser and otherUser:
        # Check if user1 is already following user2
        existing_follow = Follow.query.filter_by(user1=currUser.gccEmail, user2=otherUser.gccEmail).first()

        if existing_follow:
            # If already following, unfollow
            db.session.delete(existing_follow)
            db.session.commit()
            is_following = False
        else:
            # If not following, follow
            new_follow = Follow(user1=currUser.gccEmail, user2=otherUser.gccEmail)
            db.session.add(new_follow)
            db.session.commit()
            is_following = True
            create_notification(otherUserEmail, f"{currUser.username} has followed you", "New Follower", f"/profile/{currUser.username}")

        # Reload user1 instance to update followList
        currUser = User.query.filter_by(gccEmail=currUser.gccEmail).first()
        return jsonify({'is_following': is_following})
    else:
        return jsonify({'message': "Error: One or both users do not exist."})
    
# This route is used exclusively when the user blocks someone they were following
@app.route('/unfollow', methods=['POST'])
def unfollow():
    data = request.get_json()
    otherUserEmail = data.get('otherUserEmail')
    otherUser = load_user(otherUserEmail)
    currUser = load_user(session.get('customIdToken'))

    if currUser and otherUser:
        # Check if user1 is already following user2
        existing_follow = Follow.query.filter_by(user1=currUser.gccEmail, user2=otherUser.gccEmail).first()
        if existing_follow:
            db.session.delete(existing_follow)
            db.session.commit()

        # Reload user1 instance to update followList
        currUser = User.query.filter_by(gccEmail=currUser.gccEmail).first()
        return jsonify({'is_following': False})
    else:
        return jsonify({'message': "Error: One or both users do not exist."})

# this route corresponds to the block button
@app.route('/toggle_block_status', methods=['POST'])
def toggle_block_status():
    data = request.get_json()
    otherUserEmail = data.get('otherUserEmail')
    otherUser = load_user(otherUserEmail)
    currUser = load_user(session.get('customIdToken'))

    if currUser and otherUser:
        # Check if user1 is already following user2
        existing_block = Block.query.filter_by(user1=currUser.gccEmail, user2=otherUser.gccEmail).first()

        if existing_block:
            # If already following, unfollow
            db.session.delete(existing_block)
            db.session.commit()
            is_blocked = False
        else:
            # If not following, follow
            new_block = Block(user1=currUser.gccEmail, user2=otherUser.gccEmail)
            db.session.add(new_block)
            db.session.commit()
            is_blocked = True

        # Reload user1 instance to update followList
        currUser = User.query.filter_by(gccEmail=currUser.gccEmail).first()
        return jsonify({'is_blocked': is_blocked})
    else:
        return jsonify({'message': "Error: One or both users do not exist."})
    

# Route to delete a post by its ID
@app.route('/deletePost/<int:id>', methods=['GET', 'POST'])
def delete_entry(id):
    user = load_user(session.get('customIdToken'))
    post = Post.query.get(id)
    if user and post and (user.username == post.username or user.gccEmail == "DREHEREN20@GCC.EDU" or user.gccEmail == "TZIOVANNISCM21@GCC.EDU"):
        entry_to_delete = Post.query.get_or_404(id)
        db.session.delete(entry_to_delete)
        db.session.commit()
        return 'Entry deleted successfully'
    else:
        return 'Entry not deleted'
    
# Route to delete a comment by its ID
@app.route('/deleteComment/<int:id>', methods=['GET', 'POST'])
def delete_comment(id):
    user = load_user(session.get('customIdToken'))
    comment = Comment.query.get(id)
    postID = comment.postID
    if (user and comment):
        is_comment_owner = (user.username == comment.username) or (user.gccEmail == comment.username)
        post = Post.query.get(postID)
        is_post_owner = post.owner.gccEmail == user.gccEmail if post else False
        if is_comment_owner or is_post_owner:
            entry_to_delete = Comment.query.get_or_404(id)
            db.session.delete(entry_to_delete)
            db.session.commit()
            return 'Entry deleted successfully'
    else:
        return 'Entry not deleted'

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# POST ROUTES (return a redirect) 
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

@app.post("/create/")
def post_meme():
    try:
        body: dict = request.json
        if body["template"]:
            imgData = body["imgData"]
        else:
            imgData = body["imgData"][22:] # TODO: save templates correctly
        thumbnailData = body["thumbnailData"][22:]
        create_tag(body["tag"][:10])
        post_inst = Post(
            spacing = body["spacing"],
            space_arrangement = body["space_arrangement"],
            title = body["title"][:50],
            backImage = "", #updated later
            timePosted = datetime.now(),
            username = body["user"],
            draw = body["drawing"],
            template = body["template"],
            tag = body["tag"][:10]
        )
        db.session.add(post_inst)
        db.session.commit()
        
        if not body["template"]:
            post_inst.backImage = f"/static/images/{post_inst.postID}.png"
            with open(f"./static/images/{post_inst.postID}.png", "wb") as file:
                file.write(base64.b64decode(imgData))
        else:
            post_inst.backImage = body["imgData"]
        db.session.commit()
        
        for tb in body["textboxes"]:
            print(tb["settings"])
            tb_inst = TextBox(
                postID = post_inst.postID,
                alignment = tb["settings"].get("alignment", "center"), # TODO: fix
                fontSize = int(tb["settings"]["font_size"]),
                font = tb["settings"]["font"],
                shadowColor = tb["settings"]["font_shadow"],
                color = tb["settings"]["font_color"],
                decorations = " ".join([str(int(tb["settings"][key])) for key in ["is_bold", "is_italic", "underlined", "is_struckthrough", "has_shadow", "is_capitalized"]]),
                width = tb["width"],
                height = tb["height"],
                top = tb.get("top", "auto"),
                left = tb.get("left", "auto"),
                content = tb["text"][:50]
            )
            db.session.add(tb_inst)
        db.session.commit()

        for image in body["images"]:
            image_inst = ExtraImage(
                postID = post_inst.postID,
                left = image["left"],
                top = image["top"],
                width = image["width"],
                height = image["height"],
                src = image["src"]
            )
            db.session.add(image_inst)
            db.session.commit()
            with open(f"./static/images/extra_images/{image_inst.extraImageId}.png", "wb") as file:
                file.write(base64.b64decode(imgData))
            image_inst.image = f"{image_inst.extraImageId}.png"
            db.session.commit()
        user = load_user(session.get("customIdToken"))
        for f in user.followerList:
            u = f.follower
            create_notification(u.gccEmail, f"{post_inst.title}", f"New post from {user.username}", f"/post/{post_inst.postID}")
        db.session.commit()
        create_thumbnail(thumbnailData, f"./static/images/thumbnails/{post_inst.postID}.png")
        return {"message" : "posted successfully", "postID" : post_inst.postID}, 200
    except Exception as e:
        print(e.with_traceback())
        return {"message": "error in posting", "postID": -1}, 500 

@app.post('/add_user/')
def add_user():
    returnVal = {}
    data = request.get_json()
    username=data['username']
    password=data['backupPasswordHash']
    checkUser = User.query.filter_by(username=username).first()

    if checkUser:
        returnVal['uniqueUsername'] = False
    else:
        returnVal['uniqueUsername'] = True

    if len(password) < 8:
        returnVal['goodPassword'] = False
    else:
        returnVal['goodPassword'] = True

    if not returnVal['uniqueUsername'] or not returnVal['goodPassword']:
        return jsonify(returnVal)
    
    new_user = User(
        username=data['username'],
        gccEmail=data['gccEmail'],
        backupPasswordHash=bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()),
        timesReported=0,
        # Add other fields as needed
    )
    db.session.add(new_user)
    db.session.commit()
    os.mkdir(f"./static/images/users/{data['gccEmail']}")
    return jsonify(returnVal)

# Define a route to handle AJAX requests for creating comments
@app.post('/create_comment/')
def create_comment_route():
    # Get the data from the AJAX request
    print("hi!")
    data = request.json
    content = data.get('content')
    username = data.get('username')
    postID = data.get('postID')
    
    post = Post.query.get(postID)
    if username != post.owner.username:
        create_notification(post.owner.gccEmail, f"{username} has commented on {post.title}", post.title, f"/post/{post.postID}")

    new_comment = Comment(
        content=content,
        postID=postID,
        username=username,
        timePosted = datetime.now().strftime("%m-%d %H:%M")
        # The commentID will be automatically generated due to autoincrement=True
    )
    db.session.add(new_comment)
    db.session.commit()

    # Return a response indicating success
    return {'message': 'Comment created successfully'}, 200

@app.route('/get_num_likes/<int:id>', methods=['GET'])
def get_num_likes(id):
    post = Post.query.get_or_404(id)
    return str(post.numLikes)  # Return the number of likes as a string

# Define a route to handle AJAX requests for creating comments
@app.post('/create_report/')
def create_report_route():
    
    # Get the data from the AJAX request
    data = request.json
    reason = data.get('reason')
    userEmail = data.get('userEmail')
    postID = data.get('postID')

    new_report = Report(
        postID=postID,
        reason = reason,
        userEmail= userEmail
        # The reportID will be automatically generated due to autoincrement=True
    )
    db.session.add(new_report)
    db.session.commit()

    # Return a response indicating success
    return {'message': 'Report created successfully'}, 200

# Define a route to handle AJAX requests for creating likes
@app.post('/create_like/')
def create_like_route():
    # Get the data from the AJAX request
    data = request.json
    userEmail = data.get('userEmail')
    positive = data.get('positive')
    postID = data.get('postID')

    # Check if there is an existing like by the same user for the same post
    existing_like = Like.query.filter_by(postID=postID, userEmail=userEmail).first()

    if existing_like:
        # Check if the existing like has the same polarity
        if existing_like.positive == positive:
            # Remove both likes if they have the same polarity
            db.session.delete(existing_like)
            post = Post.query.filter_by(postID=postID).first()
            if positive:
                post.numLikes -= 1
            else:
                post.numLikes += 1
            db.session.commit()
            return {'message': 'Existing like removed due to same polarity'}, 200
        else:
            # Switch the polarity of the existing like if they have different polarities
            existing_like.positive = not existing_like.positive
            post = Post.query.filter_by(postID=postID).first()
            if not positive:
                post.numLikes -= 2
            else:
                post.numLikes += 2
            db.session.commit()
            return {'message': 'Existing like polarity switched'}, 200
    else:
        # Create a new like if there's no existing like
        new_like = Like(
            postID=postID,
            userEmail=userEmail,
            positive=positive
        )

        db.session.add(new_like)
        post = Post.query.filter_by(postID=postID).first()
        if positive:
            post.numLikes += 1
        else:
            post.numLikes -= 1
        db.session.commit()

    # Return a response indicating success
    return {'message': 'Like created successfully'}, 200


@app.post('/create_bookmark/')
def create_bookmark_route():
    # Get the data from the AJAX request
    data = request.json
    userEmail = data.get('userEmail')
    postID = data.get('postID')

    # Check if there's an existing bookmark by the same user for the same post
    existing_bookmark = Bookmark.query.filter_by(postID=postID, userEmail=userEmail).first()

    if existing_bookmark:
        # If an identical bookmark exists, return without making a new one
        db.session.delete(existing_bookmark)
        db.session.commit()
        return {'message': 'Identical bookmark already exists'}, 200
    else:
        # Otherwise, create a new bookmark
        new_bookmark = Bookmark(
            postID=postID,
            userEmail=userEmail,
        )
        db.session.add(new_bookmark)
        db.session.commit()

        # Return a response indicating success
        return {'message': 'Bookmark created successfully'}, 200


# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# QUERY/API ROUTES (return a json object)
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# returns a JSON object containing the post ids of the most recent DEFAULT_POSTS_LOADED posts
# start_id is an optional field (after question mark), specifies the post id to start from
#       the purpose of this is to allow loading posts once the page runs out
# count is an optional field (after question mark), specifies how many posts to load, defaults to DEFAULT_POSTS_LOADED
# example: /API/get_by_recent?start_id=10&count=30 will load up to 30 memes made before id 10
@app.get("/API/get_by_recent/")
def get_recent():
    start_id = int(request.args.get('start_id', -1))
    count = int(request.args.get('count', DEFAULT_POSTS_LOADED))
    username = request.args.get('username', None)
    recent = Post.query
    
    if start_id != -1:
        recent = recent.filter(Post.postID<=start_id)
    if username != None:
        recent = recent.filter(Post.username==username)
    
    recent = recent.order_by(Post.postID.desc()) \
                        .limit(count) \
                        .all()
    
    return [p.render_json() for p in recent]

@app.get("/API/taglist/")
def get_taglist():
    ret = Tag.query.all()
    return [t.tag for t in ret]

@app.get("/API/get_followed_posts/<string:gccEmail>")
def get_followed_posts(gccEmail):
    start_id = int(request.args.get('start_id', -1))
    count = int(request.args.get('count', DEFAULT_POSTS_LOADED))
    follows = User.query.get_or_404(gccEmail).followList
    follows = [f.user2 for f in follows]
    recent = Post.query
    #after this
    if start_id != -1:
        recent = recent.filter(Post.postID<=start_id)
    recent = recent.filter(Post.userEmail.in_(follows))
    
    recent = recent.order_by(Post.postID.desc()) \
                        .limit(count) \
                        .all()
    
    return [p.render_json() for p in recent]

@app.get("/API/get_liked/<string:gccEmail>")
def get_liked(gccEmail):
    start_id = int(request.args.get('start_id', -1))
    count = int(request.args.get('count', DEFAULT_POSTS_LOADED))
    likes = User.query.get_or_404(gccEmail).likeList
    if start_id != -1:
        likes = list(filter(lambda l: l.likeID <= start_id, likes))
    likes = list(filter(lambda l: l.positive == True, likes))
    likes.sort(key=lambda l: l.likeID, reverse=True)
    likes =  likes[0:count] #reduce to count or less elements
    return [l.post.render_json() for l in likes]

@app.get("/API/get_bookmarked/<string:gccEmail>")
def get_bookmarked(gccEmail):
    start_id = int(request.args.get('start_id', -1))
    count = int(request.args.get('count', DEFAULT_POSTS_LOADED))
    bookmarks = User.query.get_or_404(gccEmail).bookmarkList
    if start_id != -1:
        bookmarks = list(filter(lambda b: b.bookmarkID <= start_id, bookmarks))
    bookmarks.sort(key=lambda b: b.bookmarkID, reverse=True)
    bookmarks =  bookmarks[0:count] #reduce to count or less elements
    return [l.post.render_json() for l in bookmarks]

@app.get("/API/get_notifications/")
def get_notifications():
    gccEmail = session.get('customIdToken')
    notifications = Notification.query.filter_by(userEmail=gccEmail).all()
    return {"logged_in": gccEmail != None, "list": [n.to_json() for n in notifications]}

# posts to this route will contain this json:
# {"id" : notification id}
@app.get("/API/delete_notification/<int:id>")
def delete_notifications(id):
    notif = Notification.query.get(id)
    user = load_user(session.get('customIdToken'))
    
    if notif.userEmail == user.gccEmail:
        entry_to_delete = Notification.query.get_or_404(id)
        db.session.delete(entry_to_delete)
        db.session.commit()
        return ""
    else:
        return ""

# max_likes is an optional field (after question mark), specifies the like count to start from (default: no filter)
# timestamp is an optional field (after question mark), determines the time period to load likes from (default most recent)
# count is an optional field (after question mark), specifies how many posts to load (default: DEFAULT_POSTS_LOADED)
# example: /API/get_by_likes?max_likes=10&count=30 
#   will load up to 30 memes
#   memes chosen from those with 10 or less likes
#   using the default timeslot (most recent)

@app.get("/API/get_by_likes/")
def get_likes():
    #TODO: accept the list of other posts with an equal amount of likes that already rendered
    #TODO: consider flooring or rounding time.time to prevent floating point errors
    max_likes = int(request.args.get('max_likes', -1))
    count = request.args.get('count', DEFAULT_POSTS_LOADED)
    timestamp = float(request.args.get('timestamp', math.floor(time.time())))
    # username = request.args.get('username', None)
        
    field = None
    #within earliest timeslot?
    if not update_times[0] == 0 and timestamp >= update_times[0] and timestamp < update_times[1]:
        field = Post.numLikesD3
    #within middle timeslot?
    elif not update_times[1] == 0 and timestamp >= update_times[1] and timestamp < update_times[2]:
        field = Post.numLikesD2
    #later than most recent timeslot
    elif timestamp >= update_times[2]:
        field = Post.numLikesD1
    #it's not within any current timeslot, say it's outdated
    else:
        return {
            'outdated': True,
            'timestamp': timestamp,
            'posts': []
        }
        
    
    recent = Post.query
    if max_likes != -1:
        recent = recent.filter(field<=max_likes)
    # if username != None:
    #     recent = recent.filter(Post.username==username)
    
    recent = recent.order_by(field.desc()) \
                        .limit(count) \
                        .all()
    
    return {
        'outdated': False,
        'timestamp': timestamp,
        'posts': [p.render_json() for p in recent]
    }

@app.route('/search/', methods=['GET'])
def search():
    search_query = request.args.get('query', default=None)
    tag = request.args.get('tag', default=None)
    matching_users = User.query
    matching_posts = Post.query
    
    if search_query != None:
        matching_users = matching_users.filter((User.username.ilike(f'%{search_query}%')) | (User.gccEmail.ilike(f'%{search_query}%')))
        matching_posts = matching_posts.filter(Post.title.ilike(f'%{search_query}%'))
    
    if tag != None:
        matching_posts = matching_posts.filter_by(tag=tag)
        matching_posts = matching_posts.limit(20).all()
        post_results = [post.search_result_json() for post in matching_posts]
        return jsonify({'users': [], 'posts': post_results})

    matching_users = matching_users.limit(10).all()
    matching_posts = matching_posts.limit(20).all()
    # Construct JSON response
    user_results = [user.search_result_json() for user in matching_users]
    post_results = [post.search_result_json() for post in matching_posts]
    return jsonify({'users': user_results, 'posts': post_results})
    
@app.route('/check_user', methods=['GET'])
def check_user():
    gccEmail = request.args.get('gccEmail')

    user = User.query.filter_by(gccEmail=gccEmail).first()
    
    if user:
        return jsonify({'exists': True, 'username': user.username})
    else:
        return jsonify({'exists': False, 'username': ""})
    
@app.get('/checkUsername/')
def checkUsername():
    username = request.args.get('username')

    user = User.query.filter_by(username=username).first()
    
    if user:
        return jsonify({'exists': True, 'username': user.username})
    else:
        return jsonify({'exists': False, 'username': ""})
    
@app.get('/getUsername/')
def getUsername():
    gccEmail = request.args.get('gccEmail')
    user = User.query.filter_by(gccEmail=gccEmail).first()
    if user:
        return user.username
    else:
        return ""
    
@app.route('/profile_json/<string:gccEmail>')
def get_profile_json(gccEmail):
    user = User.query.get_or_404(gccEmail)
    profile_data = user.profile_json()
    return jsonify(profile_data)

@app.get('/getUserInfo/')
def getUser():
    userEmail = session.get('customIdToken')
    if userEmail:
        user = User.query.get(userEmail)
        if user:
            userInfo = user.get_user_info()
            userInfo['loggedIn'] = True
            return userInfo
        
    return {'loggedIn': False}
    
@app.get('/login/')
def login():
    email = request.args.get('email')
    user = User.query.get(email)
    if user:
        session['customIdToken'] = user.gccEmail
        return {'success': True}
    else:
        return {'success': False}
    
@app.get('/logout/')
def logout():
    session.pop('customIdToken', None)
    return {}
    
@app.post('/loginExisting/')
def loginExisting():
    data = request.get_json()
    name=data['username']
    password=data['password']

    user = User.query.filter_by(username=name).first()

    if user:
        return jsonify({'exists': bcrypt.checkpw(password.encode('utf-8'), user.backupPasswordHash), 'email': user.gccEmail})
    else:
        return jsonify({'exists': False, 'email': ""})


# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# MAIN
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
if __name__ == "__main__":
    app.run(debug = True)
