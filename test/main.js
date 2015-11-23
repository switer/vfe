'use strict';

require('!real')
require('real')
require('pages/index')					// alias of "/$modules_directory/pages/index/index.js", resolve from "/c" directly, if not exist, then from "/custom_modules"
require('!custom_modules/helper')
// require('/c/pages/detail.js')		     // absolute path without extension, path to "/c/pages/detail.js", if not exist, path to "/c/pages/detail/index.js"
require('header') 						// alias of "/$modules_directory/header/header.js", resolve from "/c" directly, if not exist, then from "/custom_modules"
require('/c/header') 					// alias of "/c/header/header.js", resolve from "/c" directly, 
require('/c/header.js') 				// absolute path
require('helper.js') 					// resolve from "/c", if not exist, then resolve from "/custom_modules" ...
require('/custom_modules/helper.js') 	// absolute path
require('./global-module.js') 			// relative path
require('./global-module')				// relative path without extension
require('/global-module.js')			// absolute path
require('/global-module')				// absolute path without extension
require('/custom_modules/category/header')
require('custom_cat/header/header.js')

module.exports = require('/c/home')