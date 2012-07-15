var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;

module.exports = function(options) {
  var obj = box(defaults(options, {
    image: null,
    stretchWidth: false,
    stretchHeight: false,
    fit: false,
    horizontalAlign: 'center',
    verticalAlign: 'middle',
  }));

  obj.ondraw = function(ctx) {
    var self = this;

    if (!self.image) return;

    var img = self.image;
    if (!img) return;
    if (img.width === 0 || img.height === 0) return;

    var strw = self.stretchWidth;
    var strh = self.stretchHeight;
    var boxw = self.width;
    var boxh = self.height;
    var x, y, w, h;

    w = img.width;
    h = img.height;

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

    if(self.fit) {
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
    
    switch (self.horizontalAlign) {
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

   switch (self.verticalAlign) {
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
      
    ctx.drawImage(img, x, y, w, h);
  }

  return obj;
};