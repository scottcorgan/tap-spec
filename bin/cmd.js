#!/usr/bin/env node

var tapSpec = require('../');
var tapSpec = tapSpec();

process.stdin
  .pipe(tapSpec)
  .pipe(process.stdout);

process.on('exit', function () {
  if (tapSpec.errors.length || !tapSpec.results.ok) {
    process.exit(1);
  }
});
