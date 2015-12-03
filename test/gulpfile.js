'use strict';

var gulp = require('gulp')
var debug = require('gulp-debug')
var map = require('map-stream')
var vfe = require('../index')
var path = require('path')
var dist = './dist'

gulp.task('watch', function () {
	return gulp.watch(['c/**/*', 'lib/**/*'], function () {
		gulp.start('default')
	})
})
gulp.task('clean', function () {
	return gulp.src(dist, {read: false}).pipe(vfe.clean())
})
gulp.exDest = function (dest) {
	return gulp.dest.apply(gulp, arguments)
			.pipe(map(function (file, callback) {
	    		console.log('['+ 'Create'.gray + ']', path.join(dest, file.relative).green.gray)
	            callback(null, file)
	    	}))
}
gulp.task('default', ['clean'], function () {

	function is(ext, action) {
		return vfe.if(function (file) {
			return ext.test(path.extname(file.path).replace(/^\./, ''))
		}, action)
	}
	return vfe.merge(
		vfe.bundle(['lib/a.js'], {
			name: 'libs',
			minify: true,
			hash: true,
			concats: ['lib/b.js']
		}),
		vfe({
			entry: {
				a: 'main.js'
			},
			output: {
				filename: '[name].js',				
			},
			libs: './lib/*.js',
			hash: true,
			minify: true,
			loaders: [{
				test: /.*\.json$/,
				loader: 'json-loader'
			}],
			loaderDirectories: ['webpack-loaders'],
			modulesDirectories: ['', 'c', 'custom_modules', 'node_modules'],
			node_modules: ['real'],
			vfeLoaders: {
				css: {
					options: {
						publicPath: '../'
					}
				},
				image: {
					loader: 'file-loader?name=images/[name]_[hash:6].[ext]'
				}
			},
			resolve: {
				alias: {
					custom_cat: './custom_modules/category'
				}
			}
		})
	)
	.pipe(is(/^css$/, gulp.exDest(path.join(dist, 'cdn', 'css'))))
	.pipe(is(/^js$/, gulp.dest(path.join(dist, 'cdn', 'js'))))
	.pipe(is(/^(png|jpg|webp)$/i, gulp.dest(path.join(dist, 'cdn'))))
	// .pipe(gulp.dest(dist))
})