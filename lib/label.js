var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;

module.exports = function(options) {
  var obj = box(defaults(options, {
    //text 
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

  function renderLabel(ctx, text, x, y){
    ctx.fillText(text, x, y);
  }

  function onDrawLabel(ctx) {
    var self = this;

    if (!self.text) return;
        
    if(self.adjustsFontSizeToFitWidth){
      self.updateSize(ctx);
    }
    
    var font = ((self.bold) ? 'bold ' : '') + self.size + 'px ' + self.font;
    ctx.font = font;
    
    var textWidth = ctx.measureText(self.text).width;
    var textHieght = self.getTextHeight(font);

    var shadowOffsetWidth = (self.shadowColor != 'null') ? self.shadowOffsetX : 0;
    var shadowOffsetHeight = (self.shadowColor != 'null') ? self.shadowOffsetY : 0;

    if(self.adjustsBoxSizeToFitFontSize){
      self.width = textWidth + Math.abs(shadowOffsetWidth);
      self.height = textHieght + Math.abs(shadowOffsetHeight)
    }

    var w = self.width;
    var h = self.height;

    var xPos,yPos;
    switch (self.align) {
      case 'left':
        xPos = -1 * Math.min(0,shadowOffsetWidth);
        break;

      case 'right':
        xPos = w - textWidth + (-1 * Math.max(0,shadowOffsetWidth));
        break;

      case 'center':
      default:
        xPos = w / 2 - textWidth / 2 + (-0.5 *  shadowOffsetWidth);
        break;
    }

    switch (self.verticalAlign) {
      case 'top':
        yPos = textHieght + (-1 * Math.min(0,shadowOffsetHeight));
        break;

      case 'middle':
        yPos = h/2 + textHieght /2 + (-0.5 *  shadowOffsetHeight);
        break;

      case 'bottom':
      default:
        yPos = h + (-1 * Math.max(0,shadowOffsetHeight));
        break;
    }

    if(self.shadowColor) {
      ctx.shadowBlur = self.shadowBlur;
      ctx.shadowColor = self.shadowColor;
      ctx.shadowOffsetX = self.shadowOffsetX;
      ctx.shadowOffsetY = self.shadowOffsetY;
    }

    ctx.fillStyle = (self.highlighted) ? self.highlightedTextColor : self.color;
    ctx.textBaseline="bottom";

    renderLabel(ctx, self.text, xPos, yPos);
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

    var shadowWidth = (self.shadowColor) ? Math.abs(self.shadowOffsetX) : 0;
    var width = self.width - shadowWidth;
    var size = self.size;
    ctx.font = ((self.bold) ? 'bold ' : '') + size + 'px ' + self.font; 
    var textMeasurment = ctx.measureText(self.textCache);
    if (width !== textMeasurment.width){
      ctx.font = ((self.bold) ? 'bold ' : '') + (size + 20 ) + 'px ' + self.font; 
      var delta = (ctx.measureText(self.text).width - textMeasurment.width)/20;
      self.size = size + Math.floor((width - textMeasurment.width)/delta);
      ctx.font = ((self.bold) ? 'bold ' : '') + (self.size) + 'px ' + self.font; 
      textMeasurment = ctx.measureText(self.text);

      while (textMeasurment.width < width){
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
  }

  return obj;
}