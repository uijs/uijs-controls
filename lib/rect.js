var uijs = require('uijs');
var box = uijs.box;
var defaults = uijs.util.defaults;

module.exports = function(options) {
  	var obj = box(defaults(options, {
    	color: 'gray',
  	}));

    function renderRect(ctx, x, y, w, h){
      ctx.fillRect(x, y, w, h);
    }

    function onDrawRect(ctx){
      var self = this;
      var color = self.color;
      if (!color) {
        return;
      }
      ctx.fillStyle = color;
      renderRect(ctx, 0, 0, self.width, self.height);
    }

   	obj.ondraw = onDrawRect;

	return obj;
}; 