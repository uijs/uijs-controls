var uijs = require('uijs-core');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var image = require('./image');
var label = require('./label');
var positioning = uijs.positioning;
var rect = require('./rect');
var gestures = require('./gestures');
var bind = uijs.bind;

module.exports = function(options) {
  var obj = box(defaults(options, {
    alpha: bind(function() { return this.highlighted ? 0.8 : 1.0; }),
    background: 'white',
    color: bind(function() { return this.highlighted ? 'white' : 'black'; }),
    text: '',
    image: null,
    size: 20,
    highlighted: bind(function() { return this.touching; }), // highlighted when touching
    useBuffer: true,
    invalidators: [ 'highlighted' ],
    id: 'button', //TODO: change `id` to `type`
  }));

  obj.add(rect({
    width: bind(positioning.parent.width()),
    height: bind(positioning.parent.height()),
    color: bind(function() { return obj.background; })
  }));

  obj.add(image({
    width: bind(positioning.parent.width()),
    height: bind(positioning.parent.height()),
    image: bind(function() { return obj.image; })
  }));

  obj.add(label({
    center: true,
    color: bind(function() { return obj.color; }),
    width: bind(positioning.parent.width()),
    height: bind(positioning.parent.height()),
    text: bind(function() { return obj.text; }),
    size: bind(function() { return obj.size; }),
  }));

  gestures.click(obj);

  return obj;
};
