var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;

module.exports = function(options) {
  var obj = box(defaults(options, {
    text: '',
    font: 'Helvetica',
    bold: false,
    color: 'black',
    align:'center',//left,center,right
    verticalAlign:'middle',//top,middle,bottom
    //sizing 
    size: 20,
    adjustsFontSizeToFitWidth:false,
    adjustsBoxSizeToFitFontSize:false, 
    //highlight
    highlightedTextColor:'gray',
    highlighted:false,
    //shadow
    shadowColor:null,
    shadowOffsetX:0,
    shadowOffsetY:-1,
    shadowBlur:1,    
  }));

  var recalculate = true;
  var xPosCache = 0;
  var yPosCache = 0;

  function set_recalculate(){
    recalculate = true;
  }

  function set_recalculate_shadow(){
    var self = this;
    if(self.shadowColor != 'null'){
      recalculate = true;  
    }
  }

  var firstDraw = true;
    

  function renderLabel(ctx, text, x, y){
    ctx.fillText(text, x, y);
  }

  function onDrawLabel(ctx) {
    if(firstDraw){
      obj.watch('width', set_recalculate);
      obj.watch('height', set_recalculate);
      obj.watch('text', set_recalculate);
      obj.watch('font', set_recalculate);
      obj.watch('bold', set_recalculate);
      obj.watch('align', set_recalculate);
      obj.watch('verticalAlign', set_recalculate);
      obj.watch('size', set_recalculate);
      obj.watch('adjustsFontSizeToFitWidth', set_recalculate);
      obj.watch('adjustsBoxSizeToFitFontSize', set_recalculate);
      obj.watch('shadowColor', set_recalculate);
      obj.watch('shadowOffsetX', set_recalculate_shadow);
      obj.watch('shadowOffsetY', set_recalculate_shadow);
      obj.watch('shadowOffsetBlur', set_recalculate_shadow);
      firstDraw = false;
    }

    var self = this;

    self.text;
    self.font;
    self.bold;
    self.align;
    self.verticalAlign;
    self.size;
    self.adjustsFontSizeToFitWidth;
    self.adjustsBoxSizeToFitFontSize;
    self.width;
    self.height;
    
    if (self.shadowColor != 'null'){
      self.shadowOffsetX;
      self.shadowOffsetY;
      self.shadowBlur;
    }

    if(recalculate){
      if(self.adjustsFontSizeToFitWidth){
        self.updateSize(ctx);
      }

      self.fontCache = ((self.bold) ? 'bold ' : '') + self.size + 'px ' + self.font;
      ctx.font = self.fontCache;
      var textWidth = ctx.measureText(self.text).width;
      var textHieght = self.getTextHeight(self.fontCache);

      var shadowOffsetWidth = (self.shadowColor != 'null') ? self.shadowOffsetX : 0;
      var shadowOffsetHeight = (self.shadowColor != 'null') ? self.shadowOffsetY : 0;

      if(self.adjustsBoxSizeToFitFontSize){
        self.width = textWidth + Math.abs(shadowOffsetWidth);
        self.height = textHieght + Math.abs(shadowOffsetHeight)
      }

      var w = self.width;
      var h = self.height;

      switch (self.align) {
        case 'left':
          xPosCache = -1 * Math.min(0,shadowOffsetWidth);
          break;

        case 'right':
          xPosCache = w - textWidth + (-1 * Math.max(0,shadowOffsetWidth));
          break;

        case 'center':
        default:
          xPosCache = w / 2 - textWidth / 2 + (-0.5 *  shadowOffsetWidth);
          break;
      }

      switch (self.verticalAlign) {
        case 'top':
          yPosCache = textHieght + (-1 * Math.min(0,shadowOffsetHeight));
          break;

        case 'middle':
          yPosCache = h/2 + textHieght /2 + (-0.5 *  shadowOffsetHeight);
          break;

        case 'bottom':
        default:
          yPosCache = h + (-1 * Math.max(0,shadowOffsetHeight));
          break;
      }
      recalculate = false;
    }

    if(self.shadowColor != 'null') {
      ctx.shadowBlur = self.shadowBlur;
      ctx.shadowColor = self.shadowColor;
      ctx.shadowOffsetX = self.shadowOffsetX;
      ctx.shadowOffsetY = self.shadowOffsetY;
    }

    ctx.fillStyle = (self.highlighted) ? self.highlightedTextColor : self.color;    
    ctx.textBaseline="bottom";

    ctx.font = self.fontCache;
    renderLabel(ctx, self.text, xPosCache, yPosCache);
  }

  obj.ondraw = onDrawLabel;
  
  obj.getTextHeight = function(font) {
    var self = this;

    //var div1 = document.createElement("div");
    //document.body.appendChild(div1);

    var span = document.createElement("span");
    span.style.font = font;
    span.innerHTML = self.text;
    document.body.appendChild(span);
    var textHeight = span.offsetHeight - (self.size * 0.17)
    document.body.removeChild(span);
    return textHeight;

    /*var div = document.createElement("div");
    div.style.display = "inline-block";
    div.style.width= "1px";
    div.style.height= "0px";
    div.style.verticalAlign= "baseline";
    document.body.appendChild(div);
    */

    //console.log('height !!!! - '+ span.offsetHeight);
    //var textHeight = div.offsetTop - span.offsetTop - (this.size * 0.17);

    
    //document.body.removeChild(div);
  }

  obj.updateSize = function(ctx){
    var self = this;
    if(self.width <= 0) return;

    var maxSize = (typeof(self.adjustsFontSizeToFitWidth) === 'number') ?
      self.adjustsFontSizeToFitWidth : Number.MAX_VALUE;
    
    var shadowWidth = (self.shadowColor) ? Math.abs(self.shadowOffsetX) : 0;
    var width = self.width - shadowWidth;
    var size = self.size;
    var text = self.text;
    var bold = self.bold;
    var font = self.font;

    ctx.font = ((bold) ? 'bold ' : '') + size + 'px ' + font; 
    var textMeasurment = ctx.measureText(text);
    
    if (width !== textMeasurment.width && size < maxSize){
      ctx.font = ((bold) ? 'bold ' : '') + (size + 20 ) + 'px ' + font; 
      var delta = (ctx.measureText(text).width - textMeasurment.width)/20;
      self.size = size + Math.floor((width - textMeasurment.width)/delta);
      ctx.font = ((bold) ? 'bold ' : '') + (self.size) + 'px ' + self.font; 
      textMeasurment = ctx.measureText(text);

      while (textMeasurment.width < width && self.size < maxSize){
        self.size++;
        ctx.font = ((self.bold) ? 'bold ' : '') + self.size + 'px ' + self.font; 
        textMeasurment = ctx.measureText(self.text);
      }

      while (textMeasurment.width > width){
        self.size--;
        ctx.font = ((self.bold) ? 'bold ' : '') + self.size + 'px ' + self.font; 
        textMeasurment = ctx.measureText(self.text);
      }
    }
    self.size = Math.min(maxSize,self.size);
  }
  return obj;
}