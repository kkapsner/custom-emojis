/* globals messenger selectedEmojis */"use strict";
(async function(){
	
	[
		{datasetProperty: "translation", property: "textContent"},
		{datasetProperty: "translationPlaceholder", property: "placeholder"}
	].forEach(function(data){
		
		document.querySelectorAll(
			`*[data-${data.datasetProperty.replace(/[A-Z]/g, c => "-" + c.toLowerCase())}]`
		).forEach(function(node){
			node[data.property] = browser.i18n.getMessage(node.dataset[data.datasetProperty]);
		});
	});
	
	function createEmojiSetting(emoji){
		const container = document.createElement("div");
		container.className = "emojiSetting";
		
		const emojiElement = document.createElement("span");
		emojiElement.className = "emoji";
		emojiElement.appendChild(document.createTextNode(String.fromCodePoint(...emoji.codes)));
		
		container.appendChild(emojiElement);
		
		const textInput = document.createElement("input");
		textInput.value = emoji.text;
		function update(text){
			selectedEmojis.update(emoji.codes, text);
		}
		textInput.addEventListener("change", () => update(textInput.value));
		container.appendChild(textInput);
		
		const removeButton = document.createElement("button");
		removeButton.textContent = String.fromCodePoint(10006, 65039);
		removeButton.title = messenger.i18n.getMessage("settings.removeEmoji");
		removeButton.addEventListener("click", () => selectedEmojis.remove(emoji.codes));
		container.appendChild(removeButton);
		
		return container;
	}
	
	const selectedEmojisContainer = document.querySelector(".emojis");
	selectedEmojis.onUpdate(function(emojis){
		Array.from(selectedEmojisContainer.childNodes).forEach(c => selectedEmojisContainer.removeChild(c));
		
		emojis.forEach(function(emoji){
			selectedEmojisContainer.appendChild(createEmojiSetting(emoji));
		});
	});
	
	function createSearchResult(emoji){
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
		
		const addButton = document.createElement("button");
		addButton.textContent = String.fromCodePoint(10133, 65039);
		addButton.title = messenger.i18n.getMessage("settings.addEmoji");
		addButton.addEventListener("click", () => selectedEmojis.add(emoji.codes, emoji.name));
		container.appendChild(addButton);
		return container;
	}
	
	const searchInput = document.querySelector(".search");
	let timeout = false;
	["keypress", "paste", "keyup"].forEach(function(type){
		searchInput.addEventListener(type, function(){
			window.clearTimeout(timeout);
			timeout = window.setTimeout(() => search(searchInput.value), 150);
		});
	});
	
	const searchResults = document.querySelector(".searchResults");
	
	const fullEmojiList = async function(){
		const langauge = messenger.i18n.getMessage("language") || "en";
		return (await fetch(`../data/emojiList-${langauge}.json`)).json();
	}();
	
	async function search(text){
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
					groupContainer.appendChild(createSearchResult(emoji));
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
}());