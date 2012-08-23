var uijs = require('uijs');
var box = uijs.box;
var bind = uijs.bind;
var controls = require('..');
var textCancel = controls.textCancel;

var app = box();

var cancelBox = textCancel({
	width:100,
	height:100,
});

cancelBox.on('click',function(){alert('clicked')});

app.add(cancelBox);


module.exports = app;