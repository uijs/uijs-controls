
exports.click = function(obj) {
   
  obj.on('touchmove',function(){
    if (!obj.capturing()) return;
    obj.stopCapture();
  });

  obj.on('touchstart', function() {
    obj.startCapture();
  });

  obj.on('touchend', function(pt){
  	if (!obj.capturing()) return;
  	obj.stopCapture();
  	obj.emit('click', pt);
  });

  return 'click';
};