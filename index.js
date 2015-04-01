var tapOut = require('tap-out');
var through = require('through2');
var duplexer = require('duplexer');
var format = require('chalk');
var prettyMs = require('pretty-ms');
var _ = require('lodash');

var symbols = require('./lib/utils/symbols');

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
    
    output.push('\n' + pad(format.white(test.name) + '\n\n'));
  });
  
  // Passing assertions
  parser.on('pass', function (assertion) {
    
    var glyph = format.green(symbols.ok);
    var name = format.gray(assertion.name);
    
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
    
    if (results.fail.length > 0) {
      output.push('\n\n');
      output.push(formatErrors(results));
      output.push('\n\n');
    }
    
    output.push(formatTotals(results));
    output.push('\n\n\n');
  });
  
  // Utils
  
  function formatErrors (results) {
    
    var failCount = results.fail.length;
    var past = (failCount === 1) ? 'was' : 'were';
    var plural = (failCount === 1) ? 'failure' : 'failures';
    
    var write = pad(format.red.bold('Failed Tests:') + ' There ' + past + ' ' + format.red.bold(failCount) + ' ' + plural + '\n');
    write += formatFailedAssertions(results);
    
    return write; 
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
    
    var write = '';
    
    var groupedAssertions = _.groupBy(results.fail, function (assertion) {
      return assertion.test;
    });
    
    _.each(groupedAssertions, function (assertions, testNumber) {
      
      // Write failed assertion's test name
      var test = _.find(results.tests, {number: parseInt(testNumber)});
      write += '\n' + pad('  ' + test.name + '\n\n');
      
      // Write failed assertion
      _.each(assertions, function (assertion) {
        
        write += pad('    ' + format.red(symbols.err) + ' ' + format.red(assertion.name) + '\n');
      });
    });
    
    return write;
  }
  
  function pad (str) {
    
    return OUTPUT_PADDING + str;
  }
  
  return stream;
};