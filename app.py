import os, sys, hashlib, json
from flask import Flask, session, render_template, url_for, redirect, request
from flask_sqlalchemy import SQLAlchemy
from forms import *
from sqlalchemy import Integer, String, JSON, Boolean, SQLAlchemy

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

    #  backImage TEXT, username TEXT, FOREIGN KEY (username) REFERENCES users (username) ON DELETE CASCADE ON UPDATE CASCADE)')
    class Post(db.Model):
        __tablename__ = 'Posts'
        postID = db.Column(db.Integer, primary_key=True)
        spacing = db.Column(db.Integer, nullable=False)
        title = db.Column(db.Unicode, nullable=False)
        backImage = db.Column(db.Unicode, nullable=False)
        username = db.Column(db.Unicode, nullable=False)
        username = db.relationship('Users', backref='username')
        def __str__(self):
            return f"Post(title ={self.title}, code={self.postID})"
        def __repr__(self):
            return f"Post({self.postID})"


    # Create posts  to be inserted
    post1 = Post(postID= 1, spacing = 0 , title="excel is not a valid database!!!",
                 backImage = "4 rules.png", username = "Sean Queary Lanard")
    post2 = Post(postID= 2, spacing = 0 , title="get gimbal locked idiot",
                 backImage = "Gimbal_Lock_Plane.gif", username = "Locke Gimbaldi")
    post3 = Post(postID= 3, spacing = 0 , title="why must I do this?",
                 backImage = "Stop doing databases.png", username = "The Zhangster")


    # Add all of these records to the session and commit changes
    db.session.add_all((post1, post2, post3))
    db.session.commit()


#define db classes and tables here

with app.app_context():
    db.create_all()

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# GET ROUTES (return an html document)
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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

@app.get("/post/")
def get_post():
    return render_template("post.html")

@app.get("/profile/")
def get_profile():
    return render_template("profile.html")

@app.get("/settings/")
def get_settings():
    return render_template("settings.html")


# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# POST ROUTES (return a redirect)
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# QUERY/API ROUTES (return a json object)
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# MAIN
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
if __name__ == "__main__":
    app.run(debug = True)