var uijs = require('uijs');
var rect = require('./rect');
var label = require('./label');
var gestures = require('./gestures');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var scroller = uijs.scroller;
var bind = uijs.bind;

module.exports = function(options) {
  var obj = scroller(defaults(options, {
    id: 'listeview-scoller',
    itemHeight : 70,
    onBindBoxItem: null,
    items: [],
    filterCondition: function(data,value){
      return (data.indexOf(value) !== -1);
    },
    searchBar: null,
  }));
  var cachePool = [];
  var children = [];
  var filteredItemIndexes = [];

  var prevStartIndex = 0;
  var prevEndIndex = 0;
  var prevIsUsingSearchBox = false;

  var searchBarYDelta = (obj.searchBar) ? obj.searchBar.height : 0;
  var cachePoolBufferGenerationCounter = 0;
  var itemsChanged = true;

  var content = box({
    id: 'listview-content',
    children: bind(get_content_children),
    height: bind(function(){ return (obj.itemHeight * filteredItemIndexes.length) + searchBarYDelta }),
    width: bind(function(){ return obj.width; })
  });

  //suport updating items by the user.
  obj.bind('itemsLengthAndHeight', function(){ return this.items.length + ' ' + this.itemHeight });
  obj.invalidators.push('itemsLengthAndHeight');
  obj.invalidators.push('items');
  obj.watch('itemsLengthAndHeight', updateView);
  obj.watch('items', function(items){ 
    // update all data items
    var lastIndex = cachePool.length;
    for (var i = 0; i < lastIndex; i++) {
      cachePool[i].data = items[i]; 
    };
  });

  function updateView(){
    var searchValue = (obj.searchBar) ? obj.searchBar.searchValue : '';
    filter(searchValue, true);
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
    var contentY = self.y;
    var startItemIndex = Math.max(Math.floor((-contentY -searchBarYDelta) / obj.itemHeight), 0);
    var endItemIndex = Math.min(Math.ceil(obj.height/obj.itemHeight) + startItemIndex, filteredItemIndexes.length);
    
    var sb = obj.searchBar;
    var useSearchBox = sb && contentY > -sb.height;
    
    if(prevStartIndex !== startItemIndex || prevEndIndex !== endItemIndex || 
       useSearchBox !== prevIsUsingSearchBox || cachePoolBufferGenerationCounter < 15 ){

        var lastIndex = endItemIndex + 1;
        if(cachePool.length < lastIndex){
          lastIndex = cachePool.length;
        }

        if(cachePoolBufferGenerationCounter < 15){
          cachePoolBufferGenerationCounter++;  
          startItemIndex = 0;
          endItemIndex = lastIndex = cachePool.length;
        }

        children.length = 0;
        // Add search bar only if exists and visible
        if(useSearchBox) {
          children.push(sb); 
        }

        for (var i = startItemIndex; i < lastIndex; i++) {
          children.push(cachePool[i]);
        };

        self.invalidate();
        //children = children.concat(cachePool.slice(startItemIndex, lastIndex)); 

        prevStartIndex = startItemIndex;
        prevEndIndex = endItemIndex;
        prevIsUsingSearchBox = useSearchBox;
    }
    return children;
  }
  
  function createCachePool(){
    cachePool = [];
    
    //endItemIndex = Math.min(Math.ceil(obj.height/obj.itemHeight) + 1, filteredItemIndexes.length);
    endItemIndex = filteredItemIndexes.length;
    //TODO: improve the API. I dont like it that we bind to some irrelevant data object here and change the data property later to rebind without using the data bind function
    for (var poolIndex = 0 ; poolIndex < endItemIndex; poolIndex++) {
      var boxItem = box({
        id: 'lv-flach',
        height: obj.itemHeight,
        width: obj.width,
        data: obj.items[filteredItemIndexes[poolIndex]],
        parent: content,
        index: poolIndex,
        x: 0,
        y: (poolIndex * obj.itemHeight) + searchBarYDelta,
        useBuffer: true,
      });

      obj.onBindBoxItem(boxItem);
      
      /*
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
*/
      
      cachePool.push(boxItem);
    }

    prevStartIndex = 0;
    prevEndIndex = endItemIndex;
    cachePoolBufferGenerationCounter = 0;
  }

  function filter(searchValue, create_cache_pool){
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
     filterItemNumber < cachPoolLength || create_cache_pool){
      createCachePool();
    }
  }

  obj.content = content;

  return obj;
};
