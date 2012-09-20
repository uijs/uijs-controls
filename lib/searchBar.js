var uijs = require('uijs-core');
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
    placeholder: 'Search ...',
    id: 'search bar',
    backgroundItem: box({
      width: bind(function(){return obj.width;}),
      height: bind(function(){return obj.height;}),
      onCalculate: function() {
        w = this.width;
        h = this.height;
        r = 0.35 * h;
      },
      onSetContext: function(ctx) {
        ctx.fillStyle = 'silver';
        ctx.strokeStyle = 'White';
        ctx.lineCap = 'round';
        ctx.shadowColor = 'black';
        ctx.lineWidth = 2 * r;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = -1;
      },
      ondraw: function(ctx){
        var self = this;
        ctx.fillRect(0, 0, w, h);

        ctx.beginPath();
        ctx.moveTo(2*r, h/2);
        ctx.lineTo(w - 2*r, h/2);
        ctx.stroke();
      },
      useBuffer: true,
      id: 'search bar backround',
    }),
    searchIcon: searchIcon({
      x:bind(function(){return 0.7*obj.height - this.height/2; }),
      y:bind(function(){return obj.height/2 - this.height/2; }),
      height: bind(function(){ return 0.35 * obj.height }),
      width: bind(function(){ return 0.35 * obj.height }),
    }),
    input: textbox({
      x: bind(positioning.prev.right(+2)),
      y: bind(function(){return obj.height/2 - this.height/2; }),
      placeholder: bind(function(){ return obj.placeholder; }),
    }),
    invalidators: ['searchValue'],
  }));

  obj.input.bind('width', function(){
    return (obj.width - this.x - 0.45 * obj.height); 
  }),
  obj.input.bind('height', function(){
    return (0.6 * obj.height); 
   }),

  obj.bind('searchValue', function(){ return obj.input.text; });
  
  obj.add(obj.backgroundItem);
  obj.add(obj.searchIcon);
  obj.add(obj.input);
  

  return obj;
};