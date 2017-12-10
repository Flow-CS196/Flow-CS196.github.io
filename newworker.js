var $ = {};

function write (word) {
	postMessage(['p', "" + word]);
}

function writeln (word) {
	write(word + '\n');
}

function clear () {
	postMessage(['c']);
}

function sleep (milliseconds) {
	//Right now, this function does busy waiting. Not optimal.
	var start = new Date().getTime();
	while ((new Date().getTime() - start) < milliseconds) {}
}

$.closer = () => {
	postMessage(['e']);
};

$.inputPrompter = (word, next) => {
	sleep(100);
	postMessage(['i', next, word]);
}

$.inputEvaluator = function() {
	function $($) {
		return eval($);
	}
	return $.call({}, this.word);
	//this === {}, $ = the input. This prevents global variable access.
}

$.complexEvaluator = (words) => {
	if (words[0] === 's') {
		$.word = words[1];
		$.inputEvaluator();
		return words[2];
	} else if (words[0] === 'c') {
		$.word = words[1];
		let truth = $.inputEvaluator();
		if (truth) {
			if (words[2] !== -1) {
				return words[2];
			}
			$.closer();
			return -1;
		} else {
			if (words[3] !== -1) {
				return words[3];
			}
			$.closer();
			return -1;
		}
	} else if (words[0] === 'i') {
		$.inputPrompter(words[1], words[2]);
		return -1;
	} else if (words[0] === 'e') {
		$.word = words[1];
		$.inputEvaluator();
		$.closer();
		return -1;
	}
}

$.runner = (next, code) => {
	$.word = code;
	$.inputEvaluator();
	while (next >= 0) {
		//printer(next)
		next = $.complexEvaluator($.functions[next]);
	}
}

$.creator = (rawFunctions) => {
	for (let i = 0; i < rawFunctions.length; ++i) {
		$.functions.push(rawFunctions[i]);
	}
};

$.functions = [];

this.onmessage = function (event) {
	if (event.data[0] === 'i') {
		$.runner(event.data[1], event.data[2]);
	} else {
		$.creator(event.data);
		$.runner(0, "");
	}
};

