import praw
import sqlite3
from time import sleep

CHARACTER_LIMIT = 8300000 # based on how much of Bible to be used
DB_FILE = 'atheism.db'
BREAK_LENGTH = 5

def create_comments_table(cursor):
	'''Resets the comments table.'''
	cursor.execute('CREATE TABLE IF NOT EXISTS comments (id TEXT, t TEXT)')

def get_past_chars():
	'''Gets the total number of chars from all comments currently in database.'''
	total_chars = 0
	cursor.execute('SELECT t FROM comments')
	for result in cursor.fetchall():
		total_chars += len(result[0])
	return total_chars

def add_comment(cursor, cmt):
	'''Adds a comment to the database if not already there.'''
	cursor.execute('SELECT COUNT(*) FROM comments WHERE id=?', (cmt.id, ))
	results = cursor.fetchone()
	if results[0] == 0: # doesn't exist -- add it
		cursor.execute('INSERT INTO comments VALUES (?, ?)', (cmt.id, cmt.body))
		return True
	return False

if __name__ == '__main__':
	conn = sqlite3.connect(DB_FILE)
	cursor = conn.cursor()
	create_comments_table(cursor)
	r = praw.Reddit(user_agent="Atheism Scraper")
	total_chars = get_past_chars() # total chars gathered
	comments_checked = 0
	# gather comments until their sum of characters is <= CHARACTER_LIMIT
	while True:
		for comment in r.get_comments('atheism', limit=None):
			comments_checked += 1
			try:
				#comment.body = comment.body.encode('utf-8', 'ignore')
				if add_comment(cursor, comment):
					total_chars += len(comment.body)
					print 'Added comment {}. (Total chars: {})'.format(comment.id, total_chars)
					conn.commit()
				else:
					print "No new comments. Sleeping... (Total chars: {})".format(total_chars)
					sleep(BREAK_LENGTH)
			except Exception as e:
				print '[EXCEPTION CAUGHT]: {}'.format(str(e))
	conn.close()
