var uijs = require('uijs');
var box = uijs.box;
var defaults = uijs.util.defaults;

module.exports = function(options) {
  	var obj = box(defaults(options, {
    	color: 'gray',
  	}));

   	obj.ondraw = function(ctx) {
   		var self = this;
   		if (self.width === 0 || self.height === 0) return;

   		ctx.fillStyle = self.color;
   		ctx.fillRect(0, 0, self.width, self.height);
    } 

	return obj;
}; 