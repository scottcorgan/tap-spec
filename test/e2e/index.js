'use strict';

var test = require('tapes');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var okTestPath = path.resolve(__dirname, '..', 'fixtures', 'ok.txt');
var notOkTestPath = path.resolve(__dirname, '..', 'fixtures', 'not-ok.txt');
var fmt = require('colorette');
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

    t.test('ok test output', function(t) {
        t.plan(1);
        var testOutStream = fs.createReadStream(okTestPath);
        var expected = ' '.repeat(2) + 'beep\n' +
                ' '.repeat(4) + fmt.green(symbols.ok) + ' ' + fmt.gray('should be equal') + '\n' +
                ' '.repeat(4) + fmt.green(symbols.ok) + ' ' + fmt.gray('should be equivalent') + '\n' +
                ' '.repeat(2) + 'boop\n' +
                ' '.repeat(4) + fmt.green(symbols.ok) + ' ' + fmt.gray('should be equal') + '\n' +
                ' '.repeat(4) + fmt.green(symbols.ok) + ' ' + fmt.gray('(unnamed assert)') + '\n' +
                ' '.repeat(2) + 'total:' + ' '.repeat(5) + '4\n' +
                fmt.green(' '.repeat(2) + 'passing:' + ' '.repeat(3) + 4) + '\n' +
                ' '.repeat(2) + fmt.green(fmt.bold('All tests pass!'));

        testOutStream.pipe(tapSpec);
        tapSpec.on('data', function(data) {
            actual += data.toString();
        });

        testOutStream.on('end', function() {
            t.deepEqual(normalize(actual, 1), expected, 'Format ok-test output.');
        });
    });

    t.test('not ok test output', function(t) {
        t.plan(1);
        var testOutStream = fs.createReadStream(notOkTestPath);
        var expected = ' '.repeat(2) + 'THIS IS A SUITE\n' +
            ' '.repeat(2) + 'test 1\n' +
            ' '.repeat(4) + fmt.green(symbols.ok) + ' ' + fmt.gray('this test should pass') + '\n' +
            ' '.repeat(2) + 'test 2\n' +
            ' '.repeat(4) + fmt.red(symbols.err) + ' ' + fmt.gray('this test should fail') + '\n' +
            ' '.repeat(3) + fmt.yellow('  ---') + '\n' +
            ' '.repeat(3) + fmt.yellow('    operator: ok') + '\n' +
            ' '.repeat(3) + fmt.yellow('    expected: true') + '\n' +
            ' '.repeat(3) + fmt.yellow('    actual:   false') + '\n' +
            ' '.repeat(3) + fmt.yellow('    at: Test.<anonymous> (/Users/khanh.nguyen/tap-spec/test.js:13:15)') + '\n' +
            ' '.repeat(3) + fmt.yellow('  ...') + '\n' +
            ' '.repeat(2) + fmt.red(fmt.bold('Failed Tests: ')) + 'There was ' + fmt.red(fmt.bold(1)) + ' failure\n' +
            ' '.repeat(4) + '3) test 2\n' +
            ' '.repeat(6) + fmt.red(symbols.err) + ' ' + fmt.red('this test should fail') + '\n' +
            ' '.repeat(2) + 'total:' + ' '.repeat(5) + '2\n' +
            fmt.green(' '.repeat(2) + 'passing:' + ' '.repeat(3) + 1) + '\n' +
            fmt.red(' '.repeat(2) + 'failing:' + ' '.repeat(3) + 1);

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
