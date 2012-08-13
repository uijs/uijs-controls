var uijs = require('uijs');
var html = uijs.html;
var box = uijs.box;
var util = uijs.util;
var positioning = uijs.positioning;
var controls = require('..');
var label = controls.label;
var bind = uijs.bind;

var app = box();
app.ondraw = function(ctx) {
  ctx.fillStyle = 'gray';
  ctx.fillRect(0, 0, this.width, this.height);
}

var left = html({
	x:0,
	y: 0,
	width: bind(left, 'width', function(){return this.parent.width/4;}),
	height: bind(left, 'height', function(){return this.parent.height;}),
	onload: function(container) {
	    container.innerHTML += [
	    	'<form style="border:5px solid black;">',
	    	'Text Properties <br /><br />' +
	    	'Label text <input type="text" id="lablText" size="26" value="Hello Word!"> <br />',
	    	'Label font family <input type="text" id="lablFont" size="26" value="Helvetica"> <br />',
	    	'Text color <input type="text" id="textColor" size="26" value="black"> <br />',
			'<input type="checkbox" id="bold" value="bold" />Bold <br />',
			'Align <select id="align" >',
		    '<option>center</option>',
		  	'<option>right</option>',
		  	'<option>left</option>',
		  	'</select>  <br />',
		  	'VerticalAlign <select id="verticalAlign">',
		    '<option>middle</option>',
		  	'<option>bottom</option>',
		  	'<option>top</option>',
		  	'</select> <br />',
		  	'<br />Sizing Properties <br /><br />' +
		  	'Box width  <input type="text" size="10" id="boxWidth" value="'+3/4 * this.parent.width+'"> <br />',
	    	'Box height <input type="text" size="10" id="boxHeight" value="'+this.parent.height+'"> <br />',
		  	'text size <input type="text" id="size" size="26" value="100"> <br />',
		  	'<input type="checkbox" id="adjustsFontSizeToFitWidth" value="adjustsFontSizeToFitWidth" />Adjusts font size to fit width  <br />',
		    '<input type="checkbox" id="adjustsBoxSizeToFitFontSize" value="adjustsBoxSizeToFitFontSize" />Adjusts box size to fit font size <br />',
		    '<br />Highlight Properties <br /><br />' +
		  	'<input type="checkbox" id="highlighted" value="highlighted" />Highlighted <br />',
		  	'Highlighted text color <input type="text" id="highlightedTextColor" size="26" value="gray"> <br />',
		  	'<br />Shadow Properties <br /><br />' +
		  	'Shadow Color <input type="text" id="shadowColor" size="26" value="null"> <br />',
		  	'Shadow offset X <input type="text" id="shadowOffsetX" size="26" value="0"> <br />',
		  	'Shadow offset Y <input type="text" id="shadowOffsetY" size="26" value="-1"> <br />',
		  	'shadow blur <input type="text" id="shadowBlur" size="26" value="1"> <br />',
		    '</form>',
	    ].join('\n');
    },
  })

var right = label({
  x: bind(right, 'x', positioning.prev.right()),
  y:0,
  text: bind(right, 'text', function() {
  	return document.getElementById('lablText').value;
  }),
  font: bind(right, 'font', function(){
  	return document.getElementById('lablFont').value;
  }),
  color: bind(right, 'color', function(){
  	return document.getElementById('textColor').value;
  }),
  bold: bind(right, 'bold', function(){
  	var bold = document.getElementById('bold');
  	if (!bold) { return false; }
  	return bold.checked;
  }),
  align: bind(right, 'align', function() {
	  var hsel = document.getElementById('align');
	  if (!hsel) return 'center';

	  return hsel.options[hsel.selectedIndex].value;
  }),
  verticalAlign: bind(right, 'verticalAlign', function() {
	 var vsel = document.getElementById('verticalAlign');
	  if (!vsel) return 'middle';

	  return vsel.options[vsel.selectedIndex].value;
  }),
  adjustsBoxSizeToFitFontSize: bind(right, 'adjustsBoxSizeToFitFontSize', function(){
  	var adjustsBoxSizeToFitFontSize = document.getElementById('adjustsBoxSizeToFitFontSize');
  	if (!adjustsBoxSizeToFitFontSize) { return false; }
  	return adjustsBoxSizeToFitFontSize.checked;
  }),
  highlighted: bind(right, 'highlighted', function(){
  	var highlighted = document.getElementById('highlighted');
  	if (!highlighted) { return false; }
  	return highlighted.checked;
  }),
  highlightedTextColor: bind(right, 'highlightedTextColor', function(){
  	return document.getElementById('highlightedTextColor').value;
  }),
  shadowColor: bind(right, 'shadowColor', function(){
  	return document.getElementById('shadowColor').value;
  }),
  shadowOffsetX: bind(right, 'shadowOffsetX', function(){
  	return parseInt(document.getElementById('shadowOffsetX').value);
  }),
  shadowOffsetY: bind(right, 'shadowOffsetY', function(){
  	return parseInt(document.getElementById('shadowOffsetY').value);
  }),
  shadowBlur: bind(right, 'shadowBlur', function(){
  	return parseInt(document.getElementById('shadowBlur').value);
  }),  
});

var base_ondraw = right.ondraw;
right.ondraw = function(ctx) {
  if (!this.adjustsBoxSizeToFitFontSize) { this.width = parseInt(document.getElementById('boxWidth').value); }
  if (!this.adjustsBoxSizeToFitFontSize) { this.height = parseInt(document.getElementById('boxHeight').value); }
  var adjustsFontSizeToFitWidth = document.getElementById('adjustsFontSizeToFitWidth');
  this.adjustsFontSizeToFitWidth = (!adjustsFontSizeToFitWidth) ? false : adjustsFontSizeToFitWidth.checked;
  this.size = (adjustsFontSizeToFitWidth.checked) ? this.size : parseInt(document.getElementById('size').value);
  ctx.fillStyle = 'green';
  ctx.fillRect(0, 0, this.width, this.height);
  base_ondraw.call(this, ctx);
};

app.add(left);
app.add(right);

module.exports = app;