vfe
=====
vfe is a components builder with specified director structure, base on webpack and gulp.

## Usage

Installing.
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
	
	Component modules director, default is "/c". Using `require("$componentName")` to load module, 
	such as load header module: `require("header")` will auto load header.css and header.js.
	> **Note:** It can be replaced of custom_director using modulesDirectories option. [See](https://github.com/switer/vfe#custom-modules-director)

- **lib/**
	
	Non-modularized js will concat with components' bundle file.

- **index.js**
	
	Components entry js.

## Module path rules

- **require(`"/$components_modules/name/$resource.js"`)** 

	Component resources absolute path.

- **require(`"$name"`)** 
	
	Short name of `"/$components_modules/name/$name.js"`.

- **require(`"$dir/$name"`)** 
	
	Short name of `"/$components_modules/dir/$name/$name.js"`.

- **require(`"./$name.tpl"`)**

	Load html template file as a string module.

[See more usage](https://github.com/switer/vfe/blob/master/test/index.js)

## Custom modules director
```js
builder({
	entry: './index.js',
	libs: './lib/*.js',
	modulesDirectories: ['c', 'custom_modules']
})
```
If you don't want use "/c" as component modules director, overwrite it:
```js
builder({
	modulesDirectories: ['components'] // use "/components" as modules director
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

Run default build task
```bash
vfe
```

Start develop watcher
```bash
vfe start
```

Releasing for production
```bash
vfe release
```

## License

MIT.



