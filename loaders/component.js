'use strict';

var fs = require('fs')
var path = require('path')

module.exports = function (source) {
	var callback = this.async()
	var matches = this.request.match(/[\/\\]c[\/\\]([^\/\\]+)[\/\\]([^\/\\]+)\.js/)
	var loader = this
	if (matches[1] === matches[2]) {
		this.resolve(
			this.context, 
			'./' + matches[1] + '.css', 
			function (err, cssRequest) {
				if (fs.existsSync(cssRequest)) {
					source += '\nrequire("./' + matches[1] +'.css")'
				}
				callback(null, source)
			})

	}
}