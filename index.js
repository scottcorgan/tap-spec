var through = require('through2');
var parser = require('tap-parser');
var duplexer = require('duplexer');
var format = require('chalk');
var prettyMs = require('pretty-ms');

var assertCount = 0;
var symbols = {
    ok: '\u2713',
    err: '\u2717'
};

// win32 console default output fonts don't support tick/cross
if (process && process.platform === 'win32') {
  symbols = {
    ok: '\u221A',
    err: '\u00D7'
  };
}

module.exports = function() {
  
  var startTime = new Date().getTime();
  
  var out = through();
  var tap = parser();
  var dup = duplexer(tap, out);
  var previousTestName = '';
  var currentTestName = '';
  var testNumber = 0;
  var errors = [];
  var res;

  out.push('\n');
  
  // Comments from tests
  tap.on('comment', function (comment) {
    
    previousTestName = currentTestName;
    currentTestName = comment;
    
    // Keep track of test number
    if (currentTestName !== previousTestName) {
      testNumber += 1;
    }

    if (/^tests\s+[1-9]/gi.test(comment)) {
      return;
    }
    
    else if (/^pass\s+[1-9]/gi.test(comment)) {
      return;
    }
    
    else if (/^fail\s+[1-9]/gi.test(comment)) {
      return;
    }
    
    else if (/^ok$/gi.test(comment)) {
      return;
    }
    
    else {
      // Test name
      comment = comment + '\n';
      out.push('\n');
    }

    out.push('  ' + comment + '\n');
  });
  
  // Asserts
  tap.on('assert', function (res) {
    
    var output = (res.ok)
      ? format.green(symbols.ok)
      : format.red(symbols.err);
    
    assertCount += 1;
    
    if (!res.ok) {
      errors.push({
        assertName: res.name,
        testName: currentTestName,
        testNumber: testNumber
      });
    }

    out.push('    ' + output + ' ' + format.gray(res.name) + '\n');
  });
  
  // Generic outputs
  tap.on('extra', function (extra) {
    
    out.push('   ' + format.yellow(extra) + '\n');
  });
  
  // All done
  tap.on('results', function (_res) {
    
    res = _res
    
    
    if (errors.length) {
      var past = (errors.length == 1) ? 'was' : 'were';
      var plural = (errors.length == 1) ? 'failure' : 'failures';

      out.push('  ' + format.red.bold('Failed Tests: '));
      out.push('There ' + past + ' ' + format.red.bold(errors.length) + ' ' + plural + '\n\n');
      
      // Group the errors by test name
      var groupedErrors = {};
      errors.forEach(function (error) {
        
        var name = error.testNumber + ') ' + error.testName;
        groupedErrors[name] = groupedErrors[name] || [];
        groupedErrors[name].push(error);
      });
      
      Object.keys(groupedErrors).forEach(function (name) {
        
        var errors = groupedErrors[name];
        
        out.push('    ' + name + '\n\n');
        
        errors.forEach(function (error) {
          
          out.push('      ' + format.red(symbols.err) + ' ' + format.red(error.assertName) + '\n');
        });
        
        out.push('\n');
      });
      
      out.push('\n');
    }
    
    // Test number
    out.push('  total:     ' + res.asserts.length + '\n');
    // Pass number
    out.push(format.green('  passing:   ' + res.pass.length) + '\n');
    // Fail number
    if (res.fail.length > 0) {
      out.push(format.red('  failing:   ' + res.fail.length) + '\n');
    }
    // Duration
    out.push('  duration:  ' + prettyMs(new Date().getTime() - startTime) + '\n');
    
    out.push('\n');
    
    if (res.ok) {
      out.push('  ' + format.green.bold('All tests pass!') + '\n');
    }
    
    // Catching no assertions and formatting failing tests
    if (!res.ok && assertCount === 0) {
      out.push('  ' + format.red('Failed:') + ' No assertions found.\n\n');
    }
    else if (!res.ok && res.fail.length === 0) {
      out.push('\n')
    }
    
    // Expose errors and res on returned dup stream
    dup.errors = errors;
    dup.results = res;
  });

  return dup;
}
