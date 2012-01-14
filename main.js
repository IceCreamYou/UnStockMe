var page = 0, currentTurn = 0, money = 10000;
var stocks = {
		'BEER': new stock('BEER', 20),
		'BLUE': new stock('BLUE', 20),
		'BUBL': new stock('BUBL', 20),
		'DRUG': new stock('DRUG', 20),
		'LOVE': new stock('LOVE', 20),
};
var turnEvent;

$(document).ready(function() {
	$('td.cash + td').html(money);
	
	var submitButton = null;
	$('#controls').submit(function(e) {
		if (submitButton == 'buy') {
			buy();
		}
		else if (submitButton == 'sell') {
			sell();
		}
		e.preventDefault();
	}).on('keyup mouseup', function(e) {
		submitButton = e.target.name;
	});
	
	$('#continue').submit(function(e) {
		if (page == 'congrats') {
			page = 'game';
			$.get('index.html', function(data) {
				$('#content').html($(data).find('#content'));
				drawAmounts();
			});
			drawAmounts();
			return false;
		}
		else if (page == 'game') {
			currentTurn++;
			turn();
			drawAmounts();
			if (currentTurn == 5) {
				$.get('congrats.html', function(data) {
					$('#content').html($(data).find('#content'));
					drawAmounts();
				});
			}
			return false;
		}
		else {
			page++;
			if (page == 4) {
				page = 'congrats';
			}
			$.get('training_'+ page +'.html', function(data) {
				$('#content').html($(data).find('#content'));
				if (page == 2) {
					$('#stock').append('<option value="LOVE">LOVE</option>');
					$('#controlWrapper').show();
				}
				else if (page == 3) {
					stocks.LOVE.changeValue(stocks.LOVE.value + 2);
					$('#stock option[value="BEER"]').after('<option value="BUBL">BUBL</option>');
				}
				else if (page == 'congrats') {
					stocks.BUBL.changeValue(stocks.BUBL.value + 1);
					$('#stock option[value="BEER"]').after('<option value="BLUE">BLUE</option>');
					$('#stock option[value="BUBL"]').after('<option value="DRUG">DRUG</option>');
				}
				drawAmounts();
			});
			return false;
		}
		e.preventDefault();
	});
	
	$('#continue').submit();
	stocks['BEER'].buy(money / stocks['BEER'].value);
	drawAmounts();
});

// STOCKS ---------------------------------------------------------------------

function stock(name, value) {
	this.amount = 0;
	this.name = name;
	this.value = value;
	this.allValues = [value];
	this.changeValue = function(newValue) {
		this.allValues.push(newValue);
		this.value = newValue;
	}
	this.buy = function(amount) {
		var cost = amount * this.value;
		if (cost <= money) {
			money -= cost;
			this.amount += amount;
			$('td.cash + td').html(money);
			drawAmounts();
			return true;
		}
		return Math.floor(money / this.value);
	}
	this.sell = function(amount) {
		if (amount <= this.amount) {
			this.amount -= amount;
			money += amount * this.value;
			$('td.cash + td').html(money);
			drawAmounts();
			return true;
		}
		return this.amount;
	}
}

function buy() {
	var values = validate();
	if (values) {
		var v = stocks[values.name].buy(values.amount);
		if (v !== true) {
			alert('You only have enough money to buy '+ v +' share'+ (v == 1 ? '' : 's') +'.');
		}
	}
}

function sell() {
	var values = validate();
	if (values) {
		var v = stocks[values.name].sell(values.amount);
		if (v !== true) {
			alert('You only have '+ v +' share'+ (v == 1 ? '' : 's') +' to sell.');
		}
	}
}

function validate() {
	var val = parseInt($('#amount').val());
	if (val == NaN || val < 1) {
		alert('The number of shares of stock you want to trade must be a positive integer.');
		$('#amount').addClass('error');
		return false;
	}
	else {
		$('#amount').removeClass('error');
	}
	var name = $('#stock').val();
	if (!stocks[name]) {
		$('#stock').addClass('error');
		return false;
	}
	else {
		$('#stock').removeClass('error');
	}
	return {'name': name, 'amount': val};
}

function drawAmounts() {
	var $tbody = $('#stocks tbody');
	$tbody.empty();
	for (name in stocks) {
		if (stocks.hasOwnProperty(name))
			$tbody.append('<tr><td class="stock">'+ name +'</td><td class="value">'+ stocks[name].value +'</td><td class="amount">'+ stocks[name].amount +'</td></tr>');
	}
	$tbody.append('<tr><td class="stock cash">Cash</td><td class="value">'+ money +'</td><td class="amount"></td></tr>');
}


// UTILITIES ------------------------------------------------------------------

function getRandBetween(lo, hi) {
	return parseInt(Math.floor(Math.random()*(hi-lo+1))+lo);
}

Array.prototype.remove = function(item) {
	var i = $.inArray(item, this);
	if (i === undefined || i < 0) return undefined;
	return this.splice(i, 1);
};

Array.prototype.getRandomElement = function() {
	if (this.length == 0)
		return undefined;
	var i = getRandBetween(0, this.length-1);
	return this[i];
}

Object.prototype.keys = function(){
	var keys = [];
	for (var key in this) {
		if (this.hasOwnProperty(key))
			keys.push(key);
	}
	return keys;
}


// POST-TRAINING --------------------------------------------------------------

function event(description, delta, note, stockName) {
	this.description = description;
	this.origStockName = stockName;
	this.stockName = function() {
		if (this.origStockName) {
			return this.origStockName;
		}
		return stocks.keys().getRandomElement();
	};
	this.deltaFunc = delta;
	this.delta = 0;
	this.getDelta = function() {
		this.delta = this.deltaFunc();
		return this.delta;
	};
	this.note = note;
}

function turn() {
	calculateNewPrices();
	turnEvent = eventTypes.getRandomElement();
	$('.info').html(turnEvent.description());
	drawAmounts();
}

function calculateNewPrices() {
	for (stock in stocks) {
		var stockValue = stocks[stock].value;
		if (turnEvent && stock == turnEvent.stockName()) {
			stocks[stock].changeValue(stockValue + turnEvent.getDelta());	
		}
		else {
			stocks[stock].changeValue(stockValue + getRandBetween(-.1*stockValue, .1*stockValue));
		}
	}
}

var eventTypes = [
                  new event(function() {
                	  return this.stockName() + ' is releasing their quarterly earnings report tomorrow. Wall street\'s analysts think they will hit their predictions, but you can never be sure.';
                  }, function() {
                	  var stockPercent = stocks[this.stockName()].value * 0.15;
					  if (math.Random() > .7) {
						stockPercent *= -1;  
					  }
                	  return stockPercent;
                  }, function() {
					  return 'The change was '+ this.delta;
				  }, null),
                  new event(function(name) {
                	  name +' description goes here';
                  }, function(name) {
                	  var stockPercent = stocks[name].value * 0.1;
                	  getRandBetween(-stockPercent, stockPercent);
                  }, null),
                  new event(function(name) {
                	  name +' description goes here';
                  }, function(name) {
                	  var stockPercent = stocks[name].value * 0.1;
                	  getRandBetween(-stockPercent, stockPercent);
                  }, null),
                  new event(function(name) {
                	  name +' description goes here';
                  }, function(name) {
                	  var stockPercent = stocks[name].value * 0.1;
                	  getRandBetween(-stockPercent, stockPercent);
                  }, null),
];
