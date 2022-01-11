'use strict';

/**
 * Based on https://github.com/jonathanbp/gulp-pegjs/blob/master/index.js
 * changed pegjs for peggy.
 * Add dev dependencies manually
 */
var PluginError = require('plugin-error');
var replaceExtension = require('replace-ext');
var through = require('through2');
var assign = require('object-assign');
var peggy = require('peggy');

module.exports = function (opts) {
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new PluginError('gulp-peggy', 'Streaming not supported'));
      return;
    }

    // always generate source code of parser
    var options = assign({ output: 'source', format: 'commonjs' }, opts);

    var filePath = file.path;

    try {
      file.contents = Buffer.from(peggy.generate(file.contents.toString(), options));
      file.path = replaceExtension(file.path, '.js');
      this.push(file);
    } catch (err) {
      this.emit('error', new PluginError('gulp-peggy', err, { fileName: filePath }));
    }

    cb();
  });
};
