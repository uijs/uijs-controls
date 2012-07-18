var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;

module.exports = function(options) {
  var obj = box(defaults(options, {
    borderColor: 'gray',
    borderWidth: 1,
  }));

  obj.items = [];
  var bw = obj.borderWidth;
    
  obj.ondraw = function(ctx) {
    var self = this;

    var relY = (!self.y) ? 0 : self.y;
    //TODO: do not draw child if out of viewport
    Object.keys(self.items).forEach(function(key) {
      var item = self.items[key];

      //update item positioning
      item.x = (!self.x) ? bw : self.x + bw;
      item.y = relY + bw;
      item.width = self.width - bw ;
      item.height = item.height - bw ;
 
      //draw a border
      if(bw > 0)
      {
        ctx.strokeStyle = self.borderColor;
        ctx.lineWidth = bw;
      
        ctx.strokeRect(item.x - bw/2, item.y - bw/2, item.width + bw, item.height + bw);
      }
           
      //call item draw function
      item.draw.call(item, ctx);

      //restore original item height
      item.height = item.height + bw ;
      relY += item.height;  
    });
    
  }

  return obj;
};