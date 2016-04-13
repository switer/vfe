/**
 * Initial copy from https://github.com/toptal/component-resolver-webpack
 * Thanks toptal@github
 */
var path = require('path');
var queryString = require('querystring');
var patterns = require('../lib/patterns');


var getResolveComponent = function(exts) {
    return function(request, callback) {
        var requestPath = request.request || '';
        if (!path.isAbsolute(requestPath)) {
            requestPath = path.join(request.path, requestPath);
        }
        var captured = requestPath.match(patterns.COMPONENT_ID_PATH);
        var queryIgnored = /_ignored=1/.test(request.query)

        // Allow to pass query ignored query
        if (request.query) {
            var query = request.query.replace(/^\?/)
            delete query._ignored
            query = queryString.stringify(query)
            request.query = query ? '?' + queryString.stringify(query) : null
        }
        var capturedDir = requestPath.match(patterns.ENCLOSING_DIR_PATH)
        // Ignore npm modules
        var ignored = (capturedDir && /node_modules$/.test(
            capturedDir[1]
        )) || queryIgnored;

        if (captured && !ignored) {
            var componentId = captured[1];
            var context = this;

            var extObjsForFiles = exts.map(function(ext) {
                return { ext: ext, file: true };
            });
            var extObjs = extObjsForFiles.concat(exts.map(function(ext) {
                return { ext: ext, file: false };
            }));

            var tryToFindExtension = function(index) {
                var extObj = extObjs[index];

                // None of passed extensions are found
                if (!extObj) {
                    return callback();
                }

                var resolvePath, componentFileName, componentFilePath;

                // Try to load regular file
                if (extObj.file) {
                    resolvePath = requestPath.match(patterns.ENCLOSING_DIR_PATH)[1];
                    componentFileName = componentId + '.' + extObj.ext;
                    componentFilePath = requestPath + '.' + extObj.ext;

                } else {
                    resolvePath = requestPath;
                    componentFileName = componentId + '.' + extObj.ext;
                    componentFilePath = path.join(requestPath, componentFileName);
                }


                context.fileSystem.stat(componentFilePath, function(err, stats) {
                    if (err || !stats.isFile()) {
                        return tryToFindExtension(index + 1);
                    }

                    context.doResolve('file', {
                        path: resolvePath,
                        query: request.query,
                        request: componentFileName
                    }, callback);
                });
            };

            tryToFindExtension(0);

        } else {
            callback();
        }
    };
};

var ComponentResolverPlugin = function(exts) {
    this.exts = exts || ['jsx', 'js'];
};

ComponentResolverPlugin.prototype.apply = function(resolver) {
    resolver.plugin('resolve', function (context, request) {
    	if (patterns.IGNORED.test(request.path)) {
            request.path = request.path.replace(patterns.IGNORED, '')
    		var query = request.query
    		if (query) {
    			query = queryString.parse(query)
    		} else {
    			query = {}
    		}
    		query._ignored = 1
    		request.query = '?' + queryString.stringify(query)
    	}
    });
    resolver.plugin('directory', getResolveComponent(this.exts));
};

module.exports = ComponentResolverPlugin;
