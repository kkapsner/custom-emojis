"use strict";

const fs = require("fs").promises;
const path = require("path");

function parseCodes(codes){
	return codes.split(/\s+/g).filter(function(code){return code && code.startsWith("U+");}).map(function(code){
		return parseInt(code.substring(2), 16);
	});
}
function trim(str){
	return str.replace(/^\s+/, "").replace(/\s+$/, "");
}

async function main(){
	const list = await fs.readFile(
		path.join(__dirname, "..", "data", "emoji-variation-sequences.txt"),
		{encoding: "utf-8"}
	);
	const data = {};
	
	list.split(/[\n\r]+/g).forEach(function(line){
		line = trim(line.replace(/#.*/, ""));
		if (!line){
			console.log("empty line");
			return;
		}
		
		const columns = line.split(/;/g).map(trim);
		if (columns.length < 2){
			console.log("not enough columns");
			return;
		}
		if (columns[1] !== "emoji style"){
			console.log("not emoji style:", columns[1]);
			return;
		}
		const codes = columns[0].split(/\s+/g).map(trim).map(c => parseInt(c, 16));
		data[codes[0]] = codes[1];
	});
	fs.writeFile(
		path.join(__dirname, "..", "data", "emoji-variation-sequences.json"),
		JSON.stringify(data, undefined, "\t"),
		{encoding: "utf-8"}
	);
}

main().catch(console.error);