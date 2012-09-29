// adds an fps metric indicator on the bottom-left corner of it's parent box

var uijs = require('uijs-core');
var label = require('./label');

function Fps(options) {
  if (!(this instanceof Fps)) return new Fps(options);

  this.set({
    text: uijs.bind(format),
    size: 10,
    adjustsBoxSizeToFitFontSize: true,
    font: 'courier',
    color: '#888',
    x: 2,
    y: uijs.bind(function() { return this.parent.height - this.height - 2 }),
  });

  this._min = 9999;
  this._max = 0;

  return this.set(options);
}

var fps = Fps.prototype = label();

module.exports = Fps;

// -- private

function format() {
  var fps = this.root().fps;
  if (fps < this._min) this._min = fps;
  if (fps > this._max && fps < 400) this._max = fps;
  var _ = fps.toString().split('.');
  var radix = _[1] || '0';
  return fmtnumber(fps) + ' fps (min=' + fmtnumber(this._min) + ' max=' + fmtnumber(this._max) + ')';
}

function fmtnumber(n) {
  var _ = n.toString().split('.');
  var a = _[0] || '0';
  var d = _[1] || '0';

  for (var i = 0; i < 3 - a.length; ++i) {
    a = '0' + a;
  }

  return a + '.' + d.substring(0, 1);
}