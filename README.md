Webench
=======

A http benchmarking tool, baed on wrk

Installation
-----------

```
$ npm install -g webench
```
webench depends on [Node.js](http://nodejs.org/) and [npm](http://npmjs.org/), install them first [Installing Node.js via package manager](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)

Usage
-------

### Quick start
First of all, create a testing file, we called localhost.js, content below:

```js
module.exports = {
  duration: '30s',
  connections: 400,
  threads:12,
  target: 'http://192.168.3.207:9200/listening_v3/sina_weibo/_search'
  // method: "GET",
  // stdout: false,
  // header: './header',
  // body: './post.body',
  /*
  onResponse: function  (res) {
    console.log(res.body);
  },
  */
  // report: function  (summary, latency, requests) { },
};
```

Then run the following command:
```
$ webench -c localhost.js
```
This runs a benchmark for 30 seconds, using 12 threads, and keeping 400 HTTP connections open.

  Running 30s test @ http://127.0.0.1:8080/index.html
    12 threads and 400 connections
    Thread Stats   Avg      Stdev     Max   +/- Stdev
      Latency   635.91us    0.89ms  12.92ms   93.69%
      Req/Sec    56.20k     8.07k   62.00k    86.54%
    22464657 requests in 30.00s, 17.76GB read
  Requests/sec: 748868.53
  Transfer/sec:    606.33MB

Advanced feature
----------------
### Multi Paths
Create a file called path.list

```
/users/1
/others/1
```

Put `list` to config file
```js
module.exports = {
  duration: '30s',
  connections: 400,
  threads:12,
  list: './path.list',
  target: 'http://127.0.0.1:8080/index.html'
};
```


### Other HTTP method
Create a file called post.body

```
{
  test:1
}
```

Put `body` to config file
```js
module.exports = {
  duration: '30s',
  connections: 400,
  threads:12,
  method: "post",
  body: './post.body', // here
  target: 'http://127.0.0.1:8080/index.html'
};
```

Then run the following command:
```
$ webench -c localhost.js
```
## License

webench is licensed under the [MIT License](http://opensource.org/licenses/MIT).
