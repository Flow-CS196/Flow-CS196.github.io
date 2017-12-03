addBox('f');

var box = document.getElementById('textbox');
box.value = "";
var worker = null;
var runner = document.getElementById('runButton');
var stopper = document.getElementById('stopButton');
runner.onclick = function() {
    var funcs = codeMaker();
    if (worker !== null) {
        worker.terminate();
    }
    worker = new Worker("newworker.js");
    worker.onmessage = function(event) {
        var pos;
        if (event.data[0] === 'p') {
            box.value += "" + event.data[1];
        } else if (event.data[0] === 'c') {
            box.value = "";
        } else if (event.data[0] === 'i') {
            let entry = prompt(event.data[2] + " = ?");
            if (entry === null || entry === "") {
                worker.terminate();
                worker = null;
            } else {
                worker.postMessage(['i', event.data[1], event.data[2] + "=" + entry]);
            }
        } else if (event.data[0] === 'e') {
            worker.terminate();
            worker = null;
        }
    };
    box.value = "";
    worker.postMessage(funcs);
}

stopper.onclick = function() {
    if (worker === null)
        return;
    else {
        worker.terminate();
        worker = null;
    }
}

var simpleCreator = document.getElementById("simpleButton");
var conditionalCreator = document.getElementById("conditionalButton");
var inputCreator = document.getElementById("inputButton");

simpleCreator.onclick = function() {addBox("s");};
conditionalCreator.onclick = function() {addBox("c");};
inputCreator.onclick = function() {addBox("i");};
