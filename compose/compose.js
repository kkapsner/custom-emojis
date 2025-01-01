/* globals messenger*/
"use strict";

async function main(){
	const port = messenger.runtime.connect();
	port.onMessage.addListener(function(message){
		switch (message.type){
			case "insert":
				document.execCommand("insertText", false, message.text);
				break;
		}
	});
	
}
main();