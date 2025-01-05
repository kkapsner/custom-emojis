/* globals messenger */
"use strict";
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
})();