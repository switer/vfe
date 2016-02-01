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
	return gulp.dest.call(gulp, dest)
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
				index: 'main.js',
				detail: 'detail.js'
			},
			output: {
				filename: '[name].js',				
			},
			libs: './lib/*.js',
			hash: true,
			minify: true,
			loaders: [{
				test: /.*\.json$/,
				loader: 'json-loader',
			}],
			loaderDirectories: ['webpack-loaders', 'node_modules'],
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
				},
				less: {
					loader: vfe.ExtractTextPlugin.extract("style-loader", "css-loader!less-loader", {
						publicPath: '../'
					})
				}
			},
			resolve: {
				alias: {
					custom_cat: './custom_modules/category'
				}
			}
		})
		.on('error',  function () {})
	)
	.pipe(is(/^css$/, gulp.dest(path.join(dist, 'cdn', 'css'))))
	.pipe(is(/^js$/, gulp.dest(path.join(dist, 'cdn', 'js'))))
	.pipe(is(/^(png|jpg|webp)$/i, gulp.dest(path.join(dist, 'cdn'))))
	.on('error', function (err) {
	})
	.on('close', function () {
	})
	.on('end', function () {
	})
})