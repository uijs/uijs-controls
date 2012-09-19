var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var bind = uijs.bind;

function base(options) {
  
  // TODO: remove this hack - I use a function which return i++ to invalidate the control every frame
  //       need to maybe put the time here and have a time change invalidate the control since its an
  //       animation which depends on time
  var i = 0;

  var obj = box(defaults(options, {
    height: 50,
    width: 50,
    speed: 1, // rounds per second
    lines: 20, // the number of lines to draw
    lineWidthRatio: 2, // the ration between max line width and line thickness
    radiusRatio: 0.9, // the ratio between the inner radius of the inner circle and the size of the control    
    animating: true,
    useBuffer: false,
    invalidators: ['invalidate'],
    invalidate : bind(function() { return i++; }),
    id: 'activity',
  }));

  // TODO: consider add the following parameters
  //color: 'black', // 'white' or 'black', defualt: 'white'
  //trail: 100, // afterfglow percentage
  //shadow: false, // whether to render a shadow
  //hwaccel: false, // whether to use hw acceleration

  var start = Date.now();
  obj.bind('colorIndex', function() {
    var self = this;
    if (self.animating) {
      var delta = Date.now() - start;
      var rps = self.speed * 1000; // rounds per miliseond
      self.lastColorIndex = Math.round(((delta % rps) / rps) * self.lines);
    }
    return self.lastColorIndex;      
  });

  var highlight = 0xF7F7F7;
  var baseColor = 0x6A6A6A;
  var deltaColor = 0xC0C0C;

  function onCalculateActivity(){
  }

  function onSetContextActivity(ctx){
  }

  function onDrawActivity(ctx){
    var self = this;
    var centerX = self.width / 2;
    var centerY = self.height / 2;
    var maxLength = Math.min(self.width, self.height) / 2 * 0.8;
    var radius = maxLength * self.radiusRatio;
    var minColor = highlight - self.lines * deltaColor;
    var lineWidth = maxLength * 2 / self.lines * self.lineWidthRatio;
    for (var i = 0; i < self.lines; i++) {
      var angle = i * Math.PI * 2 / self.lines;
      var x1 = centerX + radius * Math.cos(angle);
      var y1 = centerY - radius * Math.sin(angle);
      var x2 = centerX + maxLength * Math.cos(angle);
      var y2 = centerY - maxLength * Math.sin(angle);
      var idx = (self.colorIndex + i) % self.lines;
      lineColor = highlight - idx * deltaColor;
      if (lineColor < minColor) {
        lineColor = baseColor;
      }
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = '#' + lineColor.toString(16);
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  };

  obj.onCalculate = onCalculateActivity;
  obj.onSetContext = onSetContextActivity;
  obj.ondraw = onDrawActivity;
  return obj;
}

function line(options) {
  return base(defaults(options, {
    lines: 12,
    radiusRatio: 0.5,
    lineWidthRatio: 1
  }));
}

function dot(options) {
  return base(defaults(options, {
    lines: 12,
    radiusRatio: 0.99,
    lineWidthRatio: 2
  }));
}

module.exports = base;
module.exports.line = line;
module.exports.dot = dot;
