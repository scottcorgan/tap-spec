var fs = require('fs');

var tapOut = require('tap-out');
var through = require('through2');
var duplexer = require('duplexer');
var format = require('chalk');
var prettyMs = require('pretty-ms');
var _ = require('lodash');
var repeat = require('repeat-string');

var symbols = require('./lib/utils/symbols');
var lTrimList = require('./lib/utils/l-trim-list');

module.exports = function (spec) {

  spec = spec || {};

  // TODO: document
  var OUTPUT_PADDING = spec.padding || '  ';

  var output = through();
  var parser = tapOut();
  var stream = duplexer(parser, output);
  var startTime = new Date().getTime();

  output.push('\n');

  parser.on('test', function (test) {

    output.push('\n' + pad(test.name) + '\n\n');
  });

  // Passing assertions
  parser.on('pass', function (assertion) {

    var glyph = format.green(symbols.ok);
    var name = format.dim(assertion.name);

    output.push(pad('  ' + glyph + ' ' + name + '\n'));
  });

  // Failing assertions
  parser.on('fail', function (assertion) {

    var glyph = symbols.err;
    var title =  glyph + ' ' + assertion.name;
    var raw = format.cyan(prettifyRawError(assertion.error.raw));
    var divider = _.fill(
      new Array((title).length + 1),
      '-'
    ).join('');

    output.push('\n' + pad('  ' + format.red(title) + '\n'));
    output.push(pad('  ' + format.red(divider) + '\n'));
    output.push(raw);

    stream.failed = true;
  });

  parser.on('comment', function (comment) {

    output.push(pad('  ' + format.yellow(comment.raw)) + '\n');
  });

  // All done
  parser.on('output', function (results) {

    output.push('\n\n');

    if (results.fail.length > 0) {
      output.push(formatErrors(results));
      output.push('\n');
    }

    output.push(formatTotals(results));
    output.push('\n\n\n');
  });

  // Utils

  function prettifyRawError (rawError) {

    return rawError.split('\n').map(function (line) {

      return pad(line);
    }).join('\n') + '\n\n';
  }

  function formatErrors (results) {

    var failCount = results.fail.length;
    var past = (failCount === 1) ? 'was' : 'were';
    var plural = (failCount === 1) ? 'failure' : 'failures';

    var out = '\n' + pad(format.red.bold('Failed Tests:') + ' There ' + past + ' ' + format.red.bold(failCount) + ' ' + plural + '\n');
    out += formatFailedAssertions(results);

    return out;
  }

  function formatTotals (results) {

    return _.filter([
      pad('total:     ' + results.asserts.length),
      pad(format.green('passing:   ' + results.pass.length)),
      results.fail.length > 0 ? pad(format.red('failing:   ' + results.fail.length)) : null,
      pad('duration:  ' + prettyMs(new Date().getTime() - startTime)) // TODO: actually calculate this
    ], _.identity).join('\n');
  }

  function formatFailedAssertions (results) {

    var out = '';

    var groupedAssertions = _.groupBy(results.fail, function (assertion) {
      return assertion.test;
    });

    _.each(groupedAssertions, function (assertions, testNumber) {

      // Wrie failed assertion's test name
      var test = _.find(results.tests, {number: parseInt(testNumber)});
      out += '\n' + pad('  ' + test.name + '\n\n');

      // Write failed assertion
      _.each(assertions, function (assertion) {

        out += pad('    ' + format.red(symbols.err) + ' ' + format.red(assertion.name)) + '\n';
      });

      out += '\n';
    });

    return out;
  }

  function pad (str) {

    return OUTPUT_PADDING + str;
  }

  return stream;
};
