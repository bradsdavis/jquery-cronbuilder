$.widget( "cron.cronbase", {
	_buildSelectTime: function( container, min, max, inc, callback) {
		var select = $("<select></select>");
		
		for (var i = min, limit = max; i <= limit; i+=inc) {
			var option = $('<option/>');
			option.attr({ 'value': i }).text(padded_length_num(i));
			select.append(option);
		}

		//select the first.
		select.children().first().attr("selected", "selected");

		if(callback !== undefined) {
			this._on(select, {
				change: callback
			});
		}

		container.append(select);
		select.chosen({width: "60px"});

		return select;
    },

    _buildSelectDay: function( container, min, max, callback) {
		var select = $("<select></select>");
		
		for (var i = min, limit = max; i <= limit; i++) {
			var option = $('<option/>');
			option.attr({ 'value': i }).text(ordinal_suffix_of(i));
			select.append(option);
		}

		//select the first.
		select.children().first().attr("selected", "selected");

		if(callback !== undefined) {
			this._on(select, {
				change: callback
			});
		}

		container.append(select);
		select.chosen({width: "60px"});

		return select;
    },

    _buildSelect: function( target, map, callback ) {
		var select = $("<select></select>");

		$.each( map, function( key, value ) {
		  var option = $('<option/>');
		  option.attr({ 'value': value }).text(key);
		  select.append(option);
		});
		
		//select the first.
		select.children().first().attr("selected", "selected");

		if(callback !== undefined) {
			this._on(select, {
				change: callback
			});
		}


		target.append(select);
		select.chosen({width: "100px"});

		return select;
    },

});

$.widget( "cron.cronselector", $.cron.cronbase, {
	types: {
			"": "",
			"Minute": "cronminuteselector", 
			"Hour": "cronhourselector",
			"Day": "crondayselector",
			"Week": "cronweekselector",
			"Month": "cronmonthselector",
			"Year": "cronyearselector",
	},

	_create: function() {
		var main = $("<div class='cron-selector'></div>");
		main.append("<div class='cron-text'>Every:</div>");

		//build a select for the types, and register the callback.
		var selector = this._buildSelect(main, this.types, this._setCronType);

		var container = $("<div class='cron-container'></div>");
		main.append(container);

		this.element.append(main);
		selector.chosen({width: "100px"});
	}, 

	_setCronType: function(event) {
		this._setInnerContent(event.target.value);
	},

	_setInnerContent: function(option) {
		var container = this.element.find(".cron-container");
		var newContainer = $("<div class='cron-container'></div>");
		container.replaceWith(newContainer);
		newContainer[option]();
	}

});


$.widget( "cron.cronvalue", $.cron.cronbase, {
	_buildTimePanel: function() {
		this.registry.hour = this._buildSelectTime(this.element, 1, 12, 1, this.printCron);
		this.element.append("<div class='cron-text'>:</div>");
		this.registry.minute = this._buildSelectTime(this.element, 0, 59, 1, this.printCron);
		this.element.append("<div class='cron-text'> </div>");
		this.registry.ampm = this._buildSelect(this.element, {"AM": "am", "PM": "pm",}, this.printCron);
	},

	registry: {
		day: null,
		month: null, 
		dayOfWeek: null,
		dayOfMonth: null,
		hour: null,
		minute: null
	},

	dayOfWeek: function() {
		if(this.registry.dayOfWeek === null) {
			return "*";
		}
		else {
			return this.registry.dayOfWeek.val();
		}
	},

	month: function() {
		if(this.registry.month === null) {
			return "*";
		}
		else {
			return this.registry.month.val();
		}
	},
	dayOfMonth: function() {
		if(this.registry.dayOfMonth === null) {
			return "*";
		}
		else {
			return this.registry.dayOfMonth.val();
		}
	},
	hour: function() {
		if(this.registry.hour === null) {
			return "*";
		}
		else {
			var ampmVal = "am";
			if(this.registry.ampm !== null) {
				ampmVal = this.registry.ampm.val();

				if(ampmVal == "pm") {
					return (parseInt(this.registry.hour.val())+12);
				}
			}
			return this.registry.hour.val();
		}
	},
	minute: function() {
		if(this.registry.minute === null) {
			return "*";
		}
		else {
			return this.registry.minute.val();
		}
	},
	cronValue: function() {
		return this.minute()+" "+this.hour()+" "+this.dayOfMonth()+" "+this.month()+" "+this.dayOfWeek();
	},
	printCron: function() {
		console.log(this.cronValue());
	}
});


$.widget( "cron.cronminuteselector", $.cron.cronvalue, {
	
	_create: function() {
		this.element.append("<div class='cron-text'>*</div>");
	},

});

$.widget( "cron.cronhourselector", $.cron.cronvalue, {

	_create: function() {
		this.element.append("<div class='cron-text'>at</div>");
		this.registry.hour = null;
		this.registry.minute = this._buildSelectTime(this.element, 0, 59, 1, this.printCron);
		this.element.append("<div class='cron-text'>minutes past the hour.</div>")
	},

});


$.widget( "cron.crondayselector", $.cron.cronvalue, {
	_create: function() {
		this.element.append("<div class='cron-text'>at</div>");
		this._buildTimePanel();
	},
});

$.widget( "cron.cronweekselector", $.cron.cronvalue, {
	day: {
		"Sunday": "0",
		"Monday": "1", 
		"Tuesday": "2",
		"Wednesday": "3",
		"Thursday": "4",
		"Friday": "5", 
		"Saturday": "6", 
	},

	_create: function() {
		this.element.append("<div class='cron-text'>on</div>");
		this.registry.dayOfWeek = this._buildSelect(this.element, this.day, this.printCron);
		this.element.append("<div class='cron-text'>at</div>");
		this._buildTimePanel();
	},
});



$.widget( "cron.cronmonthselector", $.cron.cronvalue, {
	_create: function() {
		this.element.append("<div class='cron-text'>on the</div>");
		this.registry.dayOfMonth = this._buildSelectDay(this.element, 1, 31, this.printCron);
		this.element.append("<div class='cron-text'>day at</div>");
		this._buildTimePanel();
	},
});

$.widget( "cron.cronyearselector", $.cron.cronvalue, {
	months: {
			"January": "1",
			"February": "2",
			"March": "3",
			"April": "4",
			"May": "5",
			"June": "6",
			"July": "7",
			"August": "8",
			"September": "9",
			"October": "10",
			"November": "11",
			"December": "12",
	},
	_create: function() {
		this.element.append("<div class='cron-text'>on the</div>");
		this.registry.dayOfMonth = this._buildSelectDay(this.element, 1, 31, this.printCron);
		this.element.append("<div class='cron-text'>of</div>");
		this.registry.month = this._buildSelect(this.element, this.months, this.printCron);	
		this.element.append("<div class='cron-text'>at</div>");
		this._buildTimePanel();
	},
});


function padded_length_num(i) {
    var len = (""+i).length;
    if(len < 2) {
    	i = "0"+i;
    }
    return i;
}

function ordinal_suffix_of(i) {
    var j = i % 10;
    if (j == 1 && i != 11) {
        return i + "st";
    }
    if (j == 2 && i != 12) {
        return i + "nd";
    }
    if (j == 3 && i != 13) {
        return i + "rd";
    }
    return i + "th";
}
