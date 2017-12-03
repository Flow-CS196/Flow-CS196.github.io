var saveButton = document.getElementById("saveButton");
saveButton.onclick = function () {
	let fileName = prompt("File Name?");
	if (fileName === null) {
		return;
	}
	for (let i = 0; i < codeBoxArr.length; ++i) {
		if (codeBoxArr[i] === null) {
			continue;
		}
		codeBoxArr[i][7] = codeBoxArr[i][1].value
		codeBoxArr[i][5] = codeBoxArr[i][0].style.left;
		codeBoxArr[i][6] = codeBoxArr[i][0].style.top;
		codeBoxArr[i][8] = parseInt(codeBoxArr[i][0].style.zIndex);
	}
	localStorage.setItem(fileName, JSON.stringify(codeBoxArr));
};

var loadButton = document.getElementById("loadButton");
loadButton.onclick = function () {
	let fileName = prompt("File Name?");
	if (fileName === null) {
		return;
	}
	let stringArr = localStorage.getItem(fileName);
	if (stringArr === null) {
		alert("No such file exists. Did you type correctly?");
		return;
	}
	box.value = ""; //clean the console
	for (let i = 0; i < codeBoxArr.length; ++i) {
		if (codeBoxArr[i] === null) {
			continue;
		}
		removeBox("" + i, true);
	}
	codeBoxArr = JSON.parse(stringArr);
	for (let i = 0; i < codeBoxArr.length; ++i) {
		if (codeBoxArr[i] === null) {
			continue;
		}
		codeBoxArr[i][0] = document.createElement("div");
		codeBoxArr[i][1] = document.createElement("textarea");

		codeBoxArr[i][0].id = "" + i;
		codeBoxArr[i][0].className = codeBoxArr[i][2] + "_box";

		makeDraggable(codeBoxArr[i][0], codeBoxArr[i][8]);

		codeBoxArr[i][1].className = codeBoxArr[i][2] + "_code";

		codeBoxArr[i][1].value = codeBoxArr[i][7];
			
		codeBoxArr[i][0].appendChild(codeBoxArr[i][1]);
		space.appendChild(codeBoxArr[i][0]);

		codeBoxArr[i][0].style.left = codeBoxArr[i][5];
		codeBoxArr[i][0].style.top = codeBoxArr[i][6];
	}
	var child;
	nullIndexCount = 0;
	for (let i = 0; i < codeBoxArr.length; ++i) {
		if (codeBoxArr[i] === null) {
			nullIndexCount += 1;
			continue;
		}
		let myChildren = codeBoxArr[i][0].childNodes;
		if (codeBoxArr[i][3] !== -1) {
			let primaryChild = null;
			for (let i = 0; i < myChildren.length; ++i) {
				child = myChildren[i];
				if (child.className === "connector_primary") {
					primaryChild = child;
					break;
				}
			}
			let targetChildren = codeBoxArr[codeBoxArr[i][3]][0].childNodes;
			let primaryTarget = null;
			for (let i = 0; i < targetChildren.length; ++i) {
				child = targetChildren[i];
				if (child.className === "connector_receiver") {
					primaryTarget = child;
					break;
				}
			}
			let newLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
			newLine.className.baseVal = "primary_line";
			loadLine(newLine, primaryChild, primaryTarget);
		}
		if (codeBoxArr[i][4] !== - 1) {
			let secondaryChild = null;
			for (let i = 0; i < myChildren.length; ++i) {
				child = myChildren[i];
				if (child.className === "connector_secondary") {
					secondaryChild = child;
					break;
				}
			}
			let targetChildren = codeBoxArr[codeBoxArr[i][4]][0].childNodes;
			let secondaryTarget = null;
			for (let i = 0; i < targetChildren.length; ++i) {
				child = targetChildren[i];
				if (child.className === "connector_receiver") {
					secondaryTarget = child;
					break;
				}
			}
			let newLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
			newLine.className.baseVal = "secondary_line";
			loadLine(newLine, secondaryChild, secondaryTarget);
		}
	}
};