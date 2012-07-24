var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;

module.exports = function(options) {

  var obj = image(defaults(options, {
    image: null,
    stretchWidth: true,
    stretchHeight: true,
    width: 100, height: 40,
  }));

  var _ondraw = obj.ondraw;

  obj.alpha = function() { 
    return this._touching ? 0.8 : 1.0;
  };

  obj.add(label({
    x: 0,
    y: 0,
    width: positioning.parent.width(),
    height: positioning.parent.height(),
    color: 'white',
    text: function() { return obj.text; },
    size: function() { return 40/100 * obj.height; },
  }));

  obj.on('touchstart', function() {
    console.log('touch start');
    this._touching = true;
    this.startCapture();
  });

  obj.on('touchend', function(e) {
    console.log('touch end');
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