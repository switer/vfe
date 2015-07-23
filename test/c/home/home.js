'use strict';

require('/c/header/header.js')
require('list')

module.exports = new Reve({
	el: '.home',
	ready: function () {
		console.log('Home')
	}
})