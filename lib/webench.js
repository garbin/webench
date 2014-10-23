var EventEmitter  = require('events').EventEmitter,
    inherits      = require('util').inherits,
    s             = require('string'),
    byline        = require('byline'),
    spawn         = require('child_process').spawn,
    Webench = function() { EventEmitter.call(this); };

inherits(Webench, EventEmitter);
Webench.prototype.run = function(wrk, config) {
  wrk = s(wrk).trim().s;
  var benchmarking = spawn(wrk, config),
      self = this;
  byline(benchmarking.stdout).on('data', function(data) {
    var line = s(data);
    if (line.startsWith('RESPONSE:')) {
      var event_data = data.toString().slice(9);
      try {
        var event_data = JSON.parse(event_data);
      } catch(e) {}
      self.emit('response', event_data);
    } else if(line.startsWith('DONE:')) {
      var event_data = data.toString().slice(5);
      try {
        var event_data = JSON.parse(event_data);
      } catch(e) {}
      self.emit('done', event_data);
    } else if(line.startsWith('ERROR:')) {
      var event_data = data.toString().slice(6);
      try {
        var event_data = JSON.parse(event_data);
      } catch(e) {}
      self.emit('fatal', event_data);
      console.log(data.toString());
    } else {
      self.emit('stdout', data.toString());
    }
  });
  byline(benchmarking.stderr).on('data', function(data) {
    var line = s(data);
    self.emit('stderr', line.s);
  });
  benchmarking.on('close', function(code) {
    if (!code) {
      self.emit('close', code);
    } else {
      self.emit('fatal', {message:"uncaught exceptions", code:code});
    }
  });
};


module.exports = Webench
