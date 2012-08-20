var uijs = require('uijs');
var rectSeperator = require('./rect');
var label = require('./label');
var gestures = require('./eventGestures');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var scroller = uijs.scroller;
var bind = uijs.bind;

module.exports = function(options) {
  var obj = scroller(defaults(options, {
    itemHeight : 70,
    items: [],
    onBindBoxItem: null,
    is_simple_container_with_self_drawing: true
  }));

  var cachePool = [];
  var prevStartIndex;
  var prevEndIndex;
  
  function get_content_children(){
    var self = this;
    var cachePoolCreated = false;
    var startItemIndex = Math.max(Math.floor(-self.y/obj.itemHeight), 0);
    var endItemIndex = Math.min(Math.ceil(obj.height/obj.itemHeight) + startItemIndex + 1, obj.items.length);

    if(cachePool.length == 0 && obj.items.length > 0){
      //TODO: improve the API. I dont like it that we bind to some irrelevant data object here and change the data property later to rebind without using the data bind function
      for (var poolIndex = 0; poolIndex < endItemIndex - startItemIndex; poolIndex++) {
        var boxItem = box({
          height:obj.itemHeight,
          width:obj.width,
          data:obj.items[0],
          parent:obj,
          index:poolIndex,
          x:0,
          is_simple_container: true
        });

        obj.onBindBoxItem(boxItem);
        
        //handle events
        //adds emit and register on click event
        /*
        boxItem.on(gestures.click(boxItem),function(){
          var self = this;
          obj.emit('click', self.data);
        });
        
        boxItem.on('touchstart',function(pt){
          var self = this;
          self.highlight = true;
          
        });

        boxItem.on('touchmove',function(){
          var self = this;
          self.highlight = false;
        });

        boxItem.on('touchend',function(){
          var self = this;
          self.highlight = false;
        });
        */
        
        cachePool.push(boxItem);
      }
      prevStartIndex = -cachePool.length;
      prevEndIndex = 0;
      cachePoolCreated = true;
    }

    var startIndexDelta = startItemIndex - prevStartIndex;
    var endIndexDelta = endItemIndex - prevEndIndex;
    if(startIndexDelta != 0 && endIndexDelta != 0)
    {
      for (var i = 0; i < cachePool.length; i++) {
        var itemBox = cachePool[i];
        itemBox.index -= startIndexDelta;
        if(itemBox.index < 0){
          itemBox.index += Math.max(cachePool.length,startIndexDelta);
          if((itemBox.index + startItemIndex) < endItemIndex){
            itemBox.data = obj.items[itemBox.index + startItemIndex];
          }
        }
        if(itemBox.index >= cachePool.length){
          itemBox.index -= Math.max(cachePool.length,startIndexDelta);
          if((itemBox.index + startItemIndex) < endItemIndex){
            itemBox.data = obj.items[itemBox.index + startItemIndex];
          }
        }

        if((itemBox.index + startItemIndex) < endItemIndex){
          itemBox.y = (startItemIndex + itemBox.index) * obj.itemHeight;
        }
      };
    }

    prevStartIndex = startItemIndex;
    prevEndIndex = endItemIndex;

    //TODO: the concat is to make the setter of the property change to
    //      make sure handlers of changed children execute. Need to resolve this hack, also change push, remove, etc..
    return !cachePoolCreated ? cachePool : cachePool.concat();
  }

  var content = box({
    children: bind(content, 'children', get_content_children),
    height: bind(content, 'height', function(){ return obj.itemHeight * obj.items.length }),
    width: bind(content, 'width', function(){ return obj.width; }),
    is_simple_container: true
  });

  obj.content = content;

  return obj;
};
