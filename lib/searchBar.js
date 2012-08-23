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
    backgroundItem: rect({
      color:'Lavender',
      width: bind(function(){return obj.width;}),
      height: bind(function(){return obj.height;}),
    }),
    input: textbox({
      x:bind(function(){return Math.round(0.05*obj.width); }),
      y:bind(function(){return Math.round(0.05*obj.height); }),
      //set a fix hieght until merge with main
      height: 40,
    }),
  }));

  obj.input.width = bind(obj.input, 'width', function(){
    return Math.round(0.9*obj.width); 
  }),
  /*obj.input.height = bind(obj.input, 'height', function(){
    console.log('input height '+ Math.round(0.9*obj.height)); 
    return Math.round(0.9*obj.height); 
   }),*/

  obj.searchValue = bind(obj, 'searchValue', function(){ return obj.textBox.text; });

  obj.add(obj.backgroundItem);
  obj.add(obj.input);
  

  return obj;
};