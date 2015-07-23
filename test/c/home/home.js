'use strict';

require('header')
require('list')

module.exports = new Reve({
	el: '.home',
	ready: function () {
		console.log('Home')
	}
})