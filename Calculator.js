var userIsInTheMiddleOfTyping = false;
var needToResetOnDigitEnter = false;
var accumulator = 0.0;
var pending;
var symbol;

var display = {

	get value () {
		return document.getElementById("display-text").innerHTML.replace(/\,/g,'');
	},

	set value(n){
		var s = parseFloat(n).toLocaleString('en-GB', {
		      useGrouping: true,
		      maximumFractionDigits: 9
		});
		if (s.length > 14) {
			s = n.toExponential(8);
		} else {
			s = n === "." ? "." : n[n.length-1] === "." ? s += "." : s;
		}
		document.getElementById("display-text").innerHTML = s;
	}
}

var Operations = function () {
	
	this.constant = function ( number ) {
		if(needToResetOnDigitEnter) { reset(); }
		userIsInTheMiddleOfTyping = true;
		needToResetOnDigitEnter = true;
		return number;
	};

	this.unary = function(func) {
		userIsInTheMiddleOfTyping = true;
		needToResetOnDigitEnter = true;		
		return func(accumulator);
	};

	this.binary = function(_symbol) {
		
		if (userIsInTheMiddleOfTyping) {
			if ( pending === undefined ) {
				pending = accumulator;
			}
			else {
				this.execute();
			}		
		}

		userIsInTheMiddleOfTyping = false;	
		needToResetOnDigitEnter = false;	
		symbol = _symbol;
		return accumulator;

	};

	this.execute = function() {
		if(userIsInTheMiddleOfTyping && pending) {
			accumulator = eval(pending + symbol + accumulator);
			pending = accumulator;
			userIsInTheMiddleOfTyping = false;
			needToResetOnDigitEnter = true;			
		}
	};
}

var operations = new Operations();

function digit(sender) {
	if (needToResetOnDigitEnter) { reset(); }

	if (userIsInTheMiddleOfTyping) {
		if (/[\.]/.test(display.value) && sender.value === "." || display.value.replace('.','').length === 9) return; 
		display.value += sender.value;
	}
	else {
		display.value = sender.value;
	}

	userIsInTheMiddleOfTyping = true;
	needToResetOnDigitEnter = false;
}

function operator(sender) {

	switch(sender.value) {
	case "pi":
		accumulator = operations.constant(Math.PI);
		break;
	case "e":
		accumulator = operations.constant(Math.E);	
		break;	
	case "sqr":
		accumulator = display.value;
		accumulator = operations.unary(Math.sqrt);
		break;
	case "cos":
		accumulator = display.value;
		accumulator = operations.unary(Math.cos);
		break;
	case "Clear":
		reset();
		break;	
	case "+/-":
		accumulator = display.value;
		accumulator *= -1;
		break;					
	case "%":
		if(pending){
			accumulator = (pending / 100) * display.value;
		}else{
			accumulator = display.value;
			accumulator = accumulator / 100;
		}
		break;
	case "/":
	case "*":
	case "-":
	case "+":
		accumulator = display.value;
		accumulator = operations.binary(sender.value);
		break;
	case "=":		
		accumulator = display.value;
		operations.execute();
		break;
	default:
		break;
	} 

	display.value = accumulator;
}

function reset() {
	pending = undefined;
	symbol = undefined;
	accumulator = 0.0;
	display.value = accumulator;
	userIsInTheMiddleOfTyping = false;
}