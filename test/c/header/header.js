'use strict';

var tpl = require('./header.tpl')
var conf = require('./header.json')
require('../../consts/consts.js')
require('./header.less')

module.exports = Reve.component('header', {
	template: tpl,
	data: function () {
		return {
			title: 'Header'
		}
	}
})