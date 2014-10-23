module.exports = {
  duration: '1s',
  connections: 1,
  threads:1,
  timeout: 300,
  stdout: true,
  method: "POST",
  header: './header',
  body: './post.body',
  // onResponse: function  (status, headers) { },
  // report: function  (summary, latency, requests) { },
  target: 'http://127.0.0.1/index.php'
}
