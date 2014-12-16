var util = require('./util.js'),
    inherits = require('util').inherits,
	Duration = util.Duration,
	Intervals = {},
	_ = require('./internal.js');

// default is a reserved keyword?
Intervals['default'] = Duration.none;
Intervals.none = Duration.none;
Intervals.oneSecond = Duration.seconds(1);
Intervals.fiveSeconds = Duration.seconds(5);
Intervals.tenSeconds = Duration.seconds(10);
Intervals.fifteenSeconds = Duration.seconds(15);
Intervals.thirtySeconds = Duration.seconds(30);
Intervals.oneMinute = Duration.minutes(1);
Intervals.fiveMinutes = Duration.minutes(5);
Intervals.tenMinutes = Duration.minutes(10);
Intervals.fifteenMinutes = Duration.minutes(15);
Intervals.twentyMinutes = Duration.minutes(20);
Intervals.thirtyMinutes = Duration.minutes(30);
Intervals.oneHour = Duration.hours(1);
Intervals.twoHours = Duration.hours(2);
Intervals.threeHours = Duration.hours(3);
Intervals.fourHours = Duration.hours(4);
Intervals.sixHours = Duration.hours(6);
Intervals.twelveHours = Duration.hours(12);
Intervals.oneDay = Duration.days(1);
Intervals.oneWeek = Duration.weeks(1);
Intervals.oneMonth = Duration.months(1);
Intervals.threeMonths = Duration.months(3);
Intervals.oneYear = Duration.years(1);
Intervals.fiveYears = Duration.years(5);
Intervals.oneDecade = Duration.years(10);
Intervals.oneCentury = Duration.years(100);
Intervals.oneInterval = Duration.none;
Intervals.hour = Duration.hours(1);
Intervals.day = Duration.days(1);
Intervals.week = Duration.weeks(1);
Intervals.month = Duration.months(1);
Intervals.year = Duration.years(1);

Intervals = Object.freeze(Intervals);

function TimeRange(from, to) {
  return {
  	'from': from || Date.now(),
  	'to': to || Date.now()
  };
}

function Trend() {
}

Trend.prototype.getInterval = function() {
};

Trend.prototype.getTimeRange = function() {
};

Trend.prototype.getType = function() {
};

Trend.prototype.hasNext = function() {
};

Trend.prototype.next = function() {
};

/*
function ValueTrend(timeRange, type, values, _interval) {
  // 'private' variables go here.
  this.__priv__ = {};
  this.__priv__.values = values;

  _.prop(this, 'values', null, function() {});

  _.immutable(this.__priv__, 'timeRange', timeRange);
  _.immutable(this.__priv__, 'interval', !_.isNull(interval) ? interval : Intervals.none);
  _.immutable(this.__priv__, 'type', type);
}

inherits(ValueTrend, Trend);

ValueTrend.prototype.getInterval = function() {
  return this.__priv__.interval;
};

ValueTrend.prototype.getTimeRange = function() {
  return this.__priv__.timeRange;
};

ValueTrend.prototype.getType = function() {
  return this.__priv__.type;
};

ValueTrend.prototype.hasNext = function() {
};

ValueTrend.prototype.next = function() {
};

function RollupTrend() {

}

inherits(RollupTrend, Trend);

function Trends() {
	
}
*/

module.exports = {
  'TimeRange': TimeRange,
  'Trend': Trend,
  'ValueTrend': ValueTrend,
  'RollupTrend': RollupTrend,
  'Trends': Trends
};