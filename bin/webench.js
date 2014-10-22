#!/usr/bin/env node

var Webench = require('../lib/webench'),
    cli     = require('commander'),
    bunyan  = require('bunyan'),
    moment  = require('moment'),
    os      = require('os'),
    fs      = require('fs'),
    s       = require('string'),
    ProgressBar = require('progress'),
    exec    = require('child_process').exec,
    async   = require('async');

cli
.version('1.0.0')
.option('-c, --config   [value]', 'load testing config')
.option('-l, --log_path [value]', 'log path', 'webench.log')
.parse(process.argv);

var logger        = bunyan.createLogger({
  src: true,
  name: "webench",
  streams: [{
    path: cli.log_path
  }]
});

var config       = require(fs.realpathSync(cli.config));
var stdout       = config.stdout || true;
var benchmarking = new Webench();

var total_seconds = parseInt(config.duration);
var interval = 500;
if (s(config.duration).endsWith('m') || s(config.duration).endsWith('h')) {
  total_seconds = total_seconds * 60;
  interval = interval * 120;
} else {
  total_seconds = total_seconds * 2;
}


benchmarking.on('stderr', function(err) {
    console.error("Stderr " + err);
});

benchmarking.on('response', config.onResponse ? config.onResponse : function(response) {
  if (response.status > 399) {
    if (config.show_error_requests) {
      console.log("Request Error: " + response.status);
    }
  }
});

if (stdout) {
  console.log('Testing....');
  benchmarking.on('stdout', function(out) {
    console.log(out)
  });
} else {
  var progressbar = new ProgressBar("\tTesting [:bar] :percent :etas", {total:total_seconds, });

  var timer = setInterval(function() {
    progressbar.tick();
  }, interval);
  benchmarking.on('stderr', function(err) {
    console.log("Stderr " + err);
  });
  benchmarking.on('done', function(result) {
    clearInterval(timer);
    progressbar.tick(total_seconds);
    report  = config.report ? config.report : require('../lib/report');
    report(result);
  });
  benchmarking.on('fatal', function(error) {
    console.log(error.message)
  });
}

async.waterfall([
    function(cb) {
      if (!config.wrk) {
        exec('which wrk', function(err, stdout, stderr) {
          if (err) {
            cb(err)
            return;
          }
          cb(null, stdout);
        });
      } else {
        if (!fs.existsSync(fs.realpathSync(config.wrk))) {
          cb('wrk not found');
        } else {
          cb(null, config.wrk);
        }
      }
    },
  ],
  function(err, wrk) {
    if (err) {
      return console.log("Webench error:" + err);
    }
    var wrk_args = [
      '-d' + config.duration || '30m',
      '-t' + config.threads || 1,
      '-c' + config.connections || 100,
      '--timeout', config.timeout || '30s',
      '--header', config.header || ' ',
      '-s',
      config.script || __dirname + '/../lib/webench.lua',
      config.target
    ];
    if (config.method) {
      wrk_args.push(':method#' + config.method);
    }
    if (config.body) {
      wrk_args.push(':body#' + fs.realpathSync(config.body));
    }
    if (config.list) {
      wrk_args.push(':list#' + fs.realpathSync(config.list));
    }
    benchmarking.run(wrk, wrk_args);
  }
);
