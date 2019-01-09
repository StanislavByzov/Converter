'use strict';

const UNITS = {
	"Mass": {
				"gramm": "g",
				"pound": "lb",
				"pood": "p"
	},
	"Distance": {
				"meter": "m",
				"mile": "ml",
				"verst": "vt"
	},
	"Temperature": {
				"Celsium": "C",
				"Fahrenheit": "F",
				"Kelvin": "K"
	}	
};

const CONVERSION_RATES = {
	// mass conversions
	"Mass": {
		"g-lb": 0.002205,
		"g-p": 0.00006105,
		"lb-p": 0.02769,
		"lb-g": 453.6,
		"p-g": 16380,
		"p-lb": 36.11
	},
	// distance conversions
	"Distance": {
		"m-ml": 0.0006214,
		"m-vt": 0.9372071,
		"ml-vt": 1.50852316,
		"ml-m": 1609,
		"vt-m": 1.067,
		"vt-ml": 0.6629
	},
	// temperature conversions
	"Temperature": {
	// no rates - need to execute calculations
	}
};

let value;
let unitFrom;
let unitTo;
let unitFromSelect;
let unitToSelect;

function updateValue() {
	value = document.getElementById("value").value;
	checkIfReady();
}

function updateUnits() {
	
	unitFromSelect = document.getElementById("from");
	unitToSelect = document.getElementById("to");

	let optionsFactory = new SingletonOptionsFactory();
	// console.log(optionsFactory);
	let factory = optionsFactory.create();
	// console.log(factory);	
	factory.populateOptionsArray(unitFromSelect);
	factory.populateOptionsArray(unitToSelect);
}

function setUnit(destination) {
	let selectedIndex = -1;
	if (destination === 'from') {
		selectedIndex = unitFromSelect.options.selectedIndex;
		unitFrom = unitFromSelect.options[selectedIndex].value;
	} else if (destination === 'to') {
		selectedIndex = unitToSelect.options.selectedIndex;
		unitTo = unitToSelect.options[selectedIndex].value;
	} else {
		alert('An error occured!');
	}
	checkIfReady();
}

function checkIfReady() {
	const ready = value && unitFrom && unitTo;
	document.getElementById("convert").disabled = !ready;
}

class SingletonOptionsFactory {
	constructor() {	
	}
	
    create() {
		if (this.optionsFactory === undefined) {
			this.optionsFactory = new OptionsFactory();
		}
		return this.optionsFactory;
	}
}

class OptionsFactory {
	
	constructor() {
		// remove default empty option from the list
		const systemsSelect = document.getElementById("system");
		if (systemsSelect.options[0].value === '') {
			systemsSelect.options[0] = null;
		}
		const selectedIndex = systemsSelect.options.selectedIndex;
		this.unitsSelected = UNITS[systemsSelect.options[selectedIndex].value];
	}
	
	populateOptionsArray(destination) {
		this.clearOptions(destination);
		for (const key in this.unitsSelected) {
			const value = this.unitsSelected[key];
			var newOption = new Option(key, value);
			this.addOption(newOption, destination);
		}
		destination.options.selectedIndex = -1;
	}
	
	clearOptions(destination) {
		// remove deprecated options from the list
		while (destination.options.length > 0) {
			destination.options[0] = null;
		}
	}
	
	addOption(newOption, destination) {
		// здесь можно было бы реализовать полиморфизм вручную через switch/case или
		// ветвлением if'ов, но зачем, если стандартные средства языка это делают проще.
		// Поэтому просто вставил шаблон фабрики для демонстрации понимания паттерна
		destination.options[destination.options.length] = newOption;
	}

}

// JS слишком динамичен для интерфейсов, поэтому нативно их не поддерживает (не реализует),
// искать и прикручивать пару-тройку библиотек для интерфейсов я пробовал, но это насилие над людьми,
// поэтому запилил простую имитацию интерфейсов (опять же, для наглядности того, что есть понимание происходящего).
// Работа с "интерфейсами" ведется как с настоящими, так что прошу не обращать внимания на то, что создаются объекты

// Create interface with only one useful function. The function is implemented and throws an error for developer to ensure 
// that interface will be implemented and the function will be overrided (e.g. implemented in the class) - 
// this is made to imitate function declaration 
const IConvert = {
	getConversionRate: function() {
		throw new Error('Function is not implemented!');
	}
}

// Create class with only one useful function - custom constructor which returns an instance of the class
const Converter = {
	create() {
		let conversionFactory = new SingletonConversionFactory();
		let factory = conversionFactory.create();
		return this;
	}
}

// Function called on button click
function convert() {
	console.log('Convert from ' + unitFrom + ' to ' + unitTo);
	// implementing interface for class
	implement(IConvert, Converter);
	// implementing function, declared in the interface
	// the solution was to move the core functionality away to the separate factory,
	// so now only copying predefined functions into Converter class
	Converter.getConversionRate = ConversionFactory.prototype.convert;
	Converter.convertTemperaturesWithCalculations = ConversionFactory.prototype.convertTemperaturesWithCalculations;
	Converter.convertWithConversionRate = ConversionFactory.prototype.convertWithConversionRate;
	
	// ВАЖНО!!! Легко проверить имплементацию интерфейса IConvert классом Converter: достаточно закомментить
	// предыдущие 3 строки, и в результате код выдаст ошибку, сообщающую о том, что вызываемая функция не реализована в классе
	
	const converter = Converter.create();

	// calling newely implemented functionality
	const result = value + ' ' + unitFrom + ' = ' + converter.getConversionRate(value, unitFrom, unitTo) + ' ' + unitTo;
	
	// displaying result
	console.log('*******RESULT******');
	console.log(result);
	console.log('*******RESULT END******');
	alert(result);
}

// Imitate interface implementation. To make it easier, only one hardcoded function is passed.
// In a real project it's possible to iterate over all the "declared" fields and functions
function implement (interfaceName, className) {
	className.getConversionRate = interfaceName.getConversionRate;
}

class SingletonConversionFactory {
	constructor() {	
	}
	
    create() {
		if (this.conversionFactory === undefined) {
			this.conversionFactory = new ConversionFactory();
		}
		return this.conversionFactory;
	}
}

class ConversionFactory {
	
	constructor() {

	}
	
	convert(value, unitFrom, unitTo) {
		let convertedValue = 0;
		this.systemsSelect = document.getElementById("system");
		const selectedIndex = this.systemsSelect.options.selectedIndex;
		this.unitsConversionSystem = this.systemsSelect.options[selectedIndex].value;		
		if (this.unitsConversionSystem === 'Temperature') {
			convertedValue = this.convertTemperaturesWithCalculations(value, unitFrom, unitTo);
		} else {
			convertedValue = this.convertWithConversionRate(value, unitFrom, unitTo);
		}
		if (isNaN(convertedValue)) {
			convertedValue = 'An error occured!';
		}
		return convertedValue;
	}
	
	convertTemperaturesWithCalculations(value, unitFrom, unitTo) {
		value = +value;
		let result = 0;
		// temperature scales are too different, so we need to execute some calculations
		if (unitFrom === 'C') {
			if (unitTo === 'K') {
				result = value + 273.15;	// C to K
			} else if (unitTo === 'F') {
				result = value * 1.8 + 32	// C to F
			} else {
				result = NaN;				// handle if something is wrong
			}
		} else if (unitFrom === 'K') {
			if (unitTo === 'C') {
				result = value - 273.15;	// K to C
			} else if (unitTo === 'F') {
				result = value * 1.8 - 459.67;	// K to F
			} else {
				result = NaN;				// handle if something is wrong
			}
		} else if (unitFrom === 'F') {
			if (unitTo === 'C') {
				result = (value - 32) / 1.8;	// F to C
			} else if (unitTo === 'K') {
				result = (value + 459.67) / 1.8;	// F to K
			} else {
				result = NaN;				// handle if something is wrong
			}
		} else {
				result = NaN;				// handle if something is wrong
		}
		return result;
	}
	
	convertWithConversionRate(value, unitFrom, unitTo) {
		let result = 0;
		const conversionCode = unitFrom + '-' + unitTo;
		const conversionRate = CONVERSION_RATES[this.unitsConversionSystem][conversionCode];
		result = value * conversionRate;
		return result;
	}

}
