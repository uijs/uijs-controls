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

function determine_alpha(ha, nha){
  this.alpha = this.highlighted ? ha : nha;
}

function determine_color(hc, nhc){
 this.color = this.highlighted ? hc : nhc; 
}

module.exports = function(options) {
  var obj = box(defaults(options, {
    nonHighlightedAlpha: 1.0,
    highlightedAlpha: 0.8,
    background: 'white',
    nonHighlightedColor: 'black',
    highlightedColor: 'white',
    text: '',
    image: null,
    size: 20,
    useBuffer: true,
    id: 'button', //TODO: change `id` to `type`
  }));

  obj.watch('nonHighlightedAlpha', function(new_val) {
    determine_alpha.call(this, this.highlightedAlpha, new_val);
  }, true);
  obj.watch('higlightedAlpha',  function(new_val) {
    determine_alpha.call(this, new_val, this.nonhighlightedAlpha);
  }, true);
  obj.watch('nonHighlightedColor', function(new_val) {
    determine_Color.call(this, this.highlightedColor, new_val);
  }, true);
  obj.watch('highlightedColor',  function(new_val) {
    determine_Color.call(this, new_val, this.nonhighlightedColor);
  }, true);

  obj.watch('highlighted', function(new_val){
    if(new_val){
      this.alpha = this.highlightedAlpha;
      this.color = highlightedColor;
    }
    else{
      this.alpha = this.nonhighlightedAlpha;
      this.color = this.nonhighlightedColor;
    }
  }, true);

  obj.watch('touching', function(new_val){
    this.highlighted = new_val;
  }, true);

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
