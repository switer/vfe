'use strict';

function Component () {
	
}

Component.prototype.apply = function (compiler) {
	compiler.plugin("compile", function(params) {
	    console.log("Compiling...")
	})
}

module.exports = Component