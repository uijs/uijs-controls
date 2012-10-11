var uijs = require('uijs-core');
var Box = uijs.Box;
var activity = require('./activity');
var util = uijs.util;
var defaults = util.defaults;

function Image(options) {
  if (!(this instanceof Image)) return new Image(options);
  Box.call(this);

  this.set({
    image: null,
    stretchWidth: false,
    stretchHeight: false,
    fit: false,
    horizontalAlign: 'center',
    verticalAlign: 'middle',
    adjustsBoxSizeAccordingToImage: false,
    invalidators: ['image', 'stretchWidth', 'stretchHeight', 'fit', 'horizontalAlign', 'verticalAlign', 
                    'adjustsBoxSizeAccordingToImage', /*'loadtime'*/ ], //width and hight are added automatically 
    useBuffer: false,
    //loadtime: uijs.bind(calc_loadtime),
    //loaded: false,
    //activity: false, // shows an activity indicator while loading (default `false`)
    id: 'image',
  });

  var self = this.set(options);
  
  // add watch to image to make the control invalid when a new
  // image is loaded
  self.watch('image', function(new_val){
    if (!new_val){
      return;
    }
    var oldOnLoad = new_val.onload;
    new_val.onload = function(){
      self.invalidate();
      if(oldOnLoad){
        oldOnLoad.apply(this, arguments);
      }
    }
  });

  /*
  // TODO: Think whether we want to, and how to add this back.
  //       Also, need to make sure that the activity is removed from the
  //       children when no longer needed
  self.add(activity({
    visible: uijs.bind(function() { return self.activity && !self.loadtime }),
    width: uijs.positioning.fill.width(),
    height: uijs.positioning.fill.height(),
  }));
  */
  return self;
}

var image = Image.prototype = new Box();

image.onCalculate = function onCalculateImage(ctx, scale, oppositeScale){
  this._img = this.image;
  if (!this._img) return;
  var w = this._img.width;
  var h = this._img.height;

  //if (typeof window !== 'undefined') {
  //  w = w / window.devicePixelRatio;
  //  h = h / window.devicePixelRatio;
  //}
  if(this._img.src.indexOf("@2x") !== -1) {
    w = w / 2;
    h = h / 2;
  }
  if(this.adjustsBoxSizeAccordingToImage){
    this._img_x = 0;
    this._img_y = 0;
    this._img_w = w;
    this._img_h = h;
  }
  else{
    if (w === 0 || h === 0) {
      return;
    }
    else
    {
      var strw = this.stretchWidth;
      var strh = this.stretchHeight;
      var boxw = this._width;
      var boxh = this._height;
      var x, y;

      if(w > boxw || h > boxh)
      {
        //resize width
        h = h * boxw/w;
        w = boxw;
        //resize height if needed 
        if(h > boxh)
        {
          w = w * boxh/h;
          h = boxh;
        } 
      }

      if(this.fit) {
        if(boxw/w <= boxh/h) {
          h = h * boxw/w;
          w = boxw;
        }
        else {
          w = w * boxh/h;
          h = boxh;
        }
      }
      else {
        if (strw) {
          h = Math.min(h * boxw/w,boxh);
          w = boxw;  
        }
        if (strh) {
          w = Math.min(w * boxh/h,boxw);
          h = boxh;
        }
      }
      
      switch (this.horizontalAlign) {
        case 'left':
          x = 0;
          break;

        case 'right':
          x = boxw - w;
          break;

        case 'center':
        default:
          x = boxw / 2 - w / 2;
          break;
      }

      switch (this.verticalAlign) {
        case 'top':
          y = 0;
          break;

        case 'bottom':
          y = boxh - h;
          break;

        case 'middle':
        default:
          y = boxh / 2 - h / 2;
          break;
      }
      this._img_x = x;
      this._img_y = y;
      this._img_w = w;
      this._img_h = h; 
    }
  }
};

image.onSetContext = function onSetContextImage(ctx) {};

image.ondraw = function onDrawImage(ctx, scale, oppositeScale) {
  if (!this._img) return;
  ctx.save();
  ctx.scale(oppositeScale, oppositeScale);
  renderImage(ctx, this._img, this._img_x * scale, this._img_y * scale, this._img_w * scale, this._img_h * scale);  
  ctx.restore();
};

/*
function calc_loadtime() {
  var lt = this.image && this.image.loadtime;
  return lt;
}
*/

function renderImage(ctx, img, x, y, w, h){
  if (img.width === 0 || img.height === 0){
    return;
  }
  ctx.drawImage(img, x, y, w, h);
}

// trying to be liberal about prototypical inheritence...
// exporting `Image` which can be treated both as a factory function: `var image = require('image'); var myimage = image();`
// and as a prototypical ctor: `var Frame = require('image'); var myframe = new Frame()`
// and naturally extended via `Frame.prototype.xxx = yyy`.
module.exports = Image;