var uijs = require('uijs-core');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var bind = uijs.bind;

module.exports = function(options) {
  var obj = box(defaults(options, {
    color: 'silver',
    useBuffer: true,
    invalidators: ['color'],
    id: 'search icon',
  }));

  var squareLength = 0;
  var center = 0;
  var lineWidth = 0;
  var radius = 0;
  var color = null;

  function onCalculateSearchIcon(){
    squareLength = Math.min( this.width, this.height)
    center = squareLength*2 / 5;
    lineWidth = 0.3 * center;
    radius = center - lineWidth/2;
    color = this.color;
  }

  function onSetContextSearchIcon(ctx){
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
  }

  function onDrawSearchIcon(ctx){
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI*2, true); 
    ctx.closePath();
    ctx.stroke();
    ctx.moveTo(center + radius - lineWidth/2, center + radius - lineWidth/2);
    ctx.lineTo(squareLength - lineWidth/2, squareLength - lineWidth/2);
    ctx.stroke();
  }

  obj.onCalculate = onCalculateSearchIcon;
  obj.onSetContext = onSetContextSearchIcon;
  obj.ondraw = onDrawSearchIcon;

  return obj;
};