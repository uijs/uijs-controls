var uijs = require('uijs');

var box = uijs.box;
var util = uijs.util;
var controls = require('..');
var listView = controls.listView;

var app = box();

var listItem1 = box({
	x:0,
	y:0,
	width:300,
	height:50,
});

listItem1.draw = function(ctx) {
	var self = this;
	ctx.fillStyle = 'blue';
    ctx.fillRect(self.x, self.y, self.width, self.height);
   }

var listItem2 = box({
	x:0,
	y:0,
	width:500,
	height:50,
});

listItem2.draw = function(ctx) {
	var self = this;
	ctx.fillStyle = 'red';
    ctx.fillRect(self.x, self.y, self.width, self.height);
   }

var lv = listView({
	borderColor: 'gray',
    borderWidth: 2,
});
lv.items = [listItem1, listItem2,listItem1,listItem2,listItem1,listItem2];

app.add(lv);

module.exports = app;

