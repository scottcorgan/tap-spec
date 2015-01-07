var ts = require('../..');
var test = require('tapes');
var format = require('chalk');
var symbols = {
    ok: '\u2713',
    err: '\u2717'
};
var rs = null;
var actual = null;
var tapSpec = null;

test('unit test', function(t) {
    t.beforeEach(function(t) {
        rs = require('stream').Readable();
        rs._read = function noop() {};
        actual = '';
        tapSpec = ts();
        tapSpec.on('data', function(data) {
            actual += data.toString();
        });
        t.end();
    });

    t.test('Parsing comment', function(t) {
        t.plan(1);
        var comment = '# This is a comment\n';
        var expected = '\n  This is a comment\n\n';

        rs.on('end', function() {
            t.equal(actual, expected, 'Should parse comment correctly.');
        });

        rs.pipe(tapSpec);
        rs.push(comment);
        rs.push(null);
    });

    t.test('Parsing assert', function(t) {
        t.plan(1);
        var assert = 'ok 1 should be equal\n';
        var expected = '    ' + format.green(symbols.ok) + ' ' + format.grey('should be equal') + '\n';

        rs.on('end', function() {
            t.equal(actual, expected, 'Should parse assertion correctly.');
        });

        rs.pipe(tapSpec);
        rs.push(assert);
        rs.push(null);
    });
    t.end();
});
