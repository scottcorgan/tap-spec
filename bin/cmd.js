#!/usr/bin/env node

var through = require('through2');
var parser = require('tap-parser');
var duplexer = require('duplexer');
var chalk = require('chalk');

var out = through();
var tap = parser();
var dup = duplexer(tap, out);
var currentTestName = '';
var errors = [];

out.push('\n');

tap.on('comment', function (comment) {
  currentTestName = comment;
  
  out.push('  ' + comment + '\n');
});

tap.on('assert', function (res) {
  var output = (res.ok)
    ? chalk.green('\u2713')
    : chalk.red('✗');
  
  if (!res.ok) errors.push(currentTestName + ' ' + res.name);
  
  out.push('    ' + output + ' ' + res.name + '\n');
});

tap.on('extra', function (extra) {
  // out.push('\n' + chalk.bold('LOG: ') + extra + '\n');
  out.push('   ' + extra + '\n');
});

tap.on('results', function (res) {
  out.push('\n');
  
  if (errors.length) {
    var past = (errors.length == 1) ? 'was' : 'were';
    var plural = (errors.length == 1) ? 'error' : 'errors';
    
    out.push('  ' + chalk.red('Fail: '));
    out.push('There ' + past + ' ' + chalk.red(errors.length) + ' ' + plural + '\n\n');
    
    errors.forEach(function (error) {
      out.push('    ' + chalk.red('✗') + ' ' + chalk.red(error) + '\n');
    });
  }
  else{
    out.push('  ' + chalk.green('Pass!') + '\n');
  }
});

process.stdin
  .pipe(dup)
  .pipe(process.stdout);