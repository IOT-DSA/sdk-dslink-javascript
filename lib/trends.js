var util = require('./util.js'),
	 rollup = require('./rollup.js'),
	 Duration = util.Duration,
	 Rollup = rollup.Rollup,
	 Interval = {},
	 _ = require('./internal.js');

// default is a reserved keyword, apparently.
Interval['default'] = Duration.none;
Interval.none = Duration.none;
Interval.oneSecond = Duration.seconds(1);
Interval.fiveSeconds = Duration.seconds(5);
Interval.tenSeconds = Duration.seconds(10);
Interval.fifteenSeconds = Duration.seconds(15);
Interval.thirtySeconds = Duration.seconds(30);
Interval.oneMinute = Duration.minutes(1);
Interval.fiveMinutes = Duration.minutes(5);
Interval.tenMinutes = Duration.minutes(10);
Interval.fifteenMinutes = Duration.minutes(15);
Interval.twentyMinutes = Duration.minutes(20);
Interval.thirtyMinutes = Duration.minutes(30);
Interval.oneHour = Duration.hours(1);
Interval.twoHours = Duration.hours(2);
Interval.threeHours = Duration.hours(3);
Interval.fourHours = Duration.hours(4);
Interval.sixHours = Duration.hours(6);
Interval.twelveHours = Duration.hours(12);
Interval.oneDay = Duration.days(1);
Interval.oneWeek = Duration.weeks(1);
Interval.oneMonth = Duration.months(1);
Interval.threeMonths = Duration.months(3);
Interval.oneYear = Duration.years(1);
Interval.fiveYears = Duration.years(5);
Interval.oneDecade = Duration.years(10);
Interval.oneCentury = Duration.years(100);
Interval.oneInterval = Duration.none;
Interval.hour = Duration.hours(1);
Interval.day = Duration.days(1);
Interval.week = Duration.weeks(1);
Interval.month = Duration.months(1);
Interval.year = Duration.years(1);

Interval = Object.freeze(Interval);

var _ValueTrend = {
  'findActuals': function(timeRange, vals) {
    var values = vals.filter(function(val) {
      var time = val.timestamp;
      return (time >= timeRange.from && time <= timeRange.from);
    });
    values.sort(function(a, b) { 
  	  return a.timestamp >= b.timestamp ? -1 : 1; 
    });
    return values;
  },
  'next': function(trend) {
    var returned = null;
    trend.some(function(val) {
      var timestamp = val.timestamp,
          lastTimestamp = trend.__priv__.lastTimestamp;

      if(!_.isNull(lastTimestamp) && (timestamp < lastTimestamp))
        return false;

      if(!_.isNull(trend.interval)) {
        var difference = timestamp - lastTimestamp;

        if (difference < trend.interval) {
      	  return false;
        }
      }

      trend.__priv__.lastTimestamp = timestamp;
      returned = val;
      return true;
    });

    return returned;
  }
};

function TimeRange(from, to) {
  return {
  	'from': from,
  	'to': to || Date.now()
  };
}

function ValueTrend(timeRange, type, values, interval) {
  // 'private' variables go here.
  this.__priv__ = {};
  this.__priv__.values = _ValueTrend.findActuals(timeRange, values);
  this.__priv__.lastTimestamp = null;
  this.__priv__.current = null;

  _.getter(this, 'values', function() {
  	return this.__priv__.values;
  });

  _.immutable(this, 'timeRange', timeRange);
  _.immutable(this, 'interval', !_.isNull(interval) ? interval : Interval.none);
  _.immutable(this, 'type', type);
}

ValueTrend.prototype.hasNext = function() {
  this.__priv__.current = _ValueTrend.next(this);
  return !_.isNull(this.__priv__.current);
};

ValueTrend.prototype.next = function() {
  return this.__priv__.current;
};

function RollupTrend(rollup, interval, trend) {
  // 'private' variables go here.
  this.__priv__ = {};
  this.__priv__.cache = [];
  this.__priv__.last = null;

  _.getter(this, 'timeRange', function() {
  	return this.trend.timeRange;
  });

  _.getter(this, 'type', function() {
  	return this.trend.type;
  });

  _.immutable(this, 'rollup', rollup);
  _.immutable(this, 'trend', trend);
  _.immutable(this, 'interval', !_.isNull(interval) ? interval : Interval.none);

  while (this.trend.hasNext()) {
    this.__priv__.cache.push(this.trend.next());
  }
  this.__priv__.last = this.timeRange.from;
}

RollupTrend.prototype.hasNext = function() {
  return this.__priv__.last < this.timeRange.to;
};

RollupTrend.prototype.next = function() {
  return this.rollupBetween(_lastEnd, new Date(this.interval + this.__priv__.last));
};

RollupTrend.prototype.rollupBetween = function(from, _to) {
  var to = _to || Date.now();
  var vals = this.__priv__.cache.filter(function(val) {
    var time = val.timestamp;
    return time >= from && time <= to;
  });
  this.__priv__.last = to;
  return Rollup[this.rollup](vals);
};

function Trend(type, vals) {
  var trend = new ValueTrend(util.Context.timeRange, type, values);
  return tryRollup(trend, util.Context.interval, util.Context.rollup);
}

Trend.tryRollup = function(trend, interval, rollup) {
  if(_.isNull(interval) || interval === Interval.none) {
    return trend;
  }
    
  var _interval = trend.interval;
    
  if (_interval == interval) {
    return trend;
  }
    
  if (_.isNull(rollup)) {
    rollup = 'first';
  }
        
  return new RollupTrend(rollup, interval, trend);
};

module.exports = {
  'TimeRange': TimeRange,
  'ValueTrend': ValueTrend,
  'RollupTrend': RollupTrend,
  'Trend': Trend
};