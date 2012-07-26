var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var image = require('./image');
var label = require('./label');
var positioning = uijs.positioning;

module.exports = function(options) {
  var obj = box({
    alpha:function() {return this._touching ? 0.8 : 1.0;},
  });

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