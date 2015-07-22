'use strict';

function Component () {
	
}

Component.prototype.apply = function (compiler) {
	compiler.plugin("compile", function(params) {
	    // Just print a text
	    console.log("Compiling...")
	})
}

module.exports = Component