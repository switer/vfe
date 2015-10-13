'use strict';

var gulp = require('gulp')
var path = require('path')
var uglify = require('gulp-uglify')
var concat = require('gulp-concat')
var clean = require('gulp-clean')
var hash = require('gulp-hash')
var gulpif = require('gulp-if')
var merge2 = require('merge2')
var multipipe = require('multipipe')
var gulpFilter = require('gulp-filter')
var rename = require('gulp-rename')
var save = require('./tasks/save')
var webpack = require('webpack')
var path = require('path')
var webpackStream = require('webpack-stream')
var ExtractTextPlugin = require("extract-text-webpack-plugin")
var ComponentPlugin = require('./plugins/component')
var _ = require('underscore')
var HASH_LENGTH = 6

var root = process.cwd()
function noop () {}
function componentsBuild(options) {
    var entry = options.entry || './index.js'
    var onRequest = options.onRequest || noop
    var outputName = options.name
    var plugins = [
            // *(dir/component)
            new webpack.NormalModuleReplacementPlugin(/^[^\/\\\.]+[\/\\][^\/\\\.]+$/, function(f) {
                if (onRequest(f) === false) return
                var matches = f.request.match(/^([^\/\\\.]+)[\/\\]([^\/\\\.]+)$/)
                var cdir = matches[1]
                var cname = matches[2]
                f.request = cdir + '/' + cname + '/' + cname
                return f
            }),
            // *(component)
            new webpack.NormalModuleReplacementPlugin(/^[^\/\\\.]+$/, function(f) {
                if (onRequest(f) === false) return
                var cname = f.request.match(/^([^\/\\\.]+)$/)[1]
                f.request = cname + '/' + cname
                return f
            }),
            // /modules_directory/component:[^\.]
            new webpack.NormalModuleReplacementPlugin(/^[\/\\][^\/\\]+[\/\\][^\/\\\.]+$/, function(f) {
                if (onRequest(f) === false) return
                var matches = f.request.match(/[\/\\]([^\/\\]+)[\/\\]([^\/\\\.]+)$/)
                var cdir = matches[1]
                var cname = matches[2]

                f.context = path.join(root, './' + cdir)
                f.request = cname + '/' + cname
                return f
            }),
            // /*: absolute path
            new webpack.NormalModuleReplacementPlugin(/^[\/\\][^\/\\]+/, function(f) {
                if (onRequest(f) === false) return
                f.request = f.request.replace(/^[\/\\]([^\/\\]+)/, function (m, fname) {
                    f.context = root
                    return './' + fname
                })
                return f
            })
        ]

    var loaders = [{
            test: /.*?\.tpl$/,
            loader: 'html-loader'
        }, {
            test: /\.(png|jpg|gif|jpeg|webp)$/,
            loader: "file-loader?name=[path][name]_[hash:" + HASH_LENGTH + "].[ext]"
        }]

    var loaderDirectories = [
        path.join(__dirname, './loaders'), 
        path.join(__dirname, './node_modules'), 
        path.join(__dirname, '../') // parent node_modules
    ]

    if (options.plugins) {
        plugins = plugins.concat(options.plugins)
    }
    if (options.loaders) {
        loaders = loaders.concat(options.loaders)
    }
    if (options.loaderDirectories) {
        loaderDirectories = options.loaderDirectories.concat(loaderDirectories)
    }

    var resolveModules = options.modulesDirectories || ['c']
    return webpackStream(_.extend({}, options, {
            entry: entry,
            module: {
                loaders: loaders
            },
            resolveLoader: {
                modulesDirectories: loaderDirectories
            },
            plugins: plugins,
            resolve: {
                modulesDirectories: resolveModules,
                extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx", ".coffee"]
            },
        }))
}


var builder = function(options) {

    options = options || {}
    var outputName = options.name || 'bundle'
    var jsFilter = gulpFilter(['**/*', '!*.js'])
    var entry = options.entry || './index.js'
    var libs = options.libs || ['./lib/*.js']

    var streams = []
    /**
     * concat component js bundle with lib js
     */
    streams.push(
        gulp.src(libs)
    )

    /**
     * using webpack build component modules
     */
    streams.push(
        componentsBuild(_.extend({}, options, {
            entry: entry,
            name: outputName
        }))
    )

    var stream = merge2.apply(null, streams)
        .pipe(concat(outputName + '.js', {newLine: ';'}))
        .pipe(hash({
            hashLength: HASH_LENGTH,
            template: '<%= name %>_<%= hash %><%= ext %>'
        }))
    return options.minify === false ? stream : stream.pipe(save('bundle:js'))
                                                    .pipe(uglify())
                                                    .pipe(rename({
                                                        suffix: '.min'
                                                    }))
                                                    .pipe(save.restore('bundle:js'))
}

builder.clean = clean
builder.concat = concat
builder.uglify = uglify
builder.rename = rename
builder.merge = merge2
builder.hash = hash
builder.if = gulpif
builder.filter = gulpFilter
builder.multipipe = multipipe
builder.util = {
    /**
     * Run once and lastest one
     */
    once: function (fn) {
        var pending
        var hasNext
        function next() {
            if (pending == false) return
            pending = false
            if (hasNext) {
                hasNext = false
                fn(next)
            } 
        }
        return function () {
            if (pending) {
                return hasNext = true
            }
            pending = true
            fn(next)
        }
    }
}

module.exports = builder
