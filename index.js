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
    
    var glyph = format.red(symbols.err);
    var name = format.red.bold(assertion.name);
    
    output.push(pad('  ' + glyph + ' ' + name + '\n'));
    
    stream.failed = true;
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
        out += formatFailedAssertionDetail(assertion) + '\n';
      });
    });
    
    return out;
  }
  
  function formatFailedAssertionDetail (assertion) {
    
    var out = '';
    
    var filepath = assertion.error.at.file;
    var contents = fs.readFileSync(filepath).toString().split('\n');
    var line = contents[assertion.error.at.line - 1];
    var previousLine = contents[assertion.error.at.line - 2];
    var nextLine = contents[assertion.error.at.line];
    var lineNumber = parseInt(assertion.error.at.line);
    var previousLineNumber = parseInt(assertion.error.at.line) - 1;
    var nextLineNumber = parseInt(assertion.error.at.line) + 1;
    
    var lines = lTrimList([
      line,
      previousLine,
      nextLine
    ]);
    
    var atCharacterPadding = parseInt(assertion.error.at.character) + parseInt(lineNumber.toString().length) + 2;
    
    out += pad('    ' + format.dim(filepath)) + '\n';

    out += pad('      ' + repeat(' ', atCharacterPadding) + format.red('v') + "\n");
    out += pad('      ' + format.dim(previousLineNumber + '.  ' + lines[1])) + '\n';
    out += pad('      ' + lineNumber + '.  ' + lines[0]) + '\n';
    out += pad('      ' + format.dim(nextLineNumber + '.  ' + lines[2])) + '\n';
    out += pad('      ' + repeat(' ', atCharacterPadding) + format.red('^') + "\n");
    
    return out;
  }
  
  function pad (str) {
    
    return OUTPUT_PADDING + str;
  }
  
  return stream;
};