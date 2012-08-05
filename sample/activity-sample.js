var uijs = require('uijs');

var box = uijs.box;
var util = uijs.util;
var positioning = uijs.positioning;
var controls = require('..');
var activity = controls.activity;
var bind = uijs.bind;

var html = uijs.html;

var app = box();
app.ondraw = function(ctx) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, this.width, this.height);
}

var start = Date.now();
app.add(activity.line({
  x: 0,
  y: 0,
  width: 50,
  height: 100,
  animating: bind(app, 'animating', function () { return Date.now() - start < 2000 || Date.now() - start > 5000; }),
}));

module.exports = app;