var uijs = require('uijs');
var box = uijs.box;
var defaults = uijs.util.defaults;

module.exports = function(options) {
  	var obj = box(defaults(options, {
    	color: 'gray',
      invalidatingVars: ['x', 'y', 'width', 'height', 'color'],
      //useBuffer: true,
  	}));

    function renderRect(ctx, x, y, w, h){
      ctx.fillRect(x, y, w, h);
    }

    var colorCache = null;
    var xCache = 0;
    var yCache = 0;
    var wCache = 0;
    var hCache = 0;

    function onDrawRect(ctx){
      var self = this;

      if(self.recalculate){
        colorCache = self.color;
        xCache = 0;
        yCache = 0;
        wCache = self.width;
        hCache = self.height;
      }

      if (!colorCache) {
        return;
      }
      ctx.fillStyle = colorCache;
      renderRect(ctx, xCache, yCache, wCache, hCache);
    }

   	obj.ondraw = onDrawRect;

	  return obj;
}; 