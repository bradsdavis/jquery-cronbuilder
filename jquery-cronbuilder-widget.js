$.widget( "cron.cronbase", {

	_buildSelectTime: function(container, clz, min, max, inc, callback) {
		var select = $("<select></select>");
		select.addClass(clz);
		
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

    _buildSelectDay: function(container, clz, min, max, callback) {
		var select = $("<select></select>");
		select.addClass(clz);

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
		select.chosen({width: "70px"});

		return select;
    },

    _buildSelect: function(container, clz, map, callback ) {
		var select = $("<select></select>");
		select.addClass(clz);
		
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

		container.append(select);
		select.chosen({width: "100px"});

		return select;
    },

});

$.widget( "cron.cronselector", $.cron.cronbase, {
	options: {
		targetInput: null
	},

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
		var selector = this._buildSelect(main, "cron-type-select", this.types, this._setCronType);

		var container = $("<div class='cron-container'></div>");
		main.append(container);

		this.element.append(main);
	}, 

	_setCronType: function(event) {
		this._setInnerContent(event.target.value);
	},

	_setInnerContent: function(option) {
		var container = this.element.find(".cron-container");
		var newContainer = $("<div class='cron-container'></div>");
		container.replaceWith(newContainer);

		var result = newContainer[option]({
			targetInput: this.options.targetInput
		});
	}

});


$.widget( "cron.cronvalue", $.cron.cronbase, {
	options: {
		targetInput: null
	},

	_buildTimePanel: function() {
		this._buildSelectTime(this.element, 'cron-hour', 1, 12, 1, this.broadcastEvent);
		this.element.append("<div class='cron-text'>:</div>");
		this._buildSelectTime(this.element, 'cron-minute', 0, 59, 1, this.broadcastEvent);
		this.element.append("<div class='cron-text'> </div>");
		this._buildSelect(this.element, 'cron-ampm', {"AM": "am", "PM": "pm",}, this.broadcastEvent);
	},

	registry: {
		day: 'cron-hour',
		month: 'cron-month', 
		dayOfWeek: 'cron-day-of-week',
		dayOfMonth: 'cron-day-of-month',
		hour: 'cron-hour',
		minute: 'cron-minute',
		ampm: 'cron-ampm'
	},

	_findRegisteredElement: function(elementId) {
		var ref = this.element.find("select."+this.registry[elementId]);

		if(ref.length > 0) {
			return ref;
		}
		return undefined;
	}, 

	dayOfWeek: function() {
		if(this._findRegisteredElement('dayOfWeek') == undefined) {
			return "*";
		}
		else {
			return this._findRegisteredElement('dayOfWeek').val();
		}
	},

	month: function() {
		if(this._findRegisteredElement('month') == undefined) {
			return "*";
		}
		else {
			return this._findRegisteredElement('month').val();
		}
	},
	dayOfMonth: function() {
		if(this._findRegisteredElement('dayOfMonth') == undefined) {
			return "*";
		}
		else {
			return this._findRegisteredElement('dayOfMonth').val();
		}
	},
	hour: function() {
		if(this._findRegisteredElement('hour') == undefined) {
			return "*";
		}
		else {
			var ampmVal = "am";
			if(this._findRegisteredElement('ampm') != undefined) {
				ampmVal = this._findRegisteredElement('ampm').val();
				
				if(ampmVal == "pm") {
					return (parseInt(this._findRegisteredElement('hour').val())+12);
				}
			}
			return this._findRegisteredElement('hour').val();
		}
	},
	minute: function() {
		if(this._findRegisteredElement('minute') == undefined) {
			return "*";
		}
		else {
			return this._findRegisteredElement('minute').val();
		}
	},
	cronValue: function() {
		return this.minute()+" "+this.hour()+" "+this.dayOfMonth()+" "+this.month()+" "+this.dayOfWeek();
	},
	broadcastEvent: function() {
		var self = this;
		if(this.options.targetInput != undefined) {
			$(this.options.targetInput).each(function(){
				$(this).val(self.cronValue()); 
			});
			
		}
	},
});


$.widget( "cron.cronminuteselector", $.cron.cronvalue, {
	_create: function() {
		this.broadcastEvent();
	},
});

$.widget( "cron.cronhourselector", $.cron.cronvalue, {

	_create: function() {
		this.element.append("<div class='cron-text'>at</div>");
		this._buildSelectTime(this.element, 'cron-minute', 0, 59, 1, this.broadcastEvent);
		this.element.append("<div class='cron-text'>minutes past the hour.</div>");
		this.broadcastEvent();
	},
});


$.widget( "cron.crondayselector", $.cron.cronvalue, {
	_create: function() {
		this.element.append("<div class='cron-text'>at</div>");
		this._buildTimePanel();
		this.broadcastEvent();
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
		this._buildSelect(this.element, 'cron-day-of-week', this.day, this.broadcastEvent);
		this.element.append("<div class='cron-text'>at</div>");
		this._buildTimePanel();
		this.broadcastEvent();
	},
});



$.widget( "cron.cronmonthselector", $.cron.cronvalue, {
	_create: function() {
		this.element.append("<div class='cron-text'>on the</div>");
		this._buildSelectDay(this.element, 'cron-day-of-month', 1, 31, this.broadcastEvent);
		this.element.append("<div class='cron-text'>day at</div>");
		this._buildTimePanel();
		this.broadcastEvent();
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
		this._buildSelectDay(this.element, 'cron-day-of-month', 1, 31, this.broadcastEvent);
		this.element.append("<div class='cron-text'>of</div>");
		this._buildSelect(this.element, 'cron-month', this.months, this.broadcastEvent);	
		this.element.append("<div class='cron-text'>at</div>");
		this._buildTimePanel();
		this.broadcastEvent();
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
