/* Creates a markov chain/n-gram text representation for easily adding more text. 
 *
 * n = max n-gram length to store */
function MarkovText(n) {
	var i;
	this.totalWords = 0;
	this.n = n;
	this.ngrams = []; // each ngram up to n
	for(i = 0; i < this.n - 1; ++i) this.ngrams.push({});
};

MarkovText.prototype.addText = function(text) {
	var words = text.match(/([\w']+|[\.\?\$,!:;])/g),
		n, i, j, curKey, curWord,
		totalWords = 0;
	for(n = 2; n <= this.n; ++n) {
		for(i = 0; i < words.length - n; ++i) {
			curKey = words.slice(i, i+(n-1)).join().toLowerCase();
			curWord = words[i+(n-1)];
			this.addWord(n, curKey, curWord);
			++totalWords;
		}
	}
	console.log('\tProcessed ' + totalWords + ' words');
};

MarkovText.prototype.addWord = function(n, key, word) {
	n -= 2; // get correct index for this.ngrams
	if(!(key in this.ngrams[n]))
		this.ngrams[n][key] = [];
	this.ngrams[n][key].push(word);
};

/* Creates a sentence, adding random words until a period. */
MarkovText.prototype.getSentence = function(words) {
	if(words.length < 1 || words.length > this.n-1) return false;
	var sentenceWords = words.slice(0),
		n, curKey,
		randWord;
	while(sentenceWords[sentenceWords.length-1] !== '.') {
		curKey = sentenceWords.slice(-(n+1)).join().toLowerCase();
		for(n = this.n-2; n >= 0; --n) {
			if(this.ngrams[n][curKey]) {
				randWord = this.ngrams[n][curKey][Math.floor(Math.random()*this.ngrams[n][curKey].length)];
				sentenceWords.push(randWord);
				break;
			}
		}
		if(n < 0) return false; // could not find a word -- return failure
	}
	// put sentence words together into a string
	var sentenceStr = sentenceWords[0], i;
	for(i = 1; i < sentenceWords.length; ++i) {
		if(/[\w']/.test(sentenceWords[i])) sentenceStr += ' ' + sentenceWords[i];
		else sentenceStr += sentenceWords[i];
	}
	return sentenceStr;
}

module.exports = MarkovText;
