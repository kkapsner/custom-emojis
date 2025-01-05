/* globals messenger selectedEmojis*/
"use strict";

const search = function(){
	
	function createSearchResult(emoji, buttons){
		const container = document.createElement("div");
		container.className = "searchResult";
		
		const emojiElement = document.createElement("span");
		emojiElement.className = "emoji";
		const codes = emoji.codes;
		if (codes.length === 1){
			codes.push(65039);
		}
		emojiElement.appendChild(document.createTextNode(String.fromCodePoint(...codes)));
		
		container.appendChild(emojiElement);
		
		const textElement = document.createElement("span");
		textElement.textContent = emoji.name;// + ` (${emoji.codes})`;
		container.appendChild(textElement);
		
		const buttonsContainer = document.createElement("span");
		container.appendChild(buttonsContainer);
		buttons.forEach(function(button){
			const buttonNode = document.createElement("button");
			buttonNode.textContent = button.text;
			buttonNode.title = button.title;
			buttonNode.addEventListener("click", () => button.callback(emoji));
			buttonsContainer.appendChild(buttonNode);
		});
		return container;
	}
	
	const fullEmojiList = async function(){
		const langauge = messenger.i18n.getMessage("language") || "en";
		return (await fetch(`../data/emojiList-${langauge}.json`)).json();
	}();
	
	async function search(text, searchResults, callback){
		Array.from(searchResults.childNodes).forEach(c => searchResults.removeChild(c));
		
		if (text.length < 3){
			return;
		}
		const searchRegExp = new RegExp(text, "i");
		
		(await fullEmojiList).forEach(function(section){
			const sectionContainer = document.createElement("div");
			sectionContainer.className = "section";
			let oneGroupExists = false;
			section.groups.forEach(function(group){
				const groupContainer = document.createElement("div");
				groupContainer.className = "group";
				let oneEntryExists = false;
				group.entries.filter(emoji => searchRegExp.test(emoji.name)).forEach(function(emoji){
					oneEntryExists = true;
					groupContainer.appendChild(createSearchResult(emoji, callback));
				});
				if (oneEntryExists){
					oneGroupExists = true;
					const heading = document.createElement("h3");
					heading.textContent = group.name;
					groupContainer.insertBefore(heading, groupContainer.firstChild);
					sectionContainer.appendChild(groupContainer);
				}
			});
			if (oneGroupExists){
				const heading = document.createElement("h2");
				heading.textContent = section.name;
				sectionContainer.insertBefore(heading, sectionContainer.firstChild);
				searchResults.appendChild(sectionContainer);
			}
		});
	}
	return {
		init: function(searchInput, searchResults, callback){
			let timeout = false;
			["keypress", "paste", "keyup"].forEach(function(type){
				searchInput.addEventListener(type, function(){
					window.clearTimeout(timeout);
					timeout = window.setTimeout(() => search(searchInput.value, searchResults, callback), 150);
				});
			});
		}
	};
}();