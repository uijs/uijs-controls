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
    if (!this.text) return;

    if(this.border) { this.border(ctx);}
    
    ctx.fillStyle = this.color;
    ctx.font = ((this.bold) ? 'bold ' : '') + ((this.italic) ? 'italic ' : '') + this.size + 'px ' + this.font;
    

    var m = ctx.measureText(this.text);

    if(this.shadow) {this.shadow(ctx);}
    ctx.fillText(this.text, (this.center)? this.width / 2 - m.width / 2 - 1 : 0, this.height / 2 - this.size / 2 + this.size - 20/100 * this.size);
  };

  return obj;
}