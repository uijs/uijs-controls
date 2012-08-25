var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var bind = uijs.bind;
var gestures = require('./eventGestures');

module.exports = function(options) {
  var obj = box(defaults(options, {
    backgroundColor: 'silver',
    lineColor: 'white',
    lineLength: bind(function(){ return 0.2 * Math.min(obj.width,obj.height); }),
    lineWidth: bind(function(){ return 0.5 * obj.lineLength; }),
  }));

  obj.ondraw = function(ctx){
    var centerX = obj.width / 2;
    var centerY = obj.height / 2;
    var radius = Math.min(centerX,centerY);
    var lineLength = obj.lineLength;
    var lineWidth = obj.lineWidth;

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