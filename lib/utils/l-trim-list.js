var _ = require('lodash');

module.exports = function (lines) {

  var leftPadding;

  // Get minimum padding count
  _.each(lines, function (line) {
    var match = line.match(/^\s+/);
    var spaceLen = match ? match[0].length : 0;

    if (leftPadding === undefined || spaceLen < leftPadding) {
      leftPadding = spaceLen;
    }
  });

  // Strip padding at beginning of line
  return _.map(lines, function (line) {

    return line.slice(leftPadding);
  });
}
