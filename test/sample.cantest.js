var Canvas = require('canvas');
var uijs = require('uijs');
var box = uijs.box;

var app = box();

app.ondraw = function(ctx) {
  ctx.fillStyle = 'yellow';
  ctx.fillRect(0, 0, this.width(), this.height());
};

module.exports = function() {
  // attach uijs to the node-canvas canvas (cool!), 
  // `paused` is true so that the refresh loop will not begin, so we also need to call `redraw()`.
  var root = uijs.canvasize({ element: new Canvas(320, 480), children: [ app ] });
  root.redraw();
  return root.canvas;
};