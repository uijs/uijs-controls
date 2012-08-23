var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var textbox = require('./textbox');
var rect = require('./rect');
var html = uijs.html;
var positioning = uijs.positioning;
var bind = uijs.bind;

module.exports = function(options) {
  var obj = box(defaults(options, {
    /*backgroundItem: rect({
      color:'red',
      width: bind(function(){return obj.width;}),
      height: bind(function(){return obj.height;}),
    }),
*/
    input:textbox({
      x: bind(function(){return Math.round(0.05*obj.width);}),
      y: bind(function(){return Math.round(0.05*obj.height);}),
      //width:(obj.width),//bind(function(){return (0.9*obj.width); }),
      //height:(obj.height),//bind(function(){return (0.9*obj.height);}),
      placeholder: 'Search ...',
    }),
  }));

  obj.input.width = bind(obj.input, 'width', function(){
    var res = Math.round(0.9*obj.width);
    console.log('input width '+ res); 
    return res; 
  }),
  obj.input.height = bind(obj.input, 'height', function(){return Math.round(0.9*obj.height); }),

  //obj.add(obj.backgroundItem);
  obj.add(obj.input);

  obj.searchValue = bind(obj, 'searchValue', function(){ return obj.input.text; });

  return obj;
};