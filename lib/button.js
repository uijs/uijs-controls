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
    invalidators: ['color', 'nonHighlightedAlpha', 'nonHighlightedColor', 'highlightedAlpha', 'highlightedColor',
                    'background', 'text', 'image', 'size'],
  }));

  // TODO: there is a problem with these watches and sets in the
  //      callbacks here because we might set a property in the cb
  //      which is bound. Need to disable the watches if the callback sets
  //      a bound property
  obj.watch('nonHighlightedAlpha', function(new_val) {
    determine_alpha.call(this, this.highlightedAlpha, new_val);
  }, true);
  obj.watch('highlightedAlpha',  function(new_val) {
    determine_alpha.call(this, new_val, this.nonHighlightedAlpha);
  }, true);
  obj.watch('nonHighlightedColor', function(new_val) {
    determine_color.call(this, this.highlightedColor, new_val);
  }, true);
  obj.watch('highlightedColor',  function(new_val) {
    determine_color.call(this, new_val, this.nonHighlightedColor);
  }, true);

  obj.watch('highlighted', function(new_val){
    if(new_val){
      this.alpha = this.highlightedAlpha;
      this.color = this.highlightedColor;
    }
    else{
      this.alpha = this.nonHighlightedAlpha;
      this.color = this.nonHighlightedColor;
    }
  }, true);
  obj.watch('touching', function(new_val){
    this.highlighted = new_val;
  }, true);

  obj.backgroundbox = obj.add(rect({
    width: obj.width,
    height: obj.height,
    color: obj.background,
  }));

  obj.imagebox = obj.add(image({
    width: obj.width,
    height: obj.height,
    image: obj.image,
  }));

  obj.labelbox = obj.add(label({
    center: true,
    color: obj.color,
    width: obj.width,
    height: obj.height,
    text: obj.text,
    size: obj.size,
  }));

  obj.watch('width', function(new_val){
    this.backgroundbox.width = new_val;
    this.imagebox.width = new_val;
    this.labelbox.width = new_val;
  }, true);

  obj.watch('height', function(new_val){
    this.backgroundbox.height = new_val;
    this.imagebox.height = new_val;
    this.labelbox.width.height = new_val;
  }, true);

  obj.watch('background', function(new_val){
    this.backgroundbox.color = new_val;
  }, true);

  obj.watch('color', function(new_val){
    this.labelbox.width.color = new_val;
  }, true);

  obj.watch('image', function(new_val){
    this.imagebox.image = new_val;
  }, true);

  obj.watch('text', function(new_val){
    this.labelbox.text = new_val;
  }, true);

  obj.watch('size', function(new_val){
    this.labelbox.size = new_val;
  }, true);

  gestures.click(obj);

  return obj;
};
