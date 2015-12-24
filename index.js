'use strict';

var gulp = require('gulp')
var path = require('path')
var uglify = require('gulp-uglify')
var concat = require('gulp-concat')
var rimraf = require('gulp-rimraf')
var hash = require('gulp-hash')
var gulpif = require('gulp-if')
var merge2 = require('merge2')
var multipipe = require('multipipe')
var gulpFilter = require('gulp-filter')
var cssmin = require('gulp-cssmin')
var rename = require('gulp-rename')
var save = require('./tasks/save')
var webpack = require('webpack')
var path = require('path')
var webpackStream = require('webpack-stream')
var ExtractTextPlugin = require("extract-text-webpack-plugin")
var ComponentPlugin = require('./plugins/component')
var _ = require('underscore')
var shortid = require('shortid')
var HASH_LENGTH = 6

var root = process.cwd()
function noop () {}
function componentsBuild(options) {
    var entry = options.entry || './index.js'
    var node_modules = options.node_modules || []
    var onRequest = options.onRequest || function (f) {
        var context = f.context
        var request = f.request
        if (/[\\\/]node_modules[\\\/]/.test(context)) return false
        if (~node_modules.indexOf(request)) return false
        else return true
    }
    var extensions = ["", ".webpack.js", ".web.js", ".js", ".jsx", ".coffee"]
    var usingHash = options.hash !== false
    var cssOutputName = usingHash ? '[name]_[hash:' + HASH_LENGTH +  '].css' : '[name].css'
    function ruleFilter(f) {
        if (/^\~/.test(f.request)) return true
    }
    var plugins = [
            // (dir/component)
            new webpack.NormalModuleReplacementPlugin(/^[\w\_\$\-]+[\/\\][\w\_\$\-]+$/, function(f) {
                if (onRequest(f) === false) return
                if (ruleFilter(f)) return
                if (!/^\!/.test(f.request)) {
                    var matches = f.request.match(/^([\w\_\$\-]+)[\/\\]([\w\_\$\-]+)$/)
                    var cdir = matches[1]
                    var cname = matches[2]
                    f.request = cdir + '/' + cname + '/' + cname
                } else {
                    // no transform
                    f.request = f.request.replace(/^\!/, '')
                    
                }
                return f
            }),
            // (component), !(component) will not transform
            new webpack.NormalModuleReplacementPlugin(/^[\w\_\$\-]+$/, function(f) {
                if (onRequest(f) === false) return
                if (ruleFilter(f)) return
                if (!/^\!/.test(f.request)) {
                    var cname = f.request.match(/^([\w\_\$\-]+)$/)[1]
                    f.request = cname + '/' + cname
                } else {
                    f.request = f.request.replace(/^\!/, '')
                }
                return f
            }),
            // /modules_directory/component
            new webpack.NormalModuleReplacementPlugin(/^[\/\\][\w\_\$\-]+[\/\\][\w\_\$\-]+$/, function(f) {
                if (onRequest(f) === false) return
                if (ruleFilter(f)) return
                if (!/^\!/.test(f.request)) {
                    var matches = f.request.match(/[\/\\]([\w\_\$\-]+)[\/\\]([\w\_\$\-]+)$/)
                    var cdir = matches[1]
                    var cname = matches[2]
                    f.request = path.join('!', root, cdir, cname, cname)
                } else {
                    f.request = f.request.replace(/^\!/, '')
                }
                return f
            }),
            // /modules_directory/category/cname
            new webpack.NormalModuleReplacementPlugin(/^[\/\\][\w\_\$\-]+[\/\\][\w\_\$\-]+[\/\\][\w\_\$\-]+$/, function(f) {
                if (onRequest(f) === false) return
                if (ruleFilter(f)) return
                if (!/^\!/.test(f.request)) {
                    var matches = f.request.match(/[\/\\]([\w\_\$\-]+)[\/\\]([\w\_\$\-]+)[\/\\]([\w\_\$\-]+)$/)
                    var cdir = matches[1]
                    var category = matches[2]
                    var cname = matches[3]

                    f.request = path.join('!', root, cdir, category, cname, cname)
                } else {
                    f.request = f.request.replace(/^\!/, '')
                }
                return f
            }),
            // /*: absolute path
            new webpack.NormalModuleReplacementPlugin(/^[\/\\][\w\_\$\-]+/, function(f) {
                if (onRequest(f) === false) return
                f.request = f.request.replace(/^[\/\\]([\w\_\$\-]+)/, function (m, fname) {
                    f.context = root
                    return './' + fname
                })
                return f
            }),
            // /*: absolute path
            new webpack.NormalModuleReplacementPlugin(/^[\!\~]/, function(f) {
                if (onRequest(f) === false) return
                var request = f.request
                if (/^\~/.test(request)) {
                    f.context = root
                    f.request = path.join('./', request.replace(/^\~\/?/, ''))
                    return
                } else {
                    f.request = request.replace(/^\!/, '')
                }
                return f
            }),
            // extract css bundle
            new ExtractTextPlugin(cssOutputName)
        ]

    if (options.rule == false) {
        // remove rule transform plugins
        plugins = plugins.slice(plugins.length - 1, plugins.length)
    }

    var vfeLoaders = options.vfeLoaders || {}
    var vfeLoadersCssOpts = (vfeLoaders.css ? vfeLoaders.css : {})
    var loaders = [
        _.extend({
            test: /.*?\.tpl$/,
            loader: 'html-loader'
        }, vfeLoaders.tpl), 
        _.extend({
            test: /\.css$/,
            loader: ExtractTextPlugin.extract("css-loader", _.extend({}, vfeLoadersCssOpts.options))
        }, vfeLoadersCssOpts), 
        _.extend({
            test: /\.(png|jpg|gif|jpeg|webp)$/,
            loader: "file-loader?name=[path][name]" + (usingHash ? "_[hash:" + HASH_LENGTH + "]" : "") + ".[ext]"
        }, vfeLoaders.image)
    ]
    var preLoaders = []

    var loaderDirectories = [
        'node_modules',
        path.join(__dirname, './loaders'), 
        path.join(__dirname, './node_modules'), 
        path.join(__dirname, '../') // parent node_modules
    ]
    var moduleOpt = options.module
    var resolveOpt = options.resolve
    var resolveLoaderOpt = options.resolveLoader
    var resolveModules = [] // below will set default to "c" directory

    // options: plugins
    if (options.plugins) {
        plugins = plugins.concat(options.plugins)
    }
    // options: loaders @vfe
    if (options.loaders) {
        loaders = loaders.concat(options.loaders)
    }
    // options: loaderDirectories @vfe
    if (options.loaderDirectories) {
        loaderDirectories = options.loaderDirectories.concat(loaderDirectories)
    }
    // options: modulesDirectories @vfe
    if (options.modulesDirectories && options.modulesDirectories.length) {
        resolveModules = resolveModules.concat(options.modulesDirectories)
    }
    // options: module.preLoaders
    if (moduleOpt && moduleOpt.preLoaders) {
        preLoaders = preLoaders.concat(moduleOpt.preLoaders)
    }
    // options: module.loaders
    if (moduleOpt && moduleOpt.loaders) {
        loaders = loaders.concat(moduleOpt.loaders)
    }
    // options: resolve.extensions
    if (resolveOpt && resolveOpt.extensions) {
        extensions = extensions.concat(resolveOpt.extensions)
    }
    // options: resolve.modulesDirectories
    if (resolveOpt && resolveOpt.modulesDirectories) {
        resolveModules = resolveModules.concat(resolveOpt.modulesDirectories)
    }
    // options: resolveLoader.modulesDirectories
    if (resolveLoaderOpt && resolveLoaderOpt.modulesDirectories) {
        loaderDirectories = loaderDirectories.concat(resolveLoaderOpt.modulesDirectories)
    }

    resolveModules = resolveModules && resolveModules.length ?  resolveModules : ['c', 'node_modules']
    preLoaders = [{
        test: new RegExp('/($dir)/$w+/$w+/$w+\.js$'
            .replace(/\//g, '[\/\\\\]')
            .replace(/\$w/g, '[^\/\\\\]')
            .replace('$dir', resolveModules.join('|'))
        ),
        loader: 'component'
    },{
        test: new RegExp('/($dir)/$w+/$w+\.js$'
            .replace(/\//g, '[\/\\\\]')
            .replace(/\$w/g, '[^\.\/\\\\]')
            .replace('$dir', resolveModules.join('|'))
        ),
        loader: 'component'
    }].concat(preLoaders)

    return webpackStream(_.extend({}, options, {
        entry: entry,
        module: _.extend({}, moduleOpt, {
            preLoaders: preLoaders,
            loaders: loaders
        }),
        resolveLoader: _.extend({}, options.resolveLoader, {
            modulesDirectories: loaderDirectories
        }),
        plugins: plugins,
        resolve: _.extend({}, resolveOpt, {
            modulesDirectories: resolveModules,
            extensions: extensions
        }),
    })).on('error', function () {
        this.emit('end')
    })
}

var builder = function(options) {

    options = options || {}
    var cssFilter = gulpFilter(['*.js', '!*.css'])
    var jsFilter = gulpFilter(['**/*', '!*.js'])

    // var entry = options.entry || './index.js'
    var libs = options.libs
    var isConcatLibs = libs && libs.length && options.name
    var streams = []
    var cssimgId = shortid.generate()
    var cssminId = shortid.generate()
    var jsId = shortid.generate()

    /**
     * concat component js bundle with lib js
     */
    isConcatLibs && streams.push(
        gulp.src(libs)
    )

    /**
     * using webpack build component modules
     */
    streams.push(
        componentsBuild(_.extend({}, options))
        .pipe(jsFilter)
        .pipe(save('components:css,images:' + cssimgId))
        .pipe(gulpif(options.minify !== false,
            multipipe(
                gulpFilter(['*.css']), 
                cssmin(), 
                rename({ suffix: '.min' }), 
                save('components:css.min:' + cssminId)
            )
        ))
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
    )
    return merge2.apply(null, streams)
        .pipe(gulpif(isConcatLibs, concat(options.name + '.js', {newLine: ';'})))
        .pipe(gulpif(options.hash !== false, hash({
            hashLength: HASH_LENGTH,
            template: '<%= name %>_<%= hash %><%= ext %>'
        })))
        .pipe(gulpif(options.minify !== false, 
            multipipe(
                save('components:js:' + jsId),
                uglify(),
                rename({ suffix: '.min' }),
                save.restore('components:css.min:' + cssminId),
                save.restore('components:js:' + jsId)
            )
        ))
        .pipe(save.restore('components:css,images:' + cssimgId))
        .on('error', function () {
            this.emit('end')
        })
}
builder.bundle = function (src, options) {
    options = options || {}

    var bid = shortid.generate()
    var usingMinify = options.minify !== false
    var usingHash = options.hash !== false
    var bundleFileName = options.name + '.js'
    var concats = options.concats
    var hashOpt = {
        hashLength: HASH_LENGTH,
        template: '<%= name %>_<%= hash %><%= ext %>'
    }
    var hasConcats = _.isArray(concats) && !!concats.length
    var stream = gulp.src(src)

    if (usingMinify) {
        stream = stream
            .pipe(concat(bundleFileName))
            .pipe(gulpif(!hasConcats, save('bundle:js:' + bid)))
            .pipe(uglify())

        if (hasConcats) {
            stream = merge2(stream, gulp.src(concats))
                .pipe(concat(bundleFileName))
        }
        stream = stream
            .pipe(gulpif(usingHash, hash(hashOpt)))
            .pipe(rename({ suffix: '.min' }))
            .pipe(gulpif(!hasConcats, save.restore('bundle:js:' + bid)))
    } else {
        if (hasConcats) {
            stream = merge2(stream, gulp.src(concats))
        }
        stream = stream.pipe(concat(bundleFileName))
            .pipe(gulpif(usingHash, hash(hashOpt)))
    }

    return stream
}
builder.HASH_LENGTH = HASH_LENGTH
builder.clean = rimraf
builder.concat = concat
builder.uglify = uglify
builder.cssmin = cssmin
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
builder.webpack = webpack
builder.ExtractTextPlugin = ExtractTextPlugin

module.exports = builder
