var fontSizeMapper = {};

exports.getFontHeight = function(font, size) {
	if(!fontSizeMapper[font]){
		var self = this;

	    var span = document.createElement("span");
	    span.style.font = font;
	    span.innerHTML = 'Sg';
	    document.body.appendChild(span);
	    var fontHeight = span.offsetHeight;
	    document.body.removeChild(span);
	    fontSizeMapper[font] = fontHeight;
	}
	return fontSizeMapper[font];
}