var uijs = require('uijs');
var box = uijs.box;
var bind = uijs.bind;
var controls = require('..');
var cancelIcon = controls.cancelIcon;
var searchIcon = controls.searchIcon;

var app = box();

var cancel = cancelIcon({
	width:100,
	height:100,
});

var search = searchIcon({
	x:100,
	width:100,
	height:100,
});

cancel.on('click',function(){alert('clicked')});

app.add(cancel);
app.add(search);


module.exports = app;