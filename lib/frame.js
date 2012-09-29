// a frame is a non-filled rectangular shape

var uijs = require('uijs-core');
var Box = uijs.Box;
var defaults = uijs.util.defaults;

function Frame(options) {
  if (!(this instanceof Frame)) return new Frame(options);
  Box.call(this);

  this.set({
    color: 'black',
    lineCap: 'butt', // 'round', 'sqaure'
    lineWidth: 4,
    invalidate: [ 'color', 'lineCap', 'lineWidth' ],
  });

  return this.set(options);
}

var frame = Frame.prototype = new Box();

frame.onprepare = function(ctx, recalc) {
  ctx.strokeStyle = this.color;
  ctx.lineCap = this.lineCap;
  ctx.lineWidth = this.lineWidth;
};

frame.ondraw = function(ctx) {
  ctx.strokeRect(0, 0, this.width, this.height);
};

// trying to be liberal about prototypical inheritence...
// exporting `Frame` which can be treated both as a factory function: `var frame = require('frame'); var myframe = frame();`
// and as a prototypical ctor: `var Frame = require('frame'); var myframe = new Frame()`
// and naturally extended via `Frame.prototype.xxx = yyy`.
module.exports = Frame;