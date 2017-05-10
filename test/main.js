'use strict';

require('inherits')
require('pages/index')					// alias of "/$modules_directory/pages/index/index.js", resolve from "/c" directly, if not exist, then from "/custom_modules"
require('!custom_modules/helper')
require('/c/home') 						// alias of "/$modules_directory/header/header.js", resolve from "/c" directly, if not exist, then from "/custom_modules"
require('/c/header/header.js') 					// alias of "/c/header/header.js", resolve from "/c" directly, 
require('header') 					// alias of "/c/header/header.js", resolve from "/c" directly, 
require('helper.js') 					// resolve from "/c", if not exist, then resolve from "/custom_modules" ...
require('/custom_modules/helper.js') 	// absolute path
require('./global-module.js') 			// relative path
require('./global-module')				// relative path without extension
require('~/global-module.js')			// absolute path
require('~/global-module')				// absolute path without extension
require('/custom_modules/category/header')
require('category/header')
require('category/lib/video-info')
require('custom_cat/header/header.js')
require('!real')
require('zect')
module.exports = require('~/consts/consts.js')