'use strict';

var gulp = require('gulp')
var builder = require('../index')

gulp.task('default', function () {
	var dist = './dist'

	return builder.merge(
			gulp.src(dist).pipe(builder.clean()),
			builder({
				entry: './index.js',
				libs: './lib/*.js'
			})
		)
		.pipe(gulp.dest(dist))
})