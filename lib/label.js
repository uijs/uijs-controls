var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;

module.exports = function(options) {
  var obj = box(defaults(options, {
    // text 
    text: '',
    font: 'Helvetica',
    bold: false,
    color: 'black',
    align: 'center', // left,center,right
    verticalAlign: 'middle', //top,middle,bottom
    
    // sizing 
    size: 20,
    fitMaxSize: Number.MAX_VALUE,
    fitMinSize: 0,
    adjustsFontSizeToFitWidth: false,
    adjustsBoxSizeToFitFontSize: false, 
    
    // highlight
    highlightedTextColor: 'gray',
    highlighted: false,
    
    // shadow
    shadowColor: null,
    shadowOffsetX: 0,
    shadowOffsetY: -1,
    shadowBlur: 1,
    useBuffer: true,
    invalidators: ['text', 'font', 'bold', 'align', //width and hight are added automatically
                   'verticalAlign', 'size', 'fitMaxSize', 'fitMinSize', 
                   'adjustsFontSizeToFitWidth', 'adjustsBoxSizeToFitFontSize', 
                   'shadowColor', 'shadowOffsetX', 'shadowOffsetY', 'shadowOffsetBlur',
                   'color', 'highlighted', 'highlightedTextColor'], 
  }));

  var xPosCache = 0;
  var yPosCache = 0;
  var labelDrawText;
  var fontCache = "";

  function onCalculateLabel(ctx){
    var self = this;
    if (!self.text) return;
    labelDrawText = self.text;
    if(self.adjustsFontSizeToFitWidth){
      self.updateSize(ctx);
    }

    fontCache = ((self.bold) ? 'bold ' : '') + self.size + 'px ' + self.font;
    ctx.font = fontCache;

    var textWidth = ctx.measureText(self.text).width;
    var textHieght = getFontHeight(fontCache, self.size);

    var shadowOffsetWidth = (self.shadowColor) ? self.shadowOffsetX : 0;
    var shadowOffsetHeight = (self.shadowColor) ? self.shadowOffsetY : 0;

    if(self.adjustsBoxSizeToFitFontSize){
      self.width = textWidth + Math.abs(shadowOffsetWidth);
      self.height = textHieght + Math.abs(shadowOffsetHeight)
    }

    var w = self.width;
    var h = self.height;

    if(w - Math.abs(shadowOffsetWidth) < textWidth ){
      var res = self.cutOffText(ctx, textWidth); 
      labelDrawText = res.text;
      textWidth = res.textWidth.width;
    }

    switch (self.align) {
      case 'left':
        xPosCache = -1 * Math.min(0,shadowOffsetWidth);
        break;

      case 'right':
        xPosCache = w - textWidth + (-1 * Math.max(0,shadowOffsetWidth));
        break;

      case 'center':
        xPosCache = w / 2 - textWidth / 2 + (-0.5 *  shadowOffsetWidth);
        break;
        default:
          xPosCache = (isNumber(self.align)) ? parseInt(self.align) :
                                               (-1 * Math.min(0,shadowOffsetWidth));
          break;
      }

    switch (self.verticalAlign) {
      case 'bottom':
        yPosCache = h + (-1 * Math.max(0,shadowOffsetHeight));
        break;

      case 'top':
        yPosCache = textHieght + (-1 * Math.min(0,shadowOffsetHeight));
        break;

      case 'middle':
        yPosCache = h/2 + textHieght /2 + (-0.5 *  shadowOffsetHeight);
        break;
        
      default:
        yPosCache =  (isNumber(self.verticalAlign)) ? parseInt(self.verticalAlign) :
                                                     (h + (-1 * Math.max(0,shadowOffsetHeight)));
        break;
    }
  }

  function onSetContextLabel(ctx){
    var self = this;
    if (!self.text) return;
    if(self.shadowColor) {
      ctx.shadowBlur = self.shadowBlur;
      ctx.shadowColor = self.shadowColor;
      ctx.shadowOffsetX = self.shadowOffsetX;
      ctx.shadowOffsetY = self.shadowOffsetY;
    }

    ctx.fillStyle = (!self.highlighted) ? self.color : self.highlightedTextColor;    
    ctx.textBaseline="bottom";

    ctx.font = fontCache;
  }

  function onDrawLabel(ctx) {
    var self = this;
    if (!self.text) return;
    renderLabel(ctx, labelDrawText, xPosCache, yPosCache);
  }

  obj.ondraw = onDrawLabel;
  obj.onCalculate = onCalculateLabel;
  obj.onSetContext = onSetContextLabel;

  obj.updateSize = function(ctx){
    var self = this;
    if(self.width <= 0) return;

    var shadowWidth = (self.shadowColor) ? Math.abs(self.shadowOffsetX) : 0;
    var width = self.width - shadowWidth;
    var size = self.size;
    var text = self.text;
    var bold = self.bold;
    var font = self.font;
    var maxSize = self.fitMaxSize;
    var minSize = self.fitMinSize;

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

      while (textMeasurment.width > width && self.size > minSize){
        self.size--;
        ctx.font = ((self.bold) ? 'bold ' : '') + self.size + 'px ' + self.font; 
        textMeasurment = ctx.measureText(self.text);
      }
    }
    self.size = Math.max(minSize,Math.min(maxSize,self.size));
  }

  obj.cutOffText = function(ctx, textWidth){
    var self = this;
    if(self.width <= 0) return;

    var shadowWidth = (self.shadowColor) ? Math.abs(self.shadowOffsetX) : 0;
    var width = self.width - shadowWidth;
    var size = self.size;
    var text = self.text;
    var textMeasurment;
    var newText;
    ctx.font = ((self.bold) ? 'bold ' : '') + self.size + 'px ' + self.font;
    
    var endTextIndex = Math.floor(textWidth/text.length) - 3;
    while ((textMeasurment = ctx.measureText(newText = text.substr(0,endTextIndex) +'...')).width < width){
      endTextIndex++;
    }

    while ((textMeasurment = ctx.measureText(newText = text.substr(0,endTextIndex)+'...')).width > width){
      endTextIndex--;
    }

    return {text:newText,textWidth:textMeasurment};
  }

  function renderLabel(ctx, text, x, y){
    ctx.fillText(text, x, y);
  }

  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  return obj;
}

// -- private

var fontSizeMapper = {};

function getFontHeight(font, size) {
  if(!fontSizeMapper[font]) {
    var self = this;

      var span = document.createElement("span");
      span.style.font = font;
      span.innerHTML = 'Sg';
      document.body.appendChild(span);
      var fontHeight = span.offsetHeight;
      document.body.removeChild(span);
      fontSizeMapper[font] = fontHeight;
  }
  return fontSizeMapper[font];
}