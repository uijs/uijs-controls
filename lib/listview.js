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
    filterCondition: function(data,value){
      return (data.indexOf(value) != -1);
    },
    searchBar: null,
  }));

  var cachePool = [];
  var filteredItemIndexes = [];
  var prevStartIndex;
  var prevEndIndex;
  var searchBarYDelta = (obj.searchBar) ? obj.searchBar.height : 0;
  var init = true;

  if(obj.searchBar){
    var searchBarBox = obj.searchBar;
    searchBarBox.width = bind(searchBarBox, 'width', function(){ return obj.width; });
    searchBarBox.parent = obj;
    searchBarBox.x = 0;
    searchBarBox.y = 0;
  }
  
  var content = box({
    children: bind(content, 'children', function() { 
      var self = this;

      var startItemIndex = Math.max(Math.floor((-self.y -searchBarYDelta) /obj.itemHeight), 0);
      var endItemIndex = Math.min(Math.ceil(obj.height/obj.itemHeight) + startItemIndex + 1, filteredItemIndexes.length);

      if(init && cachePool.length == 0 && obj.items.length > 0){

        //initialize filterItems to contain all items
        obj.items.forEach(function(data,index){
          filteredItemIndexes.push(index);  
        });
        
        createCachePool();
        init = false;
      }

      var startIndexDelta = startItemIndex - prevStartIndex;
      var endIndexDelta = endItemIndex - prevEndIndex;
      if(startIndexDelta != 0 && endIndexDelta != 0)
      {
        cachePool.forEach(function(itemBox){
          itemBox.index -= startIndexDelta;
          if(itemBox.index < 0){
            itemBox.index += Math.max(cachePool.length,startIndexDelta);
            if((itemBox.index + startItemIndex) < filteredItemIndexes.length){
              itemBox.data = obj.items[filteredItemIndexes[itemBox.index + startItemIndex]];
            }
          }
          if(itemBox.index >= cachePool.length){
            itemBox.index -= Math.max(cachePool.length,startIndexDelta);
            if((itemBox.index + startItemIndex) < filteredItemIndexes.length){
              itemBox.data = obj.items[filteredItemIndexes[itemBox.index + startItemIndex]];
            }
          }

          if((itemBox.index + startItemIndex) < filteredItemIndexes.length){
            itemBox.y = ((startItemIndex + itemBox.index ) * obj.itemHeight) + searchBarYDelta;
          }
        });
      }

      prevStartIndex = startItemIndex;
      prevEndIndex = endItemIndex;
      var res = (obj.searchBar) ? [obj.searchBar].concat(cachePool) : cachePool;
      
      return res;
    }),

    height: bind(function(){ return (obj.itemHeight * filteredItemIndexes.length) + searchBarYDelta }),
    width: bind(function(){ return obj.width; }),
  });

  if(obj.searchBar){
    obj.searchBar.on('filter',function(searchValue){
      filteredItemIndexes = [];
      obj.items.forEach(function(data,index){
        if(obj.filterCondition(data,searchValue)){
          filteredItemIndexes.push(index);
        }
      });
      
      createCachePool();
    })
  }

  obj.content = content;

  createCachePool = function(){
    cachePool = [];
    
    endItemIndex = Math.min(Math.ceil(obj.height/obj.itemHeight) + 1, filteredItemIndexes.length);
    //TODO: improve the API. I dont like it that we bind to some irrelevant data object here and change the data property later to rebind without using the data bind function
    for (var poolIndex = 0 ; poolIndex < endItemIndex; poolIndex++) {
      var boxItem = box({
        height: obj.itemHeight,
        width: bind(function(){ return obj.width; }),
        data: obj.items[filteredItemIndexes[poolIndex]],
        parent: obj,
        index: poolIndex,
        x: 0,
        y: (poolIndex * obj.itemHeight) + searchBarYDelta,
      });

      obj.onBindBoxItem(boxItem);
      
      //handle events
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
      
      cachePool.push(boxItem);
    }

    prevStartIndex = 0;
    prevEndIndex = endItemIndex;

  }

  return obj;
};
