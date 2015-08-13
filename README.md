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

Directory structure constraint:

```
./
 |____c
 |   |
 |   |____header
 |       |____header.css
 |       |____header.js
 |       |____header.tpl
 |       |____images
 |           |____refresh-icon.png
 |   
 |____gulpfile.js
 |
 |____index.js
 |
 |____lib
     |____*.js
```

- **c/**
	
	Components director, each sub-director is a component and independent `css`/`js`/`tp`/`image`. Using `require(componentDirName)` to load module, such as load header module: `require("header")` will auto load header.css and header.js.

- **lib/**
	
	Non-modularized js will concat with components' bundle file.

- **index.js**
	
	Components entry js.

## Module path rule

- **require(`"/c/$name/$resource.js"`)** component resources absolute path.

- **require(`"$name"`)** short name of `"/c/$name/$name.js"`

- **require(`"$dir/$name"`)** short name of `"/c/$dir/$name/$name.js"`

## Command Line

Init template
```bash
npm install vfe -g

vfe init
```


## License

MIT.



