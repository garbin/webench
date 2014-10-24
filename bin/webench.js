#!/usr/bin/env node

var Webench = require('../lib/webench'),
    cli     = require('commander'),
    bunyan  = require('bunyan'),
    moment  = require('moment'),
    os      = require('os'),
    fs      = require('fs'),
    s       = require('string'),
    exec    = require('child_process').exec,
    async   = require('async');

cli
.version('1.0.8')
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
var stdout       = config.stdout;
var benchmarking = new Webench();

benchmarking.on('stderr', function(err) {
    console.error("Stderr " + err);
});


console.log('Testing....');

if (stdout) {
  benchmarking.on('stdout', function(out) {
    console.log(out)
  });
} else {
  benchmarking.on('stderr', function(err) {
    console.log("Stderr " + err);
  });
  benchmarking.on('done', function(result) {
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
      '--latency',
      '--timeout', config.timeout || '30s',
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
    if (config.header) {
      wrk_args.push(':header#' + fs.realpathSync(config.header));
    }
    if (config.onResponse) {
      wrk_args.push(':response#1');
      benchmarking.on('response', config.onResponse);
    }
    benchmarking.run(wrk, wrk_args);
  }
);
