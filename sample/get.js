module.exports = {
  duration: '5s',
  connections: 1,
  threads:1,
  timeout: 300,
  stdout: true,
  show_error_requests: true,
  /*
  report: function(result) {
    console.log('customer report');
  },
  */
  target: 'http://192.168.3.207:9200'
};
