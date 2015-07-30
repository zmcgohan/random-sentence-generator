var socket = io();

// form input for beginning words of sentence
var wordsInput = document.getElementById('words');
var sentencesTable = document.getElementById('sentencesTable');

// content of words text input changed
wordsInput.oninput = function() {
	var words = wordsInput.value.split(' '),
		i;
	i = 0;
	while(i < words.length) {
		if(words[i].length === 0) words.splice(i, 1);
		else ++i;
	}
	socket.emit('sentence request', { words: words });
}

// on receiving sentences
socket.on('sentence request', function(data) {
	var numSentences = 0,
		sentence,
		newTr, newTd;
	// empty current sentence rows
	while(sentencesTable.childNodes.length > 0)
		sentencesTable.removeChild(sentencesTable.childNodes[0]);
	for(sentence in data.sentences) {
		newTr = document.createElement('tr');
		newTd = document.createElement('td');
		// highlight inputted part of sentence
		newTd.innerText = sentence;
		newTr.appendChild(newTd);
		sentencesTable.appendChild(newTr);
		++numSentences;
	}
	// no sentences available
	if(numSentences === 0) {
		newTr = document.createElement('tr');
		newTd = document.createElement('td');
		newTd.innerText = 'No sentences available.';
		newTr.appendChild(newTd);
		sentencesTable.appendChild(newTr);
	} 
});
