'use strict';

require('pages/index')
require('header') // resolve from "/c" directly
require('/c/header') // resolve from "/c" directly, alias of "/c/header/header.js"
require('/c/header.js') // resolve from "/c" directly
require('/custom_modules/helper.js') // resolve from "/custom_modules" directly
require('helper.js') // step1: resolve from "/c", step2: from "/custom_modules" ...

module.exports = require('/c/home')