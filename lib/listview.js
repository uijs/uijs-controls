var uijs = require('uijs');
var rectSeperator = require('./rect');
var label = require('./label');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var positioning = uijs.positioning;
var scroller = uijs.scroller;

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

  var content = box();
  content.height = function(){ return obj.itemHeight * obj.items.length }
  content.width = function(){ return obj.width; }

  var cashPool = [];

  content.children = function() {
    var self = this;

    var startItemIndex = util.max(Math.floor(-self.y/obj.itemHeight),0);
    var endItemIndex = util.min(Math.ceil(obj.height/obj.itemHeight) + startItemIndex,obj.items.length);

    if(cashPool.length == 0 && obj.items.length > 0){
      
      for (var poolIndex = startItemIndex; poolIndex < endItemIndex; poolIndex++) {
        var boxItem = box({
          height:obj.itemHeight,
          width:obj.width,
          data:obj.items[0],
        });

        boxItem.parent = obj;

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
  }

  content.interaction = false;
/*
  //item clicking support
  obj.on('touchmove', function(startPt,endPt) {
    console.log('touch move');
    if(this.touchedItem){
      this.touchedItem.data.clicked = null;
      //this.emit('move',this.touchedItem.data,startPt,endPt);
      this.touchedItem = null;
    }
  });

  obj.on('touchstart', function(pos) {
    console.log('touch start');
    this._touching = true;
    this.startCapture();
    var item = this.content.hittest(pos,null).child;
   
    item.data.clicked = true;
    this.touchedItem = item;
      
  });

  obj.on('touchend', function(pos) {
    console.log('touch end');
    this._touching = false;
    this.stopCapture();
    
    if(this.touchedItem){
      this.touchedItem.data.clicked = null;
      this.emit('click',this.touchedItem.data);
      this.touchedItem = null;
    }
  });
*/
  obj.content = content;
  return obj;
};
