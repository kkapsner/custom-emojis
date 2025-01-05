/* globals messenger search selectedEmojis*/
"use strict";
(function(){
	const url = new URL(location.href);
	const tabId = parseInt(url.searchParams.get("tabId"), 10);
	if (!tabId){
		window.close();
	}
	search.init(
		document.querySelector(".search"),
		document.querySelector(".searchResults"),
		[
			{
				text: String.fromCodePoint(0x2795, 0xFE0F),
				title: messenger.i18n.getMessage("settings.addEmoji"),
				callback: (emoji) => selectedEmojis.add(emoji.codes, emoji.name)
			},
			{
				default: true,
				text: "\u2380",
				title: messenger.i18n.getMessage("search.insert"),
				callback: (emoji) => {
					messenger.runtime.sendMessage({
						type: "proxy",
						tabId,
						message: {
							type: "insert",
							text: String.fromCodePoint(...emoji.codes)
						}
					});
					window.close();
				}
			}
		]
	);
}());