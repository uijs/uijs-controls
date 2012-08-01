var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var bind = uijs.bind;

module.exports = function(options) {
  var obj = box(defaults(options, {
    animating: true,
    visible: bind(obj, 'visible', function() { return this.animating; }),
    lineType: 'dot', // 'dot' or 'line' (default 'dot')
    height: 50,
    width: 50,
  }));

  var numberOfLines = 12;
  var lineRatio = function () {
    if (obj.lineType == 'line') {
      return 0.6;
    }
    return 0.51;
  }

  obj.ondraw = function (ctx) {
    var self = this;
    lines.forEach(function (line, i) {      
      ctx.beginPath();
      ctx.moveTo(line.x1(), line.y1());
      ctx.lineTo(line.x2(), line.y2());
      ctx.lineWidth = line.width();
      var idx = Math.round(self.index + i) % numberOfLines;
      ctx.strokeStyle = line.color(idx);
      ctx.lineCap = 'round';
      ctx.stroke();
    });
  };

  var start = Date.now();
  obj.index = bind(obj, 'index', function() {
    var delta = Date.now() - start;
    var rps = 1 * 1000; // rounds per seconds
    return ((delta % rps) / rps) * lines.length;
  });

  function line(index) {
    var angle = index * Math.PI * 2 / numberOfLines;
    var highlight = 0xF7F7F7;
    var baseColor = 0x6A6A6A;
    var deltaColor = 0xC0C0C; 
    var minColor = highlight - numberOfLines * deltaColor;

    
    var fullLength = function () { return Math.min(obj.width, obj.height) / 2; };
    var length = function () { return Math.round(fullLength() * lineRatio()); };
    var radius = function () { return fullLength() - length(); };

    return { 
      x1: function() { return obj.width / 2 + radius() * Math.cos(angle); },
      y1: function() { return obj.height / 2 + radius() * Math.sin(angle); },
      x2: function() { return obj.width / 2 + length() * Math.cos(angle); },
      y2: function() { return obj.height / 2 + length() * Math.sin(angle); },
      width: function () {  return fullLength() / numberOfLines * 2 ; },
      color: function(index) {
        var color = highlight - index * deltaColor;
        if (color < minColor) {
          color = baseColor;
        }
        return '#' + color.toString(16);
      },
    };
  }
  

  var lines = [];
  function initLines() {
    for (var i = 0; i < numberOfLines; i++) {
      lines.push(line(i));
    };
  };
  initLines();

  return obj;
};



