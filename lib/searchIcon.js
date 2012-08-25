var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var bind = uijs.bind;

module.exports = function(options) {
  var obj = box(defaults(options, {
    color: 'silver',
  }));

  obj.ondraw = function(ctx){
  	// draw search icon
    var squareLength = Math.min( obj.width,obj.height)
    var center = squareLength*2 / 5;
    var lineWidth = 0.3 * center;
    var radius = center - lineWidth/2;

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = obj.color;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI*2, true); 
    ctx.closePath();
    ctx.stroke();
    ctx.moveTo(center + radius - lineWidth/2, center + radius - lineWidth/2);
    ctx.lineTo(squareLength - lineWidth/2, squareLength - lineWidth/2);
    ctx.stroke();
  }

   return obj;
};