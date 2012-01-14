var page = 0, money = 10000;
var stocks = {
		'BEER': new stock('BEER', 20),
		'BLUE': new stock('BLUE', 20),
		'BUBL': new stock('BUBL', 20),
		'DRUG': new stock('DRUG', 20),
		'LOVE': new stock('LOVE', 20),
};

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
		page++;
		if (page == 3) {
			page = 'congrats';
		}
		else if (page == 'congrats') {
			return false; // TODO exit training
		}
		$.get('training_'+ page +'.html', function(data) {
			$('#content').html($(data).find('#content'));
		});
		e.preventDefault();
	});
	
	stocks['BEER'].buy(money / stocks['BEER'].value);
	drawAmounts();
});

// STOCKS ---------------------------------------------------------------------

function stock(name, value) {
	this.amount = 0;
	this.name = name;
	this.value = value;
	this.allvalues = [value];
	this.changeValue = function(newValue) {
		this.allValues.push(newValue);
		value = newValue;
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
		stocks[values.name].buy(values.amount);
	}
}

function sell() {
	var values = validate();
	if (values) {
		stocks[values.name].sell(values.amount);
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
	var i = getRandBetween(0, this.length-1);
	return this[i];
}
