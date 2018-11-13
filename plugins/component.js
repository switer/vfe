/**
 * Initial copy from https://github.com/toptal/component-resolver-webpack
 * Thanks toptal@github
 */
const path = require('path');
const fs = require('fs');
const queryString = require('querystring');
const patterns = require('../lib/patterns');
const pluginName = 'VFEModuleNameWebpackPlugin';

module.exports = class ComponentNamePlugin {
    constructor (rootDir, modules, extensions) {
      this._rootDir = rootDir
      this._modules = modules
      this._extensions = extensions
    }
    apply(compiler) {
      compiler.hooks.normalModuleFactory.tap(
        'component',
        factory => {
          factory.hooks.beforeResolve.tapAsync('component-before-resolve',(data, callback) => {
            let parts = data.request.split('/')
            let cdir = !parts[0] ? parts.shift() : ''
            /**
             * /c/component
             * /c/dir/component
             * /c/dir/subdir/component
             * component
             * dir/component
             * dir/subdir/component
             */
            let isCRule = !parts.some(p => {
              return !/^[\w\-]+$/.test(p)
            })
            if (isCRule && parts.length >= 1 && parts.length <= 3) {
              let modDirs = this._modules
              let extensions = this._extensions
              let context, request
              if (cdir) {
                modDirs = [path.resolve(this._rootDir, cdir)]
              }
              let name = parts[parts.length - 1]
              modDirs.some(dir=>{
                return extensions.some(ext => {
                  let fpath = path.join(data.request, name + '.' + ext)
                  let modPath = path.resolve(dir, fpath)
                  let exist = fs.existsSync(modPath)
                  if (exist) {
                    context = dir
                    request = fpath
                  }
                  return exist
                })
              })
              data.context = context
              data.request = request
              if (request) {
                callback(null, data)
              } else {

              }
            } else {
              callback()
            }
          })
        }
      );
    }
}
