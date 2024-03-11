from datetime import datetime, timedelta
import os, sys, hashlib, json
import string
import secrets

from flask import Flask, session, render_template, url_for, redirect, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from forms import SettingsForm
from sqlalchemy import Integer, String, JSON, Boolean
from sqlalchemy import text
from apscheduler.schedulers.background import BackgroundScheduler
from PIL import Image
from io import BytesIO
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
DEFAULT_POSTS_LOADED = 30
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
    print(update_times)

def create_follow(u1Email, u2Email):
    with app.app_context():
        follow = Follow(user1 = u1Email, user2 = u2Email)
        db.session.add(follow)
        db.session.commit()
        
# takes in a Pillow Image object and returns the thumbnail version
def create_thumbnail(image_path, dimensions = (400, 400)):
    img = Image.open(image_path)
    img.thumbnail(dimensions)
    return img

# TODO: call this directly after creating a post
def save_thumbnail(post):
    create_thumbnail(f"static/images/{post.backImage}")     \
        .save(f"static/images/thumbnails/{post.postID}.png")
    
#from https://stackoverflow.com/questions/7877282/how-to-send-image-generated-by-pil-to-browser
#potentially necessary in future, but not at the moment
# def serve_pil_image(pil_img):
#     img_io = BytesIO()
#     pil_img.save(img_io, 'PNG', quality=70)
#     img_io.seek(0)
#     return send_file(img_io, mimetype='image/jpeg')

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# DATABASE SETUP
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

with app.app_context():
    db.drop_all()
    db.create_all()

#define db classes and tables here

class User(db.Model) :
    __tablename__ = 'Users'
    username = db.Column(db.String, unique = True)
    gccEmail = db.Column(db.String, primary_key = True)
    
    bio = db.Column(db.String, nullable = True)
    
    backupEmail = db.Column(db.String, nullable = True)
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
    
    def postlist_to_json(self):
        return {
            "posts": [p.render_json() for p in self.postList]
		}

class Report(db.Model) :
    __tablename__ = 'Reports'
    reportID = db.Column(db.Integer, primary_key = True)
    userEmail = db.Column(db.String, db.ForeignKey('Users.gccEmail'))
    postID = db.Column(db.Integer, db.ForeignKey('Posts.postID'))
    reason = db.Column(db.String, nullable = False)
    
class Notification(db.Model) :
    __tablename__ = 'Notifications'
    NotificationID = db.Column(db.Integer, primary_key = True)
    userEmail = db.Column(db.String, db.ForeignKey('Users.gccEmail'))
    title = db.Column(db.String)
    text = db.Column(db.String)
    # format: mm/dd/yy hh:mm AM/PM
    # ex: 3/7/24 5:30 AM
    time = db.Column(db.String)
    def to_json(self):
        return {
            "title": self.title,
            "text" : self.text,
            "time" : self.time
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
    user1 = db.Column(db.String, db.ForeignKey('Users.gccEmail'), primary_key=True)
    user2 = db.Column(db.String, db.ForeignKey('Users.gccEmail'), primary_key=True)
    # advanced backref because of 2 foreign keys from same table
    follower = db.relationship('User', back_populates='followList', foreign_keys=[user1])

class Post(db.Model) :
    __tablename__ = 'Posts'
    postID = db.Column(db.Integer, primary_key = True, autoincrement = True)
    spacing = db.Column(db.Integer, nullable = False)
    title = db.Column(db.String, nullable = True)
    backImage = db.Column(db.String, nullable = False)
    timePosted = db.Column(db.String)#, nullable = False)
    username = db.Column(db.String, db.ForeignKey('Users.username'))
    numLikes = db.Column(db.Integer, default=0)
    numLikesD1 = db.Column(db.Integer) # [0,10) min ago
    numLikesD2 = db.Column(db.Integer) # [10,20) min ago
    numLikesD3 = db.Column(db.Integer) # [20,30) min ago

    # objects that use this class for a foreign key, allows access to list
    # also allows the classes that use the foreign key to use <class>.parentPost
    comments = db.relationship('Comment', backref='parentPost')
    textBoxes = db.relationship('TextBox', backref='parentPost')
    reportsList = db.relationship('Report', backref='post')
    likeUsers = db.relationship('Like', backref='post')
    bookmarkUsers = db.relationship('Bookmark', backref='post')

    def remix_json(self):
        return {
            "spacing": self.spacing,
            "title": "Remix of " + self.title,
            "backImage": self.backImage,
            "textBoxes": [t.to_json() for t in self.textBoxes],
        }
    def render_json(self):
        return {
            "id": self.postID,
            "title": self.title,
            "thumbnail": f"thumbnails/{self.postID}.png",
            "username": self.username,
            "numLikes": self.numLikes,
        }
    def page_json(self):
        return {
            "id": self.postID,
            "title": self.title,
            "username": self.username,
            "backImage": self.backImage,#TODO: figure out if page is re-creating meme from text box and back image, or flattened image
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
            "username": self.username,
            "numLikes": self.numLikes,
            "comments": [c.to_json() for c in self.comments],
            "textBoxes": [t.to_json() for t in self.textBoxes],
        }

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
    
    def to_json(self):
	    return {
			"id": self.textBoxID,
			"orientation": self.orientation,
			"shadowColor": self.shadowColor,
			"color": self.color,
			"position": self.position,
            "font": self.font,
            "fontSize": self.fontSize,
            "content": self.content,
            "parentPost": self.postID,
		}

class Comment(db.Model) :
    __tablename__ = 'Comments'
    commentID = db.Column(db.Integer, primary_key = True)
    content = db.Column(db.String, nullable = False)
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
    db.drop_all()
    db.create_all()

        # Create posts  to be inserted
    u1 = User(username="u1", gccEmail = "u1@gcc.edu", backupPasswordHash = bcrypt.hashpw("u1123".encode('utf-8'), bcrypt.gensalt()))
    u2 = User(username="u2", gccEmail = "u2@gcc.edu", backupPasswordHash = bcrypt.hashpw("u2123".encode('utf-8'), bcrypt.gensalt()))
    u3 = User(username="u3", gccEmail = "u3@gcc.edu", backupPasswordHash = bcrypt.hashpw("u3123".encode('utf-8'), bcrypt.gensalt()))
    post1 = Post(postID= 10, spacing = 0 , title="excel is not a valid database!!!",
                 backImage = "4 rules.png", owner = u2, numLikes=10)
    post2 = Post(postID= 20, spacing = 0 , title="get gimbal locked idiot",
                 backImage = "Gimbal_Lock_Plane.gif", owner = u1, numLikes=1)
    post3 = Post(postID= 30, spacing = 0 , title="why must I do this?",
                 backImage = "Stop doing databases.png", owner = u3, numLikes=100)
    follow12 = Follow(follower = u1, user2 = "u2@gcc.edu")
    follow13 = Follow(follower = u1, user2 = "u3@gcc.edu")
    like11 = Like(user=u1, postID=10)
    like12 = Like(user=u1, postID=30)
    like13 = Like(user=u1, postID=20, positive=False)
    bm11 = Bookmark(user=u1, postID=10)
    bm12 = Bookmark(user=u1, postID=30)
    bm13 = Bookmark(user=u1, postID=20)

    # Add all of these records to the session and commit changes
    db.session.add_all((u1,u2,u3))
    db.session.add_all((post1, post2, post3))
    db.session.add_all((like11,like12,like13))
    db.session.add_all((bm11,bm12,bm13))
    db.session.commit()

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
    return render_template("create.html", templates = [url_for('static', filename = f"thumbnails/{file}") for file in os.listdir("./static/thumbnails")])

@app.get("/home/")
def get_home():
    # gets the most recent posts and sends them to the frontend
    recent = Post.query.order_by(Post.postID.desc()) \
                        .limit(DEFAULT_POSTS_LOADED) \
                        .all()
    return render_template("home.html", posts=[p.render_json() for p in recent])

@app.get("/signin-oidc/")
def get_login():
    return render_template("signin-oidc.html")


@app.get("/post/<int:post_id>/")
def get_post(post_id):
    # get the post with the id and pass the relevant data along to the frontend
    # just plain get might work better, not sure, but it would return None with a failure rather than aborting
    post = Post.query.get_or_404(post_id)
    return render_template("post.html", post=post.to_json())

@app.get("/profile/")
@app.get("/profile/<int:user_id>/")
def get_profile(user_id = -1):
    # if(user_id > -1) # load a different person's profile
    return render_template("profile.html")

# need to get their current settings, but also needs to work if someone navigates by back arrow/typing in /settings
@app.get("/settings/")
# @login_required
def get_settings():
    form = SettingsForm()
    return render_template('settings.html', form=form)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# POST ROUTES (return a redirect)
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

@app.post("/create/")
def post_meme():
    body = request.json
    data = body['imgData'][23:]
    id = len(Post.query.all()) + 1
    # TODO save under unique name somehow (based on post ID I would guess)
    with open(f"./static/images/{id}.jpeg", "wb") as file:
         file.write(base64.b64decode(data))
    post_inst = Post(
        spacing = 0, # TODO on sprint 1
        title = data['title'],
        backImage = f"./static/images/{id}.jpeg",
        userEmail = "Carnge Melon Baller"
    )
    return "hello world"

@app.post("/login/")
def post_login():
    return ""

@app.post('/add_user')#, methods=['POST'])
def add_user():
    returnVal = {}
    data = request.get_json()
    username=data['username']
    password=data['backupPasswordHash']
    checkUser = User.query.filter_by(username=username).first()
    print(username + " " + password)
    if checkUser:
        returnVal['uniqueUsername'] = False
    else:
        returnVal['uniqueUsername'] = True

    if len(password) < 8:
        returnVal['goodPassword'] = False
    else:
        returnVal['goodPassword'] = True

    print(returnVal)

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
    return jsonify(returnVal)

@app.get("/follow/<string:u1Email>/<string:u2Email>")
def follow(u1Email, u2Email):
    create_follow(u1Email, u2Email)
    return "success"

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
    # print(str(start_id) + " " + str(count))
    
    if start_id != -1:
        recent = recent.filter(Post.postID<=start_id)
    if username != None:
        recent = recent.filter(Post.username==username)
    
    recent = recent.order_by(Post.postID.desc()) \
                        .limit(count) \
                        .all()
    
    return [p.render_json() for p in recent]

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

@app.get("/API/get_notifications/<string:gccEmail>")
def get_notifications(gccEmail):
    notifications = Notification.query.filter_by(userEmail=gccEmail).all()
    return [l.post.render_json() for l in notifications]

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
        # print("slot 0")
        field = Post.numLikesD3
    #within middle timeslot?
    elif not update_times[1] == 0 and timestamp >= update_times[1] and timestamp < update_times[2]:
        # print("slot 1")
        field = Post.numLikesD2
    #later than most recent timeslot
    elif timestamp >= update_times[2]:
        # print("slot 2")
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

@app.route('/search', methods=['GET'])
def search():
    search_query = request.args.get('query')

    # Search for users by username
    matching_users = User.query.filter(User.username.ilike(f'%{search_query}%')).all()

    # Search for posts by title
    matching_posts = Post.query.filter(Post.title.ilike(f'%{search_query}%')).all()

    # Construct JSON response
    user_results = [{'username': user.username} for user in matching_users]
    post_results = [{'title': post.title} for post in matching_posts]

    return jsonify({'users': user_results, 'posts': post_results})
    
@app.route('/check_user', methods=['GET'])
def check_user():
    gccEmail = request.args.get('gccEmail')

    # user = User.query.get_or_404(gccEmail);
    user = User.query.filter_by(gccEmail=gccEmail).first()
    
    if user:
        return jsonify({'exists': True, 'username': user.username})
    else:
        return jsonify({'exists': False, 'username': ""})
    
@app.get('/checkUsername')
def checkUsername():
    username = request.args.get('username')

    user = User.query.filter_by(username=username).first()
    
    if user:
        return jsonify({'exists': True, 'username': user.username})
    else:
        return jsonify({'exists': False, 'username': ""})
    
@app.get('/getUsername')
def getUsername():
    gccEmail = request.args.get('gccEmail')
    print(User.query.filter_by(gccEmail=gccEmail).first().username)
    return User.query.filter_by(gccEmail=gccEmail).first().username

    
@app.get('/loginExisting')
def loginExisting():
    name = request.args.get('username')
    password = request.args.get('password')

    user = User.query.filter_by(username=name).first()#, backupPasswordHash=password

    # if bcrypt.checkpw(password, user.backupPasswordHash):

    if user:
        return jsonify({'exists': bcrypt.checkpw(password.encode('utf-8'), user.backupPasswordHash), 'email': user.gccEmail})
    else:
        return jsonify({'exists': False, 'email': ""})
    
@app.get('/genResetToken')
def genResetToken():
    name = request.args.get('username')
    self = User.query.filter_by(username=name).first()
    if self:
        token_length = 32
        expiration_minutes = 60

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
    
@app.get('/validate_reset_token')
def validate_reset_token():
    token = request.args.get('token')
    expiration_minutes = 60

    # Split token and expiration timestamp
    token_parts = token.split('~')
    # if len(token_parts) != 2:
    #     return False

    username, token, expiration_timestamp = token_parts

    # Convert expiration timestamp to datetime
    expiration_time = datetime.fromtimestamp(float(expiration_timestamp))

    # Check if token has expired
    if datetime.utcnow() > expiration_time:
        return jsonify({'valid': False})

    return jsonify({'valid': True})

@app.get('/sendResetEmail')
def sendResetEmail():
    username = request.args.get('username')
    token = request.args.get('token')
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'success': False})
    
    user.passwordResetToken = token
    db.session.commit()

    # Email configuration
    sender_email = 'svc_CS_D2M@gcc.edu'
    receiver_email = user.gccEmail
    password = 'Laq86937'

    # Create message container
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = 'D2M Password Reset Request'

    resetLink = 'http://localhost/resetPassword?token=' + token
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
            return jsonify({'success': True})
    except smtplib.SMTPException as e:
        print("SMTP error:", e)
        return jsonify({'success': False, 'error': str(e)})
    except TimeoutError:
        print("SMTP connection timed out")
        return jsonify({'success': False, 'error': 'SMTP connection timed out'})
    except Exception as e:
        print("Other error:", e)
        return jsonify({'success': False, 'error': str(e)})

@app.get('/setPassword')
def setPassword():
    token = request.args.get('token')
    newPassword = request.args.get('password')
    expiration_minutes = 60

    # Split token and expiration timestamp
    token_parts = token.split('~')

    username, secretString, expiration_timestamp = token_parts

    user = User.query.filter_by(username=username).first()

    if not user or token != user.passwordResetToken:
        return jsonify({'success': False})
    
    user.backupPasswordHash = bcrypt.hashpw(newPassword.encode('utf-8'), bcrypt.gensalt())
    db.session.commit()

    return jsonify({'success': True, 'email': user.gccEmail})

def create_comment(commentData, u2Email):
    with app.app_context():
       
        db.session.add(follow)
        db.session.commit()

# from https://stackoverflow.com/questions/7877282/how-to-send-image-generated-by-pil-to-browser
# with minor adjustments to make it work here
# no longer necessary, but the code is helpful to have around
# @app.get('/API/thumbnail/<int:postID>')
# def get_thumbnail(postID):
#     post = Post.query.get_or_404(postID)
#     img = create_thumbnail(f"static/images/{post.backImage}")
#     return serve_pil_image(img)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# MAIN
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
if __name__ == "__main__":
    app.run(debug = True)
