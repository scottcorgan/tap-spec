#!/usr/bin/env node

var tapSpec = require('../');
var dup = tapSpec();

process.stdin
  .pipe(dup)
  .pipe(process.stdout);

process.on('exit', function () {
  if (dup.errors.length || !dup.results.ok) {
    process.exit(1);
  }
});
