var uijs = require('uijs');
var rectSeperator = require('./rect');
var label = require('./label');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var positioning = uijs.positioning;

module.exports = function(options) {
  var obj = box(defaults(options, {
    items: [],
    onCreateItem: function(item) { 
      if(item.title){
        return label({text: item.title,});  
      }
      return item;
    }, 
    onCreateSeperator: function() {
      return rectSeperator({height: 1,})
    },
  }));
  
  obj.children = function() {
    var self = this;

    var children = [];
    var maxItemWidth = 0;
    
    var relY = 0;
    Object.keys(self.items).forEach(function(key) {
      var boxItem = self.onCreateItem(self.items[key])

      //update item positioning
      boxItem.x = 0;
      boxItem.y =  relY ;
      boxItem.parent = self;
      boxItem.dataIndex = key;

      //add box item as a child
      children.push(boxItem);

      maxItemWidth = util.max(maxItemWidth,boxItem.width);

      if(self.onCreateSeperator){
        //add seperator box
        var boxSeperator = self.onCreateSeperator(self.items[key]);

        //update seperator positioning
        boxSeperator.x = 0;
        boxSeperator.y = relY + boxItem.height;
        boxSeperator.width = function(){
          return self.width;
        };
        boxSeperator.parent = self;

        //add box seperator as a child
        children.push(boxSeperator);
      }

      relY = (boxSeperator) ? boxSeperator.y + boxSeperator.height : boxItem.y + boxItem.height;
    });

    self.childrenHeight = relY;
    self.childrenWidth = maxItemWidth;
    return children;
  }

  obj.height = function(){
    var self = this;
    return self.childrenHeight || 0; 
  }

  obj.width = function(){
    var self = this;
    return self.childrenWidth || 0; 
  }

  //obj.interaction = false;

  //item clicking support
  obj.on('touchmove', function(startPt,endPt) {
    console.log('touch move');
    if(this.touchedItem){
      this.items[this.touchedItem.dataIndex].clicked = null;
      this.emit('move',this.items[this.touchedItem.dataIndex],startPt,endPt);
      this.touchedItem = null;
    }
  });

  obj.on('touchstart', function(pos) {
    console.log('touch start');
    this._touching = true;
    this.startCapture();
    var item = this.hittest(pos,null).child;

    if(item.dataIndex){
      this.items[item.dataIndex].clicked = true;
      this.touchedItem = item;
    }
      
  });

  obj.on('touchend', function(pos) {
    console.log('touch end');
    this._touching = false;
    this.stopCapture();
    
    if(this.touchedItem){
      this.items[this.touchedItem.dataIndex].clicked = null;
      this.emit('click',this.items[this.touchedItem]);
      this.touchedItem = null;
    }
  });

  return obj;
};