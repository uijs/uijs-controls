var uijs = require('uijs');
var box = uijs.box;
var bind = uijs.bind;
var controls = require('..');
var searchBar = controls.searchBar;

var app = box();

var searchbar = searchBar({
	width:bind(function(){return app.width; }),
	height:50,
});

app.add(searchbar);

module.exports = app;