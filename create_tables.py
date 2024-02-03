# import sqlite3

# conn = sqlite3.connect('database.sqlite3')
# print("Connect to database successfully")

# conn.execute('CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, email TEXT, passwordHash TEXT, reputationID INTEGER, userSettingsID INTEGER,  FOREIGN KEY (reputationID) REFERENCES userReputations (reputationID) ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY (userSettingsID) REFERENCES userSettings (userSettingsID) ON DELETE CASCADE ON UPDATE CASCADE)')
# conn.execute('CREATE TABLE IF NOT EXISTS userReputations (reputationID INTEGER PRIMARY KEY, timesReported INTEGER, numReports INTEGER)')
# conn.execute('CREATE TABLE IF NOT EXISTS userSettings (userSettingsID INTEGER PRIMARY KEY, pfp TEXT, banner TEXT)')
# conn.execute('CREATE TABLE IF NOT EXISTS posts (postID INTEGER PRIMARY KEY, spacing INTEGER, title TEXT, backImage TEXT, username TEXT, FOREIGN KEY (username) REFERENCES users (username) ON DELETE CASCADE ON UPDATE CASCADE)')
# conn.execute('CREATE TABLE IF NOT EXISTS extraPostImages (imageID INTEGER PRIMARY KEY, url TEXT, size REAL, position TEXT, orientation TEXT, postID INTEGER, FOREIGN KEY (postID) REFERENCES posts (postID) ON DELETE CASCADE ON UPDATE CASCADE)')
# conn.execute('CREATE TABLE IF NOT EXISTS textBoxes (textBoxID INTEGER, orientation TEXT, shadowColor TEXT, color TEXT, position TEXT, font TEXT, fontSize REAL, content TEXT, postID INTEGER, FOREIGN KEY (postID) REFERENCES posts (postID) ON DELETE CASCADE ON UPDATE CASCADE)')
# conn.execute('CREATE TABLE IF NOT EXISTS comments (commentID INTEGER PRIMARY KEY, username TEXT, postID INTEGER, content TEXT, timePosted TEXT, FOREIGN KEY (username) REFERENCES users (username) ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY (postID) REFERENCES posts (postID) ON DELETE CASCADE ON UPDATE CASCADE)')


# conn.execute('DROP TABLE IF EXISTS comments')
# conn.execute('DROP TABLE IF EXISTS textBoxes')
# conn.execute('DROP TABLE IF EXISTS extraPostImages')
# conn.execute('DROP TABLE IF EXISTS posts')
# conn.execute('DROP TABLE IF EXISTS userSettings')
# conn.execute('DROP TABLE IF EXISTS userReputations')
# conn.execute('DROP TABLE IF EXISTS users')



# print("Created table successfully!")
# conn.close