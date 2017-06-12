module.exports = function (lines) {
  
  var leftPadding;
  
  // Get minimum padding count
  lines.forEach(function (line) {
    
    var spaceLen = line.match(/^\s+/)[0].length;
    
    if (leftPadding === undefined || spaceLen < leftPadding) {
      leftPadding = spaceLen;
    }
  });
  
  // Strip padding at beginning of line
  return lines.map(function (line) {
    
    return line.slice(leftPadding);
  });
}
