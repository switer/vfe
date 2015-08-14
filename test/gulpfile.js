'use strict';

var gulp = require('gulp')
var builder = require('../index')

var dist = './dist'

gulp.task('watch', function () {
	return gulp.watch(['c/**/*', 'lib/**/*'], function () {
		gulp.start('default')
	})
})
gulp.task('clean', function () {
	return gulp.src(dist, {read: false}).pipe(builder.clean())
})
gulp.task('default', ['clean'], function () {
	return builder({
			name: 'vfe-demo',
			entry: './index.js',
			libs: './lib/*.js',
			loaders: [{
				test: /.*\.json$/,
				loader: 'json-loader'
			}],
			loaderDirectories: ['webpack-loaders'],
			modulesDirectories: ['c', 'custom_modules']
		})
		.pipe(gulp.dest(dist))
})