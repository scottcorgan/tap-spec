'use strict';

var test = require('tapes');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var passTestPath = path.resolve(__dirname, '..', 'fixtures', 'pass-test.txt');
var failTestPath = path.resolve(__dirname, '..', 'fixtures', 'fail-test.txt');
var format = require('chalk');
var symbols = {
    ok: '\u2713',
    err: '\u2717'
};
var tapSpec = null;
var actual = null;


test('e2e test', function(t) {
    t.beforeEach(function(t) {
        actual = '';
        tapSpec = require('../../')();
        t.end();
    });

    t.test('all-test-pass output', function(t) {
        t.plan(1);
        var testOutStream = fs.createReadStream(passTestPath);
        var expected = ' '.repeat(2) + 'beep\n' +
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
            t.deepEqual(normalize(actual, 1), expected, 'Format ok-test output.');
        });
    });

    t.test('fail-test output', function(t) {
        t.plan(1);
        var testOutStream = fs.createReadStream(failTestPath);
        var expected = ' '.repeat(2) + 'beep\n' +
                ' '.repeat(4) + format.green(symbols.ok) + ' ' + format.gray('should be equal') + '\n' +
                ' '.repeat(4) + format.red(symbols.err) + ' ' + format.gray('should be equivalent') + '\n' +
                ' '.repeat(2) + 'boop\n' +
                ' '.repeat(4) + format.green(symbols.ok) + ' ' + format.gray('should be equal') + '\n' +
                ' '.repeat(4) + format.green(symbols.ok) + ' ' + format.gray('(unnamed assert)') + '\n' +
                ' '.repeat(2) + format.red.bold('Failed Tests: ') + 'There was ' + format.red.bold(1) + ' failure\n' +
                ' '.repeat(4) + '1) beep\n' +
                ' '.repeat(6) + format.red(symbols.err) + ' ' + format.red('should be equivalent') + '\n' +
                ' '.repeat(2) + 'total:' + ' '.repeat(5) + '4\n' +
                format.green(' '.repeat(2) + 'passing:' + ' '.repeat(3) + 3) + '\n' +
                format.red(' '.repeat(2) + 'failing:' + ' '.repeat(3) + 1);

        testOutStream.pipe(tapSpec);
        tapSpec.on('data', function(data) {
            actual += data.toString();
        });

        testOutStream.on('end', function() {
            t.deepEqual(normalize(actual, 0), expected, 'Format fail-test output.');
        });
    });

    t.end();
});

// remove empty lines and 'duration ...' line
// durationLinePos is the position of 'duration ...' line counting from the last line.
function normalize(data, durationLinePos) {
    var noEmptyLine = _.filter(data.split('\n'), function(line) { return line.trim().length !== 0; });
    noEmptyLine.splice(noEmptyLine.length - durationLinePos - 1, 1);     
    return noEmptyLine.join('\n');
}

String.prototype.repeat = function(n) {
    return new Array(n + 1).join(this);
}

