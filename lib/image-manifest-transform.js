var transformTools = require('browserify-transform-tools');

module.exports = function (options) {
  return transformTools.makeFalafelTransform('image-manifest', {
    excludeExtensions: ['json']
  }, transform);

  function getManifest(filename) {
    var imgRegex = /(.+)-(\d+)(?:x\d+)?(@2x)?\.(\w+)/;
    var match = filename.match(imgRegex);
    var obj = {};

    if (!match) {
      return {};
    }

    ['small', 'medium', 'large', 'xlarge'].forEach(function (size) {
      var key = match[1] + '-' + size + '.' + match[4];
      obj[key] = options.resolvePath(key, options.assetManifest);
    });

    return obj;
  }

  function transform(node, transformOptions, done) {
    if (node.type === 'CallExpression' && node.callee.name === 'imageManifest') {
      var filename = node.arguments[0].value;
      var manifest = getManifest(filename);
      node.update(JSON.stringify(manifest));
    }

    done();
  }
};
