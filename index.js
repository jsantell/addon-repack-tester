var cfx = require('cfx');
var async = require('async');
var diff = require('diff');
var fs = require('fs');
var exec = require('child_process').exec;
var cp = require('meta-fs').copy;
var rimraf = require('rimraf');
var REPACK_DIR = __dirname + '/repacks';
var PREV_DIR = __dirname + '/xpis';
var SDK_DIR = '/Users/jsantell/Dev/addon-sdk';
var INSTALL_PATH = __dirname + '/addons';
var SANDBOX_DIR = __dirname + '/addon';
var outStream = fs.createWriteStream(__dirname + '/results.txt');
var files = fs.readdirSync(REPACK_DIR);

// Clears out addons
prep(startProcess);

function startProcess () {
  async.mapSeries(files, process, function (err, results) {
    console.log('PROCESSING COMPLETE');
    fs.writeFileSync(__dirname + '/resultsdone.txt', results);
    console.log(err, results);
  });
}

// Runs previous and repacked versions of addons and
// passes stderr into compare
function process (name, callback) {
  async.series([
    run.bind(null, PREV_DIR, originalName(name)),
    run.bind(null, REPACK_DIR, name)
  ], compare.bind(null, name, callback));
}

// Creates a log string of success or errors
function compare (name, callback, err, results) {
  var out = '*****';
  // Get a diff of the outputs of previous and repacked XPI
  // and filter out lines that are not diff, as well as the running time, profile
  var diffs = diff.diffLines(results[0], results[1]).filter(function (obj) {
    return !/^Total time: [\d]*\.[\d]* seconds\n$/.test(obj.value) &&
      !/^Using profile at '\/tmp\/[_a-zA-Z0-9]*\.mozrunner'\.\nTotal time: [\d]*\.[\d]* seconds\n$/.test(obj.value) &&
    (obj.added || obj.removed);
  });
  if (!diffs.length && !err)
    out += name + ': SUCCESS\n';
  else if (err)
    out += name + ': PARSING ERROR \n<BEGIN>\n' + e + '\n<END>\n';
  else if (diffs.length) {
    out += name + ': ADDON ERRORS FOUND \n<BEGIN>\n';
    diffs.forEach(function (obj) {
      out += (obj.added ? '+++++' : '-----') + obj.value;
    });
    out += '\n<END>\n';
  }
  outStream.write(out, function () { callback(err, name); });
}

function run (dir, name, callback) {
  var results = '';

  copyToProfile(dir, name, function (err) {

    var proc = cfx.run({ addons: INSTALL_PATH, pkgdir: SANDBOX_DIR });

    proc.stderr.on('data', function (data) {
      results += '' + data;
    });

    proc.on('close', function (code) {
      cleanUp(name, function () {
        callback(err, results);
      });
    });
  });
}

function prep (callback) {
  rimraf(INSTALL_PATH, fs.mkdir.bind(null, INSTALL_PATH, callback));
}

function cleanUp (name, callback) {
  fs.unlink(INSTALL_PATH + '/' + name, function (err) {
    callback();
  });
}

function copyToProfile (dir, name, callback) {
  cp(dir + '/' + name, INSTALL_PATH + '/' + name, callback);
}

function originalName (filename) {
  return filename.slice(0, -('-repacked.xpi'.length));
}
