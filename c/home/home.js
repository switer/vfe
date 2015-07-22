'use strict';

require('/c/header')

module.exports = new Reve({
	el: '.home',
	ready: function () {
		console.log('Home')
	}
})