vfe
=====
[![npm version](https://badge.fury.io/js/vfe.svg)](https://badge.fury.io/js/vfe)

vfe is a components builder with specified directory structure, base on webpack and gulp.

- [Usage](https://github.com/switer/vfe#usage)
- [Command Line](https://github.com/switer/vfe#command-line)
- [Require Rules](https://github.com/switer/vfe#require-rules)
- [Custom Modules Directory](https://github.com/switer/vfe#custom-modules-directory)
- [API](https://github.com/switer/vfe#api)
- [Expose Modules](https://github.com/switer/vfe#expose-modules)
- [Configure](https://github.com/switer/vfe#configure)

## Usage
See [example](https://github.com/switer/vfe-init-template).

Installing:

```js
npm install vfe --save
```

Using with [gulp](http://gulpjs.com/) build tool, create a `gulpfile.js` file
```js
var gulp = require('gulp')
var vfe = require('vfe')

gulp.task('default', function () {

	return vfe({
			entry: './index.js',
			libs: './lib/*.js'
		})
		.pipe(gulp.dest(dist))
})
```

Project folders specification:

```
./
 |___/c
 |   |
 |   |___/header
 |       |
 |       |____header.css
 |       |
 |       |____header.js
 |       |
 |       |____header.tpl
 |       |
 |       |___/images
 |           |____icon.png
 |
 |
 |____gulpfile.js
 |
 |____index.js
 |
 |___/lib
     |____*.js
```

- **c/**

	Component modules directory, default is "/c". Using `require("$componentName")` to load module,
	such as load header module: `require("header")` will auto load header.css and header.js.
	> **Note:** It can be replaced of custom_directory using modulesDirectories option. [See](https://github.com/switer/vfe#custom-modules-directory)

- **lib/**

	Non-modularized js will concat with components' bundle file.

- **index.js**

	Components entry js.


## Command line

Install [vfe command line tool](https://github.com/tvfe/vfe-cli):
```bash
npm install vfe-cli -g
```
Run default build task
```bash
vfe
```

Start develop watcher
```bash
vfe start
## aliase
vfe s
```
> Note: Start command support run with another task name, such as `vfe start sometask`, only if task name is `start-sometask`.

Releasing for production
```bash
vfe release
## aliase
vfe r
```
> Note: Release command support run with another task name, such as `vfe release sometask`, only if task name is `release-sometask`.


## 模块引用规则

- **require(`"$name"`)**

	`"/$components_modules/$name/$name.js"` 的简写，一级目录同名规则

- **require(`"$dir/$name"`)**

	`"/$components_modules/$dir/$name/$name.js"` 的简写，二级目录同名规则

- **require(`"$dir/$sub/$name"`)**

  `"/$components_modules/$dir/$sub/$name/$name.js"` 的简写，三级目录同名规则

- **require(`"/$components_modules/$name"`)**

	`"/$components_modules/$name/$name.js"`  的简写，一级目录同名规则&绝对路径

- **require(`"/$components_modules/$dir/$name"`)**

  `"/$components_modules/$dir/$name/$name.js"`  的简写，二级目录同名规则&绝对路径

- **require(`"/$components_modules/$dir/$sub/$name"`)**

  `"/$components_modules/$dir/$sub/$name/$name.js"`  的简写，三级目录同名规则&绝对路径

- **require(`"./$name.tpl"`)**

	加载HTML模板作为渲染方法


## Custom modules directory
```js
vfe({
	entry: './index.js',
	libs: './lib/*.js',
	modulesDirectories: ['c', 'custom_modules']
})
```
If you don't want use "/c" as component modules directory, overwrite it:
```js
vfe({
	modulesDirectories: ['components'] // use "/components" as modules directory
})
```

## API

- **vfe(options)**

	`options` also is webpack's options. `vfe` only options:

	**options**
	* `name` output filename without extension.
	* `hash` enable/disable using output, default true
	* `minify` enable/disable compress css/js, default true
	* `rule`  enable/disable require rule transform, default true
	* `vfePlugins`

		- **extractText** Custom options for [extract-text-webpack-plugin](https://github.com/webpack/extract-text-webpack-plugin).

	* `vfeLoaders` configuration for build in loaders, include:

		- **tpl** default enable, set false to disable
		- **css** default enable, set false to disable
		- **less** default `disable`, pass true/object to enable
		- **image** default enable, set false to disable

	For example:

	```js
		vfe({
			// ...
	    	vfeLoaders: {
	    		tpl: false, // disable html-loader for *.tpl
	    		css: {
					options: {
						publicPath: '../'
					}
				},
				less: {
					test: /\.(ls|less)$/,
					options: {
						publicPath: '../'
					}
				},
				image: {
					loader: 'file-loader?name=images/[name]_[hash:6].[ext]'
				}
	    	}
	    	// ...
		})
	```

- **vfe.bundle(src[, options])**

	**options**
	* `name` output filename without extension
	* `hash` enable/disable using output, default true
	* `minify` enable/disable compress css/js, default true
	* `concats` those files will be concat directly without minify

- **vfe.HASH_LENGTH**

	Vfe default output name's hash-length

- **vfe.util**

	* `once( handler(next) )` run in once the the same time, run next after done, no queue

## Expose modules

Using gulp module of vfe without require, such as:

```js
vfe(options)
	.pipe(vfe.if())
	.pipe(vfe.rename)
```

| Module                                                | name        |
| ----------------------------------------------------- |:-----------:|
| [if](https://github.com/robrich/gulp-if) 				|`gulp-if`	  |
| [hash](https://github.com/Dragory/gulp-hash) 			|`gulp-hash`  |
| [filter](https://github.com/sindresorhus/gulp-filter) |`gulp-filter`|
| [merge](https://github.com/teambition/merge2) 		|`merge2`	  |
| [rename](https://github.com/hparra/gulp-rename) 		|`gulp-rename`|
| [clean](https://github.com/robrich/gulp-rimraf) 		|`gulp-rimraf`|
| [concat](https://github.com/contra/gulp-concat) 		|`gulp-concat`|
| [uglify](https://github.com/terinjokes/gulp-uglify) 	|`gulp-uglify`|
| [multipipe](https://github.com/juliangruber/multipipe)|`multipipe`  |
| [webpack](https://github.com/webpack/webpack)|`webpack`  |
| [ExtractTextPlugin](https://github.com/webpack/extract-text-webpack-plugin)|`extract-text-webpack-plugin`  |


## Configure

* **Override vfe's loader config**

```js
{
	vfeLoaders: {
		tpl: {},   // html-loader, default match: *.tpl
		css: {},   // css-loader,  default match: *.css
		image: {}, // file-loader, default match: png|jpg|gif|jpeg|webp
	}
}
```

* **WebPack**
Using as **vfe(`options`)** , `options` will be passed through to webpack function.

## License

MIT.



