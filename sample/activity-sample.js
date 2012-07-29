var uijs = require('uijs');

var box = uijs.box;
var util = uijs.util;
var positioning = uijs.positioning;
var controls = require('..');
var activity = controls.activity;

var html = uijs.html;

var app = box();
app.ondraw = function(ctx) {
       ctx.fillStyle = 'black';
       ctx.fillRect(0, 0, this.width, this.height);
   }

app.add(activity({
  x: 0,
  y: 0,
  width: 200,
  height: 100,
  lineType: 'dot',
  animating: true,
  }));



module.exports = app;