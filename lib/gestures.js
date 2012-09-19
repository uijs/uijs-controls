exports.click = function(obj) {

  obj.on('touchstart', function(e) {
    this.touching = true;
    this.startCapture();
  });

  obj.on('touchmove',function(e) {
    if (!this.capturing()) return;
    this.stopCapture();
  });

  obj.on('touchend', function(e) {
    // ignore if touch ended but not started on this box
  	if (!this.capturing()) return;

    this.touching = false;
  	this.stopCapture();

    // do not emit `click` if touch ended outside of box bounds
    if (e.x < 0 || e.x > this.width ||
        e.y < 0 || e.y > this.height) {
      return;
    }

  	this.emit('click', e);
  });

  return 'click';
};