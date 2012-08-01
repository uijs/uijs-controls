var uijs = require('uijs');
var rectSeperator = require('./rect');
var label = require('./label');
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

  var content = box({
    children: bind(content, 'children', function() { 
      var self = this;

      var startItemIndex = util.max(Math.floor(-self.y/obj.itemHeight),0);
      var endItemIndex = util.min(Math.ceil(obj.height/obj.itemHeight) + startItemIndex,obj.items.length);

      if(cashPool.length == 0 && obj.items.length > 0){
        //TODO: improve the API. I dont like it that we bind to some irrelevant data object here and change the data property later to rebind without using the data bind function
        for (var poolIndex = startItemIndex; poolIndex < endItemIndex; poolIndex++) {
          var boxItem = box({
            height:obj.itemHeight,
            width:obj.width,
            data:obj.items[0],
            parent:obj,
          });

          obj.onBindBoxItem(boxItem);

          //add box item as to the cash pool
          cashPool.push(boxItem);
        }
      }
      var i = 0;
      for (var key = startItemIndex; key < endItemIndex; key++) {
        var boxItem = cashPool[i];
        boxItem.data = obj.items[key],
        
        //update item positioning
        boxItem.x = 0;
        boxItem.y =  key * obj.itemHeight ;
        i++;
      }
      return cashPool;
    }), 
    height: bind(content, 'height', function(){ return obj.itemHeight * obj.items.length }),
    width: bind(content, 'width', function(){ return obj.width; }),
    interaction: false,
  });

  obj.content = content;
  return obj;
};
