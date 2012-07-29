var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;

module.exports = function(options) {
  var obj = box(defaults(options, {
    text: '',
    size: 20,
    font: 'Helvetica',
    color: 'black',
    bold: false,
    italic: false,
    border: null,
    shadow: null,
    center: false,
    /*border: function(ctx) {
      ctx.strokeStyle = 'yellow';
      ctx.strokeRect(0, 0, this.width, this.height);
    },
    shadow: function(ctx){
      ctx.shadowBlur = 2;
      ctx.shadowColor = 'black';
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    },*/

    height: function() { return this.size + 20/100 * this.size },
  }));

  obj.ondraw = function(ctx) {
    var self = this;
    var text = self.text;

    if (!text) return;

    var border = self.border;
    if(border) { border(ctx);}
    
    ctx.fillStyle = self.color;
    
    var size = self.size;
    var italic = self.italic;
    var font = self.font;
    var bold = self.bold;
    var calculatePlacement = false;
    if (self.prevBold !== bold || self.prevItalyc !== italic || self.prevSize !== size || self.prevFont !== font) {
      self.prevBold = bold;
      self.prevItalyc = italic;
      self.prevSize = size;
      self.prevFont = font;  
      self.fontCache = ((bold) ? 'bold ' : '') + ((italic) ? 'italic ' : '') + size + 'px ' + font; 
      calculatePlacement = true;
    };
    ctx.font = self.fontCache;

    if (self.textCache !== text) {
      self.textCache = text;
      self.mesurementCache = ctx.measureText(self.textCache);
      calculatePlacement = true;
    };

    var w = self.width;
    var h = self.height;
    if (self.widthCache !== w || self.heightCache !== h){
        calculatePlacement = true;
        self.widthCache = w;
        self.heightCache = h;
    }

    var center = self.center;
    if (self.centerCache !== center) {
      calculatePlacement = true;
      self.centerCache = center;
    };
    
    if (calculatePlacement) {
       self.xPosCache = self.center ? w / 2 - self.mesurementCache.width / 2 - 1 : 0;
       self.yPosCache = h / 2 - size / 2 + size - 20/100 * size;
    }

    var shadow = self.shadow;
    if(shadow) {shadow(ctx);}
    ctx.fillText(text, self.xPosCache, self.yPosCache);
  };

  return obj;
}