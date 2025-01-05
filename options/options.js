/* globals messenger selectedEmojis search */
"use strict";
(async function(){
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
	
	search.init(
		document.querySelector(".search"),
		document.querySelector(".searchResults"),
		[{
			text: String.fromCodePoint(10133, 65039),
			title: messenger.i18n.getMessage("settings.addEmoji"),
			callback: (emoji) => selectedEmojis.add(emoji.codes, emoji.name)
		}]
	);
}());