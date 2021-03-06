var uijs = require('uijs-core');
var rect = require('./rect');
var label = require('./label');
var gestures = require('./gestures');
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
    onBindBoxItem: null,
    items: [],
    filterCondition: function(data,value){
      return (data.indexOf(value) != -1);
    },
    searchBar: null
  }));

  var cachePool = [];
  var children = [];
  var filteredItemIndexes = [];

  var prevStartIndex;
  var prevEndIndex;

  var searchBarYDelta = (obj.searchBar) ? obj.searchBar.height : 0;
  var cachePoolInitializedThisFrame = false;

  var content = box({
    id: 'listview-content',
    children: bind(get_content_children),
    height: bind(function(){ return (obj.itemHeight * filteredItemIndexes.length) + searchBarYDelta }),
    width: bind(function(){ return obj.width; })
  });

  //suport updating items by the user.
  obj.bind('itemLength', function(){ return obj.items.length });
  obj.invalidators.push('itemLength');
  //set the watch to be sync, in order to prevent out of bound exception 
  //when the user removes an item from outside
  obj.watch('itemLength', updateView, true);
  obj.watch('height', updateView);

  function updateView(){
    var searchValue = (obj.searchBar) ? obj.searchBar.searchValue : '';
    filter(searchValue);
  }

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

    searchBarBox.watch('searchValue', function(){
      var self = this;
      filter(self.searchValue);
    });
  }

  function get_content_children() {
    var self = this;
    var startItemIndex = Math.max(Math.floor((-self.y -searchBarYDelta) /obj.itemHeight), 0);
    var endItemIndex = Math.min(Math.ceil(obj.height/obj.itemHeight) + startItemIndex + 1, filteredItemIndexes.length);

    var startIndexDelta = startItemIndex - prevStartIndex;
    var endIndexDelta = endItemIndex - prevEndIndex;
    
    var cachePoolLength = cachePool.length;
    for (var i = 0; i < cachePoolLength; i++) {
      var itemBox = cachePool[i];
      itemBox.index -= startIndexDelta;
      if(itemBox.index < 0){
        itemBox.index += Math.max(cachePool.length,startIndexDelta);
      }
      if(itemBox.index >= cachePool.length){
        itemBox.index -= Math.max(cachePool.length,startIndexDelta);
      }

      if((itemBox.index + startItemIndex) < filteredItemIndexes.length){
        itemBox.y = ((startItemIndex + itemBox.index ) * obj.itemHeight) + searchBarYDelta;
        //data object can be changed even if there was no scrolling
        itemBox.data = obj.items[filteredItemIndexes[itemBox.index + startItemIndex]];
      }
    };
  
    prevStartIndex = startItemIndex;
    prevEndIndex = endItemIndex;

    //TODO: the concat is to make the setter of the property change to
    //      make sure handlers of changed children execute. Need to resolve this hack, also change push, remove, etc..
    if(cachePoolInitializedThisFrame){
      children = [];
      if(obj.searchBar) children.push(obj.searchBar);
      children = children.concat(cachePool);
      cachePoolInitializedThisFrame = false;
    }
      
    return children;
  }
  
  function createCachePool(){
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
    cachePoolInitializedThisFrame = true;
  }

  function filter(searchValue){
    filteredItemIndexes = [];
    obj.items.forEach(function(data,index){
      if(obj.filterCondition(data,searchValue)){
        filteredItemIndexes.push(index);
      }
    });

    var screenItemNumber = Math.ceil(obj.height/obj.itemHeight);
    var cachPoolLength = cachePool.length;
    var filterItemNumber = filteredItemIndexes.length;
    
    if((screenItemNumber > cachPoolLength && filterItemNumber > cachPoolLength) ||
     filterItemNumber < cachPoolLength){
      createCachePool();
    }
  }

  obj.content = content;

  return obj;
};
