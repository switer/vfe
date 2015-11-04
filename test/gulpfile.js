'use strict';

var gulp = require('gulp')
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
gulp.task('default', ['clean'], function () {

	function is(ext, action) {
		return vfe.if(function (file) {
			return ext.test(path.extname(file.path).replace(/^\./, ''))
		}, action)
	}
	return vfe.merge(
		vfe.bundle(['lib/*'], {
			name: 'libs',
			minify: true,
			hash: true
		}),
		vfe({
			entry: {
				a: './main',
				b: './c/pages/index/index.js'
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
			modulesDirectories: ['', 'c', 'custom_modules'],
			vfeLoaders: {
				image: {
					loader: 'file-loader?name=./images/[name]_[hash:6].[ext]'
				}
			}
		})
	)
	.pipe(is(/^css$/, gulp.dest(path.join(dist, 'cdn', 'css'))))
	.pipe(is(/^js$/, gulp.dest(path.join(dist, 'cdn', 'js'))))
	.pipe(is(/^(png|jpg|webp)$/i, gulp.dest(path.join(dist, 'cdn'))))
	// .pipe(gulp.dest(dist))
})