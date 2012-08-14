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
    onBindBoxItem: function(boxItem) { 
      if(boxItem.data.title){
        boxItem.add(label({text: boxItem.data.title,}));  
      }
    },
  }));

  var cashPool = [];

  var last_frame_boxes = {};
  var firstTime = true;
  var boxes_to_return = [];

  var content = box({
    children: bind(content, 'children', function() { 
      var self = this;

      var startItemIndex = Math.max(Math.floor(-self.y/obj.itemHeight), 0);
      var endItemIndex = Math.min(Math.ceil(obj.height/obj.itemHeight) + startItemIndex + 1, obj.items.length);

      var current_frame_boxes = {};

      if(boxes_to_return.length == 0 && cashPool.length == 0 && obj.items.length > 0){
        firstTime = false;
        //TODO: improve the API. I dont like it that we bind to some irrelevant data object here and change the data property later to rebind without using the data bind function
        for (var poolIndex = startItemIndex; poolIndex < endItemIndex; poolIndex++) {
          var boxItem = box({
            height:obj.itemHeight,
            width:obj.width,
            data:obj.items[0],
            parent:obj,
          });

          obj.onBindBoxItem(boxItem);
          
          //handle events
          //adds emit and register on click event
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
          
          //
          current_frame_boxes[poolIndex] = boxItem;
          last_frame_boxes[poolIndex] = boxItem;
        }
      }
      var i = 0;
      var keys_with_no_match = [];
      boxes_to_return = [];
      for (var key = startItemIndex; key < endItemIndex; key++) {
        var boxItem = last_frame_boxes[key];
        delete last_frame_boxes[key];
        if(boxItem){

          //var boxItem = cashPool[i];
          boxItem.data = obj.items[key];
        
          //update item positioning
          boxItem.x = 0;
          boxItem.y =  key * obj.itemHeight ;
          i++;
          current_frame_boxes[key] = boxItem;
          boxes_to_return.push(boxItem);
        }
        else{
          keys_with_no_match.push(key);
        }
      }

      // return unused boxes to cache
      Object.keys(last_frame_boxes).forEach(function(key) {
        cashPool.push(last_frame_boxes[key]);
        delete last_frame_boxes[key];
      });

      // assign boxes to keys with no box
      for (var i = 0; i < keys_with_no_match.length; i++) {
        var key = keys_with_no_match[i];
        var boxItem = cashPool.pop();
        boxItem.data = obj.items[key];
        
        //update item positioning
        boxItem.x = 0;
        boxItem.y =  key * obj.itemHeight ;
        current_frame_boxes[key] = boxItem;
        boxes_to_return.push(boxItem);
      };

      // assign last frame boxes to current
      last_frame_boxes = current_frame_boxes;

      //return current frame boxes;
      return boxes_to_return;
    }), 
    height: bind(content, 'height', function(){ return obj.itemHeight * obj.items.length }),
    width: bind(content, 'width', function(){ return obj.width; }),
  });

  obj.content = content;

  return obj;
};
