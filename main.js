/* globals messenger, selectedEmojis */
"use strict";
(async function(){

	// collect ports to composer scripts to be able to talk to them
	const ports = [];
	messenger.runtime.onConnect.addListener(function(port){
		ports.push(port);
		port.onDisconnect.addListener(function(){
			const index = ports.indexOf(port);
			if (index !== -1){
				ports.splice(index, 1);
			}
		});
	});
	messenger.runtime.onMessage.addListener(function(message){
		switch (message.type){
			case "proxy":
				ports.filter(function(port){
					return port.sender.tab.id === message.tabId;
				}).forEach(function(port){
					port.postMessage(message.message);
				});
				break;
		}
	});
	
	selectedEmojis.onUpdate(async function(emojis){
		await messenger.menus.removeAll();
		emojis.forEach(function(emoji){
			const insertText = String.fromCodePoint(...emoji.codes);
			messenger.menus.create({
				contexts: ["compose_action_menu"],
				id: insertText,
				onclick: function(_menuItem, windowInfo){
					ports.filter(function(port){
						return port.sender.tab.id === windowInfo.id;
					}).forEach(function(port){
						port.postMessage({type: "insert", text: insertText});
					});
				},
				title: `${insertText} ${emoji.text}`,
			});
		});
		messenger.menus.create({
			contexts: ["compose_action_menu"],
			type: "separator"
		});
		messenger.menus.create({
			contexts: ["compose_action_menu"],
			onclick: function(_menuItem, windowInfo){
				messenger.windows.create({
					url: browser.runtime.getURL("search/search.html?tabId=" + windowInfo.id),
					allowScriptsToClose: true,
					height: 600,
					width: 800,
					type: "detached_panel"
				});
			},
			title: messenger.i18n.getMessage("compose_menu.search")
		});
	});
	messenger.composeScripts.register({
		css: [],
		js: [
			{file: "compose/compose.js"}
		]
	});
}());