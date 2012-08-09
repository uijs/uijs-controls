var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var image = require('./image');
var label = require('./label');
var positioning = uijs.positioning;
var rect = require('./rect');
var bind = uijs.bind;

module.exports = function(options) {
  var obj = box(defaults(options, {
    alpha: bind(obj, 'alpha', function() { return this._touching ? 0.8 : 1.0; }),
    background: 'white',
    color: 'black',
    text: '',
    image: null,
  }));

  obj.add(rect({
    width: bind(undefined, 'width', positioning.parent.width()),
    height: bind(undefined, 'height', positioning.parent.height()),
    color: bind(undefined, 'color', function() { return obj.background; }),
  }));

  obj.add(image({
    width: bind(undefined, 'width', positioning.parent.width()),
    height: bind(undefined, 'height', positioning.parent.height()),
    image: bind(undefined, 'image', function() { return obj.image; }),
  }));

  obj.add(label({
    center: true,
    color: bind(undefined, 'color', function() { return obj.color; }),
    width: bind(undefined, 'width', positioning.parent.width()),
    height: bind(undefined, 'height', positioning.parent.height()),
    text: bind(undefined, 'text', function() { return obj.text; }),
  }));

  obj.on('touchstart', function() {
    this._touching = true;
    this.startCapture();
  });

  obj.on('touchend', function(e) {
    this._touching = false;
    this.stopCapture();
    
    // touchend outside
    if (e.x < 0 || e.x > this.width ||
        e.y < 0 || e.y > this.height) {
      return;
    }

    this.emit('click');
  });

  return obj;
};