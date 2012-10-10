var uijs = require('uijs-core');
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
    searchBar: null
  }));
  var cachePool = [];
  var children = [];
  var filteredItemIndexes = [];

  var prevStartIndex = 0;
  var prevEndIndex = 0;
  var prevIsUsingSearchBox = false;
  var prevChildrenLength = 0;

  var searchBarYDelta = (obj.searchBar) ? obj.searchBar.height : 0;
  var cachePoolBufferGenerationCounter = 0;
  var itemsChanged = true;

  var content = box({
    id: 'listview-content',
    children: bind(get_content_children),
    height: bind(function(){ return (obj.itemHeight * filteredItemIndexes.length) + searchBarYDelta }),
    //width: bind(function(){ return obj.width; })
  });

  obj.watch('width', function(newVal){
    content.width = newVal;
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
    console.log('updateview items-count=', obj.items.length);
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

        if((prevChildrenLength === 0 && children.length !== 0) || 
           (prevChildrenLength !== 0 && children.length === 0)){
          var oc = children;
          children = oc.concat();
          // need this for the comparison with the old value in the 
          // on_children_changed callback
          oc.length = prevChildrenLength;

        }

        self.invalidate();
        //children = children.concat(cachePool.slice(startItemIndex, lastIndex)); 

        prevStartIndex = startItemIndex;
        prevEndIndex = endItemIndex;
        prevIsUsingSearchBox = useSearchBox;
        prevChildrenLength = children.length;
    }
    return children;
  }
  
  function createCachePool(){

    console.log('createCachePool obj.height = ', obj.height);

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
        highlighted: false,
      });

      obj.onBindBoxItem(boxItem);
      
      
      // handle events
      boxItem.on(gestures.click(boxItem),function(){
        var self = this;
        obj.emit('click', self.data);
      });
      
      // item click: wait 100ms before highlight
      // if moved, cancel grip.

      boxItem.on('touchstart',function(pt){
        var self = this;
        self._touching = true;
        
        setTimeout(function() {
          self.highlighted = self._touching;
        }, 100);

        self.startCapture();
      });

      boxItem.on('touchmove', function(e) {
        this._touching = false;
        this.highlighted = false;
        this.stopCapture();
      });

      boxItem.on('touchend', function(e) {
        if (this.highlighted) {
          obj.emit('click', this.data);
        }

        this._touching = false;
        this.highlighted = false;
        this.stopCapture();
      });
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

    console.log(filteredItemIndexes);
    console.log('filter', screenItemNumber, cachPoolLength, filterItemNumber);
    
    if((screenItemNumber > cachPoolLength && filterItemNumber > cachPoolLength) ||
     filterItemNumber < cachPoolLength || create_cache_pool){
      createCachePool();
    }
  }

  obj.content = content;

  return obj;
};
