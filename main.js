/**
 *
GIVEN ENOUGH TIME: BUGS:
only show stocks in the table that we've introduced so far
get rid of excess whitespace above control box

GIVEN ENOUGH TIME: FEATURES:
come up with more terms
introduce more trading concepts
introduce stock personalities
 */

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
        e.preventDefault();
        if (page == 'congrats') {
        	resetChange();
            page = 'game';
            $.get('index.html', function(data) {
                $('#content').html($(data).find('#content'));
                // TODO: show the .note from the last round of the main game
                drawAmounts();
            });
            drawAmounts();
            return false;
        }
        else if (page == 'game') {
            currentTurn++;
            if (currentTurn == 3) {
                $.get('congrats.html', function(data) {
                    $('#content').html($(data).find('#content'));
                    $('#controlWrapper').hide();
                    drawAmounts();
                });
                page = 'seriousBusiness';
            }
            else {
                turn();
                drawAmounts();
            }
            return false;
        }
        else if (page == 'seriousBusiness') {
            $('body').addClass('black');
            seriousBusiness();
            resetChange();
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
                	resetChange();
                    stocks.BUBL.changeValue(stocks.BUBL.value + 1);
                    $('#stock option[value="BEER"]').after('<option value="BLUE">BLUE</option>');
                    $('#stock option[value="BUBL"]').after('<option value="DRUG">DRUG</option>');
                }
                drawAmounts();
            });
            return false;
        }
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
    };
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
    };
    this.sell = function(amount) {
        if (amount <= this.amount) {
            this.amount -= amount;
            money += amount * this.value;
            $('td.cash + td').html(money);
            drawAmounts();
            return true;
        }
        return this.amount;
    };
}

function buy() {
    var values = validate();
    if (values) {
        var v = stocks[values.name].buy(values.amount);
        if (v !== true) {
            alert('You only have enough money to buy '+ v +' share'+ (v == 1 ? '' : 's') +'.');
        }
        else {
            setMessage('You bought '+ values.amount +' shares of '+ values.name +' for $'+ stocks[values.name].value +'/share', true);
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
        else {
            setMessage('You sold '+ values.amount +' shares of '+ values.name +' for $'+ stocks[values.name].value +'/share', true);
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
    $('#stocks thead').empty().append('<td>Stock</td><td>Price</td><td>Shares</td><td>Change</td>');
    var totalVal = money;
    for (name in stocks) {
        if (stocks.hasOwnProperty(name)) {
        	totalVal += stocks[name].value * stocks[name].amount;
        	var dollarChange = stocks[name].value - stocks[name].allValues[stocks[name].allValues.length-2];
        	if (!dollarChange)
        		dollarChange = 0;
            $tbody.append('<tr><td class="stock">'+ name +'</td><td class="value">'+ stocks[name].value +'</td><td class="amount">'+ stocks[name].amount +'</td><td class="change">' + dollarChange + '</td></tr>');
        }
    }
    $tbody.append('<tr><td class="stock cash">Cash</td><td class="value">'+ money +'</td><td class="amount">&ndash;</td><td class="change"> &ndash;</td></tr>');
    $tbody.append('<tr><td colspan="4" class="totalval"><strong>Total portfolio value:</strong> $'+ totalVal +'</td></tr>');

    // Highlight terms when you mouse over them.
    $('.info-term').hover(function() {
      var $t = $(this);
      $.each($('.term'), function() {
        if ($t.html() == $(this).html()) {
          $(this).toggleClass('highlight');
        }
      });
    });
}

function resetChange() {
	 for (stock in stocks) {
	        if (stocks.hasOwnProperty(stock)) {
	            var stockValue = stocks[stock].value;
	            stocks[stock].allValues.push(stockValue);
	        }
	 }
}


// UTILITIES ------------------------------------------------------------------

var messageFadeTimerA = null, messageFadeTimerB = null;
function setMessage(text, fade) {
    clearTimeout(messageFadeTimerA);
    clearTimeout(messageFadeTimerB);
    $('#messages').html(text).css('opacity', '1');
    if (fade) {
        // Fade out in 2 seconds after 5 seconds, then clear the text and set back to visible.
        messageFadeTimerA = setTimeout("$('#messages').animate({'opacity': '0'}, 2000);", 5000);
        messageFadeTimerB = setTimeout("$('#messages').html('').css('opacity', '1');", 7250);
    }
}

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

function keys(obj){
    var keys = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            keys.push(key);
    }
    return keys;
}


// POST-TRAINING --------------------------------------------------------------

function event(description, delta, note, stockName) {
    this.description = description;
    this.origStockName = stockName;
    this.stockName = function() {
        if (!this.origStockName) {
            this.origStockName = keys(stocks).getRandomElement();
        }
        return this.origStockName;
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
    if (turnEvent)
        $('.note').html(turnEvent.note());
    turnEvent = eventTypes.getRandomElement();
    eventTypes.remove(turnEvent);
    $('.info').html(turnEvent.description());
    drawAmounts();
}

function calculateNewPrices() {
    for (stock in stocks) {
        if (stocks.hasOwnProperty(stock)) {
            var stockValue = stocks[stock].value;
            if (turnEvent && stock == turnEvent.stockName()) {
                stocks[stock].changeValue(stockValue + turnEvent.getDelta());	
            }
            else {
                stocks[stock].changeValue(stockValue + getRandBetween(-.1*stockValue, .1*stockValue));
            }
        }
    }
}

var eventTypes = [
                  new event(function() {
                      return this.stockName() + ' is releasing their quarterly earnings report tomorrow. Wall street analysts think they will hit their predictions, but you can never be sure.';
                  }, function() {
                      var stockPercent = stocks[this.stockName()].value * 0.1;
                      return getRandBetween(-stockPercent*1, stockPercent*2.5);
                  }, function() {
                      if (this.delta < 0) {
                          return this.stockName() + ' missed their earnings predictions. Stock price fell by $' + this.delta + '.';
                      }
                      else if (this.delta > 0) {
                          return this.stockName() + ' exceeded their earnings predictions. Stock price rose by $' + this.delta + '.';
                      }
                      else {
                          return this.stockName() + ' exactly hit their earnings predictions. Stock price remained the same.';
                      }
                  }, null),
                 new event(function() {
                      return this.stockName() + ' is holding a surprise press release tomorrow. The news could be good or bad.';
                  }, function() {
                      var stockPercent = stocks[this.stockName()].value * 0.15;
                      return getRandBetween(-2*stockPercent, 2*stockPercent);
                  }, function() {
                      if (this.delta < 0) {
                          return 'One of ' + this.stockName() + '\'s key executives must resign due to health reasons. Stock price fell by $' + this.delta + '.';
                      }
                      else if (this.delta > 0) {
                          return this.stockName() + ' unveiled a new product for a rapidly growing market. Stock price rose by $' + this.delta + '.';
                      }
                      else {
                          return this.stockName() + ' announced they will sponsor PennApps in the fall of 2012. Wall Street didn\'t seem to care. Stock price remained the same.';
                      }
                  }, null),
                  new event(function() {
                      return this.stockName() + '\'s largest competitor just went bankrupt. Generally, analysts see situations like this as an opportunity to gain market share. However, it may also be seen as a sign of a weak or struggling industry.';
                  }, function() {
                      var stockPercent = stocks[this.stockName()].value * 0.1;
                      return getRandBetween(-1.5*stockPercent, stockPercent*3);
                  }, function() {
                      if (this.delta < 0) {
                          return 'A large number of analysts think ' + this.stockName() + 'may be the next to file for Chapter 11. Stock price fell by $' + this.delta + '.';
                      }
                      else if (this.delta > 0) {
                          return 'A large number of analysts think ' + this.stockName() + ' is strategically poised to capture market share from its bankrupt competitor. Stock price rose by $' + this.delta + '.';
                      }
                      else {
                          return 'Analysts\'s opinions were split evenly on the news. ' + this.stockName() + '\'s stock price remained the same.';
                      }
                  }, null),
                  new event(function() {
                      return 'Rumors have spread that ' + this.stockName() + '\'s CFO cooked the books. If these allegations prove true, they could be devastating.';
                  }, function() {
                      var stockPercent = stocks[this.stockName()].value * 0.1;
                      return getRandBetween(-stockPercent*3, stockPercent*1.5);
                  }, function() {
                      if (this.delta < 0) {
                          return this.stockName() + '\'s CFO was indicted by the SEC. Stock price fell by $' + this.delta + '.';
                      }
                      else if (this.delta > 0) {
                          return 'The rumors turned out to be false. ' + this.stockName() + '\'s stock price rose by $' + this.delta + '.';
                      }
                      else {
                          return 'The issue was dwarfed by an even larger scandal at Halliburton. ' + this.stockName() + '\'s stock price remained the same.';
                      }
                  }, null),
                  new event(function() {
                      return 'China\'s political leaders are meeting to determine monetary policy. ' + this.stockName() + ' buys key supplies from China. If the Yuan strengethens, ' + this.stockName() + ' will have to pay more to manufacture its products.';
                  }, function() {
                      var stockPercent = stocks[this.stockName()].value * 0.1;
                      return getRandBetween(-stockPercent*2, stockPercent);
                  }, function() {
                      if (this.delta < 0) {
                          return 'Due to U.S. pressure, China allowed its currency to partially elevate. ' + this.stockName() + '\'s stock price fell by $' + this.delta + '.';
                      }
                      else if (this.delta > 0) {
                          return 'The Chinese government kept the Yuan pegged to the dollar. In response, ' + this.stockName() + '\'s stock price rose by $' + this.delta + '.';
                      }
                      else {
                          return 'The Chinese government maintained the current exchange rate, but indicated they\'d be willing to change it in the future. ' + this.stockName() + '\'s stock price remained the same.';
                      }
                  }, null),
];


// SERIOUS BUSINESS -----------------------------------------------------------

var sbCount = 0;
var sbStock = 'BEER';
function seriousBusiness() {
    sbCount++;
    if (sbCount == 1) {
    	$('#right-column').hide();
    	$('#left-column').css({'width': '960px', 'padding-right': '0'});
        $('.info').html('You enter a lab. Professor Oak is standing over a table. '+
                'There are two stocks on a table: BEER and LOVE. '+
                'Your cousin Gary has been here already and taken DRUG, the third stock. '+
                'Which stock do you want to take?'
        );
        $('#controls').empty().html('<label>Stock<select id="stock" name="stock">'+
        		'<option value="BEER" selected="selected">BEER</option>'+
        		'<option value="LOVE">LOVE</option></select></label>'
        );
        $('#controlWrapper').show().css('width', 'auto');
    }
    else if (sbCount == 2) {
    	sbStock = $('#stock').val();
        $('.info').html('Good choice. You take 5 shares of '+ sbStock +' and venture into the wild. '+
                '"Be careful," Professor Oak warns, "it\'s a blue-chip world out there."'
        );
        $('#controlWrapper').hide();
        $('#controls').empty();
    }
    else if (sbCount == 3) {
        $('.info').html('You encountered wild LOVE. LOVE wants to fight!');
    }
    else if (sbCount == 4) {
        fightLove();
    }
    else if (sbCount == 5) {
        $('.info').html('You defeated wild LOVE! Nice fight! You continue on your way to Gold City, 2 shares of LOVE in tow.');
    }
    else if (sbCount == 6) {
        $('.info').html('Oh no! Gary is challenging your portfolio to a fight!');
    }
    else if (sbCount == 7) {
        fightGary();
    }
    else if (sbCount == 8) {
        $('body').removeClass('black');
        $('.info').html('Congratulations! You defeated Gary! He slinks away in shame. '+
                'You\'ve earned the right to continue on your way to a life of tricking people into giving you their money. '+
                'Good work!'
        );
    }
    else if (sbCount == 9) {
    	$('body').addClass('black');
    	$('.info').html('Oh no! Gary was only pretending to sneak away! '+
    			'He actually went and lobbied Congress to pass SOPA and PIPA! '+
    			'The internet has died! Game over. We all lose.'+
    			'<br />&nbsp;<br />This could really happen. '+
    			'Please join us in <a href="http://protestsopa.org/">protesting SOPA</a> to save your LOVE on the internet.'
    	);
        $('#continue').hide();
    }
}

function fightLove() {
    $('.info').html('The wild LOVE is worth $24. LOVE attacks first. LOVE uses split! There are now two of LOVE at $12 each!');
    if (sbStock == 'LOVE') {
    	$('#controls').html('<input type="submit" id="cheat" name="cheat" value="Cheat" />');
    }
    else if (sbStock == 'BEER') {
    	$('#controls').html('<input type="submit" id="confuse" name="confuse" value="Confuse" />');
    }
    $('#controlWrapper').show();
    $('#continue').hide();
    lovePrice = 12;
    $('#controls').submit(function(e) {
    	e.preventDefault();
    	var move = sbStock == 'LOVE' ? 'Cheat' : 'Confuse';
    	lovePrice -= 4;
    	$('.info').html('You used '+ move +' on wild LOVE. LOVE\'s price was reduced to $'+ lovePrice +'!');
    	if (lovePrice == 0) {
    		$('.info').append('<br />&nbsp;<br />You ruined LOVE! It went bankrupt!');
            $('#continue').show();
            $('#controls').empty();
            $('#controlWrapper').hide();
    	}
    	else {
    		$('.info').append('<br />&nbsp;<br />The wild LOVE cheated on you! One of your '+ sbStock +'s was destroyed.');
    	}
    });
    // BLUE used dividend! BLUE used transform! BLUE is now RED!
    // DRUG used depression!
    // BUBL used ponzi scheme!
}

function fightGary() {
    $('.info').html('Gary\'s portfolio is worth $50! '+
            'Gary used insider information! His stock value went up 10% to $55!'
    );
    //$('.info').html('Gary's BUBL used disruptive technology! One of your shares of LOVE is now obsolete! Critical hit!');

    if (sbStock == 'LOVE') {
    	$('#controls').html('<input type="submit" id="cheat" name="cheat" value="Cheat" />');
    }
    else if (sbStock == 'BEER') {
    	$('#controls').html('<input type="submit" id="confuse" name="confuse" value="Confuse" />');
    	$('#controls').append('<input type="submit" id="cheat" name="cheat" value="Cheat" />');
    }
    $('#controlWrapper').show();
    $('#continue').hide();
    lovePrice = 12;
    garyValue = 55;
    sbSubmitButton = null;
    $('#controls').submit(function(e) {
    	e.preventDefault();
    	garyValue -= Math.max(Math.floor(garyValue / 2), 10);
    	$('.info').html('You used '+ sbSubmitButton +' on Gary\'s portfolio reducing its value to $'+ garyValue +'!');
    	if (garyValue <= 10) {
    		$('.info').append('<br />&nbsp;<br />Critical hit! Gary\'s portfolio value is extremely low!');
            $('#continue').show();
            $('#controls').empty();
            $('#controlWrapper').hide();
    	}
    	else {
    		var garyStock = ['BLUE', 'DRUG', 'BUBL'].getRandomElement();
    		var garyAction = '';
    		if (garyStock == 'BLUE') {
    			if (Math.random() < 0.5) {
    				garyAction = ' used dividend! Gary\'s portfolio regained $5 value!';
    				garyValue += 5;
    			}
    			else {
    				garyAction = ' used transform! Gary\'s BLUE is now RED! You are confused.';
    			}
    		}
    		else if (garyStock == 'DRUG') {
    			garyAction = ' used depression! The entire stock market crashed! Both of your portfolios lost $10.';
    			garyValue -= 10;
    		}
    		else if (garyStock == 'BUBL') {
    			if (Math.random() < 0.5) {
    				garyAction = ' used disruptive technology! One of your shares of LOVE is now obsolete! Critical hit!';
    			}
    			else {
    				garyAction = ' used ponzi scheme! Your investments in whizgizmos tanked, reducing your portfolio value by $8.';
    			}
    		}
    		$('.info').append('<br />&nbsp;<br />Gary\'s '+ garyStock + garyAction);
    	}
    }).on('keyup mouseup', function(e) {
    	sbSubmitButton = e.target.name;
    });
}
