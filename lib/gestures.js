exports.click = function(obj) {

  var touching = false;

  obj.on('touchstart', function(e) {
    touching = true;
    this.startCapture();
    setTimeout(function() {
      obj.touching = touching;
    }, 500);
  });

  obj.on('touchend', function(e) {
    touching = false;

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