var MAX_NGRAM_LENGTH = 7,
	SENTENCE_BATCH_SIZE = 10,
	DB_FILE = 'bible.db';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// set static files folder
app.use(express.static('static'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/main.html');
});

var numConnected = 0;
io.on('connection', function(socket) {
	console.log('User connected. (Total: ' + (++numConnected) + ')');
	socket.on('disconnect', function() {
		console.log('User disconnected. (' + --numConnected + ' remain)');
	});
	socket.on('sentence request', function(data) {
		var sentences = {}, sentence,
			i;
		for(i = 0; i < SENTENCE_BATCH_SIZE; ++i) {
			sentence = text.getSentence(data.words);
			if(!sentence) continue;
			sentences[sentence] = true;
		}
		socket.emit('sentence request', { sentences: sentences });
	});
});

// set up markov text with bible text
console.log('Processing bible text...');
var sqlite3 = require('sqlite3').verbose(),
	db = new sqlite3.Database(DB_FILE);
var MarkovText = require('./markov_text.js'),
	text = new MarkovText(MAX_NGRAM_LENGTH);
var tables = [ 't_kjv', 't_asv' ],
	i;
for(i = 0; i < tables.length; ++i) {
	db.all("SELECT t FROM " + tables[i], function(err, rows) {
		var i, fullText = '';
		for(i = 0; i < rows.length; ++i) {
			fullText += rows[i].t.trim() + ' ';
		}
		text.addText(fullText);
	});
}
console.log('Complete.');

http.listen(3000, function() {
	console.log('Listening on port 3000.');
});
