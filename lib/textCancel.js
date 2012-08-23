var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var bind = uijs.bind;
var gestures = require('./eventGestures');

module.exports = function(options) {
  var obj = box(defaults(options, {
    backgroundColor: 'gray',
    lineColor: 'white',
  }));

  obj.ondraw = function(ctx){
    var centerX = obj.width / 2;
    var centerY = obj.height / 2;
    var radius = 0.9 * centerX;
    var lineLength = 0.55 * radius;
    var lineWidth = 0.2 * lineLength;

    //draw circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = obj.backgroundColor;
    ctx.fill();

    //draw the x lines
    ctx.beginPath();
    ctx.moveTo(centerX - lineLength, centerY - lineLength);
    ctx.lineTo(centerX + lineLength, centerY + lineLength);
    ctx.moveTo(centerX - lineLength, centerY + lineLength);
    ctx.lineTo(centerX + lineLength, centerY - lineLength);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = obj.lineColor;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  //add a behavior of emitting a click event
  obj.on(gestures.click(obj),function(){
    var self = this;
    obj.emit('cancel');
  });
  
  return obj;
};