'use strict';

var fs = require('fs')
var path = require('path')

module.exports = function (source) {
	var callback = this.async()
	var loader = this
	var oneMatches = this.request.match(/[\/\\]c[\/\\]([^\/\\]+)[\/\\]([^\/\\]+)\.js$/)

	if (oneMatches && oneMatches[1] === oneMatches[2]) {
		return this.resolve(
			this.context, 
			'./' + oneMatches[1] + '.css', 
			function (err, cssRequest) {
				if (fs.existsSync(cssRequest)) {
					source += '\nrequire("./' + oneMatches[1] +'.css")'
				}
				callback(null, source)
			})

	}
	// /c/dir/component/component.js
	var dirMatches = this.request.match(/[\/\\]c[\/\\]([^\/\\]+)[\/\\]([^\/\\]+)[\/\\]([^\/\\]+)\.js$/)
	if (dirMatches && dirMatches[2] === dirMatches[3]) {
		return this.resolve(
			this.context,
			'./' + dirMatches[2] + '.css',
			function (err, cssRequest) {
				if (fs.existsSync(cssRequest)) {
					source += '\nrequire("./' + dirMatches[2] +'.css")'
				}
				callback(null, source)
			}
		)
	}
	return callback(null, source)
}