var uijs = require('uijs');


var box = uijs.box;
var util = uijs.util;
var positioning = uijs.positioning;
var controls = require('..');
var image = controls.image;

var html = uijs.html;

var app = box();
app.ondraw = function(ctx) {
       ctx.fillStyle = 'gray';
       ctx.fillRect(0, 0, this.width, this.height);
   }

var left = html({
	x:0,
	y:function(){return this.parent.height/2 - 100;},
	width:function(){return this.parent.width/4;},
	height:function(){return this.parent.height;},
	onload: function(container) {
	    container.innerHTML += [
	    	'<form style="border:5px solid black;">',
	    	'Enter image path <input type="text" id="image" size="26" value="C:\\Users\\Public\\Pictures\\Sample Pictures\\koala.jpg"> <br />',
	    	'Enter image box width  <input type="text" size="10" id="boxWidth" value="'+3/4 * this.parent.width+'"> <br />',
	    	'Enter image box height <input type="text" size="10" id="boxHeight" value="'+this.parent.height+'"> <br />',
			'<input type="checkbox" id="stretchWidth" value="StretchWidth" />Stretch Width <br />',
			'<input type="checkbox" id="stretchHeight" value="StretchHeight" />Stretch Height  <br />',
		    '<input type="checkbox" id="fit" value="Fit" /> Fit <br />',
		    'HorizontalAlign <select id="horizontalAlign" >',
		    '<option>center</option>',
		  	'<option>right</option>',
		  	'<option>left</option>',
		  	'</select>  <br />',
		  	'VerticalAlign <select id="verticalAlign">',
		    '<option>middle</option>',
		  	'<option>bottom</option>',
		  	'<option>top</option>',
		  	'</select> <br />',
		    '</form>',
	    ].join('\n');
    },
  })

var right = image({
  x:positioning.prev.right(),
  y:0,
  width:function(){
  	var bw = document.getElementById('boxWidth');
  	if (!bw) { return 3/4 * this.parent.width(); }

  	return bw.value;
  },
  height:function(){
  	var bh = document.getElementById('boxHeight');
  	if (!bh) { return this.parent.height(); }

  	return bh.value;
  },
  image: function() {
  	var imgElement = document.getElementById('image');
  	if (imgElement.value !== '') { src = imgElement.value; }

  	var img = new Image();
  	img.src = src;
  	img.onload = function() { };

  	return img;
  },
  stretchWidth:function(){
  	var sw = document.getElementById('stretchWidth');
  	if (!sw) { return false; }

  	return sw.checked;
  },
  stretchHeight:function(){
  	var sh = document.getElementById('stretchHeight');
  	if (!sh) { return false; }
  	return sh.checked;
  },
  fit:function(){
  	var f = document.getElementById('fit');
  	if (!f) { return false; }

  	return f.checked;
  },
  horizontalAlign:function() {
	var hsel = document.getElementById('horizontalAlign');
	if (!hsel) return 'center';

	return hsel.options[hsel.selectedIndex].value;
  },
  verticalAlign:function() {
	var vsel = document.getElementById('verticalAlign');
	if (!vsel) return 'middle';

	return vsel.options[vsel.selectedIndex].value;
  },
});

var base_ondraw = right.ondraw;
right.ondraw = function(ctx) {
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 5;
  ctx.strokeRect(0, 0, this.width, this.height);
  base_ondraw.call(this, ctx);
};

app.add(left);
app.add(right);

module.exports = app;