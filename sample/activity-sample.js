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
};

var start = Date.now();
app.add(activity.line({
  x: 10,
  y: 10,
  width: 100,
  height: 100,
  animating: true, //bind(function () { return Date.now() - start < 2000 || Date.now() - start > 5000; }),
}));

module.exports = app;