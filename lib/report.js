var Table = require('cli-table');

module.exports = function(result) {
  var table = new Table({ head: ['Type', 'Min', 'Max', 'Mean', 'Stdev'] });
  table.push(
    ["Latency/ms", result.latency.min, result.latency.max, result.latency.mean, result.latency.stdev]
  , ["Request", result.requests.min, result.requests.max, result.requests.mean, result.requests.stdev]
  );
  console.log(table.toString());
  //console.log(result);
};
