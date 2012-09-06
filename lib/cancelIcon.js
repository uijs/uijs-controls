var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var bind = uijs.bind;
var gestures = require('./gestures');

module.exports = function(options) {
  var obj = box(defaults(options, {
    backgroundColor: 'silver',
    lineColor: 'white',
    lineLength: bind(function(){ return 0.2 * Math.min(this.width,this.height); }),
    lineWidth: bind(function(){ return 0.5 * this.lineLength; }),
    invalidators: ['backgroundColor','lineColor','lineLength','lineWidth'], //width and height are added automatically
    useBuffer: true,
  }));

  var centerX = 0;
  var centerY = 0;
  var radius = 0;
  var lineLength = 0;
  var lineWidth = 0;

  function onCalculateCancelIcon(){
    centerX = this.width / 2;
    centerY = this.height / 2;
    radius = Math.min(centerX,centerY);
    lineLength = this.lineLength;
    lineWidth = this.lineWidth;
  }

  function onSetContextCancelIcon(){

  }

  function onDrawCancelIcon(ctx){
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

  obj.onCalculate = onCalculateCancelIcon;
  obj.onSetContext = onSetContextCancelIcon;
  obj.ondraw = onDrawCancelIcon;

  //add a behavior of emitting a click event
  obj.on(gestures.click(obj),function(){
    var self = this;
    obj.emit('cancel');
  });
  
  return obj;
};