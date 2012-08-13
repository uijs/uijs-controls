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
    adjustsBoxSizeAccordingToImage:false,
    recalculate: true,
  }));

  function set_recalculate(){
    this.recalculate = true;
  }

  obj.watch('image', set_recalculate);
  obj.watch('stretchWidth', set_recalculate);
  obj.watch('stretchHeight', set_recalculate);
  obj.watch('fit', set_recalculate);
  obj.watch('horizontalAlign', set_recalculate);
  obj.watch('verticalAlign', set_recalculate);

  function renderImage(ctx, img, x, y, w, h){
    ctx.drawImage(img, x, y, w, h);
  }

  function onDrawImage(ctx){
    var self = this;

    var img = self.image;
    if (!img) return;
    if(self.adjustsBoxSizeAccordingToImage){
      renderImage(ctx, img, 0, 0, img.width, img.height);
      return;
    }
    else{
      self.stretchWidth;
      self.stretchHeight;
      self.fit;
      self.horizontalAlign;
      self.verticalAlign;

      if(self.recalculate){
        w = img.width;
        h = img.height;
        if (w === 0 || h === 0) {
          return;
        }
        else
        {
          var strw = self.stretchWidth;
          var strh = self.stretchHeight;
          var boxw = self.width;
          var boxh = self.height;
          var x, y, w, h;

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
          self.xCache = x;
          self.yCache = y;
          self.wCache = w;
          self.hCache = h; 
        }
        
        set_recalculate = false;
        renderImage(ctx, img, self.xCache, self.yCache, self.wCache, self.hCache);
      }
    }
  }

  obj.ondraw = onDrawImage;

  return obj;
};