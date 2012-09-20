var uijs = require('uijs-core');
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
    invalidators: ['image', 'stretchWidth', 'stretchHeight', 'fit', 'horizontalAlign', 'verticalAlign', 
                       'adjustsBoxSizeAccordingToImage'], //width and hight are added automatically 
    useBuffer: false,
    id: 'image',
  }));

  function renderImage(ctx, img, x, y, w, h){
    ctx.drawImage(img, x, y, w, h);
  }

  var xCache = 0;
  var yCache = 0;
  var wCache = 0;
  var hCache = 0;
  var img = null;

  function onCalculateImage(){
    var self = this;

    img = self.image;
    if (!img) return;
    var w = img.width;
    var h = img.height;
    if (typeof window !== 'undefined') {
      w = w / window.devicePixelRatio;
      h = h / window.devicePixelRatio;
    }
    if(self.adjustsBoxSizeAccordingToImage){
      xCache = 0;
      yCache = 0;
      wCache = w;
      hCache = h;
    }
    else{
      if (w === 0 || h === 0) {
        return;
      }
      else
      {
        var strw = self.stretchWidth;
        var strh = self.stretchHeight;
        var boxw = self.width;
        var boxh = self.height;
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
        xCache = x;
        yCache = y;
        wCache = w;
        hCache = h; 
      }
    }
  }

  function onSetContextImage(ctx){}

  function onDrawImage(ctx){
    if (!img) return;
    renderImage(ctx, img, xCache, yCache, wCache, hCache);  
  }

  obj.ondraw = onDrawImage;
  obj.onCalculate = onCalculateImage;
  obj.onSetContext = onSetContextImage;

  return obj;
};