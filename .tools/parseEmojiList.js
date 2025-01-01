"use strict";

const fs = require("fs").promises;
const path = require("path");

function parseCodes(codes){
	return codes.split(/\s+/g).filter(function(code){return code && code.startsWith("U+");}).map(function(code){
		return parseInt(code.substring(2), 16);
	});
}
function createEntry(line){
	return {
		index: parseInt(line[0], 10),
		codes: parseCodes(line[1]),
		name: line[2]
	};
}

async function main(){
	const list = await fs.readFile(path.join(__dirname, "..", "data", "emojiList.txt"), {encoding: "utf-8"});
	const data = [];
	
	let currentSection = false;
	let currentGroup = false;
	let lastWasEntry = true;
	list.split(/[\n\r]+/g).forEach(function(line){
		const columns = line.split(/\t/g);
		if (columns.length === 1){
			const newGroup = {
				name: line,
				entries: []
			};
			if (!lastWasEntry){
				// two headings after each other -> the last one was a section not a group
				console.log("section", currentGroup.name);
				currentSection = {
					name: currentGroup.name,
					groups: []
				};
				data.push(currentSection);
			}
			currentGroup = newGroup;
			lastWasEntry = false;
			return;
		}
		if (!currentGroup){
			throw "no group found";
		}
		if (!lastWasEntry){
			console.log("group", currentGroup.name);
			currentSection.groups.push(currentGroup);
		}
		lastWasEntry = true;
		
		currentGroup.entries.push(createEntry(columns));
	});
	fs.writeFile(
		path.join(__dirname, "..", "data", "emojiList.json"),
		JSON.stringify(data, undefined, "\t"),
		{encoding: "utf-8"}
	);
}

main().catch(console.error);