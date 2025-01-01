
"use strict";
const fs = require("fs");
const path = require("path");
const util = require("util");
const en = require("../_locales/en/messages.json");
const enKeys = Object.keys(en);

const language = process.argv[2];


function getTranslationPath(language){
	return path.join(__dirname, "../_locales/" + language + "/messages.json");
}
async function loadTranslation(language){
	const path = getTranslationPath(language);
	const exists = await util.promisify(fs.exists)(path);
	if (exists){
		console.log("language exists -> load data");
		const data = await util.promisify(fs.readFile)(path, {encoding: "UTF-8"});
		return JSON.parse(data);
	}
	else {
		console.log("language does not exist -> create it");
		return {};
	}
}

async function saveTranslation(language, data){
	const path = getTranslationPath(language);
	return await util.promisify(fs.writeFile)(path, JSON.stringify(data, null, "\t"));
}

async function getInput(prompt){
	return new Promise(function(resolve){
		process.stdout.write(prompt);
		process.stdin.setEncoding("utf8");
		process.stdin.resume();
		process.stdin.on("data", function onData(data){
			process.stdin.removeListener("data", onData);
			process.stdin.pause();
			resolve(data.replace(/[\n\r]+$/, ""));
		});
	});
}

async function askForTranslation(key){
	const enData = en[key];
	console.log("English translation for", key, ":", enData.message);
	if (enData.description){
		console.log("\nDescription:", enData.description);
	}
	return getInput("Please enter translation: ");
}

async function translate(language){
	const originalData = await loadTranslation(language);
	const data = {};
	for (let i = 0; i < enKeys.length; i += 1){
		const key = enKeys[i];
		const oldData = originalData[key];
		const enData = en[key];
		if (oldData && oldData.message && oldData.message.trim()){
			data[key] = oldData;
		}
		else {
			data[key] = {
				message: enData.message.trim() === ""? "": await askForTranslation(key),
				description: (oldData && oldData.description) || enData.description || enData.message
			};
		}
	}
	return data;
}

(async function(){
	const data = await translate(language);
	
	saveTranslation(language, data);
}());