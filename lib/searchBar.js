var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var textbox = require('./textbox');
var html = uijs.html;
var positioning = uijs.positioning;
var bind = uijs.bind;
var searchIcon = require('./searchIcon');

module.exports = function(options) {
  var obj = box(defaults(options, {
    backgroundItem: box({
      width: bind(function(){return obj.width;}),
      height: bind(function(){return obj.height;}),
      ondraw: function(ctx){
        var self = this;
        var w = self.width;
        var h = self.height;
        var r = 0.35*h;

        ctx.fillStyle = 'silver';
        ctx.fillRect(0, 0, w, h);

        ctx.beginPath();
        ctx.moveTo(2*r, h/2);
        ctx.lineTo(w - 2*r, h/2);
        ctx.lineWidth = 2*r;
        ctx.strokeStyle = 'White';
        ctx.lineCap = 'round';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'black';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = -1;
        ctx.stroke();
      }
    }),
    searchIcon: searchIcon({
      x:bind(function(){return 0.7*obj.height - this.height/2; }),
      y:bind(function(){return obj.height/2 - this.height/2; }),
      height: bind(function(){ return 0.35 * obj.height }),
      width: bind(function(){ return 0.35 * obj.height }),
    }),
    input: textbox({
      x:bind(positioning.prev.right(+2)),
      y:bind(function(){return obj.height/2 - this.height/2; }),
      //set a fix height until merge with main
      height: 25,
      placeholder:'Search ...',
    }),
  }));

  obj.input.width = bind(obj.input, 'width', function(){
    return (obj.width - this.x - 0.45 * obj.height);//(1.05*obj.height) - 20); 
  }),
  /*obj.input.height = bind(obj.input, 'height', function(){
    return (0.62*obj.height); 
   }),*/

  obj.searchValue = bind(obj, 'searchValue', function(){ return obj.input.text; });

  obj.add(obj.backgroundItem);
  obj.add(obj.searchIcon);
  obj.add(obj.input);
  

  return obj;
};