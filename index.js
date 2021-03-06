'use strict';

var gulp = require('gulp')
var path = require('path')
var uglify = require('gulp-uglify')
var concat = require('gulp-concat')
var rimraf = require('gulp-rimraf')
var gutil = require('gulp-util')
var gulpif = require('gulp-if')
var gulpHeader = require('gulp-header')
var merge2 = require('merge2')
var multipipe = require('multipipe')
var gulpFilter = require('gulp-filter')
var cssmin = require('gulp-cssmin')
var rename = require('gulp-rename')
var save = require('./tasks/save')
var webpack = require('webpack')
var hashName = require('gulp-hash-name')
var webpackStream = require('webpack-stream')
var ExtractTextPlugin = require("mini-css-extract-plugin")
var ComponentPlugin = require('./plugins/component')
var _ = require('underscore')
var shortid = require('shortid')
var HASH_LENGTH = 6

var DEFAULT_UGLFIFY = {
  compress: { screw_ie8: false },
  mangle: { screw_ie8: false },
  output: { screw_ie8: false }
}

function componentsBuild(options) {
  var entry = options.entry || './index.js'
  var componentsOptions = options.components || {}
  var componentsModules = componentsOptions.directories || ['c']
  var componentsExtensions = componentsOptions.extensions || ["js", "vue", "jsx", "ts"]
  var extensions = [".webpack.js", ".web.js", "vue", ".js", ".jsx", ".ts"]
  var usingHash = options.hash !== false
  var cssOutputName = (options.name || '[name]') + (usingHash ? '_[contenthash:' + HASH_LENGTH + '].css' : '.css')
  var cssOutputOpts = options.vfePlugins ? options.vfePlugins.extractText : {}

  var plugins = [
    // component rule
    new ComponentPlugin(process.cwd(), componentsModules.map(function(n) {
      if (path.isAbsolute(n)) return n
      else {
        return path.resolve(n)
      }
    }), componentsExtensions),
    // extract css bundle
    new ExtractTextPlugin(_.extend({
      filename: cssOutputName
    }, cssOutputOpts))
  ]

  if (options.rule === false) {
    // remove rule transform plugins
    plugins.shift()
  }
  plugins = (options.plugins || []).concat(plugins)

  var vfeLoaders = options.vfeLoaders || {}
  var enableLessLoader = !!vfeLoaders.less // default disable
  var enableCssLoader = vfeLoaders.css !== false // default enable
  var enableTplLoader = vfeLoaders.tpl !== false // default enable
  var enableImgLoader = vfeLoaders.image !== false // default enable
  var enableFontLoader = vfeLoaders.font !== false // default enable
  function patchOpts(opts) {
    return _.isObject(opts) ? opts : {}
  }
  var vfeLoadersCssOpts = patchOpts(vfeLoaders.css)
  var vfeLoadersLessOpts = patchOpts(vfeLoaders.less)

  var loaders = []
  if (enableTplLoader) {
    loaders.push(_.extend({
      test: /.*?\.tpl$/,
      use: 'html-loader'
    }, patchOpts(vfeLoaders.tpl)))
  }
  if (enableCssLoader) {
    let opts = vfeLoadersCssOpts.options
    delete vfeLoadersCssOpts.options
    loaders.push(_.extend({
      test: /\.css$/,
      use: [{
          loader: ExtractTextPlugin.loader,
          options: _.extend({}, opts)
        },
        "css-loader",
      ]
    }, vfeLoadersCssOpts))
  }
  if (enableLessLoader) {
    let opts = vfeLoadersLessOpts.options
    delete vfeLoadersLessOpts.options
    loaders.push(_.extend({
      test: /\.less$/,
      use: [{
          loader: ExtractTextPlugin.loader,
          options: _.extend({}, opts)
        },
        "css-loader",
        "less-loader",
      ]
    }, vfeLoadersLessOpts))
  }
  if (enableImgLoader) {
    loaders.push(_.extend({
      test: /\.(png|jpg|gif|jpeg|webp)$/,
      use: "file-loader?name=[path][name]" + (usingHash ? "_[hash:" + HASH_LENGTH + "]" : "") + ".[ext]"
    }, patchOpts(vfeLoaders.image)))
  }
  if (enableFontLoader) {
    loaders.push(_.extend({
      test: /\.(woff|woff2|eot|ttf|svg|otf)$/,
      use: 'url-loader?limit=100000'
    }, vfeLoaders.font))
  }
  var loaderDirectories = [
    'node_modules',
    path.join(__dirname, './loaders'),
    path.join(__dirname, './node_modules'),
    path.join(__dirname, '../') // parent node_modules
  ]
  var moduleOpt = options.module || {}
  var resolveOpt = options.resolve || {}
  var resolveLoaderOpt = options.resolveLoader || {}
  var resolveModules = [] // below will set default to "c" directory

  if (!resolveModules.length) {
    resolveModules.push('node_modules')
  }
  resolveModules = componentsModules.concat(resolveModules)

  delete options.libs
  delete options.rule
  delete options.name
  delete options.minify
  delete options.header
  delete options.concats
  delete options.hash
  delete options.components
  delete options.vfeLoaders
  delete options.vfePlugins

  return webpackStream(_.extend({
    mode: 'none'
  }, options, {
    entry: entry,
    module: _.extend({}, moduleOpt, {
      rules: loaders.concat(moduleOpt.rules || [])
    }),
    resolveLoader: _.extend({}, resolveLoaderOpt, {
      modules: loaderDirectories.concat(resolveLoaderOpt.loaderDirectories || [])
    }),
    plugins: plugins,
    resolve: _.extend({}, resolveOpt, {
      modules: resolveModules.concat(resolveOpt.modules || []),
      extensions: extensions.concat(resolveOpt.extensions || [])
    }),
  })).on('error', function() {
    this.emit('end')
  })
}

function addHeader(opt) {
  var hOpt = opt || {}
  return gulpif(function(file) {
    if (!opt) return false
    else if (!/\.(js|css)$/.test(file.path)) return false // css and js only
    else if (!opt.test) return true // match all
    else return opt.test.test(file.path)
  }, gulpHeader(hOpt.text || '', hOpt.data || {}))
}
var builder = function(options) {

  options = options || {}
  var jsOnlyFilter = gulpFilter(['*.js']) // remove all files except js
  var jsFilter = gulpFilter(['**/*', '!*.js']) // remove js from matched files

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
    .pipe(jsOnlyFilter) // here will output js/css/images, remove css and images
  )
  return merge2.apply(null, streams)
    .pipe(gulpif(isConcatLibs, concat(options.name + '.js', { newLine: ';' })))
    .pipe(gulpif(options.hash !== false, hashName({
      hashLength: HASH_LENGTH,
      template: '{name}_{hash}{ext}'
    })))
    .pipe(gulpif(options.minify !== false,
      multipipe(
        save('components:js:' + jsId),
        uglify(_.extend({}, DEFAULT_UGLFIFY, options.uglify)).on('error', gutil.log),
        rename({ suffix: '.min' }),
        save.restore('components:css.min:' + cssminId),
        save.restore('components:js:' + jsId)
      )
    ))
    .pipe(save.restore('components:css,images:' + cssimgId))
    .pipe(addHeader()) // add here for css files
    .on('error', function() {
      this.emit('end')
    })
}
/**
 * TODO: use webpack concat
 */
builder.bundle = function(src, options) {
  options = options || {}

  var bid = shortid.generate()
  var usingMinify = options.minify !== false
  var usingHash = options.hash !== false
  var bundleFileName = options.name + '.js'
  var concats = options.concats
  var hashOpt = {
    hashLength: HASH_LENGTH,
    template: '{name}_{hash}{ext}'
  }
  var headerOpt = options.header
  var hasConcats = _.isArray(concats) && !!concats.length
  var stream = gulp.src(src)

  if (usingMinify) {
    stream = stream
      .pipe(concat(bundleFileName))
      .pipe(gulpif(usingHash, hashName(hashOpt)))
      .pipe(gulpif(!hasConcats, save('bundle:js:' + bid)))
      .pipe(uglify(_.extend({}, DEFAULT_UGLFIFY, options.uglify)).on('error', gutil.log))

    /**
     * concats do not output source files
     */
    if (hasConcats) {
      stream = merge2(stream, gulp.src(concats))
        .pipe(concat(bundleFileName))
        .pipe(gulpif(usingHash, hashName(hashOpt)))
    }
    stream = stream
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulpif(!hasConcats, save.restore('bundle:js:' + bid)))
  } else {
    if (hasConcats) {
      stream = merge2(stream, gulp.src(concats))
    }
    stream = stream.pipe(concat(bundleFileName))
      .pipe(gulpif(usingHash, hashName(hashOpt)))
  }

  return stream.pipe(addHeader(headerOpt))
}
builder.HASH_LENGTH = HASH_LENGTH
builder.clean = rimraf
builder.concat = concat
builder.uglify = uglify
builder.cssmin = cssmin
builder.rename = rename
builder.merge = merge2
builder.hash = builder.hashName = hashName
builder.if = gulpif
builder.filter = gulpFilter
builder.multipipe = multipipe
builder.header = gulpHeader
builder.util = {
  /**
   * Run once and lastest one
   */
  once: function(fn) {
    var pending
    var hasNext

    function next() {
      setTimeout(function() {
        if (pending === false) return
        pending = false

        if (hasNext) {
          hasNext = false
          fn(next)
        }
      }, 50) // call after gulp ending handler done
    }
    return function() {
      if (pending) return (hasNext = true)

      pending = true
      fn(next)
    }
  }
}
builder.webpack = webpack
builder.ExtractTextPlugin = ExtractTextPlugin

module.exports = builder
