module.exports = {
  duration: '1s',
  connections: 1,
  threads:1,
  //timeout: 300,
  stdout: true,
  //method: "POST",
  list: './path.list',
  //body: './post.body',
  onResponse: function  (res) {
    console.log(res.body);
  },
  // report: function  (summary, latency, requests) { },
  target: 'http://192.168.3.207:9200'
}
