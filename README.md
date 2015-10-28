vfe
=====
vfe is a components builder with specified directory structure, base on webpack and gulp.

- [Usage](https://github.com/switer/vfe#usage)
- [Require Rules](https://github.com/switer/vfe#require-rules)
- [Custom Modules Directory](https://github.com/switer/vfe#custom-modules-directory)
- [Command Line](https://github.com/switer/vfe#command-line)
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
var builder = require('vfe')

gulp.task('default', function () {
	
	return builder({
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

## Require rules

- **require(`"/$components_modules/name/$resource.js"`)** 

	Component resources absolute path.

- **require(`"$name"`)** 
	
	Short name of `"/$components_modules/name/$name.js"`.

- **require(`"$dir/$name"`)** 
	
	Short name of `"/$components_modules/dir/$name/$name.js"`.

- **require(`"./$name.tpl"`)**

	Load html template file as a string module.

[See more usage](https://github.com/switer/vfe/blob/master/test/index.js)

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

## Command line

Install cli
```bash
npm install vfe -g
```

Init project using [vfe-template](https://github.com/switer/vfe-init-template)
```bash
vfe init
```
> **Note**: Using proxy option, `vfe init -p $proxy`. Such as `vfe init -p tx`. See [$tx](https://github.com/switer/vfe/blob/master/bin/vfe#L17) 

Run default build task
```bash
vfe
```

Start develop watcher
```bash
vfe start
```
> Note: Start command support run with another task name, such as `vfe start sometask`, only if task name is `start-sometask`.

Releasing for production
```bash
vfe release
```
> Note: Release command support run with another task name, such as `vfe release sometask`, only if task name is `release-sometask`.


## Configure

####Vfe config

```js
{
	vfeLoaders: {
		tpl: {},   // html-loader, default match: *.tpl
		css: {},   // css-loader,  default match: *.css
		image: {}, // file-loader, default match: png|jpg|gif|jpeg|webp
	}
}
```

#### WebPack
Using as **vfe(`options`)** , `options` will be passed through to webpack function.

## License

MIT.



