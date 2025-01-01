"use strict";
const fs = require("fs");
const path = require("path");

async function main(){
	const dataPath = path.join(__dirname, "..", "data");
	const englishEmojis = require("../data/emojiList-en.json");
	const targetLanguage = "de";
	
	let targetEmojis = [];
	
	const targetPath = path.join(dataPath, `emojiList-${targetLanguage}.json`);
	const existingTargetEmojis = require(targetPath);
	
	function getTargetEmoji(codes){
		let found = undefined;
		existingTargetEmojis.some(function(section){
			return section.groups.some(function(group){
				return group.entries.some(function(entry){
					if (codes.length <= entry.codes.length && entry.codes.every(function(code, index){
						return code === codes[index] || index >= codes.length;
					})){
						found = {
							section,
							group,
							entry
						};
						return true;
					}
					return false;
				});
			});
		});
		return found;
	}
	englishEmojis.forEach(function(section){
		const targetSection = {
			name: `TODO: translate "${section.name}"`,
			groups: []
		};
		section.groups.forEach(function(group){
			const targetGroup = {
				name: `TODO: translate "${group.name}"`,
				entries: []
			};
			group.entries.forEach(function(entry){
				const targetEntry = {
					index: entry.index,
					codes: entry.codes,
					name: `TODO: translate "${entry.name}"`
				};
				const foundEntry = getTargetEmoji(entry.codes);
				if (foundEntry){
					targetEntry.name = foundEntry.entry.name;
					targetGroup.name = foundEntry.group.name;
					targetSection.name = foundEntry.section.name;
				}
				targetGroup.entries.push(targetEntry);
			});
			targetSection.groups.push(targetGroup);
		});
		targetEmojis.push(targetSection);
	});
	
	fs.promises.writeFile(targetPath, JSON.stringify(targetEmojis, undefined, "\t"), {encoding: "utf-8"});
}

main();