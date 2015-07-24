'use strict';

var gulp = require('gulp')
var builder = require('../index')

var dist = './dist'

gulp.task('clean', function () {
	return gulp.src(dist, {read: false}).pipe(builder.clean())
})
gulp.task('default', ['clean'], function () {
	return builder({
			entry: './index.js',
			libs: './lib/*.js',
			loaders: [{
				test: /.*\.json$/,
				loader: 'json-loader'
			}],
			loaderDirectories: ['webpack-loaders']
		})
		.pipe(gulp.dest(dist))
})