
exports.click = function(obj) {

  console.log('registering click event');
   
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
    console.log('emitting click event');
  	obj.emit('click', pt);
  });

  return 'click';
};