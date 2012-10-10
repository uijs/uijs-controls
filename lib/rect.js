var uijs = require('uijs-core');
var defaults = uijs.util.defaults;

function Rect(options) {
  if (!(this instanceof Rect)) return new Rect(options);
  uijs.Box.call(this);

  this.set({
    color: 'gray',
    invalidators: ['color'], //width and hight are added automatically
    useBuffer: false,
    id: 'rect',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    shadowColor: '#000',
  });

  return this.set(options);
}

var rect = Rect.prototype = new uijs.Box();

rect.renderRect = function renderRect(ctx, w, h){
  ctx.fillRect(0, 0, w, h);
}

rect.onCalculate = function onCalculateRect(){
  this.colorCache = self.color;
  this.wCache = self.width;
  this.hCache = self.height;
}

rect.onSetContext = function onSetContextRect(ctx){
  ctx.fillStyle = this.colorCache;
}

rect.ondraw = function onDrawRect(ctx){
  if (!this.colorCache) {
    return;
  }
  this.renderRect(ctx, this.wCache, this.hCache);
}

// TODO: re-enable when doing new render mode
/*
rect.onprepare = function(ctx, recalc) {
  var self = this;
  ctx.fillStyle = self.color;
  if ('shadowOffsetX' in self) ctx.shadowOffsetX = self.shadowOffsetX;
  if ('shadowOffsetY' in self) ctx.shadowOffsetX = self.shadowOffsetY;
  if ('shadowBlur' in self) ctx.shadowBlur = self.shadowBlur;
  if ('shadowColor' in self) ctx.shadowColor = self.shadowColor;
}

rect.ondraw = function ondrawRect(ctx) {
  if (!this.color) return;
  ctx.fillRect(0, 0, this.width, this.height);
};
*/

module.exports = Rect;