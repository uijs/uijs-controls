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
  var w = 0;
  var h = 0;
  var r = 0;

  var obj = box(defaults(options, {
    backgroundItem: box({
      width: bind(function(){return obj.width;}),
      height: bind(function(){return obj.height;}),
      onCalculate: function() {
        w = this.width;
        h = this.height / 2;
        r = 2 * 0.35*h;
      },
      onSetContext: function(ctx) {
        ctx.fillStyle = 'silver';
        ctx.strokeStyle = 'White';
        ctx.lineCap = 'round';
        ctx.shadowColor = 'black';
        ctx.lineWidth = r;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = -1;
      },
      ondraw: function(ctx){
        var self = this;
        
        ctx.fillRect(0, 0, w, h * 2);

        ctx.beginPath();
        ctx.moveTo(r, h);
        ctx.lineTo(w - r, h);
        ctx.stroke();
      },
      useBuffer: true,
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
    invalidators: ['searchValue'],
    //useBuffer: true,
  }));

  obj.input.bind('width', function(){
    return (obj.width - this.x - 0.45 * obj.height);//(1.05*obj.height) - 20); 
  }),
  /*obj.input.height = bind(obj.input, 'height', function(){
    return (0.62*obj.height); 
   }),*/

  obj.bind('searchValue', function(){ return obj.input.text; });

  obj.add(obj.backgroundItem);
  obj.add(obj.searchIcon);
  obj.add(obj.input);
  

  return obj;
};