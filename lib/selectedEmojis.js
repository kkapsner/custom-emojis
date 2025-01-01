/* globals messenger */
"use strict";
const selectedEmojis = function(){
	
	const api = {};
	
	const defaultEmojis = [
		{
			codes: [0x1F44B, 65039],
			text: "waving hand"
		},
		{
			codes: [0x1F92D, 65039],
			text: "face with hand over mouth"
		},
		{
			codes: [129392, 65039],
			text: "smiling face with hearts"
		},
		{
			codes: [0x1F44C, 65039],
			text: "hand OK"
		},
		{
			codes: [0x270C, 65039],
			text: "victory hand"
		},
		{
			codes: [0x1F595, 65039],
			text: "middle finger"
		},
		{
			codes: [0x1F44D, 65039],
			text: "thumb up"
		},
	];
	let translationNeeded = true;
	async function getDefaultEmojis(){
		if (!translationNeeded){
			return defaultEmojis;
		}
		const langauge = messenger.i18n.getMessage("language") || "en";
		const fullList = await (await fetch(`../data/emojiList-${langauge}.json`)).json();
		fullList.forEach(section => {
			section.groups.forEach(group => {
				group.entries.forEach(entry => {
					defaultEmojis.some(emoji => {
						const codes = emoji.codes.filter(c => c !== 65039); // ignore variation
						if (codes.every((code, index) => code === entry.codes[index])){
							emoji.text = entry.name;
							return true;
						}
						return false;
					});
				});
			});
		});
		
		translationNeeded = false;
		return defaultEmojis;
	}
	
	api.getSelected = async function getSelected(){
		const {selectedEmojis} = await messenger.storage.local.get({selectedEmojis: undefined});
		return selectedEmojis || getDefaultEmojis();
	};
	
	api.add = async function add(codes, text){
		const current = (await api.getSelected()).filter(function(emoji){
			return emoji.codes.some(function(code, index){
				return code !== codes[index];
			});
		});
		current.push({codes, text});
		await messenger.storage.local.set({selectedEmojis: current});
	};
	
	api.update = async function update(codes, text){
		const current = (await api.getSelected());
		current.forEach(function(emoji){
			if (emoji.codes.every(function(code, index){
				return code === codes[index];
			})){
				emoji.text = text;
			}
		});
		await messenger.storage.local.set({selectedEmojis: current});
	};
	
	api.remove = async function remove(codes){
		const current = (await api.getSelected()).filter(function(emoji){
			return emoji.codes.some(function(code, index){
				return code !== codes[index];
			});
		});
		await messenger.storage.local.set({selectedEmojis: current});
	};
	
	const callbacks = [];
	api.onUpdate = async function onUpdate(callback){
		const current = await api.getSelected();
		callback(current);
		callbacks.push(callback);
	};
	messenger.storage.local.onChanged.addListener(async function(){
		const current = await api.getSelected();
		callbacks.forEach(callback => callback(current));
	});
	
	return api;
}();