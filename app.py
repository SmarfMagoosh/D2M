import os, sys, hashlib, json
from flask import Flask, session, render_template, url_for, redirect, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from forms import *
from sqlalchemy import Integer, String, JSON, Boolean
import base64

"""
set FLASK_APP=app.py
python -m flask run --host=0.0.0.0 --port=80
"""


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

with app.app_context():
    db.drop_all()
    db.create_all()

#define db classes and tables here

class User(db.Model) :
    __tablename__ = 'Users'
    username = db.Column(db.String, primary_key = True)
    email = db.Column(db.String, nullable = False)
    passwordHash = db.Column(db.String, nullable = False)
    reputationID = db.Column(db.Integer)#, db.ForeignKey('UserReputations.reputationID'))
    userSettingsID = db.Column(db.Integer)#, db.ForeignKey('UserSettings.userSettingsID'))
    
    # classes that use this class for a foreign key, allows access to list
    # also allows the classes that use the foreign key to use <class>.owner
    postList = db.relationship('Post', backref='owner')
    postList = db.relationship('Comment', backref='owner')

class Report(db.Model) :
    __tablename__ = 'Reports'
    reportID = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String, db.ForeignKey('Users.username'))
    postID = db.Column(db.Integer, db.ForeignKey('Posts.postID'))
    reason = db.Column(db.String, nullable = False)

class Post(db.Model) :
    __tablename__ = 'Posts'
    postID = db.Column(db.Integer, primary_key = True, autoincrement = True)
    spacing = db.Column(db.Integer, nullable = False)
    title = db.Column(db.String, nullable = True)
    backImage = db.Column(db.String, nullable = False) # TODO check if we don't need this perhaps
    username = db.Column(db.String, db.ForeignKey('Users.username'))
    numLikes = db.Column(db.Integer, default=0)
    numLikesd1 = db.Column(db.Integer) # [0,10) min ago
    numLikesd2 = db.Column(db.Integer) # [10,20) min ago
    numLikesd3 = db.Column(db.Integer) # [20,30) min ago

    # objects that use this class for a foreign key, allows access to list
    # also allows the classes that use the foreign key to use <class>.parentPost
    extraImages = db.relationship('ExtraPostImage', backref='parentPost')
    comments = db.relationship('Comment', backref='parentPost')
    textBoxes = db.relationship('TextBox', backref='parentPost')
    reportsList = db.relationship('Report', backref='post')

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
            "thumbnail": self.backImage, #TODO: reference to the thumbnail somehow similar to f"thumbnails/${self.postID}"
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
            "extraImages": [i.to_json() for i in self.extraImages],
            "comments": [c.to_json() for c in self.comments],
            "textBoxes": [t.to_json() for t in self.textBoxes],
		}

class ExtraPostImage(db.Model) :
    __tablename__ = 'ExtraPostImages'
    imageID = db.Column(db.Integer, primary_key = True)
    url = db.Column(db.String, nullable = False)
    size = db.Column(db.Float, nullable = False)
    postition = db.Column(db.String, nullable = False)
    orientation = db.Column(db.String, nullable = False)
    postID = db.Column(db.Integer, db.ForeignKey('Posts.postID'))
    
    def to_json(self):
	    return {
			"imageID": self.imageID,
			"url": self.url,
			"size": self.size,
			"position": self.postition,
			"orientation": self.orientation,
            "parentPost": self.postID,
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
			"owner": self.username,
			"parentPost": self.postID,
		}


with app.app_context():
    db.drop_all()
    db.create_all()

        # Create posts  to be inserted
    post1 = Post(postID= 10, spacing = 0 , title="excel is not a valid database!!!",
                 backImage = "4 rules.png", username = "Sean Queary Lanard")
    post2 = Post(postID= 20, spacing = 0 , title="get gimbal locked idiot",
                 backImage = "Gimbal_Lock_Plane.gif", username = "Locke Gimbaldi")
    post3 = Post(postID= 30, spacing = 0 , title="why must I do this?",
                 backImage = "Stop doing databases.png", username = "The Zhangster")


    # Add all of these records to the session and commit changes
    db.session.add_all((post1, post2, post3))
    db.session.commit()


# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# GET ROUTES (return an html document)
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# TODO: most of these routes need a way of knowing who the current logged in user is, though that will probably be handled on that end
# actually seems like the session variable will be necessary
@app.get("/")
def index():
    return redirect(url_for("get_home"))

@app.get("/create/")
def get_create():
    return render_template("create.html")

@app.get("/home/")
def get_home():
    # gets the most recent 30 posts hopefully and sends them to the frontend
    recent = Post.query.order_by(Post.postID.desc()) \
                        .limit(30) \
                        .all()
    return render_template("home.html", posts=[p.to_json() for p in recent])

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
def get_settings():
    return render_template("settings.html")


# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# POST ROUTES (return a redirect)
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

@app.post("/create/")
def post_meme():
    body = request.json
    print(body)
    # data = body['imgData'][23:]
    # id = len(Post.query.all()) + 1
    # # TODO save under unique name somehow (based on post ID I would guess)
    # with open(f"./static/images/{id}.jpeg", "wb") as file:
    #      file.write(base64.b64decode(data))
    # post_inst = Post(
    #     spacing = 0, # TODO on sprint 1
    #     title = data['title'],
    #     backImage = f"./static/images/{id}.jpeg",
    #     username = "Carnge Melon Baller"
    # )
    return "hello world"

@app.post("/login/")
def post_login():
    return ""

@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.get_json()
    new_user = User(
        username=data['username'],
        email=data['email'],
        passwordHash=data['passwordHash'],
        # Add other fields as needed
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User added successfully'}), 201

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# QUERY/API ROUTES (return a json object)
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# returns a JSON object containing the post ids of the most recent (TODO:number) posts
# start_id is an optional field (after question mark), specifies the post id to start from
#       this is used if the user approaches the end of the pre-loaded content on the page to get posts below the final one
# count is an optional field (after question mark), specifies how many posts to load, defaults to 30
@app.get("/API/recent/")
def get_recent():
    start_id = int(request.args.get('start_id', -1))
    count = request.args.get('count', 30)
    recent = ''
    print(str(start_id) + " " + str(count))
    if start_id == -1:
        recent = Post.query.order_by(Post.postID.desc()) \
                        .limit(count) \
                        .all()
    else:
        recent = Post.query.filter(Post.postID<start_id) \
                        .order_by(Post.postID.desc()) \
                        .limit(count) \
                        .all()
    return [p.to_json() for p in recent]

# returns a JSON object containing all of the data necessary to reproduce the post specified
# @app.get("/API/getpostdata/<int:post_id>/")
# def get_post(post_id):
    # return json with image link, text boxes + box settings, filters, extra image links/postitions/etc., number of likes
    # return

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# MAIN
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
if __name__ == "__main__":
    app.run(debug = True)