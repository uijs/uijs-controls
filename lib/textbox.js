var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var html = uijs.html;
var positioning = uijs.positioning;
var bind = uijs.bind;
var cancelIcon = require('./cancelIcon');
var label = require('./label');

module.exports = function(options) {
  var obj = box(defaults(options, {
    fontSize: bind(function(){ return (0.6 * obj.height); }),
    fontFamily: 'Helvetica',
    bold: false,
    fontColor: 'black',
    placeholder: 'Enter text ...',
    placeHolderColor: 'gray',
    cancelIcon: cancelIcon({
    	width:bind(function(){ return 0.75*obj.height; }),
    	height:bind(function(){ return obj.height; }),
    }),
    _id: 'text box',
    useBuffer: true,
    invalidators: ['text', 'fontSize', 'fontFamily', 'bold', 'fontColor'],
  }));

  obj.bind('text', function(){ return (!element) ? '' : element.value; });
  obj.bind('focused', function(){ return input.enabled }); 

  var loaded = false;
  var element; 

  var input = html({
    width: bind(function(){ 
      return (obj.cancelIcon && obj.cancelIcon.visible) ? obj.width - obj.cancelIcon.width - 5 : obj.width; 
    }),
    height: bind(function(){ return obj.height; }),
    onload: function(container) {
    	loaded = true;
    	recalculate();	
    },
    enabled: false,
    _id: 'input',
    //useBuffer: true,
    invalidators: ['enabled', 'bounds'],
  });

  var backroungLabel = label({
    width: bind(function(){ return input.width; }),
    height: bind(function(){ return input.height; }),
    size: bind(function(){ return obj.fontSize; }),
    text: bind(function(){ return (obj.text == '') ? obj.placeholder : obj.text ; }),
    font: bind(function(){ return obj.fontFamily; }),
    bold: bind(function(){ return obj.bold; }),
    color: bind(function(){ return (obj.text == '') ? obj.placeHolderColor : obj.fontColor; }),
    align: 'left',
    _id: 'backround',
    visible: bind(function(){ return (!input.enabled || obj.text == ''); }),
  });

  var fontColor = null;
  var fontSize = 0;
  var fontFamily = null;
  var bold = false;

  function recalculate(){
    if(loaded){
      if(fontColor !== obj.fontColor || fontSize !== obj.fontSize || fontFamily !== obj.fontFamily || bold !== obj.bold){
        fontColor = obj.fontColor;
        fontSize = obj.fontSize;
        fontFamily = obj.fontFamily;
        bold = obj.bold;
      }
      else{
        return;
      }
	   input.container.innerHTML = [
	        '<input type="text" id="textbox_' + input._id + '" value="' + (element && element.value ? element.value : "") + '" style="'+
          'padding:0px 0px 0px 0px'+
          ';outline:none'+
          ';border:0px' + 
	        ';background-color:transparent' + 
	        ';width:100%' + 
	        ';height:100%' +
	        ';font-size:' + fontSize + 'px' +
	        ';color:' + fontColor + 
	        ';font-family:' + fontFamily + 
	        ';font-weight:' + ((bold) ? 'bold' : 'normal') + '" />',
	    ].join('\n');
	    
	    element = document.getElementById('textbox_' + input._id);
	    element.onkeypress = function(e){
        code= (e.keyCode ? e.keyCode : e.which);
        //in case the key was enter
        if (code == 13) {
        	element.blur();
        }
      }
      var firstClickAfterFocus;
      element.onfocus = function(){
        input.enabled = true;
        element.style.color = obj.fontColor;
        firstClickAfterFocus = true;
      }
      element.onblur = function(){
        element.style.color = 'transparent';
        input.enabled = false;
      }
      element.onclick = function(){
        //moving the cursor to the end of text on the first click afer element focusing
        if(firstClickAfterFocus){
          element.setSelectionRange(element.value.length, element.value.length);
        }
        firstClickAfterFocus = false;
      }
	  }	
  }

  obj.recalculate = recalculate;

  if(obj.cancelIcon){
  	obj.add(obj.cancelIcon);
  	//update cancelIcon position
  	obj.cancelIcon.bind('x', function(){ return obj.width - obj.cancelIcon.width; });
  	obj.cancelIcon.y = 0;
    obj.cancelIcon.bind('visible', function(){ return obj.text != ''; });
  	obj.cancelIcon.on('cancel', function(){ 
      element.value = ''; 
    });
  }
  
  obj.setSelectionRange = function(start,end){
    if(element) element.setSelectionRange(start, end);
  }

  obj.add(input);
  obj.add(backroungLabel);

  return obj;
};