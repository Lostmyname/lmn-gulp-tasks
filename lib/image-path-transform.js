var transformTools = require('browserify-transform-tools');

module.exports = function (options) {
  return transformTools.makeFalafelTransform('image-path', {}, transform);

  function transform(node, transformOptions, done) {
    if (node.type === 'CallExpression' && node.callee.name === 'imagePath') {
      var filename = node.arguments[0].value;
      var newFilename = options.resolvePath(filename, options.assetManifest);
      node.update("'" + newFilename + "'");
    }

    done();
  }
};
