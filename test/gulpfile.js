'use strict';

var gulp = require('gulp')
var vfe = require('../index')

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
	.pipe(gulp.dest(dist))
})