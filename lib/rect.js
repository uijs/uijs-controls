var uijs = require('uijs');
var box = uijs.box;
var defaults = uijs.util.defaults;

module.exports = function(options) {
  	var obj = box(defaults(options, {
    	color: 'gray',
      invalidatingVars: ['x', 'y', 'width', 'height', 'color'],
      useBuffer: false,
  	}));

    function renderRect(ctx, x, y, w, h){
      ctx.fillRect(x, y, w, h);
    }

    var colorCache = null;
    var xCache = 0;
    var yCache = 0;
    var wCache = 0;
    var hCache = 0;

    function onCalculate(){
      var self = this;
      colorCache = self.color;
      xCache = 0;
      yCache = 0;
      wCache = self.width;
      hCache = self.height;
    }

    function onSetContext(ctx){
      if (!colorCache) {
        return;
      }
      ctx.fillStyle = colorCache;
    }

    function onDrawRect(ctx){
      if (!colorCache) {
        return;
      }      
      renderRect(ctx, xCache, yCache, wCache, hCache);
    }

   	obj.ondraw = onDrawRect;
    obj.onCalculate = onCalculate;
    obj.onSetContext = onSetContext;

	  return obj;
}; 