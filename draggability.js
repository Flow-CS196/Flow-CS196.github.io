var codeArea = document.getElementById("codeArea");
var scrollElement = document.getElementById("scrollElement");
var lineCanvas = document.getElementById("lineCanvas");
var lineIDcounter = 0;
var currentlyDragged = null;
var currentLine = null;
var mouseX = 0;
var mouseY = 0;
var offsetX = 0;
var offsetY = 0;
var currentlyScrolling = false;
var scrollStartX = 0;
var scrollStartY = 0;
var offsetDict = {}; //top, right, bottom, left
offsetDict["f_box"] = [8, -10.919, -8, 10.919]; // 30/tan(70)
offsetDict["s_box"] = [8, 0, -8, 0];
offsetDict["c_box"] = [25.397, -25.397, -25.397, 20.711]; // (50 + (16 / √2))(√2 - 1), (50)(√2 - 1)
offsetDict["i_box"] = [8, 0, -8, 0];
var nullIndexCount = 0;

window.addEventListener("mouseup", mouseUp, false);
window.addEventListener("mousemove", moveStuff, false);
window.addEventListener("keydown", deleteBox, false);
window.ondragstart = function() {return false;}; //This fixes various bugs concerning drag events. It is ugly.
codeArea.addEventListener("mousedown", startScrolling, false);

function addConnectorNodes(box) {
    let connector_receiver = document.createElement("div");
    connector_receiver.className = "connector_receiver";

    let connector_primary = document.createElement("div");
    connector_primary.className = "connector_primary";

    if (box.className === "f_box") {
        connector_receiver.style.transform = "skew(20deg)";
        connector_primary.style.transform = "skew(20deg)";
    }

    if (box.className === "c_box") {
        connector_receiver.style.left = "-13.657px"; //8 + 8/√2
        connector_receiver.style.top = "-13.657px"; //8 + 8/√2
        connector_primary.style.left = "calc(100% - 2.343px)"; //8 - 8/√2
        connector_primary.style.top = "calc(100% - 2.343px)"; //8 - 8/√2

        let connector_secondary = document.createElement("div");
        connector_secondary.className = "connector_secondary";

        connector_secondary.addEventListener("mousedown", clickOnConnector, false);
        connector_secondary.addEventListener("mouseup", anchorLine, false);
        connector_secondary.line = null; //The connector could carry a reference to a line.
        connector_secondary.lines = {}; //This will always remain empty.
        connector_secondary.oncontextmenu = function() {return false;};
        box.appendChild(connector_secondary);
    }

    connector_receiver.addEventListener("mousedown", clickOnConnector, false);
    connector_receiver.addEventListener("mouseup", anchorLine, false);
    connector_receiver.lines = {}; //The connector could carry references to many lines.
    connector_receiver.line = null; //This will always remain null.
    connector_receiver.oncontextmenu = function() {return false;};
    box.appendChild(connector_receiver);
    connector_primary.addEventListener("mousedown", clickOnConnector, false);
    connector_primary.addEventListener("mouseup", anchorLine, false);
    connector_primary.line = null; //The connector could carry a reference to a line.
    connector_primary.lines = {}; //This will always remain empty.
    connector_primary.oncontextmenu = function() {return false;};
    box.appendChild(connector_primary);
}

function makeDraggable(box, savedDepth, depth) {
    if (savedDepth !== -1) { //no saved depth
        depth = savedDepth;
    }
    box.style.zIndex = depth;
    lineCanvas.style.zIndex = Math.max(depth + 1, lineCanvas.style.zIndex);
    box.addEventListener("mousedown", clickOnBox, false);
    box.style.left = offsetDict[box.className][3] + codeArea.scrollLeft + "px";
    box.style.top = offsetDict[box.className][0] + codeArea.scrollTop + "px";
    addConnectorNodes(box);
}

function deleteBox(e) {
    if (e.keyCode === 8) { //backspace
        e.preventDefault(); //for some reason, backspace can go to the previous page even when it shouldn't be able to. This prevents that.
         //deleting a character from the textarea.
        let potentialText = document.activeElement;
        let start = potentialText.selectionStart;
        let end = potentialText.selectionEnd;
        if (start === end && start !== 0) {
            start -= 1;
        }
        if (potentialText.tagName === "TEXTAREA") {
            potentialText.value = potentialText.value.substring(0, start) + potentialText.value.substring(end, potentialText.length);
            potentialText.setSelectionRange(start, start);
        }
        if (currentlyDragged) {
            currentlyDragged = removeBox(currentlyDragged.id, false);
        }
    }
}

function orientAnchoredLine(myLine) {
    let rect = myLine.originNode.getBoundingClientRect();
    let originX = rect.left + rect.width / 2  - 160 + codeArea.scrollLeft;
    let originY = rect.top + rect.height / 2 - 40 + codeArea.scrollTop;
    rect = myLine.receiverNode.getBoundingClientRect();
    let targetX = rect.left + rect.width / 2  - 160 + codeArea.scrollLeft;
    let targetY = rect.top + rect.height / 2 - 40 + codeArea.scrollTop;
    orientLine(myLine, originX, originY, targetX, targetY);
}

function loadLine(myLine, origin, target) {
    myLine.originNode = origin;
    myLine.receiverNode = target;
    myLine.id = "l" + lineIDcounter;
    lineIDcounter += 1; //Each line has a unique ID. This would take millenia to break.
    origin.line = myLine;
    target.lines[myLine.id] = myLine;
    let rect = origin.getBoundingClientRect();
    let x1 = rect.left + rect.width / 2  - 160 + codeArea.scrollLeft;
    let y1 = rect.top + rect.height / 2 - 40 + codeArea.scrollTop;
    rect = target.getBoundingClientRect();
    let x2 = rect.left + rect.width / 2  - 160 + codeArea.scrollLeft;
    let y2 = rect.top + rect.height / 2 - 40 + codeArea.scrollTop;
    orientLine(myLine, x1, y1, x2, y2);
    lineCanvas.appendChild(myLine);
}

function orientLine(myLine, x1, y1, x2, y2) {
    function minimalOrient() {
        myLine.setAttribute("x1", x1);
        myLine.setAttribute("y1", y1);
        myLine.setAttribute("x2", x2);
        myLine.setAttribute("y2", y2);
    }

    if (myLine.className.baseVal === "receiver_line") {
        let length = Math.sqrt((x1 - myLine.trueX) * (x1 - myLine.trueX) + (y1 - myLine.trueY) * (y1 - myLine.trueY));
        if (length === 0) {
            return;
        } else {
            let newLength = Math.max(12, length);
            x2 = myLine.trueX + (x1 - myLine.trueX) * 8 / length;
            y2 = myLine.trueY + (y1 - myLine.trueY) * 8 / length;
            x1 = myLine.trueX + (x1 - myLine.trueX) * newLength / length;
            y1 = myLine.trueY + (y1 - myLine.trueY) * newLength / length;
            minimalOrient();
        }

    } else {
        minimalOrient();
        let length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        if (length === 0) {
            return;
        }
        let newLength = Math.max(4, length - 8);
        x2 = x1 + (x2 - x1) * newLength / length;
        y2 = y1 + (y2 - y1) * newLength / length;
        minimalOrient();
    }
}

function destroyAnchoredLine(myLine) {
    if (myLine.originNode.className === "connector_primary") {
        primaryUnconnectStart(myLine.originNode.parentNode.id);
    } else {
        secondaryUnconnectStart(myLine.originNode.parentNode.id);
    }
    myLine.originNode.line = null;
    delete myLine.receiverNode.lines[myLine.id];
    //The references to this line are being cleared.
    myLine.originNode = null;
    myLine.receiverNode = null;
    //The line no longer contains references to other objects.
    lineCanvas.removeChild(myLine);
}

function anchorLine(e) {
    if (!currentLine) {
        return;
    }
    if ((currentLine.className.baseVal === "receiver_line") === (this.className === "connector_receiver")) {
        return;
    }
    currentLine.id = "l" + lineIDcounter;
    lineIDcounter += 1; //Each line has a unique ID. This would take millenia to break.
    if (this.className === "connector_receiver") {
        if (currentLine.originNode.line) {
            destroyAnchoredLine(currentLine.originNode.line);
        }
        currentLine.originNode.line = currentLine;
        currentLine.receiverNode = this;
        this.lines[currentLine.id] = currentLine;
    } else {
        if (this.line) {
            destroyAnchoredLine(this.line);
        }
        this.line = currentLine;
        currentLine.originNode = this;
        currentLine.receiverNode.lines[currentLine.id] = currentLine;
    }
    let rect = this.getBoundingClientRect();
    let posX = rect.left + rect.width / 2  - 160 + codeArea.scrollLeft;
    let posY = rect.top + rect.height / 2 - 40 + codeArea.scrollTop;
    if (this.className === "connector_receiver") {
        orientLine(currentLine, currentLine.x1.baseVal.value, currentLine.y1.baseVal.value, posX, posY);
    } else {
        orientLine(currentLine, posX, posY, currentLine.x2.baseVal.value, currentLine.y2.baseVal.value);
    }
    currentLine.className.baseVal = currentLine.originNode.className.substring(10); //No more receiver_line funkiness.
    //We are going to set up primary/seconday connections.
    let startID = currentLine.originNode.parentNode.id;
    let endID = currentLine.receiverNode.parentNode.id;
    if (currentLine.originNode.className === "connector_primary") {
        primaryConnect(startID, endID);
    }
    else {
        secondaryConnect(startID, endID);
    }
    currentLine = null;
}

function startDrawing(myConnector) {
    let newLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    newLine.className.baseVal = myConnector.className.substring(10) + "_line"; //receiver, primary, or secondary + _line, based on where we are starting from.
    if (newLine.className.baseVal === "receiver_line") {
        newLine.receiverNode = myConnector;
        newLine.originNode = null;
    } else {
        newLine.originNode = myConnector;
        newLine.receiverNode = null;
    } //The line keeps a reference to this node.
    let rect = myConnector.getBoundingClientRect();
    let posX = rect.left + rect.width / 2  - 160 + codeArea.scrollLeft;
    let posY = rect.top + rect.height / 2 - 40 + codeArea.scrollTop;
    if (newLine.className.baseVal === "receiver_line") {
        newLine.trueX = posX
        newLine.trueY = posY
        orientLine(newLine, posX + 12, posY, posX + 8, posY);
    } else {
        orientLine(newLine, posX, posY, posX + 4, posY);
    }
    offsetX = -160 + codeArea.scrollLeft;
    offsetY = -40 + codeArea.scrollTop;
    currentLine = newLine;
    lineCanvas.appendChild(newLine);
}


function clickOnConnector(e) {
    if (e.button === 2) { //right-click
        e.preventDefault();
        if (this.line) {
            destroyAnchoredLine(this.line);
        }
        for(var lineID in this.lines) {
            destroyAnchoredLine(this.lines[lineID]);
        }
    } else {
        startDrawing(this);
    }
}

function startScrolling(e) {
    if (e.button === 2) { //right-click
        return;
    }
    if (!currentlyDragged && !currentLine) { //not dragging boxes or drawing lines
        currentlyScrolling = true;
        scrollStartX = mouseX;
        scrollStartY = mouseY;
    }
}

function clickOnBox(e) {
    if (e.button !== 2) { //not right-click
        if (!currentLine) { //not drawing connection lines
            startDragging(this);
        }
    }
}

function startDragging(box) {
    //re-ordering boxes
    currentlyDragged = box;
    for (let i = 0; i < codeBoxArr.length; ++i) {
        if (codeBoxArr[i] === null) {
            continue;
        }
        if (codeBoxArr[i][0].style.zIndex > box.style.zIndex) {
            codeBoxArr[i][0].style.zIndex -= 1;
        }
    }
    box.style.zIndex = codeBoxArr.length - nullIndexCount - 1;

    offsetX = -mouseX + parseFloat(box.style.left);
    offsetY = -mouseY + parseFloat(box.style.top);
}

function mouseUp(e) {
    if (currentLine) {
        lineCanvas.removeChild(currentLine);
        currentLine = null;
        return;
    }
    if (currentlyDragged === null) {
        currentlyScrolling = false;
        return;
    }
    let offsets = offsetDict[currentlyDragged.className];
    let left = parseFloat(currentlyDragged.style.left) - offsets[3];
    let top = parseFloat(currentlyDragged.style.top) - offsets[0];
    let boxWidth = currentlyDragged.offsetWidth + offsets[3] - offsets[1];
    let boxHeight = currentlyDragged.offsetHeight + offsets[0] - offsets[2];

    let areaWidth = codeArea.offsetWidth;
    let areaHeight = codeArea.offsetHeight;

    if (left < codeArea.scrollLeft) {
        currentlyDragged.style.left = codeArea.scrollLeft + offsets[3] + "px";
    }
    if (top < codeArea.scrollTop) {
        currentlyDragged.style.top = codeArea.scrollTop + offsets[0] + "px";
    }
    if (left + boxWidth > areaWidth + codeArea.scrollLeft) {
        currentlyDragged.style.left = areaWidth + codeArea.scrollLeft - boxWidth + offsets[3] + "px";
    }
    if (top + boxHeight > areaHeight + codeArea.scrollTop) {
        currentlyDragged.style.top = areaHeight + codeArea.scrollTop - boxHeight + offsets[0] + "px";
    }
    boxLineOrient(currentlyDragged);
    currentlyDragged = null;
}

function boxLineOrient(box) {
    let children = box.childNodes;
    for (let i = 0; i < children.length; ++i) {
        child = children[i];
        if (child.tagName !== "TEXTAREA") {
            if (child.line) {
                orientAnchoredLine(child.line);
            }
            for (var lineID in child.lines) {
                orientAnchoredLine(child.lines[lineID]);
            }
        }
    }
}

function moveStuff(e) {
    mouseX = e.pageX;
    mouseY = e.pageY;
    if (currentLine) {
        if (currentLine.className.baseVal === "receiver_line") {
            orientLine(currentLine, mouseX + offsetX, mouseY + offsetY, currentLine.x2.baseVal.value, currentLine.y2.baseVal.value);
        } else {
            orientLine(currentLine, currentLine.x1.baseVal.value, currentLine.y1.baseVal.value, mouseX + offsetX, mouseY + offsetY);
        }
        return;
    } else if (currentlyDragged) {
        currentlyDragged.style.top = mouseY + offsetY + "px";
        currentlyDragged.style.left = mouseX + offsetX + "px";
        boxLineOrient(currentlyDragged);
    } else if (currentlyScrolling) {
        scrollElement.style.width = Math.max(codeArea.scrollLeft + codeArea.offsetWidth, codeArea.scrollLeft + codeArea.offsetWidth + mouseX - scrollStartX) + "px";
        scrollElement.style.height = Math.max(codeArea.scrollTop + codeArea.offsetHeight,  + codeArea.scrollTop + codeArea.offsetHeight + mouseY - scrollStartY) + "px";
        lineCanvas.style.width = scrollElement.style.width;
        lineCanvas.style.height = scrollElement.style.height;
        codeArea.scrollBy(mouseX - scrollStartX, mouseY - scrollStartY);
        scrollStartX = mouseX;
        scrollStartY = mouseY;
    }
}
