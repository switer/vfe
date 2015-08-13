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
	
	Components director, each sub-director is a component and independent `css`/`js`/`tp`/`image`. Using `require(componentDirName)` to load module, such as load header module: `require("header")` will auto load header.css and header.js.

- **lib/**
	
	Non-modularized js will concat with components' bundle file.

- **index.js**
	
	Components entry js.

## Module path rules

- **require(`"/c/$name/$resource.js"`)** 

	Component resources absolute path.

- **require(`"$name"`)** 
	
	Short name of `"/c/$name/$name.js"`.

- **require(`"$dir/$name"`)** 
	
	Short name of `"/c/$dir/$name/$name.js"`.

- **require(`"./$name.tpl"`)**

	Loader html template file as a string module.

## Command line

Install cli
```bash
npm install vfe -g
```

Init project using [vfe-template](https://github.com/switer/vfe-init-template)
```bash
vfe init
```

## License

MIT.



