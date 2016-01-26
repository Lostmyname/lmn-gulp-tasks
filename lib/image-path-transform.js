var transformTools = require('browserify-transform-tools');

module.exports = function (manifest) {
  return transformTools.makeFalafelTransform('image-path', {}, transform);

  function transform(node, transformOptions, done) {
    if (node.type === 'CallExpression' && node.callee.name === 'imagePath') {
      var filename = node.arguments[0].value;
      node.update("'" + (manifest[filename] || filename) + "'");
    }

    done();
  }
};
