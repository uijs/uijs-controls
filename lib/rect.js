var uijs = require('uijs');
var box = uijs.box;
var defaults = uijs.util.defaults;

module.exports = function(options) {
  	var obj = box(defaults(options, {
    	color: 'gray',
      invalidators: ['color'], //width and hight are added automatically
      useBuffer: false,
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
      ctx.fillStyle = colorCache;
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