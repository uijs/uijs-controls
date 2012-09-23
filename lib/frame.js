// a frame is a non-filled rectangular shape

var uijs = require('uijs-core');
var defaults = uijs.util.defaults;

module.exports = function(options) {
  var obj = uijs.box(defaults(options, {
    color: 'black',
    lineCap: 'butt', // 'round', 'sqaure'
    lineWidth: 4,
    invalidators: [ 'lineCap', 'lineWidth' ],
  }));

  obj.onSetContext = function onSetContextFrame(ctx) {
    ctx.strokeStyle = this.color;
    ctx.lineCap = this.lineCap;
    ctx.lineWidth = this.lineWidth;
  };

  obj.ondraw = function ondrawFrame(ctx) {
    ctx.strokeRect(0, 0, this.width, this.height);
  };

  return obj;
};
