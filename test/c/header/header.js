'use strict';

var tpl = require('./header.tpl')
var conf = require('./header.json')

module.exports = Reve.component('header', {
	template: tpl,
	data: function () {
		return {
			title: 'Header'
		}
	}
})