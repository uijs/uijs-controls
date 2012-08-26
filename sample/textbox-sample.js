var uijs = require('uijs');
var box = uijs.box;
var bind = uijs.bind;
var controls = require('..');
var textbox = controls.textbox;

var app = box();

var textBox = textbox({
	x:bind(function(){return ((app.width - this.width)/2); }),
	y:bind(function(){return app.height/2; }),
	width:bind(function(){return app.width/3; }),
	height:50,
	_id: 'app',
});

//textBox.ondraw = function(ctx){
//	ctx.fillStyle = 'blue';
//  	ctx.fillRect(0, 0, this.width, this.height);
//}

app.add(textBox);

module.exports = app;