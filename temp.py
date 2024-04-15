import os

pfp = "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
if os.path.isfile("static/images/users/u1@gcc.edu/pfp.png"):
    pfp = "/static/images/users/u1@gcc.edu/pfp.png"

print(pfp)