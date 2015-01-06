'use strict';

var test = require('tapes'),
    fs = require('fs'),
    _ = require('lodash'),
    path = require('path'),
    passTestPath = path.resolve(__dirname, '..', 'fixtures', 'pass-test.txt'),
    failTestPath = path.resolve(__dirname, '..', 'fixtures', 'fail-test.txt'),
    format = require('chalk'),
    symbols = {
        ok: '\u2713',
        err: '\u2717'
    },
    tapSpec = require('../../')();


test('e2e test', function(t) {
    t.beforeEach(function(t) {
        // TODO
        t.end();
    });

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

    t.test('fail-test output', function(t) {
        t.plan(1);
        var testOutStream = fs.createReadStream(failTestPath),
            actual = '',
            expected = ' '.repeat(2) + 'beep\n' +
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
            t.deepEqual(normalizeOutput(actual, 0), expected, 'Should output in the right format');
        });
    });

    t.end();
});

// durationLinePos is the position of 'duration ...' line counting from the last line.
function normalizeOutput(data, durationLinePos) {
    var noEmptyLine = _.filter(data.split('\n'), function(line) { return line.trim().length !== 0; });
    noEmptyLine.splice(noEmptyLine.length - durationLinePos - 1, 1);      // remove 'duration ...' line
    return noEmptyLine.join('\n');
}

String.prototype.repeat = function(n) {
    return new Array(n + 1).join(this);
}

