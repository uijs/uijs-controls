var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var html = uijs.html;
var positioning = uijs.positioning;
var bind = uijs.bind;
var textCancel = require('./textCancel');
var label = require('./label');

module.exports = function(options) {
  var obj = box(defaults(options, {
    fontSize: bind(function(){ return (0.6 * obj.height); }),
    fontFamily: 'Helvetica',
    bold: false,
    fontColor: 'black',
    placeholder: 'Enter text ...',
    placeHolderColor: 'gray',
    textCancel: textCancel({
    	width:bind(function(){ return obj.fontSize; }),
    	height:bind(function(){ return obj.height; }),
    }),
  }));

  obj.text = bind(obj, 'text', function(){return (!element) ? '' : element.value; });
  obj.focused = bind(obj, 'focused', function(){ return input.enabled }); 

  var loaded = false;
  var element; 

  var input = html({
    width: bind(function(){ return (obj.textCancel && obj.textCancel.visible) ? obj.width - obj.textCancel.width : obj.width; }),
    height: bind(function(){ return obj.height; }),
    onload: function(container) {
    	loaded = true;
    	recalculate();	
    },
    enabled: false,
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
    visible: bind(function(){ return (!input.enabled || obj.text == ''); }),
  });

  obj.watch('width', recalculate);
  obj.watch('height', recalculate);
  obj.watch('fontSize', recalculate);
  obj.watch('fontColor', recalculate);
  obj.watch('fontFamily', recalculate);
  obj.watch('bold', recalculate);

  function recalculate(){
  	if(loaded){
	   input.container.innerHTML = [
	        '<input type="text" id="textbox_' + input._id + '" value="" style="'+
          'padding:0px 0px 0px 0px'+
          ';outline:none'+
          ';border:0px' + 
	        ';background-color:transparent' + 
	        ';width:100%' + 
	        ';height:100%' +
	        ';font-size:' + obj.fontSize + 'px' +
	        ';color:' + obj.fontColor + 
	        ';font-family:' + obj.fontFamily + 
	        ';font-weight:' + ((obj.bold) ? 'bold' : 'normal') + '" />',
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

  if(obj.textCancel){
  	obj.add(obj.textCancel);
  	//update textCancel position
  	obj.textCancel.x = bind(obj.textCancel, 'x',function(){ return obj.width - obj.textCancel.width; });
  	obj.textCancel.y = 0;

  	obj.watch('text', function(newValue){
		  obj.textCancel.visible = (newValue != '');
  	});

  	obj.textCancel.on('cancel',function(){
  		element.value = '';
  	});
  }

  //temp - until fix bind & watch behavior
  obj.on('frame',function(){
  	obj.text;
  })
  
  obj.setSelectionRange = function(start,end){
    if(element) element.setSelectionRange(start, end);
  }

  obj.add(input);
  obj.add(backroungLabel);

  return obj;
};