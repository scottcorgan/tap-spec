'use strict';

var test = require('tapes'),
    fs = require('fs'),
    _ = require('lodash'),
    path = require('path'),
    passTestPath = path.resolve(__dirname, '..', 'fixtures', 'pass-test.txt'),
    format = require('chalk'),
    symbols = {
        ok: '\u2713',
        err: '\u2717'
    },
    tapSpec = require('../../')();


test('e2e test', function(t) {
    t.test('all-test-pass output', function(t) {
        t.plan(1);
        var testOutStream = fs.createReadStream(passTestPath),
            actual = '',
            expected = ' '.repeat(2) + 'beep\n' +
                ' '.repeat(4) + format.green(symbols.ok) + ' ' + format.gray('should be equal') + '\n' +
                ' '.repeat(4) + format.green(symbols.ok) + ' ' + format.gray('should be equivalent') + '\n' +
                ' '.repeat(2) + 'boop\n' +
                ' '.repeat(4) + format.green(symbols.ok) + ' ' + format.gray('should be equal') + '\n' +
                ' '.repeat(4) + format.green(symbols.ok) + ' ' + format.gray('(unnamed assert)') + '\n' +
                ' '.repeat(2) + 'total:' + ' '.repeat(5) + '4\n' +
                format.green(' '.repeat(2) + 'passing:' + ' '.repeat(3) + 4) + '\n' +
                ' '.repeat(2) + format.green.bold('All tests pass!');

        testOutStream.pipe(tapSpec);
        tapSpec.on('data', function(data) {
            actual += data.toString();
        });

        testOutStream.on('end', function() {
            t.deepEqual(normalizeOutput(actual), expected, 'Should output in the right format');
        });
    });

    t.end();
});

function normalizeOutput(data) {
    var noEmptyLine = _.filter(data.split('\n'), function(line) { return line.trim().length !== 0; });
    noEmptyLine.splice(noEmptyLine.length - 2, 1);      // remove 'duration ...' line
    return noEmptyLine.join('\n');
}

String.prototype.repeat = function(n) {
    return new Array(n + 1).join(this);
}

