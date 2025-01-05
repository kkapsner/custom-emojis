"use strict";
document.body.onclick = function(){
	let index = 1;
	document.write(
		JSON.stringify(Array.from(document.querySelectorAll(".scrlmrgn")).map(function(sectionNode){
			return {
				name: sectionNode.querySelector("h2")
					.textContent
					.replace(/[^a-zöäüß]/ig, " ")
					.replace(/^\s+|\s+$/g, ""),
				groups: Array.from(sectionNode.querySelectorAll("h3")).map(function(groupNode){
					return {
						name: groupNode.textContent.replace(/[^a-zöäüß]/ig, " ").replace(/^\s+|\s+$/g, ""),
						entries: Array.from(
							groupNode.nextElementSibling.querySelectorAll(".applyemojicard4")
						).map(function(emojiNode){
							return {
								index: index++,
								codes: [...emojiNode.querySelector(".applyemojicard5").textContent]
									.map(c => c.codePointAt(0)),
								name: emojiNode.querySelector(".applyemojicard7").textContent
							};
						})
					};
				})
			};
		}))
	);
};