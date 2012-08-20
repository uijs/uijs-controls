var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var image = require('./image');
var html = uijs.html;
var positioning = uijs.positioning;
var bind = uijs.bind;

module.exports = function(options) {
  var obj = box(defaults(options, {
    backgroundImage: null,
    searchBoxStyle:'',
  }));

  obj.add(image({
    width: bind(function(){ return obj.width; }),
    height: bind(function(){ return obj.height; }),
    image: bind(function() { return obj.backgroundImage; }),
    fit:true,
  }));

  obj.add(html({
    width: bind(function(){ return obj.width; }),
    height: bind(function(){ return obj.height; }),
    onload: function(container) {
      container.innerHTML += [
        '<form>',
        '<input type="text" id="searchbox" value="" onKeyPress=”return disableEnterKey(e)” style="border:0px;background-color:transparent;position:absolute;top:4px;left:9px;width:256px;height:28px;" />',
        '</form>',
      ].join('\n');
    },
  }));

  var cacheSearchValue = '';
  var cacheElement = document.getElementById('searchbox');

  obj.on('frame',function(){
    if(!cacheElement){
      cacheElement = document.getElementById('searchbox');  
    }
    
    var searchValue =  (cacheElement) ? cacheElement.value : '';
    if(cacheSearchValue != searchValue){
      cacheSearchValue = searchValue;
      obj.emit('filter',cacheSearchValue);
    }
  });

  function disableEnterKey(e){
    console.log('disableEnterKey');
    var key;      
     if(window.event)
          key = window.event.keyCode; //IE
     else
          key = e.which; //firefox      

     return (key != 13);
  }


  return obj;
};