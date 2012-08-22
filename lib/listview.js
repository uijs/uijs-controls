var uijs = require('uijs');
var rect = require('./rect');
var label = require('./label');
var gestures = require('./eventGestures');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var scroller = uijs.scroller;
var positioning = uijs.positioning;
var bind = uijs.bind;

module.exports = function(options) {
  var obj = scroller(defaults(options, {
    id: 'listeview-scoller',
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
  var cachePoolInitialized = false;
  var firstTime = true;

  var content = box({
    id: 'listview-content',
    children: bind(get_content_children),
    height: bind(function(){ return (obj.itemHeight * filteredItemIndexes.length) + searchBarYDelta }),
    width: bind(function(){ return obj.width; }),
  });

  // TODO: maybe replace children binding based on items
  // obj.watch('items', function() {
  //   console.log('items changed', obj.items.length);
  // });

  if(obj.searchBar){
    var searchBarBox = obj.searchBar;
    searchBarBox.bind('width', function(){ return obj.width; });
    searchBarBox.parent = obj;
    searchBarBox.x = 0;
    searchBarBox.y = 0;
  }

  function get_content_children() {
    var self = this;
    var startItemIndex = Math.max(Math.floor((-self.y -searchBarYDelta) /obj.itemHeight), 0);
    var endItemIndex = Math.min(Math.ceil(obj.height/obj.itemHeight) + startItemIndex + 1, filteredItemIndexes.length);

    if(!cachePoolInitialized && cachePool.length === (obj.searchBar ? 1 : 0)  && obj.items.length > 0){

      //initialize filterItems to contain all items
      obj.items.forEach(function(data,index){
        filteredItemIndexes.push(index);  
      });
      
      createCachePool();
      cachePoolInitialized = true;
    }

    var startIndexDelta = startItemIndex - prevStartIndex;
    var endIndexDelta = endItemIndex - prevEndIndex;
    
    var cachePoolLength = cachePool.length;
    for (var i = obj.searchBar ? 1 : 0; i < cachePoolLength; i++) {
      var itemBox = cachePool[i];
      itemBox.index -= startIndexDelta;
      if(itemBox.index < 0){
        itemBox.index += Math.max(cachePool.length,startIndexDelta);
      }
      if(itemBox.index >= cachePool.length){
        itemBox.index -= Math.max(cachePool.length,startIndexDelta);
      }

      if((itemBox.index + startItemIndex) < filteredItemIndexes.length){
        itemBox.y = ((startItemIndex + itemBox.index ) * obj.itemHeight);// + searchBarYDelta;
        //data object can be changed even if there was no scrolling
        itemBox.data = obj.items[filteredItemIndexes[itemBox.index + startItemIndex]];
      }
    };
  
    prevStartIndex = startItemIndex;
    prevEndIndex = endItemIndex;

    //TODO: the concat is to make the setter of the property change to
    //      make sure handlers of changed children execute. Need to resolve this hack, also change push, remove, etc..
    var res = (cachePoolInitialized && firstTime ? cachePool.concat() : cachePool);
    if(cachePoolInitialized && firstTime){
      firstTime = false;
    }
      
    return res;
  }
  
  createCachePool = function(){
    cachePool = [];
    
    if(obj.searchBar){
      cachePool.push(obj.searchBar);
    }

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
        useBuffer: true,
      });

      obj.onBindBoxItem(boxItem);
      
      // handle events
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
    firstTime = true;
  }

  if(obj.searchBar){
    obj.searchBar.watch('searchValue',function(searchValue){
      filteredItemIndexes = [];
      obj.items.forEach(function(data,index){
        if(obj.filterCondition(data,searchValue)){
          filteredItemIndexes.push(index);
        }
      });
      
      createCachePool();
    }, false);
  }

  obj.content = content;

  return obj;
};