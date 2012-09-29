var uijs = require('uijs-core');
var box = uijs.box;
var defaults = uijs.util.defaults;

module.exports = function(options) {
  	var obj = box(defaults(options, {
    	color: 'gray',
      invalidators: ['color'], //width and hight are added automatically
      useBuffer: false,
      id: 'rect',
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowBlur: 0,
      shadowColor: '#000',
  	}));

    var colorCache = null;
    var wCache = 0;
    var hCache = 0;
    
    function renderRect(ctx, w, h){
      ctx.fillRect(0, 0, w, h);
    }

    function onCalculateRect(){
      var self = this;
      colorCache = self.color;
      wCache = self.width;
      hCache = self.height;
    }

    function onSetContextRect(ctx){
      var self = this;
      ctx.fillStyle = colorCache;
      if ('shadowOffsetX' in self) ctx.shadowOffsetX = self.shadowOffsetX;
      if ('shadowOffsetY' in self) ctx.shadowOffsetX = self.shadowOffsetY;
      if ('shadowBlur' in self) ctx.shadowBlur = self.shadowBlur;
      if ('shadowColor' in self) ctx.shadowColor = self.shadowColor;
    }

    function onDrawRect(ctx){
      if (!colorCache) {
        return;
      }      
      renderRect(ctx, wCache, hCache);
    }

   	obj.ondraw = onDrawRect;
    obj.onCalculate = onCalculateRect;
    obj.onSetContext = onSetContextRect;

	  return obj;
}; 