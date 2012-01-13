$(document).ready(function() {
  alert('Hello, world!');
});

function getRandBetween(lo, hi) {
	return parseInt(Math.floor(Math.random()*(hi-lo+1))+lo);
}

Array.prototype.remove = function(item) {
	var i = $.inArray(item, this);
	if (i === undefined || i < 0) return undefined;
	return this.splice(i, 1);
};

Array.prototype.getRandomElement = function() {
	var i = getRandBetween(0, this.length-1);
	return this[i];
}
