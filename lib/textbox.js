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
    type: 'text',
    cancelIcon: cancelIcon({
    	width:bind(function(){ return 0.75*obj.height; }),
    	height:bind(function(){ return obj.height; }),
    }),
    id: 'text box',
    useBuffer: true,
    invalidators: ['text', 'fontSize', 'fontFamily', 'bold', 'fontColor', 'type'],
  }));

  obj.bind('text', function(){ return (!element) ? '' : element.value; });
  obj.bind('focused', function(){ return input.enabled }); 

  var element; 

  var input = html({
    width: bind(function(){ 
      return (obj.cancelIcon && obj.cancelIcon.visible) ? obj.width - obj.cancelIcon.width - 5 : obj.width; 
    }),
    height: bind(function(){ return obj.height; }),
    enabled: false,
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
    verticalAlign: 'top',
    _id: 'backround',
    y: 4,
    visible: bind(function(){ return (!input.enabled || obj.text == ''); }),
  });

  obj.watch('fontColor', recalculate);
  obj.watch('fontSize', recalculate);
  obj.watch('fontFamily', recalculate);
  obj.watch('bold', recalculate);
  obj.watch('type', recalculate);
  //blur manually when touching outside the textbox boundaries
  obj.watch(function(){ return obj.root(); }, function(){
    if (obj.root() != obj){
      obj.root().on('touchstart', function(pt) {
        // touchstart outside textbox
        if (pt.x < obj.x ||
            pt.y < obj.y ||
            pt.x > obj.x + obj.width ||
            pt.y > obj.y + obj.height) {
          element.blur();
        }
      });
    }
  });

  function recalculate() {
    input.container.innerHTML = [
        '<input type=' + this.type + ' id="textbox_' + input._id + '" value="' + (element && element.value ? element.value : "") + '" style="'+
        'padding:0px 0px 0px 0px'+
        ';outline:none'+
        ';border:0px' + 
        ';background-color:transparent' + 
        ';width:100%' + 
        ';height:100%' +
        ';font-size:' + this.fontSize + 'px' +
        ';color:' + this.fontColor + 
        ';font-family:' + this.fontFamily + 
        ';font-weight:' + ((this.bold) ? 'bold' : 'normal') + '" />',
    ].join('\n');
    
    element = document.getElementById('textbox_' + input._id);
    element.onkeypress = function(e){
      code= (e.keyCode ? e.keyCode : e.which);
      //in case the key was enter
      if (code == 13) {
      	element.blur();
        obj.emit('submit',obj.text);
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
      if(firstClickAfterFocus){
        element.setSelectionRange(element.value.length, element.value.length);
      }
      firstClickAfterFocus = false;
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

  obj.clearText = function(){
    if(element) element.value = '';  
  }

  obj.add(input);
  obj.add(backroungLabel);

  return obj;
};