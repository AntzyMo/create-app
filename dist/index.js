#!/usr/bin/env node
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var require$$0$2 = require('fs');
var require$$0 = require('constants');
var require$$0$1 = require('stream');
var require$$0$3 = require('util');
var require$$5 = require('assert');
var require$$0$4 = require('path');
var assert$1 = require('node:assert');
var node_child_process = require('node:child_process');
var node_async_hooks = require('node:async_hooks');
var node_util = require('node:util');
var require$$0$5 = require('child_process');
var require$$1 = require('string_decoder');
var require$$8 = require('buffer');
var fs$s = require('node:fs');
var path$p = require('node:path');
var require$$2 = require('os');
var require$$2$1 = require('events');
var process$1 = require('node:process');
var node_url = require('node:url');
var Stream$5 = require('node:stream');
var http = require('node:http');
require('node:https');
require('node:zlib');
var node_buffer = require('node:buffer');
require('node:net');
require('node:readline');
require('node:os');
var require$$0$6 = require('readline');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var require$$0__default$2 = /*#__PURE__*/_interopDefaultLegacy(require$$0$2);
var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);
var require$$0__default$1 = /*#__PURE__*/_interopDefaultLegacy(require$$0$1);
var require$$0__default$3 = /*#__PURE__*/_interopDefaultLegacy(require$$0$3);
var require$$5__default = /*#__PURE__*/_interopDefaultLegacy(require$$5);
var require$$0__default$4 = /*#__PURE__*/_interopDefaultLegacy(require$$0$4);
var assert__default = /*#__PURE__*/_interopDefaultLegacy(assert$1);
var require$$0__default$5 = /*#__PURE__*/_interopDefaultLegacy(require$$0$5);
var require$$1__default = /*#__PURE__*/_interopDefaultLegacy(require$$1);
var require$$8__default = /*#__PURE__*/_interopDefaultLegacy(require$$8);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs$s);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path$p);
var require$$2__default = /*#__PURE__*/_interopDefaultLegacy(require$$2);
var require$$2__default$1 = /*#__PURE__*/_interopDefaultLegacy(require$$2$1);
var process__default = /*#__PURE__*/_interopDefaultLegacy(process$1);
var Stream__default = /*#__PURE__*/_interopDefaultLegacy(Stream$5);
var http__default = /*#__PURE__*/_interopDefaultLegacy(http);
var require$$0__default$6 = /*#__PURE__*/_interopDefaultLegacy(require$$0$6);

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var fs$r = {};

var universalify$1 = {};

universalify$1.fromCallback = function (fn) {
  return Object.defineProperty(function (...args) {
    if (typeof args[args.length - 1] === 'function') fn.apply(this, args);
    else {
      return new Promise((resolve, reject) => {
        fn.call(
          this,
          ...args,
          (err, res) => (err != null) ? reject(err) : resolve(res)
        );
      })
    }
  }, 'name', { value: fn.name })
};

universalify$1.fromPromise = function (fn) {
  return Object.defineProperty(function (...args) {
    const cb = args[args.length - 1];
    if (typeof cb !== 'function') return fn.apply(this, args)
    else fn.apply(this, args.slice(0, -1)).then(r => cb(null, r), cb);
  }, 'name', { value: fn.name })
};

var constants$5 = require$$0__default["default"];

var origCwd = process.cwd;
var cwd$1 = null;

var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;

process.cwd = function() {
  if (!cwd$1)
    cwd$1 = origCwd.call(process);
  return cwd$1
};
try {
  process.cwd();
} catch (er) {}

// This check is needed until node.js 12 is required
if (typeof process.chdir === 'function') {
  var chdir = process.chdir;
  process.chdir = function (d) {
    cwd$1 = null;
    chdir.call(process, d);
  };
  if (Object.setPrototypeOf) Object.setPrototypeOf(process.chdir, chdir);
}

var polyfills$1 = patch$1;

function patch$1 (fs) {
  // (re-)implement some things that are known busted or missing.

  // lchmod, broken prior to 0.6.2
  // back-port the fix here.
  if (constants$5.hasOwnProperty('O_SYMLINK') &&
      process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
    patchLchmod(fs);
  }

  // lutimes implementation, or no-op
  if (!fs.lutimes) {
    patchLutimes(fs);
  }

  // https://github.com/isaacs/node-graceful-fs/issues/4
  // Chown should not fail on einval or eperm if non-root.
  // It should not fail on enosys ever, as this just indicates
  // that a fs doesn't support the intended operation.

  fs.chown = chownFix(fs.chown);
  fs.fchown = chownFix(fs.fchown);
  fs.lchown = chownFix(fs.lchown);

  fs.chmod = chmodFix(fs.chmod);
  fs.fchmod = chmodFix(fs.fchmod);
  fs.lchmod = chmodFix(fs.lchmod);

  fs.chownSync = chownFixSync(fs.chownSync);
  fs.fchownSync = chownFixSync(fs.fchownSync);
  fs.lchownSync = chownFixSync(fs.lchownSync);

  fs.chmodSync = chmodFixSync(fs.chmodSync);
  fs.fchmodSync = chmodFixSync(fs.fchmodSync);
  fs.lchmodSync = chmodFixSync(fs.lchmodSync);

  fs.stat = statFix(fs.stat);
  fs.fstat = statFix(fs.fstat);
  fs.lstat = statFix(fs.lstat);

  fs.statSync = statFixSync(fs.statSync);
  fs.fstatSync = statFixSync(fs.fstatSync);
  fs.lstatSync = statFixSync(fs.lstatSync);

  // if lchmod/lchown do not exist, then make them no-ops
  if (fs.chmod && !fs.lchmod) {
    fs.lchmod = function (path, mode, cb) {
      if (cb) process.nextTick(cb);
    };
    fs.lchmodSync = function () {};
  }
  if (fs.chown && !fs.lchown) {
    fs.lchown = function (path, uid, gid, cb) {
      if (cb) process.nextTick(cb);
    };
    fs.lchownSync = function () {};
  }

  // on Windows, A/V software can lock the directory, causing this
  // to fail with an EACCES or EPERM if the directory contains newly
  // created files.  Try again on failure, for up to 60 seconds.

  // Set the timeout this long because some Windows Anti-Virus, such as Parity
  // bit9, may lock files for up to a minute, causing npm package install
  // failures. Also, take care to yield the scheduler. Windows scheduling gives
  // CPU to a busy looping process, which can cause the program causing the lock
  // contention to be starved of CPU by node, so the contention doesn't resolve.
  if (platform === "win32") {
    fs.rename = typeof fs.rename !== 'function' ? fs.rename
    : (function (fs$rename) {
      function rename (from, to, cb) {
        var start = Date.now();
        var backoff = 0;
        fs$rename(from, to, function CB (er) {
          if (er
              && (er.code === "EACCES" || er.code === "EPERM")
              && Date.now() - start < 60000) {
            setTimeout(function() {
              fs.stat(to, function (stater, st) {
                if (stater && stater.code === "ENOENT")
                  fs$rename(from, to, CB);
                else
                  cb(er);
              });
            }, backoff);
            if (backoff < 100)
              backoff += 10;
            return;
          }
          if (cb) cb(er);
        });
      }
      if (Object.setPrototypeOf) Object.setPrototypeOf(rename, fs$rename);
      return rename
    })(fs.rename);
  }

  // if read() returns EAGAIN, then just try it again.
  fs.read = typeof fs.read !== 'function' ? fs.read
  : (function (fs$read) {
    function read (fd, buffer, offset, length, position, callback_) {
      var callback;
      if (callback_ && typeof callback_ === 'function') {
        var eagCounter = 0;
        callback = function (er, _, __) {
          if (er && er.code === 'EAGAIN' && eagCounter < 10) {
            eagCounter ++;
            return fs$read.call(fs, fd, buffer, offset, length, position, callback)
          }
          callback_.apply(this, arguments);
        };
      }
      return fs$read.call(fs, fd, buffer, offset, length, position, callback)
    }

    // This ensures `util.promisify` works as it does for native `fs.read`.
    if (Object.setPrototypeOf) Object.setPrototypeOf(read, fs$read);
    return read
  })(fs.read);

  fs.readSync = typeof fs.readSync !== 'function' ? fs.readSync
  : (function (fs$readSync) { return function (fd, buffer, offset, length, position) {
    var eagCounter = 0;
    while (true) {
      try {
        return fs$readSync.call(fs, fd, buffer, offset, length, position)
      } catch (er) {
        if (er.code === 'EAGAIN' && eagCounter < 10) {
          eagCounter ++;
          continue
        }
        throw er
      }
    }
  }})(fs.readSync);

  function patchLchmod (fs) {
    fs.lchmod = function (path, mode, callback) {
      fs.open( path
             , constants$5.O_WRONLY | constants$5.O_SYMLINK
             , mode
             , function (err, fd) {
        if (err) {
          if (callback) callback(err);
          return
        }
        // prefer to return the chmod error, if one occurs,
        // but still try to close, and report closing errors if they occur.
        fs.fchmod(fd, mode, function (err) {
          fs.close(fd, function(err2) {
            if (callback) callback(err || err2);
          });
        });
      });
    };

    fs.lchmodSync = function (path, mode) {
      var fd = fs.openSync(path, constants$5.O_WRONLY | constants$5.O_SYMLINK, mode);

      // prefer to return the chmod error, if one occurs,
      // but still try to close, and report closing errors if they occur.
      var threw = true;
      var ret;
      try {
        ret = fs.fchmodSync(fd, mode);
        threw = false;
      } finally {
        if (threw) {
          try {
            fs.closeSync(fd);
          } catch (er) {}
        } else {
          fs.closeSync(fd);
        }
      }
      return ret
    };
  }

  function patchLutimes (fs) {
    if (constants$5.hasOwnProperty("O_SYMLINK") && fs.futimes) {
      fs.lutimes = function (path, at, mt, cb) {
        fs.open(path, constants$5.O_SYMLINK, function (er, fd) {
          if (er) {
            if (cb) cb(er);
            return
          }
          fs.futimes(fd, at, mt, function (er) {
            fs.close(fd, function (er2) {
              if (cb) cb(er || er2);
            });
          });
        });
      };

      fs.lutimesSync = function (path, at, mt) {
        var fd = fs.openSync(path, constants$5.O_SYMLINK);
        var ret;
        var threw = true;
        try {
          ret = fs.futimesSync(fd, at, mt);
          threw = false;
        } finally {
          if (threw) {
            try {
              fs.closeSync(fd);
            } catch (er) {}
          } else {
            fs.closeSync(fd);
          }
        }
        return ret
      };

    } else if (fs.futimes) {
      fs.lutimes = function (_a, _b, _c, cb) { if (cb) process.nextTick(cb); };
      fs.lutimesSync = function () {};
    }
  }

  function chmodFix (orig) {
    if (!orig) return orig
    return function (target, mode, cb) {
      return orig.call(fs, target, mode, function (er) {
        if (chownErOk(er)) er = null;
        if (cb) cb.apply(this, arguments);
      })
    }
  }

  function chmodFixSync (orig) {
    if (!orig) return orig
    return function (target, mode) {
      try {
        return orig.call(fs, target, mode)
      } catch (er) {
        if (!chownErOk(er)) throw er
      }
    }
  }


  function chownFix (orig) {
    if (!orig) return orig
    return function (target, uid, gid, cb) {
      return orig.call(fs, target, uid, gid, function (er) {
        if (chownErOk(er)) er = null;
        if (cb) cb.apply(this, arguments);
      })
    }
  }

  function chownFixSync (orig) {
    if (!orig) return orig
    return function (target, uid, gid) {
      try {
        return orig.call(fs, target, uid, gid)
      } catch (er) {
        if (!chownErOk(er)) throw er
      }
    }
  }

  function statFix (orig) {
    if (!orig) return orig
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = null;
      }
      function callback (er, stats) {
        if (stats) {
          if (stats.uid < 0) stats.uid += 0x100000000;
          if (stats.gid < 0) stats.gid += 0x100000000;
        }
        if (cb) cb.apply(this, arguments);
      }
      return options ? orig.call(fs, target, options, callback)
        : orig.call(fs, target, callback)
    }
  }

  function statFixSync (orig) {
    if (!orig) return orig
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target, options) {
      var stats = options ? orig.call(fs, target, options)
        : orig.call(fs, target);
      if (stats) {
        if (stats.uid < 0) stats.uid += 0x100000000;
        if (stats.gid < 0) stats.gid += 0x100000000;
      }
      return stats;
    }
  }

  // ENOSYS means that the fs doesn't support the op. Just ignore
  // that, because it doesn't matter.
  //
  // if there's no getuid, or if getuid() is something other
  // than 0, and the error is EINVAL or EPERM, then just ignore
  // it.
  //
  // This specific case is a silent failure in cp, install, tar,
  // and most other unix tools that manage permissions.
  //
  // When running as root, or if other types of errors are
  // encountered, then it's strict.
  function chownErOk (er) {
    if (!er)
      return true

    if (er.code === "ENOSYS")
      return true

    var nonroot = !process.getuid || process.getuid() !== 0;
    if (nonroot) {
      if (er.code === "EINVAL" || er.code === "EPERM")
        return true
    }

    return false
  }
}

var Stream$4 = require$$0__default$1["default"].Stream;

var legacyStreams = legacy$1;

function legacy$1 (fs) {
  return {
    ReadStream: ReadStream,
    WriteStream: WriteStream
  }

  function ReadStream (path, options) {
    if (!(this instanceof ReadStream)) return new ReadStream(path, options);

    Stream$4.call(this);

    var self = this;

    this.path = path;
    this.fd = null;
    this.readable = true;
    this.paused = false;

    this.flags = 'r';
    this.mode = 438; /*=0666*/
    this.bufferSize = 64 * 1024;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.encoding) this.setEncoding(this.encoding);

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.end === undefined) {
        this.end = Infinity;
      } else if ('number' !== typeof this.end) {
        throw TypeError('end must be a Number');
      }

      if (this.start > this.end) {
        throw new Error('start must be <= end');
      }

      this.pos = this.start;
    }

    if (this.fd !== null) {
      process.nextTick(function() {
        self._read();
      });
      return;
    }

    fs.open(this.path, this.flags, this.mode, function (err, fd) {
      if (err) {
        self.emit('error', err);
        self.readable = false;
        return;
      }

      self.fd = fd;
      self.emit('open', fd);
      self._read();
    });
  }

  function WriteStream (path, options) {
    if (!(this instanceof WriteStream)) return new WriteStream(path, options);

    Stream$4.call(this);

    this.path = path;
    this.fd = null;
    this.writable = true;

    this.flags = 'w';
    this.encoding = 'binary';
    this.mode = 438; /*=0666*/
    this.bytesWritten = 0;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.start < 0) {
        throw new Error('start must be >= zero');
      }

      this.pos = this.start;
    }

    this.busy = false;
    this._queue = [];

    if (this.fd === null) {
      this._open = fs.open;
      this._queue.push([this._open, this.path, this.flags, this.mode, undefined]);
      this.flush();
    }
  }
}

var clone_1 = clone$1;

var getPrototypeOf = Object.getPrototypeOf || function (obj) {
  return obj.__proto__
};

function clone$1 (obj) {
  if (obj === null || typeof obj !== 'object')
    return obj

  if (obj instanceof Object)
    var copy = { __proto__: getPrototypeOf(obj) };
  else
    var copy = Object.create(null);

  Object.getOwnPropertyNames(obj).forEach(function (key) {
    Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
  });

  return copy
}

var fs$q = require$$0__default$2["default"];
var polyfills = polyfills$1;
var legacy = legacyStreams;
var clone = clone_1;

var util$5 = require$$0__default$3["default"];

/* istanbul ignore next - node 0.x polyfill */
var gracefulQueue;
var previousSymbol;

/* istanbul ignore else - node 0.x polyfill */
if (typeof Symbol === 'function' && typeof Symbol.for === 'function') {
  gracefulQueue = Symbol.for('graceful-fs.queue');
  // This is used in testing by future versions
  previousSymbol = Symbol.for('graceful-fs.previous');
} else {
  gracefulQueue = '___graceful-fs.queue';
  previousSymbol = '___graceful-fs.previous';
}

function noop$2 () {}

function publishQueue(context, queue) {
  Object.defineProperty(context, gracefulQueue, {
    get: function() {
      return queue
    }
  });
}

var debug = noop$2;
if (util$5.debuglog)
  debug = util$5.debuglog('gfs4');
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ''))
  debug = function() {
    var m = util$5.format.apply(util$5, arguments);
    m = 'GFS4: ' + m.split(/\n/).join('\nGFS4: ');
    console.error(m);
  };

// Once time initialization
if (!fs$q[gracefulQueue]) {
  // This queue can be shared by multiple loaded instances
  var queue$1 = commonjsGlobal[gracefulQueue] || [];
  publishQueue(fs$q, queue$1);

  // Patch fs.close/closeSync to shared queue version, because we need
  // to retry() whenever a close happens *anywhere* in the program.
  // This is essential when multiple graceful-fs instances are
  // in play at the same time.
  fs$q.close = (function (fs$close) {
    function close (fd, cb) {
      return fs$close.call(fs$q, fd, function (err) {
        // This function uses the graceful-fs shared queue
        if (!err) {
          resetQueue();
        }

        if (typeof cb === 'function')
          cb.apply(this, arguments);
      })
    }

    Object.defineProperty(close, previousSymbol, {
      value: fs$close
    });
    return close
  })(fs$q.close);

  fs$q.closeSync = (function (fs$closeSync) {
    function closeSync (fd) {
      // This function uses the graceful-fs shared queue
      fs$closeSync.apply(fs$q, arguments);
      resetQueue();
    }

    Object.defineProperty(closeSync, previousSymbol, {
      value: fs$closeSync
    });
    return closeSync
  })(fs$q.closeSync);

  if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
    process.on('exit', function() {
      debug(fs$q[gracefulQueue]);
      require$$5__default["default"].equal(fs$q[gracefulQueue].length, 0);
    });
  }
}

if (!commonjsGlobal[gracefulQueue]) {
  publishQueue(commonjsGlobal, fs$q[gracefulQueue]);
}

var gracefulFs = patch(clone(fs$q));
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs$q.__patched) {
    gracefulFs = patch(fs$q);
    fs$q.__patched = true;
}

function patch (fs) {
  // Everything that references the open() function needs to be in here
  polyfills(fs);
  fs.gracefulify = patch;

  fs.createReadStream = createReadStream;
  fs.createWriteStream = createWriteStream;
  var fs$readFile = fs.readFile;
  fs.readFile = readFile;
  function readFile (path, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    return go$readFile(path, options, cb)

    function go$readFile (path, options, cb, startTime) {
      return fs$readFile(path, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$readFile, [path, options, cb], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
        }
      })
    }
  }

  var fs$writeFile = fs.writeFile;
  fs.writeFile = writeFile;
  function writeFile (path, data, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    return go$writeFile(path, data, options, cb)

    function go$writeFile (path, data, options, cb, startTime) {
      return fs$writeFile(path, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$writeFile, [path, data, options, cb], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
        }
      })
    }
  }

  var fs$appendFile = fs.appendFile;
  if (fs$appendFile)
    fs.appendFile = appendFile;
  function appendFile (path, data, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    return go$appendFile(path, data, options, cb)

    function go$appendFile (path, data, options, cb, startTime) {
      return fs$appendFile(path, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$appendFile, [path, data, options, cb], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
        }
      })
    }
  }

  var fs$copyFile = fs.copyFile;
  if (fs$copyFile)
    fs.copyFile = copyFile;
  function copyFile (src, dest, flags, cb) {
    if (typeof flags === 'function') {
      cb = flags;
      flags = 0;
    }
    return go$copyFile(src, dest, flags, cb)

    function go$copyFile (src, dest, flags, cb, startTime) {
      return fs$copyFile(src, dest, flags, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$copyFile, [src, dest, flags, cb], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
        }
      })
    }
  }

  var fs$readdir = fs.readdir;
  fs.readdir = readdir;
  var noReaddirOptionVersions = /^v[0-5]\./;
  function readdir (path, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    var go$readdir = noReaddirOptionVersions.test(process.version)
      ? function go$readdir (path, options, cb, startTime) {
        return fs$readdir(path, fs$readdirCallback(
          path, options, cb, startTime
        ))
      }
      : function go$readdir (path, options, cb, startTime) {
        return fs$readdir(path, options, fs$readdirCallback(
          path, options, cb, startTime
        ))
      };

    return go$readdir(path, options, cb)

    function fs$readdirCallback (path, options, cb, startTime) {
      return function (err, files) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([
            go$readdir,
            [path, options, cb],
            err,
            startTime || Date.now(),
            Date.now()
          ]);
        else {
          if (files && files.sort)
            files.sort();

          if (typeof cb === 'function')
            cb.call(this, err, files);
        }
      }
    }
  }

  if (process.version.substr(0, 4) === 'v0.8') {
    var legStreams = legacy(fs);
    ReadStream = legStreams.ReadStream;
    WriteStream = legStreams.WriteStream;
  }

  var fs$ReadStream = fs.ReadStream;
  if (fs$ReadStream) {
    ReadStream.prototype = Object.create(fs$ReadStream.prototype);
    ReadStream.prototype.open = ReadStream$open;
  }

  var fs$WriteStream = fs.WriteStream;
  if (fs$WriteStream) {
    WriteStream.prototype = Object.create(fs$WriteStream.prototype);
    WriteStream.prototype.open = WriteStream$open;
  }

  Object.defineProperty(fs, 'ReadStream', {
    get: function () {
      return ReadStream
    },
    set: function (val) {
      ReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(fs, 'WriteStream', {
    get: function () {
      return WriteStream
    },
    set: function (val) {
      WriteStream = val;
    },
    enumerable: true,
    configurable: true
  });

  // legacy names
  var FileReadStream = ReadStream;
  Object.defineProperty(fs, 'FileReadStream', {
    get: function () {
      return FileReadStream
    },
    set: function (val) {
      FileReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  var FileWriteStream = WriteStream;
  Object.defineProperty(fs, 'FileWriteStream', {
    get: function () {
      return FileWriteStream
    },
    set: function (val) {
      FileWriteStream = val;
    },
    enumerable: true,
    configurable: true
  });

  function ReadStream (path, options) {
    if (this instanceof ReadStream)
      return fs$ReadStream.apply(this, arguments), this
    else
      return ReadStream.apply(Object.create(ReadStream.prototype), arguments)
  }

  function ReadStream$open () {
    var that = this;
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        if (that.autoClose)
          that.destroy();

        that.emit('error', err);
      } else {
        that.fd = fd;
        that.emit('open', fd);
        that.read();
      }
    });
  }

  function WriteStream (path, options) {
    if (this instanceof WriteStream)
      return fs$WriteStream.apply(this, arguments), this
    else
      return WriteStream.apply(Object.create(WriteStream.prototype), arguments)
  }

  function WriteStream$open () {
    var that = this;
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        that.destroy();
        that.emit('error', err);
      } else {
        that.fd = fd;
        that.emit('open', fd);
      }
    });
  }

  function createReadStream (path, options) {
    return new fs.ReadStream(path, options)
  }

  function createWriteStream (path, options) {
    return new fs.WriteStream(path, options)
  }

  var fs$open = fs.open;
  fs.open = open;
  function open (path, flags, mode, cb) {
    if (typeof mode === 'function')
      cb = mode, mode = null;

    return go$open(path, flags, mode, cb)

    function go$open (path, flags, mode, cb, startTime) {
      return fs$open(path, flags, mode, function (err, fd) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$open, [path, flags, mode, cb], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
        }
      })
    }
  }

  return fs
}

function enqueue (elem) {
  debug('ENQUEUE', elem[0].name, elem[1]);
  fs$q[gracefulQueue].push(elem);
  retry();
}

// keep track of the timeout between retry() calls
var retryTimer;

// reset the startTime and lastTime to now
// this resets the start of the 60 second overall timeout as well as the
// delay between attempts so that we'll retry these jobs sooner
function resetQueue () {
  var now = Date.now();
  for (var i = 0; i < fs$q[gracefulQueue].length; ++i) {
    // entries that are only a length of 2 are from an older version, don't
    // bother modifying those since they'll be retried anyway.
    if (fs$q[gracefulQueue][i].length > 2) {
      fs$q[gracefulQueue][i][3] = now; // startTime
      fs$q[gracefulQueue][i][4] = now; // lastTime
    }
  }
  // call retry to make sure we're actively processing the queue
  retry();
}

function retry () {
  // clear the timer and remove it to help prevent unintended concurrency
  clearTimeout(retryTimer);
  retryTimer = undefined;

  if (fs$q[gracefulQueue].length === 0)
    return

  var elem = fs$q[gracefulQueue].shift();
  var fn = elem[0];
  var args = elem[1];
  // these items may be unset if they were added by an older graceful-fs
  var err = elem[2];
  var startTime = elem[3];
  var lastTime = elem[4];

  // if we don't have a startTime we have no way of knowing if we've waited
  // long enough, so go ahead and retry this item now
  if (startTime === undefined) {
    debug('RETRY', fn.name, args);
    fn.apply(null, args);
  } else if (Date.now() - startTime >= 60000) {
    // it's been more than 60 seconds total, bail now
    debug('TIMEOUT', fn.name, args);
    var cb = args.pop();
    if (typeof cb === 'function')
      cb.call(null, err);
  } else {
    // the amount of time between the last attempt and right now
    var sinceAttempt = Date.now() - lastTime;
    // the amount of time between when we first tried, and when we last tried
    // rounded up to at least 1
    var sinceStart = Math.max(lastTime - startTime, 1);
    // backoff. wait longer than the total time we've been retrying, but only
    // up to a maximum of 100ms
    var desiredDelay = Math.min(sinceStart * 1.2, 100);
    // it's been long enough since the last retry, do it again
    if (sinceAttempt >= desiredDelay) {
      debug('RETRY', fn.name, args);
      fn.apply(null, args.concat([startTime]));
    } else {
      // if we can't do this job yet, push it to the end of the queue
      // and let the next iteration check again
      fs$q[gracefulQueue].push(elem);
    }
  }

  // schedule our next run if one isn't already scheduled
  if (retryTimer === undefined) {
    retryTimer = setTimeout(retry, 0);
  }
}

(function (exports) {
	// This is adapted from https://github.com/normalize/mz
	// Copyright (c) 2014-2016 Jonathan Ong me@jongleberry.com and Contributors
	const u = universalify$1.fromCallback;
	const fs = gracefulFs;

	const api = [
	  'access',
	  'appendFile',
	  'chmod',
	  'chown',
	  'close',
	  'copyFile',
	  'fchmod',
	  'fchown',
	  'fdatasync',
	  'fstat',
	  'fsync',
	  'ftruncate',
	  'futimes',
	  'lchmod',
	  'lchown',
	  'link',
	  'lstat',
	  'mkdir',
	  'mkdtemp',
	  'open',
	  'opendir',
	  'readdir',
	  'readFile',
	  'readlink',
	  'realpath',
	  'rename',
	  'rm',
	  'rmdir',
	  'stat',
	  'symlink',
	  'truncate',
	  'unlink',
	  'utimes',
	  'writeFile'
	].filter(key => {
	  // Some commands are not available on some systems. Ex:
	  // fs.opendir was added in Node.js v12.12.0
	  // fs.rm was added in Node.js v14.14.0
	  // fs.lchown is not available on at least some Linux
	  return typeof fs[key] === 'function'
	});

	// Export cloned fs:
	Object.assign(exports, fs);

	// Universalify async methods:
	api.forEach(method => {
	  exports[method] = u(fs[method]);
	});

	// We differ from mz/fs in that we still ship the old, broken, fs.exists()
	// since we are a drop-in replacement for the native module
	exports.exists = function (filename, callback) {
	  if (typeof callback === 'function') {
	    return fs.exists(filename, callback)
	  }
	  return new Promise(resolve => {
	    return fs.exists(filename, resolve)
	  })
	};

	// fs.read(), fs.write(), & fs.writev() need special treatment due to multiple callback args

	exports.read = function (fd, buffer, offset, length, position, callback) {
	  if (typeof callback === 'function') {
	    return fs.read(fd, buffer, offset, length, position, callback)
	  }
	  return new Promise((resolve, reject) => {
	    fs.read(fd, buffer, offset, length, position, (err, bytesRead, buffer) => {
	      if (err) return reject(err)
	      resolve({ bytesRead, buffer });
	    });
	  })
	};

	// Function signature can be
	// fs.write(fd, buffer[, offset[, length[, position]]], callback)
	// OR
	// fs.write(fd, string[, position[, encoding]], callback)
	// We need to handle both cases, so we use ...args
	exports.write = function (fd, buffer, ...args) {
	  if (typeof args[args.length - 1] === 'function') {
	    return fs.write(fd, buffer, ...args)
	  }

	  return new Promise((resolve, reject) => {
	    fs.write(fd, buffer, ...args, (err, bytesWritten, buffer) => {
	      if (err) return reject(err)
	      resolve({ bytesWritten, buffer });
	    });
	  })
	};

	// fs.writev only available in Node v12.9.0+
	if (typeof fs.writev === 'function') {
	  // Function signature is
	  // s.writev(fd, buffers[, position], callback)
	  // We need to handle the optional arg, so we use ...args
	  exports.writev = function (fd, buffers, ...args) {
	    if (typeof args[args.length - 1] === 'function') {
	      return fs.writev(fd, buffers, ...args)
	    }

	    return new Promise((resolve, reject) => {
	      fs.writev(fd, buffers, ...args, (err, bytesWritten, buffers) => {
	        if (err) return reject(err)
	        resolve({ bytesWritten, buffers });
	      });
	    })
	  };
	}

	// fs.realpath.native sometimes not available if fs is monkey-patched
	if (typeof fs.realpath.native === 'function') {
	  exports.realpath.native = u(fs.realpath.native);
	} else {
	  process.emitWarning(
	    'fs.realpath.native is not a function. Is fs being monkey-patched?',
	    'Warning', 'fs-extra-WARN0003'
	  );
	}
} (fs$r));

var makeDir$1 = {};

var utils$m = {};

const path$o = require$$0__default$4["default"];

// https://github.com/nodejs/node/issues/8987
// https://github.com/libuv/libuv/pull/1088
utils$m.checkPath = function checkPath (pth) {
  if (process.platform === 'win32') {
    const pathHasInvalidWinCharacters = /[<>:"|?*]/.test(pth.replace(path$o.parse(pth).root, ''));

    if (pathHasInvalidWinCharacters) {
      const error = new Error(`Path contains invalid characters: ${pth}`);
      error.code = 'EINVAL';
      throw error
    }
  }
};

const fs$p = fs$r;
const { checkPath: checkPath$1 } = utils$m;

const getMode = options => {
  const defaults = { mode: 0o777 };
  if (typeof options === 'number') return options
  return ({ ...defaults, ...options }).mode
};

makeDir$1.makeDir = async (dir, options) => {
  checkPath$1(dir);

  return fs$p.mkdir(dir, {
    mode: getMode(options),
    recursive: true
  })
};

makeDir$1.makeDirSync = (dir, options) => {
  checkPath$1(dir);

  return fs$p.mkdirSync(dir, {
    mode: getMode(options),
    recursive: true
  })
};

const u$a = universalify$1.fromPromise;
const { makeDir: _makeDir, makeDirSync } = makeDir$1;
const makeDir = u$a(_makeDir);

var mkdirs$2 = {
  mkdirs: makeDir,
  mkdirsSync: makeDirSync,
  // alias
  mkdirp: makeDir,
  mkdirpSync: makeDirSync,
  ensureDir: makeDir,
  ensureDirSync: makeDirSync
};

const u$9 = universalify$1.fromPromise;
const fs$o = fs$r;

function pathExists$6 (path) {
  return fs$o.access(path).then(() => true).catch(() => false)
}

var pathExists_1 = {
  pathExists: u$9(pathExists$6),
  pathExistsSync: fs$o.existsSync
};

const fs$n = gracefulFs;

function utimesMillis$1 (path, atime, mtime, callback) {
  // if (!HAS_MILLIS_RES) return fs.utimes(path, atime, mtime, callback)
  fs$n.open(path, 'r+', (err, fd) => {
    if (err) return callback(err)
    fs$n.futimes(fd, atime, mtime, futimesErr => {
      fs$n.close(fd, closeErr => {
        if (callback) callback(futimesErr || closeErr);
      });
    });
  });
}

function utimesMillisSync$1 (path, atime, mtime) {
  const fd = fs$n.openSync(path, 'r+');
  fs$n.futimesSync(fd, atime, mtime);
  return fs$n.closeSync(fd)
}

var utimes = {
  utimesMillis: utimesMillis$1,
  utimesMillisSync: utimesMillisSync$1
};

const fs$m = fs$r;
const path$n = require$$0__default$4["default"];
const util$4 = require$$0__default$3["default"];

function getStats$2 (src, dest, opts) {
  const statFunc = opts.dereference
    ? (file) => fs$m.stat(file, { bigint: true })
    : (file) => fs$m.lstat(file, { bigint: true });
  return Promise.all([
    statFunc(src),
    statFunc(dest).catch(err => {
      if (err.code === 'ENOENT') return null
      throw err
    })
  ]).then(([srcStat, destStat]) => ({ srcStat, destStat }))
}

function getStatsSync (src, dest, opts) {
  let destStat;
  const statFunc = opts.dereference
    ? (file) => fs$m.statSync(file, { bigint: true })
    : (file) => fs$m.lstatSync(file, { bigint: true });
  const srcStat = statFunc(src);
  try {
    destStat = statFunc(dest);
  } catch (err) {
    if (err.code === 'ENOENT') return { srcStat, destStat: null }
    throw err
  }
  return { srcStat, destStat }
}

function checkPaths (src, dest, funcName, opts, cb) {
  util$4.callbackify(getStats$2)(src, dest, opts, (err, stats) => {
    if (err) return cb(err)
    const { srcStat, destStat } = stats;

    if (destStat) {
      if (areIdentical$2(srcStat, destStat)) {
        const srcBaseName = path$n.basename(src);
        const destBaseName = path$n.basename(dest);
        if (funcName === 'move' &&
          srcBaseName !== destBaseName &&
          srcBaseName.toLowerCase() === destBaseName.toLowerCase()) {
          return cb(null, { srcStat, destStat, isChangingCase: true })
        }
        return cb(new Error('Source and destination must not be the same.'))
      }
      if (srcStat.isDirectory() && !destStat.isDirectory()) {
        return cb(new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`))
      }
      if (!srcStat.isDirectory() && destStat.isDirectory()) {
        return cb(new Error(`Cannot overwrite directory '${dest}' with non-directory '${src}'.`))
      }
    }

    if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
      return cb(new Error(errMsg(src, dest, funcName)))
    }
    return cb(null, { srcStat, destStat })
  });
}

function checkPathsSync (src, dest, funcName, opts) {
  const { srcStat, destStat } = getStatsSync(src, dest, opts);

  if (destStat) {
    if (areIdentical$2(srcStat, destStat)) {
      const srcBaseName = path$n.basename(src);
      const destBaseName = path$n.basename(dest);
      if (funcName === 'move' &&
        srcBaseName !== destBaseName &&
        srcBaseName.toLowerCase() === destBaseName.toLowerCase()) {
        return { srcStat, destStat, isChangingCase: true }
      }
      throw new Error('Source and destination must not be the same.')
    }
    if (srcStat.isDirectory() && !destStat.isDirectory()) {
      throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`)
    }
    if (!srcStat.isDirectory() && destStat.isDirectory()) {
      throw new Error(`Cannot overwrite directory '${dest}' with non-directory '${src}'.`)
    }
  }

  if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
    throw new Error(errMsg(src, dest, funcName))
  }
  return { srcStat, destStat }
}

// recursively check if dest parent is a subdirectory of src.
// It works for all file types including symlinks since it
// checks the src and dest inodes. It starts from the deepest
// parent and stops once it reaches the src parent or the root path.
function checkParentPaths (src, srcStat, dest, funcName, cb) {
  const srcParent = path$n.resolve(path$n.dirname(src));
  const destParent = path$n.resolve(path$n.dirname(dest));
  if (destParent === srcParent || destParent === path$n.parse(destParent).root) return cb()
  fs$m.stat(destParent, { bigint: true }, (err, destStat) => {
    if (err) {
      if (err.code === 'ENOENT') return cb()
      return cb(err)
    }
    if (areIdentical$2(srcStat, destStat)) {
      return cb(new Error(errMsg(src, dest, funcName)))
    }
    return checkParentPaths(src, srcStat, destParent, funcName, cb)
  });
}

function checkParentPathsSync (src, srcStat, dest, funcName) {
  const srcParent = path$n.resolve(path$n.dirname(src));
  const destParent = path$n.resolve(path$n.dirname(dest));
  if (destParent === srcParent || destParent === path$n.parse(destParent).root) return
  let destStat;
  try {
    destStat = fs$m.statSync(destParent, { bigint: true });
  } catch (err) {
    if (err.code === 'ENOENT') return
    throw err
  }
  if (areIdentical$2(srcStat, destStat)) {
    throw new Error(errMsg(src, dest, funcName))
  }
  return checkParentPathsSync(src, srcStat, destParent, funcName)
}

function areIdentical$2 (srcStat, destStat) {
  return destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev
}

// return true if dest is a subdir of src, otherwise false.
// It only checks the path strings.
function isSrcSubdir (src, dest) {
  const srcArr = path$n.resolve(src).split(path$n.sep).filter(i => i);
  const destArr = path$n.resolve(dest).split(path$n.sep).filter(i => i);
  return srcArr.reduce((acc, cur, i) => acc && destArr[i] === cur, true)
}

function errMsg (src, dest, funcName) {
  return `Cannot ${funcName} '${src}' to a subdirectory of itself, '${dest}'.`
}

var stat$5 = {
  checkPaths,
  checkPathsSync,
  checkParentPaths,
  checkParentPathsSync,
  isSrcSubdir,
  areIdentical: areIdentical$2
};

const fs$l = gracefulFs;
const path$m = require$$0__default$4["default"];
const mkdirs$1 = mkdirs$2.mkdirs;
const pathExists$5 = pathExists_1.pathExists;
const utimesMillis = utimes.utimesMillis;
const stat$4 = stat$5;

function copy$2 (src, dest, opts, cb) {
  if (typeof opts === 'function' && !cb) {
    cb = opts;
    opts = {};
  } else if (typeof opts === 'function') {
    opts = { filter: opts };
  }

  cb = cb || function () {};
  opts = opts || {};

  opts.clobber = 'clobber' in opts ? !!opts.clobber : true; // default to true for now
  opts.overwrite = 'overwrite' in opts ? !!opts.overwrite : opts.clobber; // overwrite falls back to clobber

  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    process.emitWarning(
      'Using the preserveTimestamps option in 32-bit node is not recommended;\n\n' +
      '\tsee https://github.com/jprichardson/node-fs-extra/issues/269',
      'Warning', 'fs-extra-WARN0001'
    );
  }

  stat$4.checkPaths(src, dest, 'copy', opts, (err, stats) => {
    if (err) return cb(err)
    const { srcStat, destStat } = stats;
    stat$4.checkParentPaths(src, srcStat, dest, 'copy', err => {
      if (err) return cb(err)
      if (opts.filter) return handleFilter(checkParentDir, destStat, src, dest, opts, cb)
      return checkParentDir(destStat, src, dest, opts, cb)
    });
  });
}

function checkParentDir (destStat, src, dest, opts, cb) {
  const destParent = path$m.dirname(dest);
  pathExists$5(destParent, (err, dirExists) => {
    if (err) return cb(err)
    if (dirExists) return getStats$1(destStat, src, dest, opts, cb)
    mkdirs$1(destParent, err => {
      if (err) return cb(err)
      return getStats$1(destStat, src, dest, opts, cb)
    });
  });
}

function handleFilter (onInclude, destStat, src, dest, opts, cb) {
  Promise.resolve(opts.filter(src, dest)).then(include => {
    if (include) return onInclude(destStat, src, dest, opts, cb)
    return cb()
  }, error => cb(error));
}

function startCopy$1 (destStat, src, dest, opts, cb) {
  if (opts.filter) return handleFilter(getStats$1, destStat, src, dest, opts, cb)
  return getStats$1(destStat, src, dest, opts, cb)
}

function getStats$1 (destStat, src, dest, opts, cb) {
  const stat = opts.dereference ? fs$l.stat : fs$l.lstat;
  stat(src, (err, srcStat) => {
    if (err) return cb(err)

    if (srcStat.isDirectory()) return onDir$1(srcStat, destStat, src, dest, opts, cb)
    else if (srcStat.isFile() ||
             srcStat.isCharacterDevice() ||
             srcStat.isBlockDevice()) return onFile$1(srcStat, destStat, src, dest, opts, cb)
    else if (srcStat.isSymbolicLink()) return onLink$1(destStat, src, dest, opts, cb)
    else if (srcStat.isSocket()) return cb(new Error(`Cannot copy a socket file: ${src}`))
    else if (srcStat.isFIFO()) return cb(new Error(`Cannot copy a FIFO pipe: ${src}`))
    return cb(new Error(`Unknown file: ${src}`))
  });
}

function onFile$1 (srcStat, destStat, src, dest, opts, cb) {
  if (!destStat) return copyFile$1(srcStat, src, dest, opts, cb)
  return mayCopyFile$1(srcStat, src, dest, opts, cb)
}

function mayCopyFile$1 (srcStat, src, dest, opts, cb) {
  if (opts.overwrite) {
    fs$l.unlink(dest, err => {
      if (err) return cb(err)
      return copyFile$1(srcStat, src, dest, opts, cb)
    });
  } else if (opts.errorOnExist) {
    return cb(new Error(`'${dest}' already exists`))
  } else return cb()
}

function copyFile$1 (srcStat, src, dest, opts, cb) {
  fs$l.copyFile(src, dest, err => {
    if (err) return cb(err)
    if (opts.preserveTimestamps) return handleTimestampsAndMode(srcStat.mode, src, dest, cb)
    return setDestMode$1(dest, srcStat.mode, cb)
  });
}

function handleTimestampsAndMode (srcMode, src, dest, cb) {
  // Make sure the file is writable before setting the timestamp
  // otherwise open fails with EPERM when invoked with 'r+'
  // (through utimes call)
  if (fileIsNotWritable$1(srcMode)) {
    return makeFileWritable$1(dest, srcMode, err => {
      if (err) return cb(err)
      return setDestTimestampsAndMode(srcMode, src, dest, cb)
    })
  }
  return setDestTimestampsAndMode(srcMode, src, dest, cb)
}

function fileIsNotWritable$1 (srcMode) {
  return (srcMode & 0o200) === 0
}

function makeFileWritable$1 (dest, srcMode, cb) {
  return setDestMode$1(dest, srcMode | 0o200, cb)
}

function setDestTimestampsAndMode (srcMode, src, dest, cb) {
  setDestTimestamps$1(src, dest, err => {
    if (err) return cb(err)
    return setDestMode$1(dest, srcMode, cb)
  });
}

function setDestMode$1 (dest, srcMode, cb) {
  return fs$l.chmod(dest, srcMode, cb)
}

function setDestTimestamps$1 (src, dest, cb) {
  // The initial srcStat.atime cannot be trusted
  // because it is modified by the read(2) system call
  // (See https://nodejs.org/api/fs.html#fs_stat_time_values)
  fs$l.stat(src, (err, updatedSrcStat) => {
    if (err) return cb(err)
    return utimesMillis(dest, updatedSrcStat.atime, updatedSrcStat.mtime, cb)
  });
}

function onDir$1 (srcStat, destStat, src, dest, opts, cb) {
  if (!destStat) return mkDirAndCopy$1(srcStat.mode, src, dest, opts, cb)
  return copyDir$1(src, dest, opts, cb)
}

function mkDirAndCopy$1 (srcMode, src, dest, opts, cb) {
  fs$l.mkdir(dest, err => {
    if (err) return cb(err)
    copyDir$1(src, dest, opts, err => {
      if (err) return cb(err)
      return setDestMode$1(dest, srcMode, cb)
    });
  });
}

function copyDir$1 (src, dest, opts, cb) {
  fs$l.readdir(src, (err, items) => {
    if (err) return cb(err)
    return copyDirItems(items, src, dest, opts, cb)
  });
}

function copyDirItems (items, src, dest, opts, cb) {
  const item = items.pop();
  if (!item) return cb()
  return copyDirItem$1(items, item, src, dest, opts, cb)
}

function copyDirItem$1 (items, item, src, dest, opts, cb) {
  const srcItem = path$m.join(src, item);
  const destItem = path$m.join(dest, item);
  stat$4.checkPaths(srcItem, destItem, 'copy', opts, (err, stats) => {
    if (err) return cb(err)
    const { destStat } = stats;
    startCopy$1(destStat, srcItem, destItem, opts, err => {
      if (err) return cb(err)
      return copyDirItems(items, src, dest, opts, cb)
    });
  });
}

function onLink$1 (destStat, src, dest, opts, cb) {
  fs$l.readlink(src, (err, resolvedSrc) => {
    if (err) return cb(err)
    if (opts.dereference) {
      resolvedSrc = path$m.resolve(process.cwd(), resolvedSrc);
    }

    if (!destStat) {
      return fs$l.symlink(resolvedSrc, dest, cb)
    } else {
      fs$l.readlink(dest, (err, resolvedDest) => {
        if (err) {
          // dest exists and is a regular file or directory,
          // Windows may throw UNKNOWN error. If dest already exists,
          // fs throws error anyway, so no need to guard against it here.
          if (err.code === 'EINVAL' || err.code === 'UNKNOWN') return fs$l.symlink(resolvedSrc, dest, cb)
          return cb(err)
        }
        if (opts.dereference) {
          resolvedDest = path$m.resolve(process.cwd(), resolvedDest);
        }
        if (stat$4.isSrcSubdir(resolvedSrc, resolvedDest)) {
          return cb(new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`))
        }

        // do not copy if src is a subdir of dest since unlinking
        // dest in this case would result in removing src contents
        // and therefore a broken symlink would be created.
        if (destStat.isDirectory() && stat$4.isSrcSubdir(resolvedDest, resolvedSrc)) {
          return cb(new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`))
        }
        return copyLink$1(resolvedSrc, dest, cb)
      });
    }
  });
}

function copyLink$1 (resolvedSrc, dest, cb) {
  fs$l.unlink(dest, err => {
    if (err) return cb(err)
    return fs$l.symlink(resolvedSrc, dest, cb)
  });
}

var copy_1 = copy$2;

const fs$k = gracefulFs;
const path$l = require$$0__default$4["default"];
const mkdirsSync$1 = mkdirs$2.mkdirsSync;
const utimesMillisSync = utimes.utimesMillisSync;
const stat$3 = stat$5;

function copySync$1 (src, dest, opts) {
  if (typeof opts === 'function') {
    opts = { filter: opts };
  }

  opts = opts || {};
  opts.clobber = 'clobber' in opts ? !!opts.clobber : true; // default to true for now
  opts.overwrite = 'overwrite' in opts ? !!opts.overwrite : opts.clobber; // overwrite falls back to clobber

  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    process.emitWarning(
      'Using the preserveTimestamps option in 32-bit node is not recommended;\n\n' +
      '\tsee https://github.com/jprichardson/node-fs-extra/issues/269',
      'Warning', 'fs-extra-WARN0002'
    );
  }

  const { srcStat, destStat } = stat$3.checkPathsSync(src, dest, 'copy', opts);
  stat$3.checkParentPathsSync(src, srcStat, dest, 'copy');
  return handleFilterAndCopy(destStat, src, dest, opts)
}

function handleFilterAndCopy (destStat, src, dest, opts) {
  if (opts.filter && !opts.filter(src, dest)) return
  const destParent = path$l.dirname(dest);
  if (!fs$k.existsSync(destParent)) mkdirsSync$1(destParent);
  return getStats(destStat, src, dest, opts)
}

function startCopy (destStat, src, dest, opts) {
  if (opts.filter && !opts.filter(src, dest)) return
  return getStats(destStat, src, dest, opts)
}

function getStats (destStat, src, dest, opts) {
  const statSync = opts.dereference ? fs$k.statSync : fs$k.lstatSync;
  const srcStat = statSync(src);

  if (srcStat.isDirectory()) return onDir(srcStat, destStat, src, dest, opts)
  else if (srcStat.isFile() ||
           srcStat.isCharacterDevice() ||
           srcStat.isBlockDevice()) return onFile(srcStat, destStat, src, dest, opts)
  else if (srcStat.isSymbolicLink()) return onLink(destStat, src, dest, opts)
  else if (srcStat.isSocket()) throw new Error(`Cannot copy a socket file: ${src}`)
  else if (srcStat.isFIFO()) throw new Error(`Cannot copy a FIFO pipe: ${src}`)
  throw new Error(`Unknown file: ${src}`)
}

function onFile (srcStat, destStat, src, dest, opts) {
  if (!destStat) return copyFile(srcStat, src, dest, opts)
  return mayCopyFile(srcStat, src, dest, opts)
}

function mayCopyFile (srcStat, src, dest, opts) {
  if (opts.overwrite) {
    fs$k.unlinkSync(dest);
    return copyFile(srcStat, src, dest, opts)
  } else if (opts.errorOnExist) {
    throw new Error(`'${dest}' already exists`)
  }
}

function copyFile (srcStat, src, dest, opts) {
  fs$k.copyFileSync(src, dest);
  if (opts.preserveTimestamps) handleTimestamps(srcStat.mode, src, dest);
  return setDestMode(dest, srcStat.mode)
}

function handleTimestamps (srcMode, src, dest) {
  // Make sure the file is writable before setting the timestamp
  // otherwise open fails with EPERM when invoked with 'r+'
  // (through utimes call)
  if (fileIsNotWritable(srcMode)) makeFileWritable(dest, srcMode);
  return setDestTimestamps(src, dest)
}

function fileIsNotWritable (srcMode) {
  return (srcMode & 0o200) === 0
}

function makeFileWritable (dest, srcMode) {
  return setDestMode(dest, srcMode | 0o200)
}

function setDestMode (dest, srcMode) {
  return fs$k.chmodSync(dest, srcMode)
}

function setDestTimestamps (src, dest) {
  // The initial srcStat.atime cannot be trusted
  // because it is modified by the read(2) system call
  // (See https://nodejs.org/api/fs.html#fs_stat_time_values)
  const updatedSrcStat = fs$k.statSync(src);
  return utimesMillisSync(dest, updatedSrcStat.atime, updatedSrcStat.mtime)
}

function onDir (srcStat, destStat, src, dest, opts) {
  if (!destStat) return mkDirAndCopy(srcStat.mode, src, dest, opts)
  return copyDir(src, dest, opts)
}

function mkDirAndCopy (srcMode, src, dest, opts) {
  fs$k.mkdirSync(dest);
  copyDir(src, dest, opts);
  return setDestMode(dest, srcMode)
}

function copyDir (src, dest, opts) {
  fs$k.readdirSync(src).forEach(item => copyDirItem(item, src, dest, opts));
}

function copyDirItem (item, src, dest, opts) {
  const srcItem = path$l.join(src, item);
  const destItem = path$l.join(dest, item);
  const { destStat } = stat$3.checkPathsSync(srcItem, destItem, 'copy', opts);
  return startCopy(destStat, srcItem, destItem, opts)
}

function onLink (destStat, src, dest, opts) {
  let resolvedSrc = fs$k.readlinkSync(src);
  if (opts.dereference) {
    resolvedSrc = path$l.resolve(process.cwd(), resolvedSrc);
  }

  if (!destStat) {
    return fs$k.symlinkSync(resolvedSrc, dest)
  } else {
    let resolvedDest;
    try {
      resolvedDest = fs$k.readlinkSync(dest);
    } catch (err) {
      // dest exists and is a regular file or directory,
      // Windows may throw UNKNOWN error. If dest already exists,
      // fs throws error anyway, so no need to guard against it here.
      if (err.code === 'EINVAL' || err.code === 'UNKNOWN') return fs$k.symlinkSync(resolvedSrc, dest)
      throw err
    }
    if (opts.dereference) {
      resolvedDest = path$l.resolve(process.cwd(), resolvedDest);
    }
    if (stat$3.isSrcSubdir(resolvedSrc, resolvedDest)) {
      throw new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`)
    }

    // prevent copy if src is a subdir of dest since unlinking
    // dest in this case would result in removing src contents
    // and therefore a broken symlink would be created.
    if (fs$k.statSync(dest).isDirectory() && stat$3.isSrcSubdir(resolvedDest, resolvedSrc)) {
      throw new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`)
    }
    return copyLink(resolvedSrc, dest)
  }
}

function copyLink (resolvedSrc, dest) {
  fs$k.unlinkSync(dest);
  return fs$k.symlinkSync(resolvedSrc, dest)
}

var copySync_1 = copySync$1;

const u$8 = universalify$1.fromCallback;
var copy$1 = {
  copy: u$8(copy_1),
  copySync: copySync_1
};

const fs$j = gracefulFs;
const path$k = require$$0__default$4["default"];
const assert = require$$5__default["default"];

const isWindows$1 = (process.platform === 'win32');

function defaults$1 (options) {
  const methods = [
    'unlink',
    'chmod',
    'stat',
    'lstat',
    'rmdir',
    'readdir'
  ];
  methods.forEach(m => {
    options[m] = options[m] || fs$j[m];
    m = m + 'Sync';
    options[m] = options[m] || fs$j[m];
  });

  options.maxBusyTries = options.maxBusyTries || 3;
}

function rimraf$1 (p, options, cb) {
  let busyTries = 0;

  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  assert(p, 'rimraf: missing path');
  assert.strictEqual(typeof p, 'string', 'rimraf: path should be a string');
  assert.strictEqual(typeof cb, 'function', 'rimraf: callback function required');
  assert(options, 'rimraf: invalid options argument provided');
  assert.strictEqual(typeof options, 'object', 'rimraf: options should be object');

  defaults$1(options);

  rimraf_(p, options, function CB (er) {
    if (er) {
      if ((er.code === 'EBUSY' || er.code === 'ENOTEMPTY' || er.code === 'EPERM') &&
          busyTries < options.maxBusyTries) {
        busyTries++;
        const time = busyTries * 100;
        // try again, with the same exact callback as this one.
        return setTimeout(() => rimraf_(p, options, CB), time)
      }

      // already gone
      if (er.code === 'ENOENT') er = null;
    }

    cb(er);
  });
}

// Two possible strategies.
// 1. Assume it's a file.  unlink it, then do the dir stuff on EPERM or EISDIR
// 2. Assume it's a directory.  readdir, then do the file stuff on ENOTDIR
//
// Both result in an extra syscall when you guess wrong.  However, there
// are likely far more normal files in the world than directories.  This
// is based on the assumption that a the average number of files per
// directory is >= 1.
//
// If anyone ever complains about this, then I guess the strategy could
// be made configurable somehow.  But until then, YAGNI.
function rimraf_ (p, options, cb) {
  assert(p);
  assert(options);
  assert(typeof cb === 'function');

  // sunos lets the root user unlink directories, which is... weird.
  // so we have to lstat here and make sure it's not a dir.
  options.lstat(p, (er, st) => {
    if (er && er.code === 'ENOENT') {
      return cb(null)
    }

    // Windows can EPERM on stat.  Life is suffering.
    if (er && er.code === 'EPERM' && isWindows$1) {
      return fixWinEPERM(p, options, er, cb)
    }

    if (st && st.isDirectory()) {
      return rmdir(p, options, er, cb)
    }

    options.unlink(p, er => {
      if (er) {
        if (er.code === 'ENOENT') {
          return cb(null)
        }
        if (er.code === 'EPERM') {
          return (isWindows$1)
            ? fixWinEPERM(p, options, er, cb)
            : rmdir(p, options, er, cb)
        }
        if (er.code === 'EISDIR') {
          return rmdir(p, options, er, cb)
        }
      }
      return cb(er)
    });
  });
}

function fixWinEPERM (p, options, er, cb) {
  assert(p);
  assert(options);
  assert(typeof cb === 'function');

  options.chmod(p, 0o666, er2 => {
    if (er2) {
      cb(er2.code === 'ENOENT' ? null : er);
    } else {
      options.stat(p, (er3, stats) => {
        if (er3) {
          cb(er3.code === 'ENOENT' ? null : er);
        } else if (stats.isDirectory()) {
          rmdir(p, options, er, cb);
        } else {
          options.unlink(p, cb);
        }
      });
    }
  });
}

function fixWinEPERMSync (p, options, er) {
  let stats;

  assert(p);
  assert(options);

  try {
    options.chmodSync(p, 0o666);
  } catch (er2) {
    if (er2.code === 'ENOENT') {
      return
    } else {
      throw er
    }
  }

  try {
    stats = options.statSync(p);
  } catch (er3) {
    if (er3.code === 'ENOENT') {
      return
    } else {
      throw er
    }
  }

  if (stats.isDirectory()) {
    rmdirSync(p, options, er);
  } else {
    options.unlinkSync(p);
  }
}

function rmdir (p, options, originalEr, cb) {
  assert(p);
  assert(options);
  assert(typeof cb === 'function');

  // try to rmdir first, and only readdir on ENOTEMPTY or EEXIST (SunOS)
  // if we guessed wrong, and it's not a directory, then
  // raise the original error.
  options.rmdir(p, er => {
    if (er && (er.code === 'ENOTEMPTY' || er.code === 'EEXIST' || er.code === 'EPERM')) {
      rmkids(p, options, cb);
    } else if (er && er.code === 'ENOTDIR') {
      cb(originalEr);
    } else {
      cb(er);
    }
  });
}

function rmkids (p, options, cb) {
  assert(p);
  assert(options);
  assert(typeof cb === 'function');

  options.readdir(p, (er, files) => {
    if (er) return cb(er)

    let n = files.length;
    let errState;

    if (n === 0) return options.rmdir(p, cb)

    files.forEach(f => {
      rimraf$1(path$k.join(p, f), options, er => {
        if (errState) {
          return
        }
        if (er) return cb(errState = er)
        if (--n === 0) {
          options.rmdir(p, cb);
        }
      });
    });
  });
}

// this looks simpler, and is strictly *faster*, but will
// tie up the JavaScript thread and fail on excessively
// deep directory trees.
function rimrafSync (p, options) {
  let st;

  options = options || {};
  defaults$1(options);

  assert(p, 'rimraf: missing path');
  assert.strictEqual(typeof p, 'string', 'rimraf: path should be a string');
  assert(options, 'rimraf: missing options');
  assert.strictEqual(typeof options, 'object', 'rimraf: options should be object');

  try {
    st = options.lstatSync(p);
  } catch (er) {
    if (er.code === 'ENOENT') {
      return
    }

    // Windows can EPERM on stat.  Life is suffering.
    if (er.code === 'EPERM' && isWindows$1) {
      fixWinEPERMSync(p, options, er);
    }
  }

  try {
    // sunos lets the root user unlink directories, which is... weird.
    if (st && st.isDirectory()) {
      rmdirSync(p, options, null);
    } else {
      options.unlinkSync(p);
    }
  } catch (er) {
    if (er.code === 'ENOENT') {
      return
    } else if (er.code === 'EPERM') {
      return isWindows$1 ? fixWinEPERMSync(p, options, er) : rmdirSync(p, options, er)
    } else if (er.code !== 'EISDIR') {
      throw er
    }
    rmdirSync(p, options, er);
  }
}

function rmdirSync (p, options, originalEr) {
  assert(p);
  assert(options);

  try {
    options.rmdirSync(p);
  } catch (er) {
    if (er.code === 'ENOTDIR') {
      throw originalEr
    } else if (er.code === 'ENOTEMPTY' || er.code === 'EEXIST' || er.code === 'EPERM') {
      rmkidsSync(p, options);
    } else if (er.code !== 'ENOENT') {
      throw er
    }
  }
}

function rmkidsSync (p, options) {
  assert(p);
  assert(options);
  options.readdirSync(p).forEach(f => rimrafSync(path$k.join(p, f), options));

  if (isWindows$1) {
    // We only end up here once we got ENOTEMPTY at least once, and
    // at this point, we are guaranteed to have removed all the kids.
    // So, we know that it won't be ENOENT or ENOTDIR or anything else.
    // try really hard to delete stuff on windows, because it has a
    // PROFOUNDLY annoying habit of not closing handles promptly when
    // files are deleted, resulting in spurious ENOTEMPTY errors.
    const startTime = Date.now();
    do {
      try {
        const ret = options.rmdirSync(p, options);
        return ret
      } catch {}
    } while (Date.now() - startTime < 500) // give up after 500ms
  } else {
    const ret = options.rmdirSync(p, options);
    return ret
  }
}

var rimraf_1 = rimraf$1;
rimraf$1.sync = rimrafSync;

const fs$i = gracefulFs;
const u$7 = universalify$1.fromCallback;
const rimraf = rimraf_1;

function remove$2 (path, callback) {
  // Node 14.14.0+
  if (fs$i.rm) return fs$i.rm(path, { recursive: true, force: true }, callback)
  rimraf(path, callback);
}

function removeSync$1 (path) {
  // Node 14.14.0+
  if (fs$i.rmSync) return fs$i.rmSync(path, { recursive: true, force: true })
  rimraf.sync(path);
}

var remove_1 = {
  remove: u$7(remove$2),
  removeSync: removeSync$1
};

const u$6 = universalify$1.fromPromise;
const fs$h = fs$r;
const path$j = require$$0__default$4["default"];
const mkdir$3 = mkdirs$2;
const remove$1 = remove_1;

const emptyDir = u$6(async function emptyDir (dir) {
  let items;
  try {
    items = await fs$h.readdir(dir);
  } catch {
    return mkdir$3.mkdirs(dir)
  }

  return Promise.all(items.map(item => remove$1.remove(path$j.join(dir, item))))
});

function emptyDirSync (dir) {
  let items;
  try {
    items = fs$h.readdirSync(dir);
  } catch {
    return mkdir$3.mkdirsSync(dir)
  }

  items.forEach(item => {
    item = path$j.join(dir, item);
    remove$1.removeSync(item);
  });
}

var empty = {
  emptyDirSync,
  emptydirSync: emptyDirSync,
  emptyDir,
  emptydir: emptyDir
};

const u$5 = universalify$1.fromCallback;
const path$i = require$$0__default$4["default"];
const fs$g = gracefulFs;
const mkdir$2 = mkdirs$2;

function createFile$1 (file, callback) {
  function makeFile () {
    fs$g.writeFile(file, '', err => {
      if (err) return callback(err)
      callback();
    });
  }

  fs$g.stat(file, (err, stats) => { // eslint-disable-line handle-callback-err
    if (!err && stats.isFile()) return callback()
    const dir = path$i.dirname(file);
    fs$g.stat(dir, (err, stats) => {
      if (err) {
        // if the directory doesn't exist, make it
        if (err.code === 'ENOENT') {
          return mkdir$2.mkdirs(dir, err => {
            if (err) return callback(err)
            makeFile();
          })
        }
        return callback(err)
      }

      if (stats.isDirectory()) makeFile();
      else {
        // parent is not a directory
        // This is just to cause an internal ENOTDIR error to be thrown
        fs$g.readdir(dir, err => {
          if (err) return callback(err)
        });
      }
    });
  });
}

function createFileSync$1 (file) {
  let stats;
  try {
    stats = fs$g.statSync(file);
  } catch {}
  if (stats && stats.isFile()) return

  const dir = path$i.dirname(file);
  try {
    if (!fs$g.statSync(dir).isDirectory()) {
      // parent is not a directory
      // This is just to cause an internal ENOTDIR error to be thrown
      fs$g.readdirSync(dir);
    }
  } catch (err) {
    // If the stat call above failed because the directory doesn't exist, create it
    if (err && err.code === 'ENOENT') mkdir$2.mkdirsSync(dir);
    else throw err
  }

  fs$g.writeFileSync(file, '');
}

var file = {
  createFile: u$5(createFile$1),
  createFileSync: createFileSync$1
};

const u$4 = universalify$1.fromCallback;
const path$h = require$$0__default$4["default"];
const fs$f = gracefulFs;
const mkdir$1 = mkdirs$2;
const pathExists$4 = pathExists_1.pathExists;
const { areIdentical: areIdentical$1 } = stat$5;

function createLink$1 (srcpath, dstpath, callback) {
  function makeLink (srcpath, dstpath) {
    fs$f.link(srcpath, dstpath, err => {
      if (err) return callback(err)
      callback(null);
    });
  }

  fs$f.lstat(dstpath, (_, dstStat) => {
    fs$f.lstat(srcpath, (err, srcStat) => {
      if (err) {
        err.message = err.message.replace('lstat', 'ensureLink');
        return callback(err)
      }
      if (dstStat && areIdentical$1(srcStat, dstStat)) return callback(null)

      const dir = path$h.dirname(dstpath);
      pathExists$4(dir, (err, dirExists) => {
        if (err) return callback(err)
        if (dirExists) return makeLink(srcpath, dstpath)
        mkdir$1.mkdirs(dir, err => {
          if (err) return callback(err)
          makeLink(srcpath, dstpath);
        });
      });
    });
  });
}

function createLinkSync$1 (srcpath, dstpath) {
  let dstStat;
  try {
    dstStat = fs$f.lstatSync(dstpath);
  } catch {}

  try {
    const srcStat = fs$f.lstatSync(srcpath);
    if (dstStat && areIdentical$1(srcStat, dstStat)) return
  } catch (err) {
    err.message = err.message.replace('lstat', 'ensureLink');
    throw err
  }

  const dir = path$h.dirname(dstpath);
  const dirExists = fs$f.existsSync(dir);
  if (dirExists) return fs$f.linkSync(srcpath, dstpath)
  mkdir$1.mkdirsSync(dir);

  return fs$f.linkSync(srcpath, dstpath)
}

var link = {
  createLink: u$4(createLink$1),
  createLinkSync: createLinkSync$1
};

const path$g = require$$0__default$4["default"];
const fs$e = gracefulFs;
const pathExists$3 = pathExists_1.pathExists;

/**
 * Function that returns two types of paths, one relative to symlink, and one
 * relative to the current working directory. Checks if path is absolute or
 * relative. If the path is relative, this function checks if the path is
 * relative to symlink or relative to current working directory. This is an
 * initiative to find a smarter `srcpath` to supply when building symlinks.
 * This allows you to determine which path to use out of one of three possible
 * types of source paths. The first is an absolute path. This is detected by
 * `path.isAbsolute()`. When an absolute path is provided, it is checked to
 * see if it exists. If it does it's used, if not an error is returned
 * (callback)/ thrown (sync). The other two options for `srcpath` are a
 * relative url. By default Node's `fs.symlink` works by creating a symlink
 * using `dstpath` and expects the `srcpath` to be relative to the newly
 * created symlink. If you provide a `srcpath` that does not exist on the file
 * system it results in a broken symlink. To minimize this, the function
 * checks to see if the 'relative to symlink' source file exists, and if it
 * does it will use it. If it does not, it checks if there's a file that
 * exists that is relative to the current working directory, if does its used.
 * This preserves the expectations of the original fs.symlink spec and adds
 * the ability to pass in `relative to current working direcotry` paths.
 */

function symlinkPaths$1 (srcpath, dstpath, callback) {
  if (path$g.isAbsolute(srcpath)) {
    return fs$e.lstat(srcpath, (err) => {
      if (err) {
        err.message = err.message.replace('lstat', 'ensureSymlink');
        return callback(err)
      }
      return callback(null, {
        toCwd: srcpath,
        toDst: srcpath
      })
    })
  } else {
    const dstdir = path$g.dirname(dstpath);
    const relativeToDst = path$g.join(dstdir, srcpath);
    return pathExists$3(relativeToDst, (err, exists) => {
      if (err) return callback(err)
      if (exists) {
        return callback(null, {
          toCwd: relativeToDst,
          toDst: srcpath
        })
      } else {
        return fs$e.lstat(srcpath, (err) => {
          if (err) {
            err.message = err.message.replace('lstat', 'ensureSymlink');
            return callback(err)
          }
          return callback(null, {
            toCwd: srcpath,
            toDst: path$g.relative(dstdir, srcpath)
          })
        })
      }
    })
  }
}

function symlinkPathsSync$1 (srcpath, dstpath) {
  let exists;
  if (path$g.isAbsolute(srcpath)) {
    exists = fs$e.existsSync(srcpath);
    if (!exists) throw new Error('absolute srcpath does not exist')
    return {
      toCwd: srcpath,
      toDst: srcpath
    }
  } else {
    const dstdir = path$g.dirname(dstpath);
    const relativeToDst = path$g.join(dstdir, srcpath);
    exists = fs$e.existsSync(relativeToDst);
    if (exists) {
      return {
        toCwd: relativeToDst,
        toDst: srcpath
      }
    } else {
      exists = fs$e.existsSync(srcpath);
      if (!exists) throw new Error('relative srcpath does not exist')
      return {
        toCwd: srcpath,
        toDst: path$g.relative(dstdir, srcpath)
      }
    }
  }
}

var symlinkPaths_1 = {
  symlinkPaths: symlinkPaths$1,
  symlinkPathsSync: symlinkPathsSync$1
};

const fs$d = gracefulFs;

function symlinkType$1 (srcpath, type, callback) {
  callback = (typeof type === 'function') ? type : callback;
  type = (typeof type === 'function') ? false : type;
  if (type) return callback(null, type)
  fs$d.lstat(srcpath, (err, stats) => {
    if (err) return callback(null, 'file')
    type = (stats && stats.isDirectory()) ? 'dir' : 'file';
    callback(null, type);
  });
}

function symlinkTypeSync$1 (srcpath, type) {
  let stats;

  if (type) return type
  try {
    stats = fs$d.lstatSync(srcpath);
  } catch {
    return 'file'
  }
  return (stats && stats.isDirectory()) ? 'dir' : 'file'
}

var symlinkType_1 = {
  symlinkType: symlinkType$1,
  symlinkTypeSync: symlinkTypeSync$1
};

const u$3 = universalify$1.fromCallback;
const path$f = require$$0__default$4["default"];
const fs$c = fs$r;
const _mkdirs = mkdirs$2;
const mkdirs = _mkdirs.mkdirs;
const mkdirsSync = _mkdirs.mkdirsSync;

const _symlinkPaths = symlinkPaths_1;
const symlinkPaths = _symlinkPaths.symlinkPaths;
const symlinkPathsSync = _symlinkPaths.symlinkPathsSync;

const _symlinkType = symlinkType_1;
const symlinkType = _symlinkType.symlinkType;
const symlinkTypeSync = _symlinkType.symlinkTypeSync;

const pathExists$2 = pathExists_1.pathExists;

const { areIdentical } = stat$5;

function createSymlink$1 (srcpath, dstpath, type, callback) {
  callback = (typeof type === 'function') ? type : callback;
  type = (typeof type === 'function') ? false : type;

  fs$c.lstat(dstpath, (err, stats) => {
    if (!err && stats.isSymbolicLink()) {
      Promise.all([
        fs$c.stat(srcpath),
        fs$c.stat(dstpath)
      ]).then(([srcStat, dstStat]) => {
        if (areIdentical(srcStat, dstStat)) return callback(null)
        _createSymlink(srcpath, dstpath, type, callback);
      });
    } else _createSymlink(srcpath, dstpath, type, callback);
  });
}

function _createSymlink (srcpath, dstpath, type, callback) {
  symlinkPaths(srcpath, dstpath, (err, relative) => {
    if (err) return callback(err)
    srcpath = relative.toDst;
    symlinkType(relative.toCwd, type, (err, type) => {
      if (err) return callback(err)
      const dir = path$f.dirname(dstpath);
      pathExists$2(dir, (err, dirExists) => {
        if (err) return callback(err)
        if (dirExists) return fs$c.symlink(srcpath, dstpath, type, callback)
        mkdirs(dir, err => {
          if (err) return callback(err)
          fs$c.symlink(srcpath, dstpath, type, callback);
        });
      });
    });
  });
}

function createSymlinkSync$1 (srcpath, dstpath, type) {
  let stats;
  try {
    stats = fs$c.lstatSync(dstpath);
  } catch {}
  if (stats && stats.isSymbolicLink()) {
    const srcStat = fs$c.statSync(srcpath);
    const dstStat = fs$c.statSync(dstpath);
    if (areIdentical(srcStat, dstStat)) return
  }

  const relative = symlinkPathsSync(srcpath, dstpath);
  srcpath = relative.toDst;
  type = symlinkTypeSync(relative.toCwd, type);
  const dir = path$f.dirname(dstpath);
  const exists = fs$c.existsSync(dir);
  if (exists) return fs$c.symlinkSync(srcpath, dstpath, type)
  mkdirsSync(dir);
  return fs$c.symlinkSync(srcpath, dstpath, type)
}

var symlink = {
  createSymlink: u$3(createSymlink$1),
  createSymlinkSync: createSymlinkSync$1
};

const { createFile, createFileSync } = file;
const { createLink, createLinkSync } = link;
const { createSymlink, createSymlinkSync } = symlink;

var ensure = {
  // file
  createFile,
  createFileSync,
  ensureFile: createFile,
  ensureFileSync: createFileSync,
  // link
  createLink,
  createLinkSync,
  ensureLink: createLink,
  ensureLinkSync: createLinkSync,
  // symlink
  createSymlink,
  createSymlinkSync,
  ensureSymlink: createSymlink,
  ensureSymlinkSync: createSymlinkSync
};

function stringify$9 (obj, { EOL = '\n', finalEOL = true, replacer = null, spaces } = {}) {
  const EOF = finalEOL ? EOL : '';
  const str = JSON.stringify(obj, replacer, spaces);

  return str.replace(/\n/g, EOL) + EOF
}

function stripBom$1 (content) {
  // we do this because JSON.parse would convert it to a utf8 string if encoding wasn't specified
  if (Buffer.isBuffer(content)) content = content.toString('utf8');
  return content.replace(/^\uFEFF/, '')
}

var utils$l = { stringify: stringify$9, stripBom: stripBom$1 };

let _fs;
try {
  _fs = gracefulFs;
} catch (_) {
  _fs = require$$0__default$2["default"];
}
const universalify = universalify$1;
const { stringify: stringify$8, stripBom } = utils$l;

async function _readFile (file, options = {}) {
  if (typeof options === 'string') {
    options = { encoding: options };
  }

  const fs = options.fs || _fs;

  const shouldThrow = 'throws' in options ? options.throws : true;

  let data = await universalify.fromCallback(fs.readFile)(file, options);

  data = stripBom(data);

  let obj;
  try {
    obj = JSON.parse(data, options ? options.reviver : null);
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file}: ${err.message}`;
      throw err
    } else {
      return null
    }
  }

  return obj
}

const readFile = universalify.fromPromise(_readFile);

function readFileSync (file, options = {}) {
  if (typeof options === 'string') {
    options = { encoding: options };
  }

  const fs = options.fs || _fs;

  const shouldThrow = 'throws' in options ? options.throws : true;

  try {
    let content = fs.readFileSync(file, options);
    content = stripBom(content);
    return JSON.parse(content, options.reviver)
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file}: ${err.message}`;
      throw err
    } else {
      return null
    }
  }
}

async function _writeFile (file, obj, options = {}) {
  const fs = options.fs || _fs;

  const str = stringify$8(obj, options);

  await universalify.fromCallback(fs.writeFile)(file, str, options);
}

const writeFile = universalify.fromPromise(_writeFile);

function writeFileSync (file, obj, options = {}) {
  const fs = options.fs || _fs;

  const str = stringify$8(obj, options);
  // not sure if fs.writeFileSync returns anything, but just in case
  return fs.writeFileSync(file, str, options)
}

const jsonfile$1 = {
  readFile,
  readFileSync,
  writeFile,
  writeFileSync
};

var jsonfile_1 = jsonfile$1;

const jsonFile$1 = jsonfile_1;

var jsonfile = {
  // jsonfile exports
  readJson: jsonFile$1.readFile,
  readJsonSync: jsonFile$1.readFileSync,
  writeJson: jsonFile$1.writeFile,
  writeJsonSync: jsonFile$1.writeFileSync
};

const u$2 = universalify$1.fromCallback;
const fs$b = gracefulFs;
const path$e = require$$0__default$4["default"];
const mkdir = mkdirs$2;
const pathExists$1 = pathExists_1.pathExists;

function outputFile$1 (file, data, encoding, callback) {
  if (typeof encoding === 'function') {
    callback = encoding;
    encoding = 'utf8';
  }

  const dir = path$e.dirname(file);
  pathExists$1(dir, (err, itDoes) => {
    if (err) return callback(err)
    if (itDoes) return fs$b.writeFile(file, data, encoding, callback)

    mkdir.mkdirs(dir, err => {
      if (err) return callback(err)

      fs$b.writeFile(file, data, encoding, callback);
    });
  });
}

function outputFileSync$1 (file, ...args) {
  const dir = path$e.dirname(file);
  if (fs$b.existsSync(dir)) {
    return fs$b.writeFileSync(file, ...args)
  }
  mkdir.mkdirsSync(dir);
  fs$b.writeFileSync(file, ...args);
}

var outputFile_1 = {
  outputFile: u$2(outputFile$1),
  outputFileSync: outputFileSync$1
};

const { stringify: stringify$7 } = utils$l;
const { outputFile } = outputFile_1;

async function outputJson (file, data, options = {}) {
  const str = stringify$7(data, options);

  await outputFile(file, str, options);
}

var outputJson_1 = outputJson;

const { stringify: stringify$6 } = utils$l;
const { outputFileSync } = outputFile_1;

function outputJsonSync (file, data, options) {
  const str = stringify$6(data, options);

  outputFileSync(file, str, options);
}

var outputJsonSync_1 = outputJsonSync;

const u$1 = universalify$1.fromPromise;
const jsonFile = jsonfile;

jsonFile.outputJson = u$1(outputJson_1);
jsonFile.outputJsonSync = outputJsonSync_1;
// aliases
jsonFile.outputJSON = jsonFile.outputJson;
jsonFile.outputJSONSync = jsonFile.outputJsonSync;
jsonFile.writeJSON = jsonFile.writeJson;
jsonFile.writeJSONSync = jsonFile.writeJsonSync;
jsonFile.readJSON = jsonFile.readJson;
jsonFile.readJSONSync = jsonFile.readJsonSync;

var json = jsonFile;

const fs$a = gracefulFs;
const path$d = require$$0__default$4["default"];
const copy = copy$1.copy;
const remove = remove_1.remove;
const mkdirp = mkdirs$2.mkdirp;
const pathExists = pathExists_1.pathExists;
const stat$2 = stat$5;

function move$1 (src, dest, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  opts = opts || {};

  const overwrite = opts.overwrite || opts.clobber || false;

  stat$2.checkPaths(src, dest, 'move', opts, (err, stats) => {
    if (err) return cb(err)
    const { srcStat, isChangingCase = false } = stats;
    stat$2.checkParentPaths(src, srcStat, dest, 'move', err => {
      if (err) return cb(err)
      if (isParentRoot$1(dest)) return doRename$1(src, dest, overwrite, isChangingCase, cb)
      mkdirp(path$d.dirname(dest), err => {
        if (err) return cb(err)
        return doRename$1(src, dest, overwrite, isChangingCase, cb)
      });
    });
  });
}

function isParentRoot$1 (dest) {
  const parent = path$d.dirname(dest);
  const parsedPath = path$d.parse(parent);
  return parsedPath.root === parent
}

function doRename$1 (src, dest, overwrite, isChangingCase, cb) {
  if (isChangingCase) return rename$1(src, dest, overwrite, cb)
  if (overwrite) {
    return remove(dest, err => {
      if (err) return cb(err)
      return rename$1(src, dest, overwrite, cb)
    })
  }
  pathExists(dest, (err, destExists) => {
    if (err) return cb(err)
    if (destExists) return cb(new Error('dest already exists.'))
    return rename$1(src, dest, overwrite, cb)
  });
}

function rename$1 (src, dest, overwrite, cb) {
  fs$a.rename(src, dest, err => {
    if (!err) return cb()
    if (err.code !== 'EXDEV') return cb(err)
    return moveAcrossDevice$1(src, dest, overwrite, cb)
  });
}

function moveAcrossDevice$1 (src, dest, overwrite, cb) {
  const opts = {
    overwrite,
    errorOnExist: true
  };
  copy(src, dest, opts, err => {
    if (err) return cb(err)
    return remove(src, cb)
  });
}

var move_1 = move$1;

const fs$9 = gracefulFs;
const path$c = require$$0__default$4["default"];
const copySync = copy$1.copySync;
const removeSync = remove_1.removeSync;
const mkdirpSync = mkdirs$2.mkdirpSync;
const stat$1 = stat$5;

function moveSync (src, dest, opts) {
  opts = opts || {};
  const overwrite = opts.overwrite || opts.clobber || false;

  const { srcStat, isChangingCase = false } = stat$1.checkPathsSync(src, dest, 'move', opts);
  stat$1.checkParentPathsSync(src, srcStat, dest, 'move');
  if (!isParentRoot(dest)) mkdirpSync(path$c.dirname(dest));
  return doRename(src, dest, overwrite, isChangingCase)
}

function isParentRoot (dest) {
  const parent = path$c.dirname(dest);
  const parsedPath = path$c.parse(parent);
  return parsedPath.root === parent
}

function doRename (src, dest, overwrite, isChangingCase) {
  if (isChangingCase) return rename(src, dest, overwrite)
  if (overwrite) {
    removeSync(dest);
    return rename(src, dest, overwrite)
  }
  if (fs$9.existsSync(dest)) throw new Error('dest already exists.')
  return rename(src, dest, overwrite)
}

function rename (src, dest, overwrite) {
  try {
    fs$9.renameSync(src, dest);
  } catch (err) {
    if (err.code !== 'EXDEV') throw err
    return moveAcrossDevice(src, dest, overwrite)
  }
}

function moveAcrossDevice (src, dest, overwrite) {
  const opts = {
    overwrite,
    errorOnExist: true
  };
  copySync(src, dest, opts);
  return removeSync(src)
}

var moveSync_1 = moveSync;

const u = universalify$1.fromCallback;
var move = {
  move: u(move_1),
  moveSync: moveSync_1
};

var lib$1 = {
  // Export promiseified graceful-fs:
  ...fs$r,
  // Export extra methods:
  ...copy$1,
  ...empty,
  ...ensure,
  ...json,
  ...mkdirs$2,
  ...move,
  ...outputFile_1,
  ...pathExists_1,
  ...remove_1
};

const ANSI_BACKGROUND_OFFSET = 10;

const wrapAnsi16 = (offset = 0) => code => `\u001B[${code + offset}m`;

const wrapAnsi256 = (offset = 0) => code => `\u001B[${38 + offset};5;${code}m`;

const wrapAnsi16m = (offset = 0) => (red, green, blue) => `\u001B[${38 + offset};2;${red};${green};${blue}m`;

function assembleStyles() {
	const codes = new Map();
	const styles = {
		modifier: {
			reset: [0, 0],
			// 21 isn't widely supported and 22 does the same thing
			bold: [1, 22],
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			overline: [53, 55],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29],
		},
		color: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],

			// Bright color
			blackBright: [90, 39],
			redBright: [91, 39],
			greenBright: [92, 39],
			yellowBright: [93, 39],
			blueBright: [94, 39],
			magentaBright: [95, 39],
			cyanBright: [96, 39],
			whiteBright: [97, 39],
		},
		bgColor: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49],

			// Bright color
			bgBlackBright: [100, 49],
			bgRedBright: [101, 49],
			bgGreenBright: [102, 49],
			bgYellowBright: [103, 49],
			bgBlueBright: [104, 49],
			bgMagentaBright: [105, 49],
			bgCyanBright: [106, 49],
			bgWhiteBright: [107, 49],
		},
	};

	// Alias bright black as gray (and grey)
	styles.color.gray = styles.color.blackBright;
	styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
	styles.color.grey = styles.color.blackBright;
	styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;

	for (const [groupName, group] of Object.entries(styles)) {
		for (const [styleName, style] of Object.entries(group)) {
			styles[styleName] = {
				open: `\u001B[${style[0]}m`,
				close: `\u001B[${style[1]}m`,
			};

			group[styleName] = styles[styleName];

			codes.set(style[0], style[1]);
		}

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false,
		});
	}

	Object.defineProperty(styles, 'codes', {
		value: codes,
		enumerable: false,
	});

	styles.color.close = '\u001B[39m';
	styles.bgColor.close = '\u001B[49m';

	styles.color.ansi = wrapAnsi16();
	styles.color.ansi256 = wrapAnsi256();
	styles.color.ansi16m = wrapAnsi16m();
	styles.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
	styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
	styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);

	// From https://github.com/Qix-/color-convert/blob/3f0e0d4e92e235796ccb17f6e85c72094a651f49/conversions.js
	Object.defineProperties(styles, {
		rgbToAnsi256: {
			value: (red, green, blue) => {
				// We use the extended greyscale palette here, with the exception of
				// black and white. normal palette only has 4 greyscale shades.
				if (red === green && green === blue) {
					if (red < 8) {
						return 16;
					}

					if (red > 248) {
						return 231;
					}

					return Math.round(((red - 8) / 247) * 24) + 232;
				}

				return 16
					+ (36 * Math.round(red / 255 * 5))
					+ (6 * Math.round(green / 255 * 5))
					+ Math.round(blue / 255 * 5);
			},
			enumerable: false,
		},
		hexToRgb: {
			value: hex => {
				const matches = /(?<colorString>[a-f\d]{6}|[a-f\d]{3})/i.exec(hex.toString(16));
				if (!matches) {
					return [0, 0, 0];
				}

				let {colorString} = matches.groups;

				if (colorString.length === 3) {
					colorString = [...colorString].map(character => character + character).join('');
				}

				const integer = Number.parseInt(colorString, 16);

				return [
					/* eslint-disable no-bitwise */
					(integer >> 16) & 0xFF,
					(integer >> 8) & 0xFF,
					integer & 0xFF,
					/* eslint-enable no-bitwise */
				];
			},
			enumerable: false,
		},
		hexToAnsi256: {
			value: hex => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
			enumerable: false,
		},
		ansi256ToAnsi: {
			value: code => {
				if (code < 8) {
					return 30 + code;
				}

				if (code < 16) {
					return 90 + (code - 8);
				}

				let red;
				let green;
				let blue;

				if (code >= 232) {
					red = (((code - 232) * 10) + 8) / 255;
					green = red;
					blue = red;
				} else {
					code -= 16;

					const remainder = code % 36;

					red = Math.floor(code / 36) / 5;
					green = Math.floor(remainder / 6) / 5;
					blue = (remainder % 6) / 5;
				}

				const value = Math.max(red, green, blue) * 2;

				if (value === 0) {
					return 30;
				}

				// eslint-disable-next-line no-bitwise
				let result = 30 + ((Math.round(blue) << 2) | (Math.round(green) << 1) | Math.round(red));

				if (value === 2) {
					result += 60;
				}

				return result;
			},
			enumerable: false,
		},
		rgbToAnsi: {
			value: (red, green, blue) => styles.ansi256ToAnsi(styles.rgbToAnsi256(red, green, blue)),
			enumerable: false,
		},
		hexToAnsi: {
			value: hex => styles.ansi256ToAnsi(styles.hexToAnsi256(hex)),
			enumerable: false,
		},
	});

	return styles;
}

const ansiStyles = assembleStyles();

/* eslint-env browser */

// const isBlinkBasedBrowser = /\b(Chrome|Chromium)\//.test(navigator.userAgent);

const colorSupport = false

const supportsColor = {
	stdout: colorSupport,
	stderr: colorSupport,
};

// TODO: When targeting Node.js 16, use `String.prototype.replaceAll`.
function stringReplaceAll(string, substring, replacer) {
	let index = string.indexOf(substring);
	if (index === -1) {
		return string;
	}

	const substringLength = substring.length;
	let endIndex = 0;
	let returnValue = '';
	do {
		returnValue += string.substr(endIndex, index - endIndex) + substring + replacer;
		endIndex = index + substringLength;
		index = string.indexOf(substring, endIndex);
	} while (index !== -1);

	returnValue += string.slice(endIndex);
	return returnValue;
}

function stringEncaseCRLFWithFirstIndex(string, prefix, postfix, index) {
	let endIndex = 0;
	let returnValue = '';
	do {
		const gotCR = string[index - 1] === '\r';
		returnValue += string.substr(endIndex, (gotCR ? index - 1 : index) - endIndex) + prefix + (gotCR ? '\r\n' : '\n') + postfix;
		endIndex = index + 1;
		index = string.indexOf('\n', endIndex);
	} while (index !== -1);

	returnValue += string.slice(endIndex);
	return returnValue;
}

const {stdout: stdoutColor, stderr: stderrColor} = supportsColor;

const GENERATOR = Symbol('GENERATOR');
const STYLER = Symbol('STYLER');
const IS_EMPTY = Symbol('IS_EMPTY');

// `supportsColor.level` → `ansiStyles.color[name]` mapping
const levelMapping = [
	'ansi',
	'ansi',
	'ansi256',
	'ansi16m',
];

const styles = Object.create(null);

const applyOptions = (object, options = {}) => {
	if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
		throw new Error('The `level` option should be an integer from 0 to 3');
	}

	// Detect level if not set manually
	const colorLevel = stdoutColor ? stdoutColor.level : 0;
	object.level = options.level === undefined ? colorLevel : options.level;
};

const chalkFactory = options => {
	const chalk = (...strings) => strings.join(' ');
	applyOptions(chalk, options);

	Object.setPrototypeOf(chalk, createChalk.prototype);

	return chalk;
};

function createChalk(options) {
	return chalkFactory(options);
}

Object.setPrototypeOf(createChalk.prototype, Function.prototype);

for (const [styleName, style] of Object.entries(ansiStyles)) {
	styles[styleName] = {
		get() {
			const builder = createBuilder(this, createStyler(style.open, style.close, this[STYLER]), this[IS_EMPTY]);
			Object.defineProperty(this, styleName, {value: builder});
			return builder;
		},
	};
}

styles.visible = {
	get() {
		const builder = createBuilder(this, this[STYLER], true);
		Object.defineProperty(this, 'visible', {value: builder});
		return builder;
	},
};

const getModelAnsi = (model, level, type, ...arguments_) => {
	if (model === 'rgb') {
		if (level === 'ansi16m') {
			return ansiStyles[type].ansi16m(...arguments_);
		}

		if (level === 'ansi256') {
			return ansiStyles[type].ansi256(ansiStyles.rgbToAnsi256(...arguments_));
		}

		return ansiStyles[type].ansi(ansiStyles.rgbToAnsi(...arguments_));
	}

	if (model === 'hex') {
		return getModelAnsi('rgb', level, type, ...ansiStyles.hexToRgb(...arguments_));
	}

	return ansiStyles[type][model](...arguments_);
};

const usedModels = ['rgb', 'hex', 'ansi256'];

for (const model of usedModels) {
	styles[model] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(getModelAnsi(model, levelMapping[level], 'color', ...arguments_), ansiStyles.color.close, this[STYLER]);
				return createBuilder(this, styler, this[IS_EMPTY]);
			};
		},
	};

	const bgModel = 'bg' + model[0].toUpperCase() + model.slice(1);
	styles[bgModel] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(getModelAnsi(model, levelMapping[level], 'bgColor', ...arguments_), ansiStyles.bgColor.close, this[STYLER]);
				return createBuilder(this, styler, this[IS_EMPTY]);
			};
		},
	};
}

const proto = Object.defineProperties(() => {}, {
	...styles,
	level: {
		enumerable: true,
		get() {
			return this[GENERATOR].level;
		},
		set(level) {
			this[GENERATOR].level = level;
		},
	},
});

const createStyler = (open, close, parent) => {
	let openAll;
	let closeAll;
	if (parent === undefined) {
		openAll = open;
		closeAll = close;
	} else {
		openAll = parent.openAll + open;
		closeAll = close + parent.closeAll;
	}

	return {
		open,
		close,
		openAll,
		closeAll,
		parent,
	};
};

const createBuilder = (self, _styler, _isEmpty) => {
	// Single argument is hot path, implicit coercion is faster than anything
	// eslint-disable-next-line no-implicit-coercion
	const builder = (...arguments_) => applyStyle(builder, (arguments_.length === 1) ? ('' + arguments_[0]) : arguments_.join(' '));

	// We alter the prototype because we must return a function, but there is
	// no way to create a function with a different prototype
	Object.setPrototypeOf(builder, proto);

	builder[GENERATOR] = self;
	builder[STYLER] = _styler;
	builder[IS_EMPTY] = _isEmpty;

	return builder;
};

const applyStyle = (self, string) => {
	if (self.level <= 0 || !string) {
		return self[IS_EMPTY] ? '' : string;
	}

	let styler = self[STYLER];

	if (styler === undefined) {
		return string;
	}

	const {openAll, closeAll} = styler;
	if (string.includes('\u001B')) {
		while (styler !== undefined) {
			// Replace any instances already present with a re-opening code
			// otherwise only the part of the string until said closing code
			// will be colored, and the rest will simply be 'plain'.
			string = stringReplaceAll(string, styler.close, styler.open);

			styler = styler.parent;
		}
	}

	// We can move both next actions out of loop, because remaining actions in loop won't have
	// any/visible effect on parts we add here. Close the styling before a linebreak and reopen
	// after next line to fix a bleed issue on macOS: https://github.com/chalk/chalk/pull/92
	const lfIndex = string.indexOf('\n');
	if (lfIndex !== -1) {
		string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
	}

	return openAll + string + closeAll;
};

Object.defineProperties(createChalk.prototype, styles);

const chalk = createChalk();
createChalk({level: stderrColor ? stderrColor.level : 0});

var windows;
var hasRequiredWindows;

function requireWindows () {
	if (hasRequiredWindows) return windows;
	hasRequiredWindows = 1;
	windows = isexe;
	isexe.sync = sync;

	var fs = require$$0__default$2["default"];

	function checkPathExt (path, options) {
	  var pathext = options.pathExt !== undefined ?
	    options.pathExt : process.env.PATHEXT;

	  if (!pathext) {
	    return true
	  }

	  pathext = pathext.split(';');
	  if (pathext.indexOf('') !== -1) {
	    return true
	  }
	  for (var i = 0; i < pathext.length; i++) {
	    var p = pathext[i].toLowerCase();
	    if (p && path.substr(-p.length).toLowerCase() === p) {
	      return true
	    }
	  }
	  return false
	}

	function checkStat (stat, path, options) {
	  if (!stat.isSymbolicLink() && !stat.isFile()) {
	    return false
	  }
	  return checkPathExt(path, options)
	}

	function isexe (path, options, cb) {
	  fs.stat(path, function (er, stat) {
	    cb(er, er ? false : checkStat(stat, path, options));
	  });
	}

	function sync (path, options) {
	  return checkStat(fs.statSync(path), path, options)
	}
	return windows;
}

var mode;
var hasRequiredMode;

function requireMode () {
	if (hasRequiredMode) return mode;
	hasRequiredMode = 1;
	mode = isexe;
	isexe.sync = sync;

	var fs = require$$0__default$2["default"];

	function isexe (path, options, cb) {
	  fs.stat(path, function (er, stat) {
	    cb(er, er ? false : checkStat(stat, options));
	  });
	}

	function sync (path, options) {
	  return checkStat(fs.statSync(path), options)
	}

	function checkStat (stat, options) {
	  return stat.isFile() && checkMode(stat, options)
	}

	function checkMode (stat, options) {
	  var mod = stat.mode;
	  var uid = stat.uid;
	  var gid = stat.gid;

	  var myUid = options.uid !== undefined ?
	    options.uid : process.getuid && process.getuid();
	  var myGid = options.gid !== undefined ?
	    options.gid : process.getgid && process.getgid();

	  var u = parseInt('100', 8);
	  var g = parseInt('010', 8);
	  var o = parseInt('001', 8);
	  var ug = u | g;

	  var ret = (mod & o) ||
	    (mod & g) && gid === myGid ||
	    (mod & u) && uid === myUid ||
	    (mod & ug) && myUid === 0;

	  return ret
	}
	return mode;
}

var core;
if (process.platform === 'win32' || commonjsGlobal.TESTING_WINDOWS) {
  core = requireWindows();
} else {
  core = requireMode();
}

var isexe_1 = isexe$1;
isexe$1.sync = sync$8;

function isexe$1 (path, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (!cb) {
    if (typeof Promise !== 'function') {
      throw new TypeError('callback not provided')
    }

    return new Promise(function (resolve, reject) {
      isexe$1(path, options || {}, function (er, is) {
        if (er) {
          reject(er);
        } else {
          resolve(is);
        }
      });
    })
  }

  core(path, options || {}, function (er, is) {
    // ignore EACCES because that just means we aren't allowed to run it
    if (er) {
      if (er.code === 'EACCES' || options && options.ignoreErrors) {
        er = null;
        is = false;
      }
    }
    cb(er, is);
  });
}

function sync$8 (path, options) {
  // my kingdom for a filtered catch
  try {
    return core.sync(path, options || {})
  } catch (er) {
    if (options && options.ignoreErrors || er.code === 'EACCES') {
      return false
    } else {
      throw er
    }
  }
}

const isWindows = process.platform === 'win32' ||
    process.env.OSTYPE === 'cygwin' ||
    process.env.OSTYPE === 'msys';

const path$b = require$$0__default$4["default"];
const COLON = isWindows ? ';' : ':';
const isexe = isexe_1;

const getNotFoundError = (cmd) =>
  Object.assign(new Error(`not found: ${cmd}`), { code: 'ENOENT' });

const getPathInfo = (cmd, opt) => {
  const colon = opt.colon || COLON;

  // If it has a slash, then we don't bother searching the pathenv.
  // just check the file itself, and that's it.
  const pathEnv = cmd.match(/\//) || isWindows && cmd.match(/\\/) ? ['']
    : (
      [
        // windows always checks the cwd first
        ...(isWindows ? [process.cwd()] : []),
        ...(opt.path || process.env.PATH ||
          /* istanbul ignore next: very unusual */ '').split(colon),
      ]
    );
  const pathExtExe = isWindows
    ? opt.pathExt || process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM'
    : '';
  const pathExt = isWindows ? pathExtExe.split(colon) : [''];

  if (isWindows) {
    if (cmd.indexOf('.') !== -1 && pathExt[0] !== '')
      pathExt.unshift('');
  }

  return {
    pathEnv,
    pathExt,
    pathExtExe,
  }
};

const which = (cmd, opt, cb) => {
  if (typeof opt === 'function') {
    cb = opt;
    opt = {};
  }
  if (!opt)
    opt = {};

  const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
  const found = [];

  const step = i => new Promise((resolve, reject) => {
    if (i === pathEnv.length)
      return opt.all && found.length ? resolve(found)
        : reject(getNotFoundError(cmd))

    const ppRaw = pathEnv[i];
    const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;

    const pCmd = path$b.join(pathPart, cmd);
    const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd
      : pCmd;

    resolve(subStep(p, i, 0));
  });

  const subStep = (p, i, ii) => new Promise((resolve, reject) => {
    if (ii === pathExt.length)
      return resolve(step(i + 1))
    const ext = pathExt[ii];
    isexe(p + ext, { pathExt: pathExtExe }, (er, is) => {
      if (!er && is) {
        if (opt.all)
          found.push(p + ext);
        else
          return resolve(p + ext)
      }
      return resolve(subStep(p, i, ii + 1))
    });
  });

  return cb ? step(0).then(res => cb(null, res), cb) : step(0)
};

const whichSync = (cmd, opt) => {
  opt = opt || {};

  const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
  const found = [];

  for (let i = 0; i < pathEnv.length; i ++) {
    const ppRaw = pathEnv[i];
    const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;

    const pCmd = path$b.join(pathPart, cmd);
    const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd
      : pCmd;

    for (let j = 0; j < pathExt.length; j ++) {
      const cur = p + pathExt[j];
      try {
        const is = isexe.sync(cur, { pathExt: pathExtExe });
        if (is) {
          if (opt.all)
            found.push(cur);
          else
            return cur
        }
      } catch (ex) {}
    }
  }

  if (opt.all && found.length)
    return found

  if (opt.nothrow)
    return null

  throw getNotFoundError(cmd)
};

var which_1 = which;
which.sync = whichSync;

var eventStream = {};

var through$1 = {exports: {}};

(function (module, exports) {
	var Stream = require$$0__default$1["default"];

	// through
	//
	// a stream that does nothing but re-emit the input.
	// useful for aggregating a series of changing but not ending streams into one stream)

	module.exports = through;
	through.through = through;

	//create a readable writable stream.

	function through (write, end, opts) {
	  write = write || function (data) { this.queue(data); };
	  end = end || function () { this.queue(null); };

	  var ended = false, destroyed = false, buffer = [], _ended = false;
	  var stream = new Stream();
	  stream.readable = stream.writable = true;
	  stream.paused = false;

	//  stream.autoPause   = !(opts && opts.autoPause   === false)
	  stream.autoDestroy = !(opts && opts.autoDestroy === false);

	  stream.write = function (data) {
	    write.call(this, data);
	    return !stream.paused
	  };

	  function drain() {
	    while(buffer.length && !stream.paused) {
	      var data = buffer.shift();
	      if(null === data)
	        return stream.emit('end')
	      else
	        stream.emit('data', data);
	    }
	  }

	  stream.queue = stream.push = function (data) {
	//    console.error(ended)
	    if(_ended) return stream
	    if(data === null) _ended = true;
	    buffer.push(data);
	    drain();
	    return stream
	  };

	  //this will be registered as the first 'end' listener
	  //must call destroy next tick, to make sure we're after any
	  //stream piped from here.
	  //this is only a problem if end is not emitted synchronously.
	  //a nicer way to do this is to make sure this is the last listener for 'end'

	  stream.on('end', function () {
	    stream.readable = false;
	    if(!stream.writable && stream.autoDestroy)
	      process.nextTick(function () {
	        stream.destroy();
	      });
	  });

	  function _end () {
	    stream.writable = false;
	    end.call(stream);
	    if(!stream.readable && stream.autoDestroy)
	      stream.destroy();
	  }

	  stream.end = function (data) {
	    if(ended) return
	    ended = true;
	    if(arguments.length) stream.write(data);
	    _end(); // will emit or queue
	    return stream
	  };

	  stream.destroy = function () {
	    if(destroyed) return
	    destroyed = true;
	    ended = true;
	    buffer.length = 0;
	    stream.writable = stream.readable = false;
	    stream.emit('close');
	    return stream
	  };

	  stream.pause = function () {
	    if(stream.paused) return
	    stream.paused = true;
	    return stream
	  };

	  stream.resume = function () {
	    if(stream.paused) {
	      stream.paused = false;
	      stream.emit('resume');
	    }
	    drain();
	    //may have become paused again,
	    //as drain emits 'data'.
	    if(!stream.paused)
	      stream.emit('drain');
	    return stream
	  };
	  return stream
	}
} (through$1));

var Stream$3 = require$$0__default$1["default"];

// from
//
// a stream that reads from an source.
// source may be an array, or a function.
// from handles pause behaviour for you.

var from =
function from (source) {
  if(Array.isArray(source)) {
		var source_index = 0, source_len = source.length;
    return from (function (i) {
      if(source_index < source_len)
        this.emit('data', source[source_index++]);
      else
        this.emit('end');
      return true
    })
  }
  var s = new Stream$3(), i = 0;
  s.ended = false;
  s.started = false;
  s.readable = true;
  s.writable = false;
  s.paused = false;
  s.ended = false;
  s.pause = function () {
    s.started = true;
    s.paused = true;
  };
  function next () {
    s.started = true;
    if(s.ended) return
    while(!s.ended && !s.paused && source.call(s, i++, function () {
      if(!s.ended && !s.paused)
          process.nextTick(next);
    }))
      ;
  }
  s.resume = function () {
    s.started = true;
    s.paused = false;
    next();
  };
  s.on('end', function () {
    s.ended = true;
    s.readable = false;
    process.nextTick(s.destroy);
  });
  s.destroy = function () {
    s.ended = true;
    s.emit('close'); 
  };
  /*
    by default, the stream will start emitting at nextTick
    if you want, you can pause it, after pipeing.
    you can also resume before next tick, and that will also
    work.
  */
  process.nextTick(function () {
    if(!s.started) s.resume();
  });
  return s
};

var Stream$2 = require$$0__default$1["default"];
var writeMethods = ["write", "end", "destroy"];
var readMethods = ["resume", "pause"];
var readEvents = ["data", "close"];
var slice$1 = Array.prototype.slice;

var duplexer$1 = duplex;

function forEach (arr, fn) {
    if (arr.forEach) {
        return arr.forEach(fn)
    }

    for (var i = 0; i < arr.length; i++) {
        fn(arr[i], i);
    }
}

function duplex(writer, reader) {
    var stream = new Stream$2();
    var ended = false;

    forEach(writeMethods, proxyWriter);

    forEach(readMethods, proxyReader);

    forEach(readEvents, proxyStream);

    reader.on("end", handleEnd);

    writer.on("drain", function() {
      stream.emit("drain");
    });

    writer.on("error", reemit);
    reader.on("error", reemit);

    stream.writable = writer.writable;
    stream.readable = reader.readable;

    return stream

    function proxyWriter(methodName) {
        stream[methodName] = method;

        function method() {
            return writer[methodName].apply(writer, arguments)
        }
    }

    function proxyReader(methodName) {
        stream[methodName] = method;

        function method() {
            stream.emit(methodName);
            var func = reader[methodName];
            if (func) {
                return func.apply(reader, arguments)
            }
            reader.emit(methodName);
        }
    }

    function proxyStream(methodName) {
        reader.on(methodName, reemit);

        function reemit() {
            var args = slice$1.call(arguments);
            args.unshift(methodName);
            stream.emit.apply(stream, args);
        }
    }

    function handleEnd() {
        if (ended) {
            return
        }
        ended = true;
        var args = slice$1.call(arguments);
        args.unshift("end");
        stream.emit.apply(stream, args);
    }

    function reemit(err) {
        stream.emit("error", err);
    }
}

//filter will reemit the data if cb(err,pass) pass is truthy

// reduce is more tricky
// maybe we want to group the reductions or emit progress updates occasionally
// the most basic reduce just emits one 'data' event after it has recieved 'end'


var Stream$1 = require$$0__default$1["default"].Stream;


//create an event stream and apply function to each .write
//emitting each response as data
//unless it's an empty callback

var mapStream = function (mapper, opts) {

  var stream = new Stream$1()
    , self = this
    , inputs = 0
    , outputs = 0
    , ended = false
    , paused = false
    , destroyed = false
    , lastWritten = 0
    , inNext = false;

  this.opts = opts || {};
  var errorEventName = this.opts.failures ? 'failure' : 'error';

  // Items that are not ready to be written yet (because they would come out of
  // order) get stuck in a queue for later.
  var writeQueue = {};

  stream.writable = true;
  stream.readable = true;

  function queueData (data, number) {
    var nextToWrite = lastWritten + 1;

    if (number === nextToWrite) {
      // If it's next, and its not undefined write it
      if (data !== undefined) {
        stream.emit.apply(stream, ['data', data]);
      }
      lastWritten ++;
      nextToWrite ++;
    } else {
      // Otherwise queue it for later.
      writeQueue[number] = data;
    }

    // If the next value is in the queue, write it
    if (writeQueue.hasOwnProperty(nextToWrite)) {
      var dataToWrite = writeQueue[nextToWrite];
      delete writeQueue[nextToWrite];
      return queueData(dataToWrite, nextToWrite)
    }

    outputs ++;
    if(inputs === outputs) {
      if(paused) paused = false, stream.emit('drain'); //written all the incoming events
      if(ended) end();
    }
  }

  function next (err, data, number) {
    if(destroyed) return
    inNext = true;

    if (!err || self.opts.failures) {
      queueData(data, number);
    }

    if (err) {
      stream.emit.apply(stream, [ errorEventName, err ]);
    }

    inNext = false;
  }

  // Wrap the mapper function by calling its callback with the order number of
  // the item in the stream.
  function wrappedMapper (input, number, callback) {
    return mapper.call(null, input, function(err, data){
      callback(err, data, number);
    })
  }

  stream.write = function (data) {
    if(ended) throw new Error('map stream is not writable')
    inNext = false;
    inputs ++;

    try {
      //catch sync errors and handle them like async errors
      var written = wrappedMapper(data, inputs, next);
      paused = (written === false);
      return !paused
    } catch (err) {
      //if the callback has been called syncronously, and the error
      //has occured in an listener, throw it again.
      if(inNext)
        throw err
      next(err);
      return !paused
    }
  };

  function end (data) {
    //if end was called with args, write it, 
    ended = true; //write will emit 'end' if ended is true
    stream.writable = false;
    if(data !== undefined) {
      return queueData(data, inputs)
    } else if (inputs == outputs) { //wait for processing 
      stream.readable = false, stream.emit('end'), stream.destroy(); 
    }
  }

  stream.end = function (data) {
    if(ended) return
    end();
  };

  stream.destroy = function () {
    ended = destroyed = true;
    stream.writable = stream.readable = paused = false;
    process.nextTick(function () {
      stream.emit('close');
    });
  };
  stream.pause = function () {
    paused = true;
  };

  stream.resume = function () {
    paused = false;
  };

  return stream
};

var pauseStream = {exports: {}};

(function (module) {
	//through@2 handles this by default!
	module.exports = through$1.exports;
} (pauseStream));

//filter will reemit the data if cb(err,pass) pass is truthy

// reduce is more tricky
// maybe we want to group the reductions or emit progress updates occasionally
// the most basic reduce just emits one 'data' event after it has recieved 'end'


var through = through$1.exports;
var Decoder = require$$1__default["default"].StringDecoder;

var split_1 = split;

//TODO pass in a function to map across the lines.

function split (matcher, mapper, options) {
  var decoder = new Decoder();
  var soFar = '';
  var maxLength = options && options.maxLength;
  if('function' === typeof matcher)
    mapper = matcher, matcher = null;
  if (!matcher)
    matcher = /\r?\n/;

  function emit(stream, piece) {
    if(mapper) {
      try {
        piece = mapper(piece);
      }
      catch (err) {
        return stream.emit('error', err)
      }
      if('undefined' !== typeof piece)
        stream.queue(piece);
    }
    else
      stream.queue(piece);
  }

  function next (stream, buffer) {
    var pieces = ((soFar != null ? soFar : '') + buffer).split(matcher);
    soFar = pieces.pop();

    if (maxLength && soFar.length > maxLength)
      stream.emit('error', new Error('maximum buffer reached'));

    for (var i = 0; i < pieces.length; i++) {
      var piece = pieces[i];
      emit(stream, piece);
    }
  }

  return through(function (b) {
    next(this, decoder.write(b));
  },
  function () {
    if(decoder.end)
      next(this, decoder.end());
    if(soFar != null)
      emit(this, soFar);
    this.queue(null);
  })
}

var duplexer = duplexer$1;

var streamCombiner = function () {

  var streams = [].slice.call(arguments)
    , first = streams[0]
    , last = streams[streams.length - 1]
    , thepipe = duplexer(first, last);

  if(streams.length == 1)
    return streams[0]
  else if (!streams.length)
    throw new Error('connect called with empty args')

  //pipe all the streams together

  function recurse (streams) {
    if(streams.length < 2)
      return
    streams[0].pipe(streams[1]);
    recurse(streams.slice(1));  
  }
  
  recurse(streams);
 
  function onerror () {
    var args = [].slice.call(arguments);
    args.unshift('error');
    thepipe.emit.apply(thepipe, args);
  }
  
  //es.duplex already reemits the error from the first and last stream.
  //add a listener for the inner streams in the pipeline.
  for(var i = 1; i < streams.length - 1; i ++)
    streams[i].on('error', onerror);

  return thepipe
};

(function (exports) {
	//filter will reemit the data if cb(err,pass) pass is truthy

	// reduce is more tricky
	// maybe we want to group the reductions or emit progress updates occasionally
	// the most basic reduce just emits one 'data' event after it has recieved 'end'

	var Stream = require$$0__default$1["default"].Stream
	  , es = exports
	  , through = through$1.exports
	  , from$1 = from
	  , duplex = duplexer$1
	  , map = mapStream
	  , pause = pauseStream.exports
	  , split = split_1
	  , pipeline = streamCombiner
	  , immediately = commonjsGlobal.setImmediate || process.nextTick;

	es.Stream = Stream; //re-export Stream from core
	es.through = through;
	es.from = from$1;
	es.duplex = duplex;
	es.map = map;
	es.pause = pause;
	es.split = split;
	es.pipeline = es.connect = es.pipe = pipeline;
	// merge / concat
	//
	// combine multiple streams into a single stream.
	// will emit end only once

	es.concat = //actually this should be called concat
	es.merge = function (/*streams...*/) {
	  var toMerge = [].slice.call(arguments);
	  if (toMerge.length === 1 && (toMerge[0] instanceof Array)) {
	    toMerge = toMerge[0]; //handle array as arguments object
	  }
	  var stream = new Stream();
	  stream.setMaxListeners(0); // allow adding more than 11 streams
	  var endCount = 0;
	  stream.writable = stream.readable = true;

	  if (toMerge.length) {
	    toMerge.forEach(function (e) {
	      e.pipe(stream, {end: false});
	      var ended = false;
	      e.on('end', function () {
	        if(ended) return
	        ended = true;
	        endCount ++;
	        if(endCount == toMerge.length)
	          stream.emit('end');
	      });
	    });
	  } else {
	    process.nextTick(function () {
	      stream.emit('end');
	    });
	  }
	  
	  stream.write = function (data) {
	    this.emit('data', data);
	  };
	  stream.destroy = function () {
	    toMerge.forEach(function (e) {
	      if(e.destroy) e.destroy();
	    });
	  };
	  return stream
	};


	// writable stream, collects all events into an array
	// and calls back when 'end' occurs
	// mainly I'm using this to test the other functions

	es.writeArray = function (done) {
	  if ('function' !== typeof done)
	    throw new Error('function writeArray (done): done must be function')

	  var a = new Stream ()
	    , array = [], isDone = false;
	  a.write = function (l) {
	    array.push(l);
	  };
	  a.end = function () {
	    isDone = true;
	    done(null, array);
	  };
	  a.writable = true;
	  a.readable = false;
	  a.destroy = function () {
	    a.writable = a.readable = false;
	    if(isDone) return
	    done(new Error('destroyed before end'), array);
	  };
	  return a
	};

	//return a Stream that reads the properties of an object
	//respecting pause() and resume()

	es.readArray = function (array) {
	  var stream = new Stream()
	    , i = 0
	    , paused = false
	    , ended = false;

	  stream.readable = true;
	  stream.writable = false;

	  if(!Array.isArray(array))
	    throw new Error('event-stream.read expects an array')

	  stream.resume = function () {
	    if(ended) return
	    paused = false;
	    var l = array.length;
	    while(i < l && !paused && !ended) {
	      stream.emit('data', array[i++]);
	    }
	    if(i == l && !ended)
	      ended = true, stream.readable = false, stream.emit('end');
	  };
	  process.nextTick(stream.resume);
	  stream.pause = function () {
	     paused = true;
	  };
	  stream.destroy = function () {
	    ended = true;
	    stream.emit('close');
	  };
	  return stream
	};

	//
	// readable (asyncFunction)
	// return a stream that calls an async function while the stream is not paused.
	//
	// the function must take: (count, callback) {...
	//

	es.readable =
	function (func, continueOnError) {
	  var stream = new Stream()
	    , i = 0
	    , paused = false
	    , ended = false
	    , reading = false;

	  stream.readable = true;
	  stream.writable = false;

	  if('function' !== typeof func)
	    throw new Error('event-stream.readable expects async function')

	  stream.on('end', function () { ended = true; });

	  function get (err, data) {

	    if(err) {
	      stream.emit('error', err);
	      if(!continueOnError) stream.emit('end');
	    } else if (arguments.length > 1)
	      stream.emit('data', data);

	    immediately(function () {
	      if(ended || paused || reading) return
	      try {
	        reading = true;
	        func.call(stream, i++, function () {
	          reading = false;
	          get.apply(null, arguments);
	        });
	      } catch (err) {
	        stream.emit('error', err);
	      }
	    });
	  }
	  stream.resume = function () {
	    paused = false;
	    get();
	  };
	  process.nextTick(get);
	  stream.pause = function () {
	     paused = true;
	  };
	  stream.destroy = function () {
	    stream.emit('end');
	    stream.emit('close');
	    ended = true;
	  };
	  return stream
	};


	//
	// map sync
	//

	es.mapSync = function (sync) {
	  return es.through(function write(data) {
	    var mappedData;
	    try {
	      mappedData = sync(data);
	    } catch (err) {
	      return this.emit('error', err)
	    }
	    if (mappedData !== undefined)
	      this.emit('data', mappedData);
	  })
	};

	//
	// log just print out what is coming through the stream, for debugging
	//

	es.log = function (name) {
	  return es.through(function (data) {
	    [].slice.call(arguments);
	    if(name) console.error(name, data);
	    else     console.error(data);
	    this.emit('data', data);
	  })
	};


	//
	// child -- pipe through a child process
	//

	es.child = function (child) {

	  return es.duplex(child.stdin, child.stdout)

	};

	//
	// parse
	//
	// must be used after es.split() to ensure that each chunk represents a line
	// source.pipe(es.split()).pipe(es.parse())

	es.parse = function (options) {
	  var emitError = !!(options ? options.error : false);
	  return es.through(function (data) {
	    var obj;
	    try {
	      if(data) //ignore empty lines
	        obj = JSON.parse(data.toString());
	    } catch (err) {
	      if (emitError)
	        return this.emit('error', err)
	      return console.error(err, 'attempting to parse:', data)
	    }
	    //ignore lines that where only whitespace.
	    if(obj !== undefined)
	      this.emit('data', obj);
	  })
	};
	//
	// stringify
	//

	es.stringify = function () {
	  var Buffer = require$$8__default["default"].Buffer;
	  return es.mapSync(function (e){
	    return JSON.stringify(Buffer.isBuffer(e) ? e.toString() : e) + '\n'
	  })
	};

	//
	// replace a string within a stream.
	//
	// warn: just concatenates the string and then does str.split().join().
	// probably not optimal.
	// for smallish responses, who cares?
	// I need this for shadow-npm so it's only relatively small json files.

	es.replace = function (from, to) {
	  return es.pipeline(es.split(from), es.join(to))
	};

	//
	// join chunks with a joiner. just like Array#join
	// also accepts a callback that is passed the chunks appended together
	// this is still supported for legacy reasons.
	//

	es.join = function (str) {

	  //legacy api
	  if('function' === typeof str)
	    return es.wait(str)

	  var first = true;
	  return es.through(function (data) {
	    if(!first)
	      this.emit('data', str);
	    first = false;
	    this.emit('data', data);
	    return true
	  })
	};


	//
	// wait. callback when 'end' is emitted, with all chunks appended as string.
	//

	es.wait = function (callback) {
	  var arr = [];
	  return es.through(function (data) { arr.push(data); },
	    function () {
	      var body = Buffer.isBuffer(arr[0]) ? Buffer.concat(arr)
	        : arr.join('');
	      this.emit('data', body);
	      this.emit('end');
	      if(callback) callback(null, body);
	    })
	};

	es.pipeable = function () {
	  throw new Error('[EVENT-STREAM] es.pipeable is deprecated')
	};
} (eventStream));

var spawn = require$$0__default$5["default"].spawn,
    es    = eventStream;

var psTree$1 = function childrenOfPid(pid, callback) {
  var headers = null;

  if (typeof callback !== 'function') {
    throw new Error('childrenOfPid(pid, callback) expects callback');
  }

  if (typeof pid === 'number') {
    pid = pid.toString();
  }

  //
  // The `ps-tree` module behaves differently on *nix vs. Windows
  // by spawning different programs and parsing their output.
  //
  // Linux:
  // 1. " <defunct> " need to be striped
  // ```bash
  // $ ps -A -o comm,ppid,pid,stat
  // COMMAND          PPID   PID STAT
  // bbsd             2899 16958 Ss
  // watch <defunct>  1914 16964 Z
  // ps              20688 16965 R+
  // ```
  //
  // Win32:
  // 1. wmic PROCESS WHERE ParentProcessId=4604 GET Name,ParentProcessId,ProcessId,Status)
  // 2. The order of head columns is fixed
  // ```shell
  // > wmic PROCESS GET Name,ProcessId,ParentProcessId,Status
  // Name                          ParentProcessId  ProcessId   Status
  // System Idle Process           0                0
  // System                        0                4
  // smss.exe                      4                228
  // ```

  var processLister;
  if (process.platform === 'win32') {
    // See also: https://github.com/nodejs/node-v0.x-archive/issues/2318
    processLister = spawn('wmic.exe', ['PROCESS', 'GET', 'Name,ProcessId,ParentProcessId,Status']);
  } else {
    processLister = spawn('ps', ['-A', '-o', 'ppid,pid,stat,comm']);
  }

  es.connect(
    // spawn('ps', ['-A', '-o', 'ppid,pid,stat,comm']).stdout,
    processLister.stdout,
    es.split(),
    es.map(function (line, cb) { //this could parse alot of unix command output
      var columns = line.trim().split(/\s+/);
      if (!headers) {
        headers = columns;

        //
        // Rename Win32 header name, to as same as the linux, for compatible.
        //
        headers = headers.map(normalizeHeader);
        return cb();
      }

      var row = {};
      // For each header
      var h = headers.slice();
      while (h.length) {
        row[h.shift()] = h.length ? columns.shift() : columns.join(' ');
      }

      return cb(null, row);
    }),
    es.writeArray(function (err, ps) {
      var parents = {},
          children = [];

      parents[pid] = true;
      ps.forEach(function (proc) {
        if (parents[proc.PPID]) {
          parents[proc.PID] = true;
          children.push(proc);
        }
      });

      callback(null, children);
    })
  ).on('error', callback);
};

/**
 * Normalizes the given header `str` from the Windows
 * title to the *nix title.
 *
 * @param {string} str Header string to normalize
 */
function normalizeHeader(str) {
  if (process.platform !== 'win32') {
    return str;
  }

  switch (str) {
    case 'Name':
      return 'COMMAND';
    case 'ParentProcessId':
      return 'PPID';
    case 'ProcessId':
      return 'PID';
    case 'Status':
      return 'STAT';
    default:
      throw new Error('Unknown process listing header: ' + str);
  }
}

// Copyright 2022 Google LLC
const psTree = node_util.promisify(psTree$1);
function noop$1() { }
function quote(arg) {
    if (/^[a-z0-9/_.-]+$/i.test(arg) || arg === '') {
        return arg;
    }
    return (`$'` +
        arg
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/\f/g, '\\f')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t')
            .replace(/\v/g, '\\v')
            .replace(/\0/g, '\\0') +
        `'`);
}
function exitCodeInfo(exitCode) {
    return {
        2: 'Misuse of shell builtins',
        126: 'Invoked command cannot execute',
        127: 'Command not found',
        128: 'Invalid exit argument',
        129: 'Hangup',
        130: 'Interrupt',
        131: 'Quit and dump core',
        132: 'Illegal instruction',
        133: 'Trace/breakpoint trap',
        134: 'Process aborted',
        135: 'Bus error: "access to undefined portion of memory object"',
        136: 'Floating point exception: "erroneous arithmetic operation"',
        137: 'Kill (terminate immediately)',
        138: 'User-defined 1',
        139: 'Segmentation violation',
        140: 'User-defined 2',
        141: 'Write to pipe with no one reading',
        142: 'Signal raised by alarm',
        143: 'Termination (request to terminate)',
        145: 'Child process terminated, stopped (or continued*)',
        146: 'Continue if stopped',
        147: 'Stop executing temporarily',
        148: 'Terminal stop signal',
        149: 'Background process attempting to read from tty ("in")',
        150: 'Background process attempting to write to tty ("out")',
        151: 'Urgent data available on socket',
        152: 'CPU time limit exceeded',
        153: 'File size limit exceeded',
        154: 'Signal raised by timer counting virtual time: "virtual timer expired"',
        155: 'Profiling timer expired',
        157: 'Pollable event',
        159: 'Bad syscall',
    }[exitCode || -1];
}
function errnoMessage(errno) {
    if (errno === undefined) {
        return 'Unknown error';
    }
    return ({
        0: 'Success',
        1: 'Not super-user',
        2: 'No such file or directory',
        3: 'No such process',
        4: 'Interrupted system call',
        5: 'I/O error',
        6: 'No such device or address',
        7: 'Arg list too long',
        8: 'Exec format error',
        9: 'Bad file number',
        10: 'No children',
        11: 'No more processes',
        12: 'Not enough core',
        13: 'Permission denied',
        14: 'Bad address',
        15: 'Block device required',
        16: 'Mount device busy',
        17: 'File exists',
        18: 'Cross-device link',
        19: 'No such device',
        20: 'Not a directory',
        21: 'Is a directory',
        22: 'Invalid argument',
        23: 'Too many open files in system',
        24: 'Too many open files',
        25: 'Not a typewriter',
        26: 'Text file busy',
        27: 'File too large',
        28: 'No space left on device',
        29: 'Illegal seek',
        30: 'Read only file system',
        31: 'Too many links',
        32: 'Broken pipe',
        33: 'Math arg out of domain of func',
        34: 'Math result not representable',
        35: 'File locking deadlock error',
        36: 'File or path name too long',
        37: 'No record locks available',
        38: 'Function not implemented',
        39: 'Directory not empty',
        40: 'Too many symbolic links',
        42: 'No message of desired type',
        43: 'Identifier removed',
        44: 'Channel number out of range',
        45: 'Level 2 not synchronized',
        46: 'Level 3 halted',
        47: 'Level 3 reset',
        48: 'Link number out of range',
        49: 'Protocol driver not attached',
        50: 'No CSI structure available',
        51: 'Level 2 halted',
        52: 'Invalid exchange',
        53: 'Invalid request descriptor',
        54: 'Exchange full',
        55: 'No anode',
        56: 'Invalid request code',
        57: 'Invalid slot',
        59: 'Bad font file fmt',
        60: 'Device not a stream',
        61: 'No data (for no delay io)',
        62: 'Timer expired',
        63: 'Out of streams resources',
        64: 'Machine is not on the network',
        65: 'Package not installed',
        66: 'The object is remote',
        67: 'The link has been severed',
        68: 'Advertise error',
        69: 'Srmount error',
        70: 'Communication error on send',
        71: 'Protocol error',
        72: 'Multihop attempted',
        73: 'Cross mount point (not really error)',
        74: 'Trying to read unreadable message',
        75: 'Value too large for defined data type',
        76: 'Given log. name not unique',
        77: 'f.d. invalid for this operation',
        78: 'Remote address changed',
        79: 'Can   access a needed shared lib',
        80: 'Accessing a corrupted shared lib',
        81: '.lib section in a.out corrupted',
        82: 'Attempting to link in too many libs',
        83: 'Attempting to exec a shared library',
        84: 'Illegal byte sequence',
        86: 'Streams pipe error',
        87: 'Too many users',
        88: 'Socket operation on non-socket',
        89: 'Destination address required',
        90: 'Message too long',
        91: 'Protocol wrong type for socket',
        92: 'Protocol not available',
        93: 'Unknown protocol',
        94: 'Socket type not supported',
        95: 'Not supported',
        96: 'Protocol family not supported',
        97: 'Address family not supported by protocol family',
        98: 'Address already in use',
        99: 'Address not available',
        100: 'Network interface is not configured',
        101: 'Network is unreachable',
        102: 'Connection reset by network',
        103: 'Connection aborted',
        104: 'Connection reset by peer',
        105: 'No buffer space available',
        106: 'Socket is already connected',
        107: 'Socket is not connected',
        108: "Can't send after socket shutdown",
        109: 'Too many references',
        110: 'Connection timed out',
        111: 'Connection refused',
        112: 'Host is down',
        113: 'Host is unreachable',
        114: 'Socket already connected',
        115: 'Connection already in progress',
        116: 'Stale file handle',
        122: 'Quota exceeded',
        123: 'No medium (in tape drive)',
        125: 'Operation canceled',
        130: 'Previous owner died',
        131: 'State not recoverable',
    }[-errno] || 'Unknown error');
}
function parseDuration(d) {
    if (typeof d == 'number') {
        if (isNaN(d) || d < 0)
            throw new Error(`Invalid duration: "${d}".`);
        return d;
    }
    else if (/\d+s/.test(d)) {
        return +d.slice(0, -1) * 1000;
    }
    else if (/\d+ms/.test(d)) {
        return +d.slice(0, -2);
    }
    throw new Error(`Unknown duration: "${d}".`);
}
function formatCmd(cmd) {
    if (cmd == undefined)
        return chalk.grey('undefined');
    const chars = [...cmd];
    let out = '$ ';
    let buf = '';
    let ch;
    let state = root;
    let wordCount = 0;
    while (state) {
        ch = chars.shift() || 'EOF';
        if (ch == '\n') {
            out += style(state, buf) + '\n> ';
            buf = '';
            continue;
        }
        const next = ch == 'EOF' ? undefined : state();
        if (next != state) {
            out += style(state, buf);
            buf = '';
        }
        state = next == root ? next() : next;
        buf += ch;
    }
    function style(state, s) {
        if (s == '')
            return '';
        if (reservedWords.includes(s)) {
            return chalk.cyanBright(s);
        }
        if (state == word && wordCount == 0) {
            wordCount++;
            return chalk.greenBright(s);
        }
        if (state == syntax) {
            wordCount = 0;
            return chalk.cyanBright(s);
        }
        if (state == dollar)
            return chalk.yellowBright(s);
        if (state?.name.startsWith('str'))
            return chalk.yellowBright(s);
        return s;
    }
    function isSyntax(ch) {
        return '()[]{}<>;:+|&='.includes(ch);
    }
    function root() {
        if (/\s/.test(ch))
            return space;
        if (isSyntax(ch))
            return syntax;
        if (/[$]/.test(ch))
            return dollar;
        if (/["]/.test(ch))
            return strDouble;
        if (/[']/.test(ch))
            return strSingle;
        return word;
    }
    function space() {
        if (/\s/.test(ch))
            return space;
        return root;
    }
    function word() {
        if (/[0-9a-z/_.]/i.test(ch))
            return word;
        return root;
    }
    function syntax() {
        if (isSyntax(ch))
            return syntax;
        return root;
    }
    function dollar() {
        if (/[']/.test(ch))
            return str;
        return root;
    }
    function str() {
        if (/[']/.test(ch))
            return strEnd;
        if (/[\\]/.test(ch))
            return strBackslash;
        return str;
    }
    function strBackslash() {
        return strEscape;
    }
    function strEscape() {
        return str;
    }
    function strDouble() {
        if (/["]/.test(ch))
            return strEnd;
        return strDouble;
    }
    function strSingle() {
        if (/[']/.test(ch))
            return strEnd;
        return strSingle;
    }
    function strEnd() {
        return root;
    }
    return out + '\n';
}
const reservedWords = [
    'if',
    'then',
    'else',
    'elif',
    'fi',
    'case',
    'esac',
    'for',
    'select',
    'while',
    'until',
    'do',
    'done',
    'in',
];

// Copyright 2021 Google LLC
const processCwd = Symbol('processCwd');
const storage = new node_async_hooks.AsyncLocalStorage();
const hook = node_async_hooks.createHook({
    init: syncCwd,
    before: syncCwd,
    promiseResolve: syncCwd,
    after: syncCwd,
    destroy: syncCwd,
});
hook.enable();
const defaults = {
    [processCwd]: process.cwd(),
    verbose: true,
    env: process.env,
    shell: true,
    prefix: '',
    quote,
    spawn: node_child_process.spawn,
    log,
};
try {
    if (process.platform !== 'win32') {
        defaults.shell = which_1.sync('bash');
        defaults.prefix = 'set -euo pipefail;';
    }
}
catch (err) {
    // ¯\_(ツ)_/¯
}
function getStore() {
    return storage.getStore() || defaults;
}
const $ = new Proxy(function (pieces, ...args) {
    const from = new Error().stack.split(/^\s*at\s/m)[2].trim();
    if (pieces.some((p) => p == undefined)) {
        throw new Error(`Malformed command at ${from}`);
    }
    let resolve, reject;
    let promise = new ProcessPromise((...args) => ([resolve, reject] = args));
    let cmd = pieces[0], i = 0;
    while (i < args.length) {
        let s;
        if (Array.isArray(args[i])) {
            s = args[i].map((x) => $.quote(substitute(x))).join(' ');
        }
        else {
            s = $.quote(substitute(args[i]));
        }
        cmd += s + pieces[++i];
    }
    promise._bind(cmd, from, resolve, reject, getStore());
    setImmediate(() => promise._run()); // Postpone run to allow promise configuration.
    return promise;
}, {
    set(_, key, value) {
        Reflect.set(getStore(), key, value);
        return true;
    },
    get(_, key) {
        return Reflect.get(getStore(), key);
    },
});
function substitute(arg) {
    if (arg?.stdout) {
        return arg.stdout.replace(/\n$/, '');
    }
    return `${arg}`;
}
class ProcessPromise extends Promise {
    constructor() {
        super(...arguments);
        this._command = '';
        this._from = '';
        this._resolve = noop$1;
        this._reject = noop$1;
        this._snapshot = getStore();
        this._stdio = ['inherit', 'pipe', 'pipe'];
        this._nothrow = false;
        this._quiet = false;
        this._resolved = false;
        this._piped = false;
        this._prerun = noop$1;
        this._postrun = noop$1;
    }
    _bind(cmd, from, resolve, reject, options) {
        this._command = cmd;
        this._from = from;
        this._resolve = resolve;
        this._reject = reject;
        this._snapshot = { ...options };
    }
    _run() {
        const $ = this._snapshot;
        if (this.child)
            return; // The _run() can be called from a few places.
        this._prerun(); // In case $1.pipe($2), the $2 returned, and on $2._run() invoke $1._run().
        $.log({
            kind: 'cmd',
            cmd: this._command,
            verbose: $.verbose && !this._quiet,
        });
        this.child = node_child_process.spawn($.prefix + this._command, {
            cwd: $.cwd ?? $[processCwd],
            shell: typeof $.shell === 'string' ? $.shell : true,
            stdio: this._stdio,
            windowsHide: true,
            env: $.env,
        });
        this.child.on('close', (code, signal) => {
            let message = `exit code: ${code}`;
            if (code != 0 || signal != null) {
                message = `${stderr || '\n'}    at ${this._from}`;
                message += `\n    exit code: ${code}${exitCodeInfo(code) ? ' (' + exitCodeInfo(code) + ')' : ''}`;
                if (signal != null) {
                    message += `\n    signal: ${signal}`;
                }
            }
            let output = new ProcessOutput(code, signal, stdout, stderr, combined, message);
            if (code === 0 || this._nothrow) {
                this._resolve(output);
            }
            else {
                this._reject(output);
            }
            this._resolved = true;
        });
        this.child.on('error', (err) => {
            const message = `${err.message}\n` +
                `    errno: ${err.errno} (${errnoMessage(err.errno)})\n` +
                `    code: ${err.code}\n` +
                `    at ${this._from}`;
            this._reject(new ProcessOutput(null, null, stdout, stderr, combined, message));
            this._resolved = true;
        });
        let stdout = '', stderr = '', combined = '';
        let onStdout = (data) => {
            $.log({ kind: 'stdout', data, verbose: $.verbose && !this._quiet });
            stdout += data;
            combined += data;
        };
        let onStderr = (data) => {
            $.log({ kind: 'stderr', data, verbose: $.verbose && !this._quiet });
            stderr += data;
            combined += data;
        };
        if (!this._piped)
            this.child.stdout?.on('data', onStdout); // If process is piped, don't collect or print output.
        this.child.stderr?.on('data', onStderr); // Stderr should be printed regardless of piping.
        this._postrun(); // In case $1.pipe($2), after both subprocesses are running, we can pipe $1.stdout to $2.stdin.
        if (this._timeout && this._timeoutSignal) {
            const t = setTimeout(() => this.kill(this._timeoutSignal), this._timeout);
            this.finally(() => clearTimeout(t)).catch(noop$1);
        }
    }
    get stdin() {
        this.stdio('pipe');
        this._run();
        assert__default["default"](this.child);
        if (this.child.stdin == null)
            throw new Error('The stdin of subprocess is null.');
        return this.child.stdin;
    }
    get stdout() {
        this._run();
        assert__default["default"](this.child);
        if (this.child.stdout == null)
            throw new Error('The stdout of subprocess is null.');
        return this.child.stdout;
    }
    get stderr() {
        this._run();
        assert__default["default"](this.child);
        if (this.child.stderr == null)
            throw new Error('The stderr of subprocess is null.');
        return this.child.stderr;
    }
    get exitCode() {
        return this.then((p) => p.exitCode, (p) => p.exitCode);
    }
    pipe(dest) {
        if (typeof dest == 'string')
            throw new Error('The pipe() method does not take strings. Forgot $?');
        if (this._resolved) {
            if (dest instanceof ProcessPromise)
                dest.stdin.end(); // In case of piped stdin, we may want to close stdin of dest as well.
            throw new Error("The pipe() method shouldn't be called after promise is already resolved!");
        }
        this._piped = true;
        if (dest instanceof ProcessPromise) {
            dest.stdio('pipe');
            dest._prerun = this._run.bind(this);
            dest._postrun = () => {
                if (!dest.child)
                    throw new Error('Access to stdin of pipe destination without creation a subprocess.');
                this.stdout.pipe(dest.stdin);
            };
            return dest;
        }
        else {
            this._postrun = () => this.stdout.pipe(dest);
            return this;
        }
    }
    async kill(signal = 'SIGTERM') {
        if (!this.child)
            throw new Error('Trying to kill a process without creating one.');
        if (!this.child.pid)
            throw new Error('The process pid is undefined.');
        let children = await psTree(this.child.pid);
        for (const p of children) {
            try {
                process.kill(+p.PID, signal);
            }
            catch (e) { }
        }
        try {
            process.kill(this.child.pid, signal);
        }
        catch (e) { }
    }
    stdio(stdin, stdout = 'pipe', stderr = 'pipe') {
        this._stdio = [stdin, stdout, stderr];
        return this;
    }
    nothrow() {
        this._nothrow = true;
        return this;
    }
    quiet() {
        this._quiet = true;
        return this;
    }
    timeout(d, signal = 'SIGTERM') {
        this._timeout = parseDuration(d);
        this._timeoutSignal = signal;
        return this;
    }
}
class ProcessOutput extends Error {
    constructor(code, signal, stdout, stderr, combined, message) {
        super(message);
        this._code = code;
        this._signal = signal;
        this._stdout = stdout;
        this._stderr = stderr;
        this._combined = combined;
    }
    toString() {
        return this._combined;
    }
    get stdout() {
        return this._stdout;
    }
    get stderr() {
        return this._stderr;
    }
    get exitCode() {
        return this._code;
    }
    get signal() {
        return this._signal;
    }
    [node_util.inspect.custom]() {
        let stringify = (s, c) => s.length === 0 ? "''" : c(node_util.inspect(s));
        return `ProcessOutput {
  stdout: ${stringify(this.stdout, chalk.green)},
  stderr: ${stringify(this.stderr, chalk.red)},
  signal: ${node_util.inspect(this.signal)},
  exitCode: ${(this.exitCode === 0 ? chalk.green : chalk.red)(this.exitCode)}${exitCodeInfo(this.exitCode)
            ? chalk.grey(' (' + exitCodeInfo(this.exitCode) + ')')
            : ''}
}`;
    }
}
function syncCwd() {
    if ($[processCwd] != process.cwd())
        process.chdir($[processCwd]);
}
function cd(dir) {
    $.log({ kind: 'cd', dir });
    process.chdir(dir);
    $[processCwd] = process.cwd();
}
function log(entry) {
    switch (entry.kind) {
        case 'cmd':
            if (!entry.verbose)
                return;
            process.stderr.write(formatCmd(entry.cmd));
            break;
        case 'stdout':
        case 'stderr':
            if (!entry.verbose)
                return;
            process.stderr.write(entry.data);
            break;
        case 'cd':
            if (!$.verbose)
                return;
            process.stderr.write('$ ' + chalk.greenBright('cd') + ` ${entry.dir}\n`);
            break;
        case 'fetch':
            if (!$.verbose)
                return;
            const init = entry.init ? ' ' + node_util.inspect(entry.init) : '';
            process.stderr.write('$ ' + chalk.greenBright('fetch') + ` ${entry.url}${init}\n`);
            break;
        case 'retry':
            if (!$.verbose)
                return;
            process.stderr.write(entry.error + '\n');
    }
}

/*
 * merge2
 * https://github.com/teambition/merge2
 *
 * Copyright (c) 2014-2020 Teambition
 * Licensed under the MIT license.
 */
const Stream = require$$0__default$1["default"];
const PassThrough = Stream.PassThrough;
const slice = Array.prototype.slice;

var merge2_1 = merge2$1;

function merge2$1 () {
  const streamsQueue = [];
  const args = slice.call(arguments);
  let merging = false;
  let options = args[args.length - 1];

  if (options && !Array.isArray(options) && options.pipe == null) {
    args.pop();
  } else {
    options = {};
  }

  const doEnd = options.end !== false;
  const doPipeError = options.pipeError === true;
  if (options.objectMode == null) {
    options.objectMode = true;
  }
  if (options.highWaterMark == null) {
    options.highWaterMark = 64 * 1024;
  }
  const mergedStream = PassThrough(options);

  function addStream () {
    for (let i = 0, len = arguments.length; i < len; i++) {
      streamsQueue.push(pauseStreams(arguments[i], options));
    }
    mergeStream();
    return this
  }

  function mergeStream () {
    if (merging) {
      return
    }
    merging = true;

    let streams = streamsQueue.shift();
    if (!streams) {
      process.nextTick(endStream);
      return
    }
    if (!Array.isArray(streams)) {
      streams = [streams];
    }

    let pipesCount = streams.length + 1;

    function next () {
      if (--pipesCount > 0) {
        return
      }
      merging = false;
      mergeStream();
    }

    function pipe (stream) {
      function onend () {
        stream.removeListener('merge2UnpipeEnd', onend);
        stream.removeListener('end', onend);
        if (doPipeError) {
          stream.removeListener('error', onerror);
        }
        next();
      }
      function onerror (err) {
        mergedStream.emit('error', err);
      }
      // skip ended stream
      if (stream._readableState.endEmitted) {
        return next()
      }

      stream.on('merge2UnpipeEnd', onend);
      stream.on('end', onend);

      if (doPipeError) {
        stream.on('error', onerror);
      }

      stream.pipe(mergedStream, { end: false });
      // compatible for old stream
      stream.resume();
    }

    for (let i = 0; i < streams.length; i++) {
      pipe(streams[i]);
    }

    next();
  }

  function endStream () {
    merging = false;
    // emit 'queueDrain' when all streams merged.
    mergedStream.emit('queueDrain');
    if (doEnd) {
      mergedStream.end();
    }
  }

  mergedStream.setMaxListeners(0);
  mergedStream.add = addStream;
  mergedStream.on('unpipe', function (stream) {
    stream.emit('merge2UnpipeEnd');
  });

  if (args.length) {
    addStream.apply(null, args);
  }
  return mergedStream
}

// check and pause streams for pipe.
function pauseStreams (streams, options) {
  if (!Array.isArray(streams)) {
    // Backwards-compat with old-style streams
    if (!streams._readableState && streams.pipe) {
      streams = streams.pipe(PassThrough(options));
    }
    if (!streams._readableState || !streams.pause || !streams.pipe) {
      throw new Error('Only readable stream can be merged.')
    }
    streams.pause();
  } else {
    for (let i = 0, len = streams.length; i < len; i++) {
      streams[i] = pauseStreams(streams[i], options);
    }
  }
  return streams
}

var tasks = {};

var utils$k = {};

var array$1 = {};

Object.defineProperty(array$1, "__esModule", { value: true });
array$1.splitWhen = array$1.flatten = void 0;
function flatten(items) {
    return items.reduce((collection, item) => [].concat(collection, item), []);
}
array$1.flatten = flatten;
function splitWhen(items, predicate) {
    const result = [[]];
    let groupIndex = 0;
    for (const item of items) {
        if (predicate(item)) {
            groupIndex++;
            result[groupIndex] = [];
        }
        else {
            result[groupIndex].push(item);
        }
    }
    return result;
}
array$1.splitWhen = splitWhen;

var errno$1 = {};

Object.defineProperty(errno$1, "__esModule", { value: true });
errno$1.isEnoentCodeError = void 0;
function isEnoentCodeError(error) {
    return error.code === 'ENOENT';
}
errno$1.isEnoentCodeError = isEnoentCodeError;

var fs$8 = {};

Object.defineProperty(fs$8, "__esModule", { value: true });
fs$8.createDirentFromStats = void 0;
class DirentFromStats$1 {
    constructor(name, stats) {
        this.name = name;
        this.isBlockDevice = stats.isBlockDevice.bind(stats);
        this.isCharacterDevice = stats.isCharacterDevice.bind(stats);
        this.isDirectory = stats.isDirectory.bind(stats);
        this.isFIFO = stats.isFIFO.bind(stats);
        this.isFile = stats.isFile.bind(stats);
        this.isSocket = stats.isSocket.bind(stats);
        this.isSymbolicLink = stats.isSymbolicLink.bind(stats);
    }
}
function createDirentFromStats$1(name, stats) {
    return new DirentFromStats$1(name, stats);
}
fs$8.createDirentFromStats = createDirentFromStats$1;

var path$a = {};

Object.defineProperty(path$a, "__esModule", { value: true });
path$a.removeLeadingDotSegment = path$a.escape = path$a.makeAbsolute = path$a.unixify = void 0;
const path$9 = require$$0__default$4["default"];
const LEADING_DOT_SEGMENT_CHARACTERS_COUNT = 2; // ./ or .\\
const UNESCAPED_GLOB_SYMBOLS_RE = /(\\?)([()*?[\]{|}]|^!|[!+@](?=\())/g;
/**
 * Designed to work only with simple paths: `dir\\file`.
 */
function unixify(filepath) {
    return filepath.replace(/\\/g, '/');
}
path$a.unixify = unixify;
function makeAbsolute(cwd, filepath) {
    return path$9.resolve(cwd, filepath);
}
path$a.makeAbsolute = makeAbsolute;
function escape(pattern) {
    return pattern.replace(UNESCAPED_GLOB_SYMBOLS_RE, '\\$2');
}
path$a.escape = escape;
function removeLeadingDotSegment(entry) {
    // We do not use `startsWith` because this is 10x slower than current implementation for some cases.
    // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
    if (entry.charAt(0) === '.') {
        const secondCharactery = entry.charAt(1);
        if (secondCharactery === '/' || secondCharactery === '\\') {
            return entry.slice(LEADING_DOT_SEGMENT_CHARACTERS_COUNT);
        }
    }
    return entry;
}
path$a.removeLeadingDotSegment = removeLeadingDotSegment;

var pattern$1 = {};

/*!
 * is-extglob <https://github.com/jonschlinkert/is-extglob>
 *
 * Copyright (c) 2014-2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

var isExtglob$1 = function isExtglob(str) {
  if (typeof str !== 'string' || str === '') {
    return false;
  }

  var match;
  while ((match = /(\\).|([@?!+*]\(.*\))/g.exec(str))) {
    if (match[2]) return true;
    str = str.slice(match.index + match[0].length);
  }

  return false;
};

/*!
 * is-glob <https://github.com/jonschlinkert/is-glob>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

var isExtglob = isExtglob$1;
var chars = { '{': '}', '(': ')', '[': ']'};
var strictCheck = function(str) {
  if (str[0] === '!') {
    return true;
  }
  var index = 0;
  var pipeIndex = -2;
  var closeSquareIndex = -2;
  var closeCurlyIndex = -2;
  var closeParenIndex = -2;
  var backSlashIndex = -2;
  while (index < str.length) {
    if (str[index] === '*') {
      return true;
    }

    if (str[index + 1] === '?' && /[\].+)]/.test(str[index])) {
      return true;
    }

    if (closeSquareIndex !== -1 && str[index] === '[' && str[index + 1] !== ']') {
      if (closeSquareIndex < index) {
        closeSquareIndex = str.indexOf(']', index);
      }
      if (closeSquareIndex > index) {
        if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) {
          return true;
        }
        backSlashIndex = str.indexOf('\\', index);
        if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) {
          return true;
        }
      }
    }

    if (closeCurlyIndex !== -1 && str[index] === '{' && str[index + 1] !== '}') {
      closeCurlyIndex = str.indexOf('}', index);
      if (closeCurlyIndex > index) {
        backSlashIndex = str.indexOf('\\', index);
        if (backSlashIndex === -1 || backSlashIndex > closeCurlyIndex) {
          return true;
        }
      }
    }

    if (closeParenIndex !== -1 && str[index] === '(' && str[index + 1] === '?' && /[:!=]/.test(str[index + 2]) && str[index + 3] !== ')') {
      closeParenIndex = str.indexOf(')', index);
      if (closeParenIndex > index) {
        backSlashIndex = str.indexOf('\\', index);
        if (backSlashIndex === -1 || backSlashIndex > closeParenIndex) {
          return true;
        }
      }
    }

    if (pipeIndex !== -1 && str[index] === '(' && str[index + 1] !== '|') {
      if (pipeIndex < index) {
        pipeIndex = str.indexOf('|', index);
      }
      if (pipeIndex !== -1 && str[pipeIndex + 1] !== ')') {
        closeParenIndex = str.indexOf(')', pipeIndex);
        if (closeParenIndex > pipeIndex) {
          backSlashIndex = str.indexOf('\\', pipeIndex);
          if (backSlashIndex === -1 || backSlashIndex > closeParenIndex) {
            return true;
          }
        }
      }
    }

    if (str[index] === '\\') {
      var open = str[index + 1];
      index += 2;
      var close = chars[open];

      if (close) {
        var n = str.indexOf(close, index);
        if (n !== -1) {
          index = n + 1;
        }
      }

      if (str[index] === '!') {
        return true;
      }
    } else {
      index++;
    }
  }
  return false;
};

var relaxedCheck = function(str) {
  if (str[0] === '!') {
    return true;
  }
  var index = 0;
  while (index < str.length) {
    if (/[*?{}()[\]]/.test(str[index])) {
      return true;
    }

    if (str[index] === '\\') {
      var open = str[index + 1];
      index += 2;
      var close = chars[open];

      if (close) {
        var n = str.indexOf(close, index);
        if (n !== -1) {
          index = n + 1;
        }
      }

      if (str[index] === '!') {
        return true;
      }
    } else {
      index++;
    }
  }
  return false;
};

var isGlob$1 = function isGlob(str, options) {
  if (typeof str !== 'string' || str === '') {
    return false;
  }

  if (isExtglob(str)) {
    return true;
  }

  var check = strictCheck;

  // optionally relax check
  if (options && options.strict === false) {
    check = relaxedCheck;
  }

  return check(str);
};

var isGlob = isGlob$1;
var pathPosixDirname = require$$0__default$4["default"].posix.dirname;
var isWin32 = require$$2__default["default"].platform() === 'win32';

var slash$1 = '/';
var backslash = /\\/g;
var enclosure = /[\{\[].*[\}\]]$/;
var globby$1 = /(^|[^\\])([\{\[]|\([^\)]+$)/;
var escaped = /\\([\!\*\?\|\[\]\(\)\{\}])/g;

/**
 * @param {string} str
 * @param {Object} opts
 * @param {boolean} [opts.flipBackslashes=true]
 * @returns {string}
 */
var globParent$1 = function globParent(str, opts) {
  var options = Object.assign({ flipBackslashes: true }, opts);

  // flip windows path separators
  if (options.flipBackslashes && isWin32 && str.indexOf(slash$1) < 0) {
    str = str.replace(backslash, slash$1);
  }

  // special case for strings ending in enclosure containing path separator
  if (enclosure.test(str)) {
    str += slash$1;
  }

  // preserves full path in case of trailing path separator
  str += 'a';

  // remove path parts that are globby
  do {
    str = pathPosixDirname(str);
  } while (isGlob(str) || globby$1.test(str));

  // remove escape chars and return result
  return str.replace(escaped, '$1');
};

var utils$j = {};

(function (exports) {

	exports.isInteger = num => {
	  if (typeof num === 'number') {
	    return Number.isInteger(num);
	  }
	  if (typeof num === 'string' && num.trim() !== '') {
	    return Number.isInteger(Number(num));
	  }
	  return false;
	};

	/**
	 * Find a node of the given type
	 */

	exports.find = (node, type) => node.nodes.find(node => node.type === type);

	/**
	 * Find a node of the given type
	 */

	exports.exceedsLimit = (min, max, step = 1, limit) => {
	  if (limit === false) return false;
	  if (!exports.isInteger(min) || !exports.isInteger(max)) return false;
	  return ((Number(max) - Number(min)) / Number(step)) >= limit;
	};

	/**
	 * Escape the given node with '\\' before node.value
	 */

	exports.escapeNode = (block, n = 0, type) => {
	  let node = block.nodes[n];
	  if (!node) return;

	  if ((type && node.type === type) || node.type === 'open' || node.type === 'close') {
	    if (node.escaped !== true) {
	      node.value = '\\' + node.value;
	      node.escaped = true;
	    }
	  }
	};

	/**
	 * Returns true if the given brace node should be enclosed in literal braces
	 */

	exports.encloseBrace = node => {
	  if (node.type !== 'brace') return false;
	  if ((node.commas >> 0 + node.ranges >> 0) === 0) {
	    node.invalid = true;
	    return true;
	  }
	  return false;
	};

	/**
	 * Returns true if a brace node is invalid.
	 */

	exports.isInvalidBrace = block => {
	  if (block.type !== 'brace') return false;
	  if (block.invalid === true || block.dollar) return true;
	  if ((block.commas >> 0 + block.ranges >> 0) === 0) {
	    block.invalid = true;
	    return true;
	  }
	  if (block.open !== true || block.close !== true) {
	    block.invalid = true;
	    return true;
	  }
	  return false;
	};

	/**
	 * Returns true if a node is an open or close node
	 */

	exports.isOpenOrClose = node => {
	  if (node.type === 'open' || node.type === 'close') {
	    return true;
	  }
	  return node.open === true || node.close === true;
	};

	/**
	 * Reduce an array of text nodes.
	 */

	exports.reduce = nodes => nodes.reduce((acc, node) => {
	  if (node.type === 'text') acc.push(node.value);
	  if (node.type === 'range') node.type = 'text';
	  return acc;
	}, []);

	/**
	 * Flatten an array
	 */

	exports.flatten = (...args) => {
	  const result = [];
	  const flat = arr => {
	    for (let i = 0; i < arr.length; i++) {
	      let ele = arr[i];
	      Array.isArray(ele) ? flat(ele) : ele !== void 0 && result.push(ele);
	    }
	    return result;
	  };
	  flat(args);
	  return result;
	};
} (utils$j));

const utils$i = utils$j;

var stringify$5 = (ast, options = {}) => {
  let stringify = (node, parent = {}) => {
    let invalidBlock = options.escapeInvalid && utils$i.isInvalidBrace(parent);
    let invalidNode = node.invalid === true && options.escapeInvalid === true;
    let output = '';

    if (node.value) {
      if ((invalidBlock || invalidNode) && utils$i.isOpenOrClose(node)) {
        return '\\' + node.value;
      }
      return node.value;
    }

    if (node.value) {
      return node.value;
    }

    if (node.nodes) {
      for (let child of node.nodes) {
        output += stringify(child);
      }
    }
    return output;
  };

  return stringify(ast);
};

/*!
 * is-number <https://github.com/jonschlinkert/is-number>
 *
 * Copyright (c) 2014-present, Jon Schlinkert.
 * Released under the MIT License.
 */

var isNumber$3 = function(num) {
  if (typeof num === 'number') {
    return num - num === 0;
  }
  if (typeof num === 'string' && num.trim() !== '') {
    return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
  }
  return false;
};

/*!
 * to-regex-range <https://github.com/micromatch/to-regex-range>
 *
 * Copyright (c) 2015-present, Jon Schlinkert.
 * Released under the MIT License.
 */

const isNumber$2 = isNumber$3;

const toRegexRange$1 = (min, max, options) => {
  if (isNumber$2(min) === false) {
    throw new TypeError('toRegexRange: expected the first argument to be a number');
  }

  if (max === void 0 || min === max) {
    return String(min);
  }

  if (isNumber$2(max) === false) {
    throw new TypeError('toRegexRange: expected the second argument to be a number.');
  }

  let opts = { relaxZeros: true, ...options };
  if (typeof opts.strictZeros === 'boolean') {
    opts.relaxZeros = opts.strictZeros === false;
  }

  let relax = String(opts.relaxZeros);
  let shorthand = String(opts.shorthand);
  let capture = String(opts.capture);
  let wrap = String(opts.wrap);
  let cacheKey = min + ':' + max + '=' + relax + shorthand + capture + wrap;

  if (toRegexRange$1.cache.hasOwnProperty(cacheKey)) {
    return toRegexRange$1.cache[cacheKey].result;
  }

  let a = Math.min(min, max);
  let b = Math.max(min, max);

  if (Math.abs(a - b) === 1) {
    let result = min + '|' + max;
    if (opts.capture) {
      return `(${result})`;
    }
    if (opts.wrap === false) {
      return result;
    }
    return `(?:${result})`;
  }

  let isPadded = hasPadding(min) || hasPadding(max);
  let state = { min, max, a, b };
  let positives = [];
  let negatives = [];

  if (isPadded) {
    state.isPadded = isPadded;
    state.maxLen = String(state.max).length;
  }

  if (a < 0) {
    let newMin = b < 0 ? Math.abs(b) : 1;
    negatives = splitToPatterns(newMin, Math.abs(a), state, opts);
    a = state.a = 0;
  }

  if (b >= 0) {
    positives = splitToPatterns(a, b, state, opts);
  }

  state.negatives = negatives;
  state.positives = positives;
  state.result = collatePatterns(negatives, positives);

  if (opts.capture === true) {
    state.result = `(${state.result})`;
  } else if (opts.wrap !== false && (positives.length + negatives.length) > 1) {
    state.result = `(?:${state.result})`;
  }

  toRegexRange$1.cache[cacheKey] = state;
  return state.result;
};

function collatePatterns(neg, pos, options) {
  let onlyNegative = filterPatterns(neg, pos, '-', false) || [];
  let onlyPositive = filterPatterns(pos, neg, '', false) || [];
  let intersected = filterPatterns(neg, pos, '-?', true) || [];
  let subpatterns = onlyNegative.concat(intersected).concat(onlyPositive);
  return subpatterns.join('|');
}

function splitToRanges(min, max) {
  let nines = 1;
  let zeros = 1;

  let stop = countNines(min, nines);
  let stops = new Set([max]);

  while (min <= stop && stop <= max) {
    stops.add(stop);
    nines += 1;
    stop = countNines(min, nines);
  }

  stop = countZeros(max + 1, zeros) - 1;

  while (min < stop && stop <= max) {
    stops.add(stop);
    zeros += 1;
    stop = countZeros(max + 1, zeros) - 1;
  }

  stops = [...stops];
  stops.sort(compare);
  return stops;
}

/**
 * Convert a range to a regex pattern
 * @param {Number} `start`
 * @param {Number} `stop`
 * @return {String}
 */

function rangeToPattern(start, stop, options) {
  if (start === stop) {
    return { pattern: start, count: [], digits: 0 };
  }

  let zipped = zip(start, stop);
  let digits = zipped.length;
  let pattern = '';
  let count = 0;

  for (let i = 0; i < digits; i++) {
    let [startDigit, stopDigit] = zipped[i];

    if (startDigit === stopDigit) {
      pattern += startDigit;

    } else if (startDigit !== '0' || stopDigit !== '9') {
      pattern += toCharacterClass(startDigit, stopDigit);

    } else {
      count++;
    }
  }

  if (count) {
    pattern += options.shorthand === true ? '\\d' : '[0-9]';
  }

  return { pattern, count: [count], digits };
}

function splitToPatterns(min, max, tok, options) {
  let ranges = splitToRanges(min, max);
  let tokens = [];
  let start = min;
  let prev;

  for (let i = 0; i < ranges.length; i++) {
    let max = ranges[i];
    let obj = rangeToPattern(String(start), String(max), options);
    let zeros = '';

    if (!tok.isPadded && prev && prev.pattern === obj.pattern) {
      if (prev.count.length > 1) {
        prev.count.pop();
      }

      prev.count.push(obj.count[0]);
      prev.string = prev.pattern + toQuantifier(prev.count);
      start = max + 1;
      continue;
    }

    if (tok.isPadded) {
      zeros = padZeros(max, tok, options);
    }

    obj.string = zeros + obj.pattern + toQuantifier(obj.count);
    tokens.push(obj);
    start = max + 1;
    prev = obj;
  }

  return tokens;
}

function filterPatterns(arr, comparison, prefix, intersection, options) {
  let result = [];

  for (let ele of arr) {
    let { string } = ele;

    // only push if _both_ are negative...
    if (!intersection && !contains(comparison, 'string', string)) {
      result.push(prefix + string);
    }

    // or _both_ are positive
    if (intersection && contains(comparison, 'string', string)) {
      result.push(prefix + string);
    }
  }
  return result;
}

/**
 * Zip strings
 */

function zip(a, b) {
  let arr = [];
  for (let i = 0; i < a.length; i++) arr.push([a[i], b[i]]);
  return arr;
}

function compare(a, b) {
  return a > b ? 1 : b > a ? -1 : 0;
}

function contains(arr, key, val) {
  return arr.some(ele => ele[key] === val);
}

function countNines(min, len) {
  return Number(String(min).slice(0, -len) + '9'.repeat(len));
}

function countZeros(integer, zeros) {
  return integer - (integer % Math.pow(10, zeros));
}

function toQuantifier(digits) {
  let [start = 0, stop = ''] = digits;
  if (stop || start > 1) {
    return `{${start + (stop ? ',' + stop : '')}}`;
  }
  return '';
}

function toCharacterClass(a, b, options) {
  return `[${a}${(b - a === 1) ? '' : '-'}${b}]`;
}

function hasPadding(str) {
  return /^-?(0+)\d/.test(str);
}

function padZeros(value, tok, options) {
  if (!tok.isPadded) {
    return value;
  }

  let diff = Math.abs(tok.maxLen - String(value).length);
  let relax = options.relaxZeros !== false;

  switch (diff) {
    case 0:
      return '';
    case 1:
      return relax ? '0?' : '0';
    case 2:
      return relax ? '0{0,2}' : '00';
    default: {
      return relax ? `0{0,${diff}}` : `0{${diff}}`;
    }
  }
}

/**
 * Cache
 */

toRegexRange$1.cache = {};
toRegexRange$1.clearCache = () => (toRegexRange$1.cache = {});

/**
 * Expose `toRegexRange`
 */

var toRegexRange_1 = toRegexRange$1;

/*!
 * fill-range <https://github.com/jonschlinkert/fill-range>
 *
 * Copyright (c) 2014-present, Jon Schlinkert.
 * Licensed under the MIT License.
 */

const util$3 = require$$0__default$3["default"];
const toRegexRange = toRegexRange_1;

const isObject$1 = val => val !== null && typeof val === 'object' && !Array.isArray(val);

const transform$1 = toNumber => {
  return value => toNumber === true ? Number(value) : String(value);
};

const isValidValue = value => {
  return typeof value === 'number' || (typeof value === 'string' && value !== '');
};

const isNumber$1 = num => Number.isInteger(+num);

const zeros = input => {
  let value = `${input}`;
  let index = -1;
  if (value[0] === '-') value = value.slice(1);
  if (value === '0') return false;
  while (value[++index] === '0');
  return index > 0;
};

const stringify$4 = (start, end, options) => {
  if (typeof start === 'string' || typeof end === 'string') {
    return true;
  }
  return options.stringify === true;
};

const pad = (input, maxLength, toNumber) => {
  if (maxLength > 0) {
    let dash = input[0] === '-' ? '-' : '';
    if (dash) input = input.slice(1);
    input = (dash + input.padStart(dash ? maxLength - 1 : maxLength, '0'));
  }
  if (toNumber === false) {
    return String(input);
  }
  return input;
};

const toMaxLen = (input, maxLength) => {
  let negative = input[0] === '-' ? '-' : '';
  if (negative) {
    input = input.slice(1);
    maxLength--;
  }
  while (input.length < maxLength) input = '0' + input;
  return negative ? ('-' + input) : input;
};

const toSequence = (parts, options) => {
  parts.negatives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
  parts.positives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);

  let prefix = options.capture ? '' : '?:';
  let positives = '';
  let negatives = '';
  let result;

  if (parts.positives.length) {
    positives = parts.positives.join('|');
  }

  if (parts.negatives.length) {
    negatives = `-(${prefix}${parts.negatives.join('|')})`;
  }

  if (positives && negatives) {
    result = `${positives}|${negatives}`;
  } else {
    result = positives || negatives;
  }

  if (options.wrap) {
    return `(${prefix}${result})`;
  }

  return result;
};

const toRange = (a, b, isNumbers, options) => {
  if (isNumbers) {
    return toRegexRange(a, b, { wrap: false, ...options });
  }

  let start = String.fromCharCode(a);
  if (a === b) return start;

  let stop = String.fromCharCode(b);
  return `[${start}-${stop}]`;
};

const toRegex = (start, end, options) => {
  if (Array.isArray(start)) {
    let wrap = options.wrap === true;
    let prefix = options.capture ? '' : '?:';
    return wrap ? `(${prefix}${start.join('|')})` : start.join('|');
  }
  return toRegexRange(start, end, options);
};

const rangeError = (...args) => {
  return new RangeError('Invalid range arguments: ' + util$3.inspect(...args));
};

const invalidRange = (start, end, options) => {
  if (options.strictRanges === true) throw rangeError([start, end]);
  return [];
};

const invalidStep = (step, options) => {
  if (options.strictRanges === true) {
    throw new TypeError(`Expected step "${step}" to be a number`);
  }
  return [];
};

const fillNumbers = (start, end, step = 1, options = {}) => {
  let a = Number(start);
  let b = Number(end);

  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    if (options.strictRanges === true) throw rangeError([start, end]);
    return [];
  }

  // fix negative zero
  if (a === 0) a = 0;
  if (b === 0) b = 0;

  let descending = a > b;
  let startString = String(start);
  let endString = String(end);
  let stepString = String(step);
  step = Math.max(Math.abs(step), 1);

  let padded = zeros(startString) || zeros(endString) || zeros(stepString);
  let maxLen = padded ? Math.max(startString.length, endString.length, stepString.length) : 0;
  let toNumber = padded === false && stringify$4(start, end, options) === false;
  let format = options.transform || transform$1(toNumber);

  if (options.toRegex && step === 1) {
    return toRange(toMaxLen(start, maxLen), toMaxLen(end, maxLen), true, options);
  }

  let parts = { negatives: [], positives: [] };
  let push = num => parts[num < 0 ? 'negatives' : 'positives'].push(Math.abs(num));
  let range = [];
  let index = 0;

  while (descending ? a >= b : a <= b) {
    if (options.toRegex === true && step > 1) {
      push(a);
    } else {
      range.push(pad(format(a, index), maxLen, toNumber));
    }
    a = descending ? a - step : a + step;
    index++;
  }

  if (options.toRegex === true) {
    return step > 1
      ? toSequence(parts, options)
      : toRegex(range, null, { wrap: false, ...options });
  }

  return range;
};

const fillLetters = (start, end, step = 1, options = {}) => {
  if ((!isNumber$1(start) && start.length > 1) || (!isNumber$1(end) && end.length > 1)) {
    return invalidRange(start, end, options);
  }


  let format = options.transform || (val => String.fromCharCode(val));
  let a = `${start}`.charCodeAt(0);
  let b = `${end}`.charCodeAt(0);

  let descending = a > b;
  let min = Math.min(a, b);
  let max = Math.max(a, b);

  if (options.toRegex && step === 1) {
    return toRange(min, max, false, options);
  }

  let range = [];
  let index = 0;

  while (descending ? a >= b : a <= b) {
    range.push(format(a, index));
    a = descending ? a - step : a + step;
    index++;
  }

  if (options.toRegex === true) {
    return toRegex(range, null, { wrap: false, options });
  }

  return range;
};

const fill$2 = (start, end, step, options = {}) => {
  if (end == null && isValidValue(start)) {
    return [start];
  }

  if (!isValidValue(start) || !isValidValue(end)) {
    return invalidRange(start, end, options);
  }

  if (typeof step === 'function') {
    return fill$2(start, end, 1, { transform: step });
  }

  if (isObject$1(step)) {
    return fill$2(start, end, 0, step);
  }

  let opts = { ...options };
  if (opts.capture === true) opts.wrap = true;
  step = step || opts.step || 1;

  if (!isNumber$1(step)) {
    if (step != null && !isObject$1(step)) return invalidStep(step, opts);
    return fill$2(start, end, 1, step);
  }

  if (isNumber$1(start) && isNumber$1(end)) {
    return fillNumbers(start, end, step, opts);
  }

  return fillLetters(start, end, Math.max(Math.abs(step), 1), opts);
};

var fillRange = fill$2;

const fill$1 = fillRange;
const utils$h = utils$j;

const compile$1 = (ast, options = {}) => {
  let walk = (node, parent = {}) => {
    let invalidBlock = utils$h.isInvalidBrace(parent);
    let invalidNode = node.invalid === true && options.escapeInvalid === true;
    let invalid = invalidBlock === true || invalidNode === true;
    let prefix = options.escapeInvalid === true ? '\\' : '';
    let output = '';

    if (node.isOpen === true) {
      return prefix + node.value;
    }
    if (node.isClose === true) {
      return prefix + node.value;
    }

    if (node.type === 'open') {
      return invalid ? (prefix + node.value) : '(';
    }

    if (node.type === 'close') {
      return invalid ? (prefix + node.value) : ')';
    }

    if (node.type === 'comma') {
      return node.prev.type === 'comma' ? '' : (invalid ? node.value : '|');
    }

    if (node.value) {
      return node.value;
    }

    if (node.nodes && node.ranges > 0) {
      let args = utils$h.reduce(node.nodes);
      let range = fill$1(...args, { ...options, wrap: false, toRegex: true });

      if (range.length !== 0) {
        return args.length > 1 && range.length > 1 ? `(${range})` : range;
      }
    }

    if (node.nodes) {
      for (let child of node.nodes) {
        output += walk(child, node);
      }
    }
    return output;
  };

  return walk(ast);
};

var compile_1 = compile$1;

const fill = fillRange;
const stringify$3 = stringify$5;
const utils$g = utils$j;

const append = (queue = '', stash = '', enclose = false) => {
  let result = [];

  queue = [].concat(queue);
  stash = [].concat(stash);

  if (!stash.length) return queue;
  if (!queue.length) {
    return enclose ? utils$g.flatten(stash).map(ele => `{${ele}}`) : stash;
  }

  for (let item of queue) {
    if (Array.isArray(item)) {
      for (let value of item) {
        result.push(append(value, stash, enclose));
      }
    } else {
      for (let ele of stash) {
        if (enclose === true && typeof ele === 'string') ele = `{${ele}}`;
        result.push(Array.isArray(ele) ? append(item, ele, enclose) : (item + ele));
      }
    }
  }
  return utils$g.flatten(result);
};

const expand$1 = (ast, options = {}) => {
  let rangeLimit = options.rangeLimit === void 0 ? 1000 : options.rangeLimit;

  let walk = (node, parent = {}) => {
    node.queue = [];

    let p = parent;
    let q = parent.queue;

    while (p.type !== 'brace' && p.type !== 'root' && p.parent) {
      p = p.parent;
      q = p.queue;
    }

    if (node.invalid || node.dollar) {
      q.push(append(q.pop(), stringify$3(node, options)));
      return;
    }

    if (node.type === 'brace' && node.invalid !== true && node.nodes.length === 2) {
      q.push(append(q.pop(), ['{}']));
      return;
    }

    if (node.nodes && node.ranges > 0) {
      let args = utils$g.reduce(node.nodes);

      if (utils$g.exceedsLimit(...args, options.step, rangeLimit)) {
        throw new RangeError('expanded array length exceeds range limit. Use options.rangeLimit to increase or disable the limit.');
      }

      let range = fill(...args, options);
      if (range.length === 0) {
        range = stringify$3(node, options);
      }

      q.push(append(q.pop(), range));
      node.nodes = [];
      return;
    }

    let enclose = utils$g.encloseBrace(node);
    let queue = node.queue;
    let block = node;

    while (block.type !== 'brace' && block.type !== 'root' && block.parent) {
      block = block.parent;
      queue = block.queue;
    }

    for (let i = 0; i < node.nodes.length; i++) {
      let child = node.nodes[i];

      if (child.type === 'comma' && node.type === 'brace') {
        if (i === 1) queue.push('');
        queue.push('');
        continue;
      }

      if (child.type === 'close') {
        q.push(append(q.pop(), queue, enclose));
        continue;
      }

      if (child.value && child.type !== 'open') {
        queue.push(append(queue.pop(), child.value));
        continue;
      }

      if (child.nodes) {
        walk(child, node);
      }
    }

    return queue;
  };

  return utils$g.flatten(walk(ast));
};

var expand_1 = expand$1;

var constants$4 = {
  MAX_LENGTH: 1024 * 64,

  // Digits
  CHAR_0: '0', /* 0 */
  CHAR_9: '9', /* 9 */

  // Alphabet chars.
  CHAR_UPPERCASE_A: 'A', /* A */
  CHAR_LOWERCASE_A: 'a', /* a */
  CHAR_UPPERCASE_Z: 'Z', /* Z */
  CHAR_LOWERCASE_Z: 'z', /* z */

  CHAR_LEFT_PARENTHESES: '(', /* ( */
  CHAR_RIGHT_PARENTHESES: ')', /* ) */

  CHAR_ASTERISK: '*', /* * */

  // Non-alphabetic chars.
  CHAR_AMPERSAND: '&', /* & */
  CHAR_AT: '@', /* @ */
  CHAR_BACKSLASH: '\\', /* \ */
  CHAR_BACKTICK: '`', /* ` */
  CHAR_CARRIAGE_RETURN: '\r', /* \r */
  CHAR_CIRCUMFLEX_ACCENT: '^', /* ^ */
  CHAR_COLON: ':', /* : */
  CHAR_COMMA: ',', /* , */
  CHAR_DOLLAR: '$', /* . */
  CHAR_DOT: '.', /* . */
  CHAR_DOUBLE_QUOTE: '"', /* " */
  CHAR_EQUAL: '=', /* = */
  CHAR_EXCLAMATION_MARK: '!', /* ! */
  CHAR_FORM_FEED: '\f', /* \f */
  CHAR_FORWARD_SLASH: '/', /* / */
  CHAR_HASH: '#', /* # */
  CHAR_HYPHEN_MINUS: '-', /* - */
  CHAR_LEFT_ANGLE_BRACKET: '<', /* < */
  CHAR_LEFT_CURLY_BRACE: '{', /* { */
  CHAR_LEFT_SQUARE_BRACKET: '[', /* [ */
  CHAR_LINE_FEED: '\n', /* \n */
  CHAR_NO_BREAK_SPACE: '\u00A0', /* \u00A0 */
  CHAR_PERCENT: '%', /* % */
  CHAR_PLUS: '+', /* + */
  CHAR_QUESTION_MARK: '?', /* ? */
  CHAR_RIGHT_ANGLE_BRACKET: '>', /* > */
  CHAR_RIGHT_CURLY_BRACE: '}', /* } */
  CHAR_RIGHT_SQUARE_BRACKET: ']', /* ] */
  CHAR_SEMICOLON: ';', /* ; */
  CHAR_SINGLE_QUOTE: '\'', /* ' */
  CHAR_SPACE: ' ', /*   */
  CHAR_TAB: '\t', /* \t */
  CHAR_UNDERSCORE: '_', /* _ */
  CHAR_VERTICAL_LINE: '|', /* | */
  CHAR_ZERO_WIDTH_NOBREAK_SPACE: '\uFEFF' /* \uFEFF */
};

const stringify$2 = stringify$5;

/**
 * Constants
 */

const {
  MAX_LENGTH: MAX_LENGTH$1,
  CHAR_BACKSLASH, /* \ */
  CHAR_BACKTICK, /* ` */
  CHAR_COMMA: CHAR_COMMA$1, /* , */
  CHAR_DOT: CHAR_DOT$1, /* . */
  CHAR_LEFT_PARENTHESES: CHAR_LEFT_PARENTHESES$1, /* ( */
  CHAR_RIGHT_PARENTHESES: CHAR_RIGHT_PARENTHESES$1, /* ) */
  CHAR_LEFT_CURLY_BRACE: CHAR_LEFT_CURLY_BRACE$1, /* { */
  CHAR_RIGHT_CURLY_BRACE: CHAR_RIGHT_CURLY_BRACE$1, /* } */
  CHAR_LEFT_SQUARE_BRACKET: CHAR_LEFT_SQUARE_BRACKET$1, /* [ */
  CHAR_RIGHT_SQUARE_BRACKET: CHAR_RIGHT_SQUARE_BRACKET$1, /* ] */
  CHAR_DOUBLE_QUOTE, /* " */
  CHAR_SINGLE_QUOTE, /* ' */
  CHAR_NO_BREAK_SPACE,
  CHAR_ZERO_WIDTH_NOBREAK_SPACE
} = constants$4;

/**
 * parse
 */

const parse$3 = (input, options = {}) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected a string');
  }

  let opts = options || {};
  let max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH$1, opts.maxLength) : MAX_LENGTH$1;
  if (input.length > max) {
    throw new SyntaxError(`Input length (${input.length}), exceeds max characters (${max})`);
  }

  let ast = { type: 'root', input, nodes: [] };
  let stack = [ast];
  let block = ast;
  let prev = ast;
  let brackets = 0;
  let length = input.length;
  let index = 0;
  let depth = 0;
  let value;

  /**
   * Helpers
   */

  const advance = () => input[index++];
  const push = node => {
    if (node.type === 'text' && prev.type === 'dot') {
      prev.type = 'text';
    }

    if (prev && prev.type === 'text' && node.type === 'text') {
      prev.value += node.value;
      return;
    }

    block.nodes.push(node);
    node.parent = block;
    node.prev = prev;
    prev = node;
    return node;
  };

  push({ type: 'bos' });

  while (index < length) {
    block = stack[stack.length - 1];
    value = advance();

    /**
     * Invalid chars
     */

    if (value === CHAR_ZERO_WIDTH_NOBREAK_SPACE || value === CHAR_NO_BREAK_SPACE) {
      continue;
    }

    /**
     * Escaped chars
     */

    if (value === CHAR_BACKSLASH) {
      push({ type: 'text', value: (options.keepEscaping ? value : '') + advance() });
      continue;
    }

    /**
     * Right square bracket (literal): ']'
     */

    if (value === CHAR_RIGHT_SQUARE_BRACKET$1) {
      push({ type: 'text', value: '\\' + value });
      continue;
    }

    /**
     * Left square bracket: '['
     */

    if (value === CHAR_LEFT_SQUARE_BRACKET$1) {
      brackets++;
      let next;

      while (index < length && (next = advance())) {
        value += next;

        if (next === CHAR_LEFT_SQUARE_BRACKET$1) {
          brackets++;
          continue;
        }

        if (next === CHAR_BACKSLASH) {
          value += advance();
          continue;
        }

        if (next === CHAR_RIGHT_SQUARE_BRACKET$1) {
          brackets--;

          if (brackets === 0) {
            break;
          }
        }
      }

      push({ type: 'text', value });
      continue;
    }

    /**
     * Parentheses
     */

    if (value === CHAR_LEFT_PARENTHESES$1) {
      block = push({ type: 'paren', nodes: [] });
      stack.push(block);
      push({ type: 'text', value });
      continue;
    }

    if (value === CHAR_RIGHT_PARENTHESES$1) {
      if (block.type !== 'paren') {
        push({ type: 'text', value });
        continue;
      }
      block = stack.pop();
      push({ type: 'text', value });
      block = stack[stack.length - 1];
      continue;
    }

    /**
     * Quotes: '|"|`
     */

    if (value === CHAR_DOUBLE_QUOTE || value === CHAR_SINGLE_QUOTE || value === CHAR_BACKTICK) {
      let open = value;
      let next;

      if (options.keepQuotes !== true) {
        value = '';
      }

      while (index < length && (next = advance())) {
        if (next === CHAR_BACKSLASH) {
          value += next + advance();
          continue;
        }

        if (next === open) {
          if (options.keepQuotes === true) value += next;
          break;
        }

        value += next;
      }

      push({ type: 'text', value });
      continue;
    }

    /**
     * Left curly brace: '{'
     */

    if (value === CHAR_LEFT_CURLY_BRACE$1) {
      depth++;

      let dollar = prev.value && prev.value.slice(-1) === '$' || block.dollar === true;
      let brace = {
        type: 'brace',
        open: true,
        close: false,
        dollar,
        depth,
        commas: 0,
        ranges: 0,
        nodes: []
      };

      block = push(brace);
      stack.push(block);
      push({ type: 'open', value });
      continue;
    }

    /**
     * Right curly brace: '}'
     */

    if (value === CHAR_RIGHT_CURLY_BRACE$1) {
      if (block.type !== 'brace') {
        push({ type: 'text', value });
        continue;
      }

      let type = 'close';
      block = stack.pop();
      block.close = true;

      push({ type, value });
      depth--;

      block = stack[stack.length - 1];
      continue;
    }

    /**
     * Comma: ','
     */

    if (value === CHAR_COMMA$1 && depth > 0) {
      if (block.ranges > 0) {
        block.ranges = 0;
        let open = block.nodes.shift();
        block.nodes = [open, { type: 'text', value: stringify$2(block) }];
      }

      push({ type: 'comma', value });
      block.commas++;
      continue;
    }

    /**
     * Dot: '.'
     */

    if (value === CHAR_DOT$1 && depth > 0 && block.commas === 0) {
      let siblings = block.nodes;

      if (depth === 0 || siblings.length === 0) {
        push({ type: 'text', value });
        continue;
      }

      if (prev.type === 'dot') {
        block.range = [];
        prev.value += value;
        prev.type = 'range';

        if (block.nodes.length !== 3 && block.nodes.length !== 5) {
          block.invalid = true;
          block.ranges = 0;
          prev.type = 'text';
          continue;
        }

        block.ranges++;
        block.args = [];
        continue;
      }

      if (prev.type === 'range') {
        siblings.pop();

        let before = siblings[siblings.length - 1];
        before.value += prev.value + value;
        prev = before;
        block.ranges--;
        continue;
      }

      push({ type: 'dot', value });
      continue;
    }

    /**
     * Text
     */

    push({ type: 'text', value });
  }

  // Mark imbalanced braces and brackets as invalid
  do {
    block = stack.pop();

    if (block.type !== 'root') {
      block.nodes.forEach(node => {
        if (!node.nodes) {
          if (node.type === 'open') node.isOpen = true;
          if (node.type === 'close') node.isClose = true;
          if (!node.nodes) node.type = 'text';
          node.invalid = true;
        }
      });

      // get the location of the block on parent.nodes (block's siblings)
      let parent = stack[stack.length - 1];
      let index = parent.nodes.indexOf(block);
      // replace the (invalid) block with it's nodes
      parent.nodes.splice(index, 1, ...block.nodes);
    }
  } while (stack.length > 0);

  push({ type: 'eos' });
  return ast;
};

var parse_1$1 = parse$3;

const stringify$1 = stringify$5;
const compile = compile_1;
const expand = expand_1;
const parse$2 = parse_1$1;

/**
 * Expand the given pattern or create a regex-compatible string.
 *
 * ```js
 * const braces = require('braces');
 * console.log(braces('{a,b,c}', { compile: true })); //=> ['(a|b|c)']
 * console.log(braces('{a,b,c}')); //=> ['a', 'b', 'c']
 * ```
 * @param {String} `str`
 * @param {Object} `options`
 * @return {String}
 * @api public
 */

const braces$1 = (input, options = {}) => {
  let output = [];

  if (Array.isArray(input)) {
    for (let pattern of input) {
      let result = braces$1.create(pattern, options);
      if (Array.isArray(result)) {
        output.push(...result);
      } else {
        output.push(result);
      }
    }
  } else {
    output = [].concat(braces$1.create(input, options));
  }

  if (options && options.expand === true && options.nodupes === true) {
    output = [...new Set(output)];
  }
  return output;
};

/**
 * Parse the given `str` with the given `options`.
 *
 * ```js
 * // braces.parse(pattern, [, options]);
 * const ast = braces.parse('a/{b,c}/d');
 * console.log(ast);
 * ```
 * @param {String} pattern Brace pattern to parse
 * @param {Object} options
 * @return {Object} Returns an AST
 * @api public
 */

braces$1.parse = (input, options = {}) => parse$2(input, options);

/**
 * Creates a braces string from an AST, or an AST node.
 *
 * ```js
 * const braces = require('braces');
 * let ast = braces.parse('foo/{a,b}/bar');
 * console.log(stringify(ast.nodes[2])); //=> '{a,b}'
 * ```
 * @param {String} `input` Brace pattern or AST.
 * @param {Object} `options`
 * @return {Array} Returns an array of expanded values.
 * @api public
 */

braces$1.stringify = (input, options = {}) => {
  if (typeof input === 'string') {
    return stringify$1(braces$1.parse(input, options), options);
  }
  return stringify$1(input, options);
};

/**
 * Compiles a brace pattern into a regex-compatible, optimized string.
 * This method is called by the main [braces](#braces) function by default.
 *
 * ```js
 * const braces = require('braces');
 * console.log(braces.compile('a/{b,c}/d'));
 * //=> ['a/(b|c)/d']
 * ```
 * @param {String} `input` Brace pattern or AST.
 * @param {Object} `options`
 * @return {Array} Returns an array of expanded values.
 * @api public
 */

braces$1.compile = (input, options = {}) => {
  if (typeof input === 'string') {
    input = braces$1.parse(input, options);
  }
  return compile(input, options);
};

/**
 * Expands a brace pattern into an array. This method is called by the
 * main [braces](#braces) function when `options.expand` is true. Before
 * using this method it's recommended that you read the [performance notes](#performance))
 * and advantages of using [.compile](#compile) instead.
 *
 * ```js
 * const braces = require('braces');
 * console.log(braces.expand('a/{b,c}/d'));
 * //=> ['a/b/d', 'a/c/d'];
 * ```
 * @param {String} `pattern` Brace pattern
 * @param {Object} `options`
 * @return {Array} Returns an array of expanded values.
 * @api public
 */

braces$1.expand = (input, options = {}) => {
  if (typeof input === 'string') {
    input = braces$1.parse(input, options);
  }

  let result = expand(input, options);

  // filter out empty strings if specified
  if (options.noempty === true) {
    result = result.filter(Boolean);
  }

  // filter out duplicates if specified
  if (options.nodupes === true) {
    result = [...new Set(result)];
  }

  return result;
};

/**
 * Processes a brace pattern and returns either an expanded array
 * (if `options.expand` is true), a highly optimized regex-compatible string.
 * This method is called by the main [braces](#braces) function.
 *
 * ```js
 * const braces = require('braces');
 * console.log(braces.create('user-{200..300}/project-{a,b,c}-{1..10}'))
 * //=> 'user-(20[0-9]|2[1-9][0-9]|300)/project-(a|b|c)-([1-9]|10)'
 * ```
 * @param {String} `pattern` Brace pattern
 * @param {Object} `options`
 * @return {Array} Returns an array of expanded values.
 * @api public
 */

braces$1.create = (input, options = {}) => {
  if (input === '' || input.length < 3) {
    return [input];
  }

 return options.expand !== true
    ? braces$1.compile(input, options)
    : braces$1.expand(input, options);
};

/**
 * Expose "braces"
 */

var braces_1 = braces$1;

var picomatch$2 = {exports: {}};

var utils$f = {};

const path$8 = require$$0__default$4["default"];
const WIN_SLASH = '\\\\/';
const WIN_NO_SLASH = `[^${WIN_SLASH}]`;

/**
 * Posix glob regex
 */

const DOT_LITERAL = '\\.';
const PLUS_LITERAL = '\\+';
const QMARK_LITERAL = '\\?';
const SLASH_LITERAL = '\\/';
const ONE_CHAR = '(?=.)';
const QMARK = '[^/]';
const END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
const START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
const DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
const NO_DOT = `(?!${DOT_LITERAL})`;
const NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
const NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
const NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
const QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
const STAR = `${QMARK}*?`;

const POSIX_CHARS = {
  DOT_LITERAL,
  PLUS_LITERAL,
  QMARK_LITERAL,
  SLASH_LITERAL,
  ONE_CHAR,
  QMARK,
  END_ANCHOR,
  DOTS_SLASH,
  NO_DOT,
  NO_DOTS,
  NO_DOT_SLASH,
  NO_DOTS_SLASH,
  QMARK_NO_DOT,
  STAR,
  START_ANCHOR
};

/**
 * Windows glob regex
 */

const WINDOWS_CHARS = {
  ...POSIX_CHARS,

  SLASH_LITERAL: `[${WIN_SLASH}]`,
  QMARK: WIN_NO_SLASH,
  STAR: `${WIN_NO_SLASH}*?`,
  DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
  NO_DOT: `(?!${DOT_LITERAL})`,
  NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
  NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
  NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
  QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
  START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
  END_ANCHOR: `(?:[${WIN_SLASH}]|$)`
};

/**
 * POSIX Bracket Regex
 */

const POSIX_REGEX_SOURCE$1 = {
  alnum: 'a-zA-Z0-9',
  alpha: 'a-zA-Z',
  ascii: '\\x00-\\x7F',
  blank: ' \\t',
  cntrl: '\\x00-\\x1F\\x7F',
  digit: '0-9',
  graph: '\\x21-\\x7E',
  lower: 'a-z',
  print: '\\x20-\\x7E ',
  punct: '\\-!"#$%&\'()\\*+,./:;<=>?@[\\]^_`{|}~',
  space: ' \\t\\r\\n\\v\\f',
  upper: 'A-Z',
  word: 'A-Za-z0-9_',
  xdigit: 'A-Fa-f0-9'
};

var constants$3 = {
  MAX_LENGTH: 1024 * 64,
  POSIX_REGEX_SOURCE: POSIX_REGEX_SOURCE$1,

  // regular expressions
  REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
  REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
  REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
  REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
  REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
  REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,

  // Replace globs with equivalent patterns to reduce parsing time.
  REPLACEMENTS: {
    '***': '*',
    '**/**': '**',
    '**/**/**': '**'
  },

  // Digits
  CHAR_0: 48, /* 0 */
  CHAR_9: 57, /* 9 */

  // Alphabet chars.
  CHAR_UPPERCASE_A: 65, /* A */
  CHAR_LOWERCASE_A: 97, /* a */
  CHAR_UPPERCASE_Z: 90, /* Z */
  CHAR_LOWERCASE_Z: 122, /* z */

  CHAR_LEFT_PARENTHESES: 40, /* ( */
  CHAR_RIGHT_PARENTHESES: 41, /* ) */

  CHAR_ASTERISK: 42, /* * */

  // Non-alphabetic chars.
  CHAR_AMPERSAND: 38, /* & */
  CHAR_AT: 64, /* @ */
  CHAR_BACKWARD_SLASH: 92, /* \ */
  CHAR_CARRIAGE_RETURN: 13, /* \r */
  CHAR_CIRCUMFLEX_ACCENT: 94, /* ^ */
  CHAR_COLON: 58, /* : */
  CHAR_COMMA: 44, /* , */
  CHAR_DOT: 46, /* . */
  CHAR_DOUBLE_QUOTE: 34, /* " */
  CHAR_EQUAL: 61, /* = */
  CHAR_EXCLAMATION_MARK: 33, /* ! */
  CHAR_FORM_FEED: 12, /* \f */
  CHAR_FORWARD_SLASH: 47, /* / */
  CHAR_GRAVE_ACCENT: 96, /* ` */
  CHAR_HASH: 35, /* # */
  CHAR_HYPHEN_MINUS: 45, /* - */
  CHAR_LEFT_ANGLE_BRACKET: 60, /* < */
  CHAR_LEFT_CURLY_BRACE: 123, /* { */
  CHAR_LEFT_SQUARE_BRACKET: 91, /* [ */
  CHAR_LINE_FEED: 10, /* \n */
  CHAR_NO_BREAK_SPACE: 160, /* \u00A0 */
  CHAR_PERCENT: 37, /* % */
  CHAR_PLUS: 43, /* + */
  CHAR_QUESTION_MARK: 63, /* ? */
  CHAR_RIGHT_ANGLE_BRACKET: 62, /* > */
  CHAR_RIGHT_CURLY_BRACE: 125, /* } */
  CHAR_RIGHT_SQUARE_BRACKET: 93, /* ] */
  CHAR_SEMICOLON: 59, /* ; */
  CHAR_SINGLE_QUOTE: 39, /* ' */
  CHAR_SPACE: 32, /*   */
  CHAR_TAB: 9, /* \t */
  CHAR_UNDERSCORE: 95, /* _ */
  CHAR_VERTICAL_LINE: 124, /* | */
  CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279, /* \uFEFF */

  SEP: path$8.sep,

  /**
   * Create EXTGLOB_CHARS
   */

  extglobChars(chars) {
    return {
      '!': { type: 'negate', open: '(?:(?!(?:', close: `))${chars.STAR})` },
      '?': { type: 'qmark', open: '(?:', close: ')?' },
      '+': { type: 'plus', open: '(?:', close: ')+' },
      '*': { type: 'star', open: '(?:', close: ')*' },
      '@': { type: 'at', open: '(?:', close: ')' }
    };
  },

  /**
   * Create GLOB_CHARS
   */

  globChars(win32) {
    return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
  }
};

(function (exports) {

	const path = require$$0__default$4["default"];
	const win32 = process.platform === 'win32';
	const {
	  REGEX_BACKSLASH,
	  REGEX_REMOVE_BACKSLASH,
	  REGEX_SPECIAL_CHARS,
	  REGEX_SPECIAL_CHARS_GLOBAL
	} = constants$3;

	exports.isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);
	exports.hasRegexChars = str => REGEX_SPECIAL_CHARS.test(str);
	exports.isRegexChar = str => str.length === 1 && exports.hasRegexChars(str);
	exports.escapeRegex = str => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, '\\$1');
	exports.toPosixSlashes = str => str.replace(REGEX_BACKSLASH, '/');

	exports.removeBackslashes = str => {
	  return str.replace(REGEX_REMOVE_BACKSLASH, match => {
	    return match === '\\' ? '' : match;
	  });
	};

	exports.supportsLookbehinds = () => {
	  const segs = process.version.slice(1).split('.').map(Number);
	  if (segs.length === 3 && segs[0] >= 9 || (segs[0] === 8 && segs[1] >= 10)) {
	    return true;
	  }
	  return false;
	};

	exports.isWindows = options => {
	  if (options && typeof options.windows === 'boolean') {
	    return options.windows;
	  }
	  return win32 === true || path.sep === '\\';
	};

	exports.escapeLast = (input, char, lastIdx) => {
	  const idx = input.lastIndexOf(char, lastIdx);
	  if (idx === -1) return input;
	  if (input[idx - 1] === '\\') return exports.escapeLast(input, char, idx - 1);
	  return `${input.slice(0, idx)}\\${input.slice(idx)}`;
	};

	exports.removePrefix = (input, state = {}) => {
	  let output = input;
	  if (output.startsWith('./')) {
	    output = output.slice(2);
	    state.prefix = './';
	  }
	  return output;
	};

	exports.wrapOutput = (input, state = {}, options = {}) => {
	  const prepend = options.contains ? '' : '^';
	  const append = options.contains ? '' : '$';

	  let output = `${prepend}(?:${input})${append}`;
	  if (state.negated === true) {
	    output = `(?:^(?!${output}).*$)`;
	  }
	  return output;
	};
} (utils$f));

const utils$e = utils$f;
const {
  CHAR_ASTERISK,             /* * */
  CHAR_AT,                   /* @ */
  CHAR_BACKWARD_SLASH,       /* \ */
  CHAR_COMMA,                /* , */
  CHAR_DOT,                  /* . */
  CHAR_EXCLAMATION_MARK,     /* ! */
  CHAR_FORWARD_SLASH,        /* / */
  CHAR_LEFT_CURLY_BRACE,     /* { */
  CHAR_LEFT_PARENTHESES,     /* ( */
  CHAR_LEFT_SQUARE_BRACKET,  /* [ */
  CHAR_PLUS,                 /* + */
  CHAR_QUESTION_MARK,        /* ? */
  CHAR_RIGHT_CURLY_BRACE,    /* } */
  CHAR_RIGHT_PARENTHESES,    /* ) */
  CHAR_RIGHT_SQUARE_BRACKET  /* ] */
} = constants$3;

const isPathSeparator = code => {
  return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
};

const depth = token => {
  if (token.isPrefix !== true) {
    token.depth = token.isGlobstar ? Infinity : 1;
  }
};

/**
 * Quickly scans a glob pattern and returns an object with a handful of
 * useful properties, like `isGlob`, `path` (the leading non-glob, if it exists),
 * `glob` (the actual pattern), `negated` (true if the path starts with `!` but not
 * with `!(`) and `negatedExtglob` (true if the path starts with `!(`).
 *
 * ```js
 * const pm = require('picomatch');
 * console.log(pm.scan('foo/bar/*.js'));
 * { isGlob: true, input: 'foo/bar/*.js', base: 'foo/bar', glob: '*.js' }
 * ```
 * @param {String} `str`
 * @param {Object} `options`
 * @return {Object} Returns an object with tokens and regex source string.
 * @api public
 */

const scan$1 = (input, options) => {
  const opts = options || {};

  const length = input.length - 1;
  const scanToEnd = opts.parts === true || opts.scanToEnd === true;
  const slashes = [];
  const tokens = [];
  const parts = [];

  let str = input;
  let index = -1;
  let start = 0;
  let lastIndex = 0;
  let isBrace = false;
  let isBracket = false;
  let isGlob = false;
  let isExtglob = false;
  let isGlobstar = false;
  let braceEscaped = false;
  let backslashes = false;
  let negated = false;
  let negatedExtglob = false;
  let finished = false;
  let braces = 0;
  let prev;
  let code;
  let token = { value: '', depth: 0, isGlob: false };

  const eos = () => index >= length;
  const peek = () => str.charCodeAt(index + 1);
  const advance = () => {
    prev = code;
    return str.charCodeAt(++index);
  };

  while (index < length) {
    code = advance();
    let next;

    if (code === CHAR_BACKWARD_SLASH) {
      backslashes = token.backslashes = true;
      code = advance();

      if (code === CHAR_LEFT_CURLY_BRACE) {
        braceEscaped = true;
      }
      continue;
    }

    if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
      braces++;

      while (eos() !== true && (code = advance())) {
        if (code === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          advance();
          continue;
        }

        if (code === CHAR_LEFT_CURLY_BRACE) {
          braces++;
          continue;
        }

        if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
          isBrace = token.isBrace = true;
          isGlob = token.isGlob = true;
          finished = true;

          if (scanToEnd === true) {
            continue;
          }

          break;
        }

        if (braceEscaped !== true && code === CHAR_COMMA) {
          isBrace = token.isBrace = true;
          isGlob = token.isGlob = true;
          finished = true;

          if (scanToEnd === true) {
            continue;
          }

          break;
        }

        if (code === CHAR_RIGHT_CURLY_BRACE) {
          braces--;

          if (braces === 0) {
            braceEscaped = false;
            isBrace = token.isBrace = true;
            finished = true;
            break;
          }
        }
      }

      if (scanToEnd === true) {
        continue;
      }

      break;
    }

    if (code === CHAR_FORWARD_SLASH) {
      slashes.push(index);
      tokens.push(token);
      token = { value: '', depth: 0, isGlob: false };

      if (finished === true) continue;
      if (prev === CHAR_DOT && index === (start + 1)) {
        start += 2;
        continue;
      }

      lastIndex = index + 1;
      continue;
    }

    if (opts.noext !== true) {
      const isExtglobChar = code === CHAR_PLUS
        || code === CHAR_AT
        || code === CHAR_ASTERISK
        || code === CHAR_QUESTION_MARK
        || code === CHAR_EXCLAMATION_MARK;

      if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
        isGlob = token.isGlob = true;
        isExtglob = token.isExtglob = true;
        finished = true;
        if (code === CHAR_EXCLAMATION_MARK && index === start) {
          negatedExtglob = true;
        }

        if (scanToEnd === true) {
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              code = advance();
              continue;
            }

            if (code === CHAR_RIGHT_PARENTHESES) {
              isGlob = token.isGlob = true;
              finished = true;
              break;
            }
          }
          continue;
        }
        break;
      }
    }

    if (code === CHAR_ASTERISK) {
      if (prev === CHAR_ASTERISK) isGlobstar = token.isGlobstar = true;
      isGlob = token.isGlob = true;
      finished = true;

      if (scanToEnd === true) {
        continue;
      }
      break;
    }

    if (code === CHAR_QUESTION_MARK) {
      isGlob = token.isGlob = true;
      finished = true;

      if (scanToEnd === true) {
        continue;
      }
      break;
    }

    if (code === CHAR_LEFT_SQUARE_BRACKET) {
      while (eos() !== true && (next = advance())) {
        if (next === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          advance();
          continue;
        }

        if (next === CHAR_RIGHT_SQUARE_BRACKET) {
          isBracket = token.isBracket = true;
          isGlob = token.isGlob = true;
          finished = true;
          break;
        }
      }

      if (scanToEnd === true) {
        continue;
      }

      break;
    }

    if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
      negated = token.negated = true;
      start++;
      continue;
    }

    if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
      isGlob = token.isGlob = true;

      if (scanToEnd === true) {
        while (eos() !== true && (code = advance())) {
          if (code === CHAR_LEFT_PARENTHESES) {
            backslashes = token.backslashes = true;
            code = advance();
            continue;
          }

          if (code === CHAR_RIGHT_PARENTHESES) {
            finished = true;
            break;
          }
        }
        continue;
      }
      break;
    }

    if (isGlob === true) {
      finished = true;

      if (scanToEnd === true) {
        continue;
      }

      break;
    }
  }

  if (opts.noext === true) {
    isExtglob = false;
    isGlob = false;
  }

  let base = str;
  let prefix = '';
  let glob = '';

  if (start > 0) {
    prefix = str.slice(0, start);
    str = str.slice(start);
    lastIndex -= start;
  }

  if (base && isGlob === true && lastIndex > 0) {
    base = str.slice(0, lastIndex);
    glob = str.slice(lastIndex);
  } else if (isGlob === true) {
    base = '';
    glob = str;
  } else {
    base = str;
  }

  if (base && base !== '' && base !== '/' && base !== str) {
    if (isPathSeparator(base.charCodeAt(base.length - 1))) {
      base = base.slice(0, -1);
    }
  }

  if (opts.unescape === true) {
    if (glob) glob = utils$e.removeBackslashes(glob);

    if (base && backslashes === true) {
      base = utils$e.removeBackslashes(base);
    }
  }

  const state = {
    prefix,
    input,
    start,
    base,
    glob,
    isBrace,
    isBracket,
    isGlob,
    isExtglob,
    isGlobstar,
    negated,
    negatedExtglob
  };

  if (opts.tokens === true) {
    state.maxDepth = 0;
    if (!isPathSeparator(code)) {
      tokens.push(token);
    }
    state.tokens = tokens;
  }

  if (opts.parts === true || opts.tokens === true) {
    let prevIndex;

    for (let idx = 0; idx < slashes.length; idx++) {
      const n = prevIndex ? prevIndex + 1 : start;
      const i = slashes[idx];
      const value = input.slice(n, i);
      if (opts.tokens) {
        if (idx === 0 && start !== 0) {
          tokens[idx].isPrefix = true;
          tokens[idx].value = prefix;
        } else {
          tokens[idx].value = value;
        }
        depth(tokens[idx]);
        state.maxDepth += tokens[idx].depth;
      }
      if (idx !== 0 || value !== '') {
        parts.push(value);
      }
      prevIndex = i;
    }

    if (prevIndex && prevIndex + 1 < input.length) {
      const value = input.slice(prevIndex + 1);
      parts.push(value);

      if (opts.tokens) {
        tokens[tokens.length - 1].value = value;
        depth(tokens[tokens.length - 1]);
        state.maxDepth += tokens[tokens.length - 1].depth;
      }
    }

    state.slashes = slashes;
    state.parts = parts;
  }

  return state;
};

var scan_1 = scan$1;

const constants$2 = constants$3;
const utils$d = utils$f;

/**
 * Constants
 */

const {
  MAX_LENGTH,
  POSIX_REGEX_SOURCE,
  REGEX_NON_SPECIAL_CHARS,
  REGEX_SPECIAL_CHARS_BACKREF,
  REPLACEMENTS
} = constants$2;

/**
 * Helpers
 */

const expandRange = (args, options) => {
  if (typeof options.expandRange === 'function') {
    return options.expandRange(...args, options);
  }

  args.sort();
  const value = `[${args.join('-')}]`;

  try {
    /* eslint-disable-next-line no-new */
    new RegExp(value);
  } catch (ex) {
    return args.map(v => utils$d.escapeRegex(v)).join('..');
  }

  return value;
};

/**
 * Create the message for a syntax error
 */

const syntaxError = (type, char) => {
  return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
};

/**
 * Parse the given input string.
 * @param {String} input
 * @param {Object} options
 * @return {Object}
 */

const parse$1 = (input, options) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected a string');
  }

  input = REPLACEMENTS[input] || input;

  const opts = { ...options };
  const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;

  let len = input.length;
  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }

  const bos = { type: 'bos', value: '', output: opts.prepend || '' };
  const tokens = [bos];

  const capture = opts.capture ? '' : '?:';
  const win32 = utils$d.isWindows(options);

  // create constants based on platform, for windows or posix
  const PLATFORM_CHARS = constants$2.globChars(win32);
  const EXTGLOB_CHARS = constants$2.extglobChars(PLATFORM_CHARS);

  const {
    DOT_LITERAL,
    PLUS_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOT_SLASH,
    NO_DOTS_SLASH,
    QMARK,
    QMARK_NO_DOT,
    STAR,
    START_ANCHOR
  } = PLATFORM_CHARS;

  const globstar = opts => {
    return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
  };

  const nodot = opts.dot ? '' : NO_DOT;
  const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
  let star = opts.bash === true ? globstar(opts) : STAR;

  if (opts.capture) {
    star = `(${star})`;
  }

  // minimatch options support
  if (typeof opts.noext === 'boolean') {
    opts.noextglob = opts.noext;
  }

  const state = {
    input,
    index: -1,
    start: 0,
    dot: opts.dot === true,
    consumed: '',
    output: '',
    prefix: '',
    backtrack: false,
    negated: false,
    brackets: 0,
    braces: 0,
    parens: 0,
    quotes: 0,
    globstar: false,
    tokens
  };

  input = utils$d.removePrefix(input, state);
  len = input.length;

  const extglobs = [];
  const braces = [];
  const stack = [];
  let prev = bos;
  let value;

  /**
   * Tokenizing helpers
   */

  const eos = () => state.index === len - 1;
  const peek = state.peek = (n = 1) => input[state.index + n];
  const advance = state.advance = () => input[++state.index] || '';
  const remaining = () => input.slice(state.index + 1);
  const consume = (value = '', num = 0) => {
    state.consumed += value;
    state.index += num;
  };

  const append = token => {
    state.output += token.output != null ? token.output : token.value;
    consume(token.value);
  };

  const negate = () => {
    let count = 1;

    while (peek() === '!' && (peek(2) !== '(' || peek(3) === '?')) {
      advance();
      state.start++;
      count++;
    }

    if (count % 2 === 0) {
      return false;
    }

    state.negated = true;
    state.start++;
    return true;
  };

  const increment = type => {
    state[type]++;
    stack.push(type);
  };

  const decrement = type => {
    state[type]--;
    stack.pop();
  };

  /**
   * Push tokens onto the tokens array. This helper speeds up
   * tokenizing by 1) helping us avoid backtracking as much as possible,
   * and 2) helping us avoid creating extra tokens when consecutive
   * characters are plain text. This improves performance and simplifies
   * lookbehinds.
   */

  const push = tok => {
    if (prev.type === 'globstar') {
      const isBrace = state.braces > 0 && (tok.type === 'comma' || tok.type === 'brace');
      const isExtglob = tok.extglob === true || (extglobs.length && (tok.type === 'pipe' || tok.type === 'paren'));

      if (tok.type !== 'slash' && tok.type !== 'paren' && !isBrace && !isExtglob) {
        state.output = state.output.slice(0, -prev.output.length);
        prev.type = 'star';
        prev.value = '*';
        prev.output = star;
        state.output += prev.output;
      }
    }

    if (extglobs.length && tok.type !== 'paren') {
      extglobs[extglobs.length - 1].inner += tok.value;
    }

    if (tok.value || tok.output) append(tok);
    if (prev && prev.type === 'text' && tok.type === 'text') {
      prev.value += tok.value;
      prev.output = (prev.output || '') + tok.value;
      return;
    }

    tok.prev = prev;
    tokens.push(tok);
    prev = tok;
  };

  const extglobOpen = (type, value) => {
    const token = { ...EXTGLOB_CHARS[value], conditions: 1, inner: '' };

    token.prev = prev;
    token.parens = state.parens;
    token.output = state.output;
    const output = (opts.capture ? '(' : '') + token.open;

    increment('parens');
    push({ type, value, output: state.output ? '' : ONE_CHAR });
    push({ type: 'paren', extglob: true, value: advance(), output });
    extglobs.push(token);
  };

  const extglobClose = token => {
    let output = token.close + (opts.capture ? ')' : '');
    let rest;

    if (token.type === 'negate') {
      let extglobStar = star;

      if (token.inner && token.inner.length > 1 && token.inner.includes('/')) {
        extglobStar = globstar(opts);
      }

      if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
        output = token.close = `)$))${extglobStar}`;
      }

      if (token.inner.includes('*') && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
        // Any non-magical string (`.ts`) or even nested expression (`.{ts,tsx}`) can follow after the closing parenthesis.
        // In this case, we need to parse the string and use it in the output of the original pattern.
        // Suitable patterns: `/!(*.d).ts`, `/!(*.d).{ts,tsx}`, `**/!(*-dbg).@(js)`.
        //
        // Disabling the `fastpaths` option due to a problem with parsing strings as `.ts` in the pattern like `**/!(*.d).ts`.
        const expression = parse$1(rest, { ...options, fastpaths: false }).output;

        output = token.close = `)${expression})${extglobStar})`;
      }

      if (token.prev.type === 'bos') {
        state.negatedExtglob = true;
      }
    }

    push({ type: 'paren', extglob: true, value, output });
    decrement('parens');
  };

  /**
   * Fast paths
   */

  if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
    let backslashes = false;

    let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first, rest, index) => {
      if (first === '\\') {
        backslashes = true;
        return m;
      }

      if (first === '?') {
        if (esc) {
          return esc + first + (rest ? QMARK.repeat(rest.length) : '');
        }
        if (index === 0) {
          return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : '');
        }
        return QMARK.repeat(chars.length);
      }

      if (first === '.') {
        return DOT_LITERAL.repeat(chars.length);
      }

      if (first === '*') {
        if (esc) {
          return esc + first + (rest ? star : '');
        }
        return star;
      }
      return esc ? m : `\\${m}`;
    });

    if (backslashes === true) {
      if (opts.unescape === true) {
        output = output.replace(/\\/g, '');
      } else {
        output = output.replace(/\\+/g, m => {
          return m.length % 2 === 0 ? '\\\\' : (m ? '\\' : '');
        });
      }
    }

    if (output === input && opts.contains === true) {
      state.output = input;
      return state;
    }

    state.output = utils$d.wrapOutput(output, state, options);
    return state;
  }

  /**
   * Tokenize input until we reach end-of-string
   */

  while (!eos()) {
    value = advance();

    if (value === '\u0000') {
      continue;
    }

    /**
     * Escaped characters
     */

    if (value === '\\') {
      const next = peek();

      if (next === '/' && opts.bash !== true) {
        continue;
      }

      if (next === '.' || next === ';') {
        continue;
      }

      if (!next) {
        value += '\\';
        push({ type: 'text', value });
        continue;
      }

      // collapse slashes to reduce potential for exploits
      const match = /^\\+/.exec(remaining());
      let slashes = 0;

      if (match && match[0].length > 2) {
        slashes = match[0].length;
        state.index += slashes;
        if (slashes % 2 !== 0) {
          value += '\\';
        }
      }

      if (opts.unescape === true) {
        value = advance();
      } else {
        value += advance();
      }

      if (state.brackets === 0) {
        push({ type: 'text', value });
        continue;
      }
    }

    /**
     * If we're inside a regex character class, continue
     * until we reach the closing bracket.
     */

    if (state.brackets > 0 && (value !== ']' || prev.value === '[' || prev.value === '[^')) {
      if (opts.posix !== false && value === ':') {
        const inner = prev.value.slice(1);
        if (inner.includes('[')) {
          prev.posix = true;

          if (inner.includes(':')) {
            const idx = prev.value.lastIndexOf('[');
            const pre = prev.value.slice(0, idx);
            const rest = prev.value.slice(idx + 2);
            const posix = POSIX_REGEX_SOURCE[rest];
            if (posix) {
              prev.value = pre + posix;
              state.backtrack = true;
              advance();

              if (!bos.output && tokens.indexOf(prev) === 1) {
                bos.output = ONE_CHAR;
              }
              continue;
            }
          }
        }
      }

      if ((value === '[' && peek() !== ':') || (value === '-' && peek() === ']')) {
        value = `\\${value}`;
      }

      if (value === ']' && (prev.value === '[' || prev.value === '[^')) {
        value = `\\${value}`;
      }

      if (opts.posix === true && value === '!' && prev.value === '[') {
        value = '^';
      }

      prev.value += value;
      append({ value });
      continue;
    }

    /**
     * If we're inside a quoted string, continue
     * until we reach the closing double quote.
     */

    if (state.quotes === 1 && value !== '"') {
      value = utils$d.escapeRegex(value);
      prev.value += value;
      append({ value });
      continue;
    }

    /**
     * Double quotes
     */

    if (value === '"') {
      state.quotes = state.quotes === 1 ? 0 : 1;
      if (opts.keepQuotes === true) {
        push({ type: 'text', value });
      }
      continue;
    }

    /**
     * Parentheses
     */

    if (value === '(') {
      increment('parens');
      push({ type: 'paren', value });
      continue;
    }

    if (value === ')') {
      if (state.parens === 0 && opts.strictBrackets === true) {
        throw new SyntaxError(syntaxError('opening', '('));
      }

      const extglob = extglobs[extglobs.length - 1];
      if (extglob && state.parens === extglob.parens + 1) {
        extglobClose(extglobs.pop());
        continue;
      }

      push({ type: 'paren', value, output: state.parens ? ')' : '\\)' });
      decrement('parens');
      continue;
    }

    /**
     * Square brackets
     */

    if (value === '[') {
      if (opts.nobracket === true || !remaining().includes(']')) {
        if (opts.nobracket !== true && opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError('closing', ']'));
        }

        value = `\\${value}`;
      } else {
        increment('brackets');
      }

      push({ type: 'bracket', value });
      continue;
    }

    if (value === ']') {
      if (opts.nobracket === true || (prev && prev.type === 'bracket' && prev.value.length === 1)) {
        push({ type: 'text', value, output: `\\${value}` });
        continue;
      }

      if (state.brackets === 0) {
        if (opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError('opening', '['));
        }

        push({ type: 'text', value, output: `\\${value}` });
        continue;
      }

      decrement('brackets');

      const prevValue = prev.value.slice(1);
      if (prev.posix !== true && prevValue[0] === '^' && !prevValue.includes('/')) {
        value = `/${value}`;
      }

      prev.value += value;
      append({ value });

      // when literal brackets are explicitly disabled
      // assume we should match with a regex character class
      if (opts.literalBrackets === false || utils$d.hasRegexChars(prevValue)) {
        continue;
      }

      const escaped = utils$d.escapeRegex(prev.value);
      state.output = state.output.slice(0, -prev.value.length);

      // when literal brackets are explicitly enabled
      // assume we should escape the brackets to match literal characters
      if (opts.literalBrackets === true) {
        state.output += escaped;
        prev.value = escaped;
        continue;
      }

      // when the user specifies nothing, try to match both
      prev.value = `(${capture}${escaped}|${prev.value})`;
      state.output += prev.value;
      continue;
    }

    /**
     * Braces
     */

    if (value === '{' && opts.nobrace !== true) {
      increment('braces');

      const open = {
        type: 'brace',
        value,
        output: '(',
        outputIndex: state.output.length,
        tokensIndex: state.tokens.length
      };

      braces.push(open);
      push(open);
      continue;
    }

    if (value === '}') {
      const brace = braces[braces.length - 1];

      if (opts.nobrace === true || !brace) {
        push({ type: 'text', value, output: value });
        continue;
      }

      let output = ')';

      if (brace.dots === true) {
        const arr = tokens.slice();
        const range = [];

        for (let i = arr.length - 1; i >= 0; i--) {
          tokens.pop();
          if (arr[i].type === 'brace') {
            break;
          }
          if (arr[i].type !== 'dots') {
            range.unshift(arr[i].value);
          }
        }

        output = expandRange(range, opts);
        state.backtrack = true;
      }

      if (brace.comma !== true && brace.dots !== true) {
        const out = state.output.slice(0, brace.outputIndex);
        const toks = state.tokens.slice(brace.tokensIndex);
        brace.value = brace.output = '\\{';
        value = output = '\\}';
        state.output = out;
        for (const t of toks) {
          state.output += (t.output || t.value);
        }
      }

      push({ type: 'brace', value, output });
      decrement('braces');
      braces.pop();
      continue;
    }

    /**
     * Pipes
     */

    if (value === '|') {
      if (extglobs.length > 0) {
        extglobs[extglobs.length - 1].conditions++;
      }
      push({ type: 'text', value });
      continue;
    }

    /**
     * Commas
     */

    if (value === ',') {
      let output = value;

      const brace = braces[braces.length - 1];
      if (brace && stack[stack.length - 1] === 'braces') {
        brace.comma = true;
        output = '|';
      }

      push({ type: 'comma', value, output });
      continue;
    }

    /**
     * Slashes
     */

    if (value === '/') {
      // if the beginning of the glob is "./", advance the start
      // to the current index, and don't add the "./" characters
      // to the state. This greatly simplifies lookbehinds when
      // checking for BOS characters like "!" and "." (not "./")
      if (prev.type === 'dot' && state.index === state.start + 1) {
        state.start = state.index + 1;
        state.consumed = '';
        state.output = '';
        tokens.pop();
        prev = bos; // reset "prev" to the first token
        continue;
      }

      push({ type: 'slash', value, output: SLASH_LITERAL });
      continue;
    }

    /**
     * Dots
     */

    if (value === '.') {
      if (state.braces > 0 && prev.type === 'dot') {
        if (prev.value === '.') prev.output = DOT_LITERAL;
        const brace = braces[braces.length - 1];
        prev.type = 'dots';
        prev.output += value;
        prev.value += value;
        brace.dots = true;
        continue;
      }

      if ((state.braces + state.parens) === 0 && prev.type !== 'bos' && prev.type !== 'slash') {
        push({ type: 'text', value, output: DOT_LITERAL });
        continue;
      }

      push({ type: 'dot', value, output: DOT_LITERAL });
      continue;
    }

    /**
     * Question marks
     */

    if (value === '?') {
      const isGroup = prev && prev.value === '(';
      if (!isGroup && opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        extglobOpen('qmark', value);
        continue;
      }

      if (prev && prev.type === 'paren') {
        const next = peek();
        let output = value;

        if (next === '<' && !utils$d.supportsLookbehinds()) {
          throw new Error('Node.js v10 or higher is required for regex lookbehinds');
        }

        if ((prev.value === '(' && !/[!=<:]/.test(next)) || (next === '<' && !/<([!=]|\w+>)/.test(remaining()))) {
          output = `\\${value}`;
        }

        push({ type: 'text', value, output });
        continue;
      }

      if (opts.dot !== true && (prev.type === 'slash' || prev.type === 'bos')) {
        push({ type: 'qmark', value, output: QMARK_NO_DOT });
        continue;
      }

      push({ type: 'qmark', value, output: QMARK });
      continue;
    }

    /**
     * Exclamation
     */

    if (value === '!') {
      if (opts.noextglob !== true && peek() === '(') {
        if (peek(2) !== '?' || !/[!=<:]/.test(peek(3))) {
          extglobOpen('negate', value);
          continue;
        }
      }

      if (opts.nonegate !== true && state.index === 0) {
        negate();
        continue;
      }
    }

    /**
     * Plus
     */

    if (value === '+') {
      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        extglobOpen('plus', value);
        continue;
      }

      if ((prev && prev.value === '(') || opts.regex === false) {
        push({ type: 'plus', value, output: PLUS_LITERAL });
        continue;
      }

      if ((prev && (prev.type === 'bracket' || prev.type === 'paren' || prev.type === 'brace')) || state.parens > 0) {
        push({ type: 'plus', value });
        continue;
      }

      push({ type: 'plus', value: PLUS_LITERAL });
      continue;
    }

    /**
     * Plain text
     */

    if (value === '@') {
      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        push({ type: 'at', extglob: true, value, output: '' });
        continue;
      }

      push({ type: 'text', value });
      continue;
    }

    /**
     * Plain text
     */

    if (value !== '*') {
      if (value === '$' || value === '^') {
        value = `\\${value}`;
      }

      const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
      if (match) {
        value += match[0];
        state.index += match[0].length;
      }

      push({ type: 'text', value });
      continue;
    }

    /**
     * Stars
     */

    if (prev && (prev.type === 'globstar' || prev.star === true)) {
      prev.type = 'star';
      prev.star = true;
      prev.value += value;
      prev.output = star;
      state.backtrack = true;
      state.globstar = true;
      consume(value);
      continue;
    }

    let rest = remaining();
    if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
      extglobOpen('star', value);
      continue;
    }

    if (prev.type === 'star') {
      if (opts.noglobstar === true) {
        consume(value);
        continue;
      }

      const prior = prev.prev;
      const before = prior.prev;
      const isStart = prior.type === 'slash' || prior.type === 'bos';
      const afterStar = before && (before.type === 'star' || before.type === 'globstar');

      if (opts.bash === true && (!isStart || (rest[0] && rest[0] !== '/'))) {
        push({ type: 'star', value, output: '' });
        continue;
      }

      const isBrace = state.braces > 0 && (prior.type === 'comma' || prior.type === 'brace');
      const isExtglob = extglobs.length && (prior.type === 'pipe' || prior.type === 'paren');
      if (!isStart && prior.type !== 'paren' && !isBrace && !isExtglob) {
        push({ type: 'star', value, output: '' });
        continue;
      }

      // strip consecutive `/**/`
      while (rest.slice(0, 3) === '/**') {
        const after = input[state.index + 4];
        if (after && after !== '/') {
          break;
        }
        rest = rest.slice(3);
        consume('/**', 3);
      }

      if (prior.type === 'bos' && eos()) {
        prev.type = 'globstar';
        prev.value += value;
        prev.output = globstar(opts);
        state.output = prev.output;
        state.globstar = true;
        consume(value);
        continue;
      }

      if (prior.type === 'slash' && prior.prev.type !== 'bos' && !afterStar && eos()) {
        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = `(?:${prior.output}`;

        prev.type = 'globstar';
        prev.output = globstar(opts) + (opts.strictSlashes ? ')' : '|$)');
        prev.value += value;
        state.globstar = true;
        state.output += prior.output + prev.output;
        consume(value);
        continue;
      }

      if (prior.type === 'slash' && prior.prev.type !== 'bos' && rest[0] === '/') {
        const end = rest[1] !== void 0 ? '|$' : '';

        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = `(?:${prior.output}`;

        prev.type = 'globstar';
        prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
        prev.value += value;

        state.output += prior.output + prev.output;
        state.globstar = true;

        consume(value + advance());

        push({ type: 'slash', value: '/', output: '' });
        continue;
      }

      if (prior.type === 'bos' && rest[0] === '/') {
        prev.type = 'globstar';
        prev.value += value;
        prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
        state.output = prev.output;
        state.globstar = true;
        consume(value + advance());
        push({ type: 'slash', value: '/', output: '' });
        continue;
      }

      // remove single star from output
      state.output = state.output.slice(0, -prev.output.length);

      // reset previous token to globstar
      prev.type = 'globstar';
      prev.output = globstar(opts);
      prev.value += value;

      // reset output with globstar
      state.output += prev.output;
      state.globstar = true;
      consume(value);
      continue;
    }

    const token = { type: 'star', value, output: star };

    if (opts.bash === true) {
      token.output = '.*?';
      if (prev.type === 'bos' || prev.type === 'slash') {
        token.output = nodot + token.output;
      }
      push(token);
      continue;
    }

    if (prev && (prev.type === 'bracket' || prev.type === 'paren') && opts.regex === true) {
      token.output = value;
      push(token);
      continue;
    }

    if (state.index === state.start || prev.type === 'slash' || prev.type === 'dot') {
      if (prev.type === 'dot') {
        state.output += NO_DOT_SLASH;
        prev.output += NO_DOT_SLASH;

      } else if (opts.dot === true) {
        state.output += NO_DOTS_SLASH;
        prev.output += NO_DOTS_SLASH;

      } else {
        state.output += nodot;
        prev.output += nodot;
      }

      if (peek() !== '*') {
        state.output += ONE_CHAR;
        prev.output += ONE_CHAR;
      }
    }

    push(token);
  }

  while (state.brackets > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ']'));
    state.output = utils$d.escapeLast(state.output, '[');
    decrement('brackets');
  }

  while (state.parens > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ')'));
    state.output = utils$d.escapeLast(state.output, '(');
    decrement('parens');
  }

  while (state.braces > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', '}'));
    state.output = utils$d.escapeLast(state.output, '{');
    decrement('braces');
  }

  if (opts.strictSlashes !== true && (prev.type === 'star' || prev.type === 'bracket')) {
    push({ type: 'maybe_slash', value: '', output: `${SLASH_LITERAL}?` });
  }

  // rebuild the output if we had to backtrack at any point
  if (state.backtrack === true) {
    state.output = '';

    for (const token of state.tokens) {
      state.output += token.output != null ? token.output : token.value;

      if (token.suffix) {
        state.output += token.suffix;
      }
    }
  }

  return state;
};

/**
 * Fast paths for creating regular expressions for common glob patterns.
 * This can significantly speed up processing and has very little downside
 * impact when none of the fast paths match.
 */

parse$1.fastpaths = (input, options) => {
  const opts = { ...options };
  const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
  const len = input.length;
  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }

  input = REPLACEMENTS[input] || input;
  const win32 = utils$d.isWindows(options);

  // create constants based on platform, for windows or posix
  const {
    DOT_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOTS,
    NO_DOTS_SLASH,
    STAR,
    START_ANCHOR
  } = constants$2.globChars(win32);

  const nodot = opts.dot ? NO_DOTS : NO_DOT;
  const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
  const capture = opts.capture ? '' : '?:';
  const state = { negated: false, prefix: '' };
  let star = opts.bash === true ? '.*?' : STAR;

  if (opts.capture) {
    star = `(${star})`;
  }

  const globstar = opts => {
    if (opts.noglobstar === true) return star;
    return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
  };

  const create = str => {
    switch (str) {
      case '*':
        return `${nodot}${ONE_CHAR}${star}`;

      case '.*':
        return `${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '*.*':
        return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '*/*':
        return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;

      case '**':
        return nodot + globstar(opts);

      case '**/*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;

      case '**/*.*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '**/.*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;

      default: {
        const match = /^(.*?)\.(\w+)$/.exec(str);
        if (!match) return;

        const source = create(match[1]);
        if (!source) return;

        return source + DOT_LITERAL + match[2];
      }
    }
  };

  const output = utils$d.removePrefix(input, state);
  let source = create(output);

  if (source && opts.strictSlashes !== true) {
    source += `${SLASH_LITERAL}?`;
  }

  return source;
};

var parse_1 = parse$1;

const path$7 = require$$0__default$4["default"];
const scan = scan_1;
const parse = parse_1;
const utils$c = utils$f;
const constants$1 = constants$3;
const isObject = val => val && typeof val === 'object' && !Array.isArray(val);

/**
 * Creates a matcher function from one or more glob patterns. The
 * returned function takes a string to match as its first argument,
 * and returns true if the string is a match. The returned matcher
 * function also takes a boolean as the second argument that, when true,
 * returns an object with additional information.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch(glob[, options]);
 *
 * const isMatch = picomatch('*.!(*a)');
 * console.log(isMatch('a.a')); //=> false
 * console.log(isMatch('a.b')); //=> true
 * ```
 * @name picomatch
 * @param {String|Array} `globs` One or more glob patterns.
 * @param {Object=} `options`
 * @return {Function=} Returns a matcher function.
 * @api public
 */

const picomatch$1 = (glob, options, returnState = false) => {
  if (Array.isArray(glob)) {
    const fns = glob.map(input => picomatch$1(input, options, returnState));
    const arrayMatcher = str => {
      for (const isMatch of fns) {
        const state = isMatch(str);
        if (state) return state;
      }
      return false;
    };
    return arrayMatcher;
  }

  const isState = isObject(glob) && glob.tokens && glob.input;

  if (glob === '' || (typeof glob !== 'string' && !isState)) {
    throw new TypeError('Expected pattern to be a non-empty string');
  }

  const opts = options || {};
  const posix = utils$c.isWindows(options);
  const regex = isState
    ? picomatch$1.compileRe(glob, options)
    : picomatch$1.makeRe(glob, options, false, true);

  const state = regex.state;
  delete regex.state;

  let isIgnored = () => false;
  if (opts.ignore) {
    const ignoreOpts = { ...options, ignore: null, onMatch: null, onResult: null };
    isIgnored = picomatch$1(opts.ignore, ignoreOpts, returnState);
  }

  const matcher = (input, returnObject = false) => {
    const { isMatch, match, output } = picomatch$1.test(input, regex, options, { glob, posix });
    const result = { glob, state, regex, posix, input, output, match, isMatch };

    if (typeof opts.onResult === 'function') {
      opts.onResult(result);
    }

    if (isMatch === false) {
      result.isMatch = false;
      return returnObject ? result : false;
    }

    if (isIgnored(input)) {
      if (typeof opts.onIgnore === 'function') {
        opts.onIgnore(result);
      }
      result.isMatch = false;
      return returnObject ? result : false;
    }

    if (typeof opts.onMatch === 'function') {
      opts.onMatch(result);
    }
    return returnObject ? result : true;
  };

  if (returnState) {
    matcher.state = state;
  }

  return matcher;
};

/**
 * Test `input` with the given `regex`. This is used by the main
 * `picomatch()` function to test the input string.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.test(input, regex[, options]);
 *
 * console.log(picomatch.test('foo/bar', /^(?:([^/]*?)\/([^/]*?))$/));
 * // { isMatch: true, match: [ 'foo/', 'foo', 'bar' ], output: 'foo/bar' }
 * ```
 * @param {String} `input` String to test.
 * @param {RegExp} `regex`
 * @return {Object} Returns an object with matching info.
 * @api public
 */

picomatch$1.test = (input, regex, options, { glob, posix } = {}) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected input to be a string');
  }

  if (input === '') {
    return { isMatch: false, output: '' };
  }

  const opts = options || {};
  const format = opts.format || (posix ? utils$c.toPosixSlashes : null);
  let match = input === glob;
  let output = (match && format) ? format(input) : input;

  if (match === false) {
    output = format ? format(input) : input;
    match = output === glob;
  }

  if (match === false || opts.capture === true) {
    if (opts.matchBase === true || opts.basename === true) {
      match = picomatch$1.matchBase(input, regex, options, posix);
    } else {
      match = regex.exec(output);
    }
  }

  return { isMatch: Boolean(match), match, output };
};

/**
 * Match the basename of a filepath.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.matchBase(input, glob[, options]);
 * console.log(picomatch.matchBase('foo/bar.js', '*.js'); // true
 * ```
 * @param {String} `input` String to test.
 * @param {RegExp|String} `glob` Glob pattern or regex created by [.makeRe](#makeRe).
 * @return {Boolean}
 * @api public
 */

picomatch$1.matchBase = (input, glob, options, posix = utils$c.isWindows(options)) => {
  const regex = glob instanceof RegExp ? glob : picomatch$1.makeRe(glob, options);
  return regex.test(path$7.basename(input));
};

/**
 * Returns true if **any** of the given glob `patterns` match the specified `string`.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.isMatch(string, patterns[, options]);
 *
 * console.log(picomatch.isMatch('a.a', ['b.*', '*.a'])); //=> true
 * console.log(picomatch.isMatch('a.a', 'b.*')); //=> false
 * ```
 * @param {String|Array} str The string to test.
 * @param {String|Array} patterns One or more glob patterns to use for matching.
 * @param {Object} [options] See available [options](#options).
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */

picomatch$1.isMatch = (str, patterns, options) => picomatch$1(patterns, options)(str);

/**
 * Parse a glob pattern to create the source string for a regular
 * expression.
 *
 * ```js
 * const picomatch = require('picomatch');
 * const result = picomatch.parse(pattern[, options]);
 * ```
 * @param {String} `pattern`
 * @param {Object} `options`
 * @return {Object} Returns an object with useful properties and output to be used as a regex source string.
 * @api public
 */

picomatch$1.parse = (pattern, options) => {
  if (Array.isArray(pattern)) return pattern.map(p => picomatch$1.parse(p, options));
  return parse(pattern, { ...options, fastpaths: false });
};

/**
 * Scan a glob pattern to separate the pattern into segments.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.scan(input[, options]);
 *
 * const result = picomatch.scan('!./foo/*.js');
 * console.log(result);
 * { prefix: '!./',
 *   input: '!./foo/*.js',
 *   start: 3,
 *   base: 'foo',
 *   glob: '*.js',
 *   isBrace: false,
 *   isBracket: false,
 *   isGlob: true,
 *   isExtglob: false,
 *   isGlobstar: false,
 *   negated: true }
 * ```
 * @param {String} `input` Glob pattern to scan.
 * @param {Object} `options`
 * @return {Object} Returns an object with
 * @api public
 */

picomatch$1.scan = (input, options) => scan(input, options);

/**
 * Compile a regular expression from the `state` object returned by the
 * [parse()](#parse) method.
 *
 * @param {Object} `state`
 * @param {Object} `options`
 * @param {Boolean} `returnOutput` Intended for implementors, this argument allows you to return the raw output from the parser.
 * @param {Boolean} `returnState` Adds the state to a `state` property on the returned regex. Useful for implementors and debugging.
 * @return {RegExp}
 * @api public
 */

picomatch$1.compileRe = (state, options, returnOutput = false, returnState = false) => {
  if (returnOutput === true) {
    return state.output;
  }

  const opts = options || {};
  const prepend = opts.contains ? '' : '^';
  const append = opts.contains ? '' : '$';

  let source = `${prepend}(?:${state.output})${append}`;
  if (state && state.negated === true) {
    source = `^(?!${source}).*$`;
  }

  const regex = picomatch$1.toRegex(source, options);
  if (returnState === true) {
    regex.state = state;
  }

  return regex;
};

/**
 * Create a regular expression from a parsed glob pattern.
 *
 * ```js
 * const picomatch = require('picomatch');
 * const state = picomatch.parse('*.js');
 * // picomatch.compileRe(state[, options]);
 *
 * console.log(picomatch.compileRe(state));
 * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
 * ```
 * @param {String} `state` The object returned from the `.parse` method.
 * @param {Object} `options`
 * @param {Boolean} `returnOutput` Implementors may use this argument to return the compiled output, instead of a regular expression. This is not exposed on the options to prevent end-users from mutating the result.
 * @param {Boolean} `returnState` Implementors may use this argument to return the state from the parsed glob with the returned regular expression.
 * @return {RegExp} Returns a regex created from the given pattern.
 * @api public
 */

picomatch$1.makeRe = (input, options = {}, returnOutput = false, returnState = false) => {
  if (!input || typeof input !== 'string') {
    throw new TypeError('Expected a non-empty string');
  }

  let parsed = { negated: false, fastpaths: true };

  if (options.fastpaths !== false && (input[0] === '.' || input[0] === '*')) {
    parsed.output = parse.fastpaths(input, options);
  }

  if (!parsed.output) {
    parsed = parse(input, options);
  }

  return picomatch$1.compileRe(parsed, options, returnOutput, returnState);
};

/**
 * Create a regular expression from the given regex source string.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.toRegex(source[, options]);
 *
 * const { output } = picomatch.parse('*.js');
 * console.log(picomatch.toRegex(output));
 * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
 * ```
 * @param {String} `source` Regular expression source string.
 * @param {Object} `options`
 * @return {RegExp}
 * @api public
 */

picomatch$1.toRegex = (source, options) => {
  try {
    const opts = options || {};
    return new RegExp(source, opts.flags || (opts.nocase ? 'i' : ''));
  } catch (err) {
    if (options && options.debug === true) throw err;
    return /$^/;
  }
};

/**
 * Picomatch constants.
 * @return {Object}
 */

picomatch$1.constants = constants$1;

/**
 * Expose "picomatch"
 */

var picomatch_1 = picomatch$1;

(function (module) {

	module.exports = picomatch_1;
} (picomatch$2));

const util$2 = require$$0__default$3["default"];
const braces = braces_1;
const picomatch = picomatch$2.exports;
const utils$b = utils$f;
const isEmptyString = val => val === '' || val === './';

/**
 * Returns an array of strings that match one or more glob patterns.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm(list, patterns[, options]);
 *
 * console.log(mm(['a.js', 'a.txt'], ['*.js']));
 * //=> [ 'a.js' ]
 * ```
 * @param {String|Array<string>} `list` List of strings to match.
 * @param {String|Array<string>} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options)
 * @return {Array} Returns an array of matches
 * @summary false
 * @api public
 */

const micromatch$1 = (list, patterns, options) => {
  patterns = [].concat(patterns);
  list = [].concat(list);

  let omit = new Set();
  let keep = new Set();
  let items = new Set();
  let negatives = 0;

  let onResult = state => {
    items.add(state.output);
    if (options && options.onResult) {
      options.onResult(state);
    }
  };

  for (let i = 0; i < patterns.length; i++) {
    let isMatch = picomatch(String(patterns[i]), { ...options, onResult }, true);
    let negated = isMatch.state.negated || isMatch.state.negatedExtglob;
    if (negated) negatives++;

    for (let item of list) {
      let matched = isMatch(item, true);

      let match = negated ? !matched.isMatch : matched.isMatch;
      if (!match) continue;

      if (negated) {
        omit.add(matched.output);
      } else {
        omit.delete(matched.output);
        keep.add(matched.output);
      }
    }
  }

  let result = negatives === patterns.length ? [...items] : [...keep];
  let matches = result.filter(item => !omit.has(item));

  if (options && matches.length === 0) {
    if (options.failglob === true) {
      throw new Error(`No matches found for "${patterns.join(', ')}"`);
    }

    if (options.nonull === true || options.nullglob === true) {
      return options.unescape ? patterns.map(p => p.replace(/\\/g, '')) : patterns;
    }
  }

  return matches;
};

/**
 * Backwards compatibility
 */

micromatch$1.match = micromatch$1;

/**
 * Returns a matcher function from the given glob `pattern` and `options`.
 * The returned function takes a string to match as its only argument and returns
 * true if the string is a match.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.matcher(pattern[, options]);
 *
 * const isMatch = mm.matcher('*.!(*a)');
 * console.log(isMatch('a.a')); //=> false
 * console.log(isMatch('a.b')); //=> true
 * ```
 * @param {String} `pattern` Glob pattern
 * @param {Object} `options`
 * @return {Function} Returns a matcher function.
 * @api public
 */

micromatch$1.matcher = (pattern, options) => picomatch(pattern, options);

/**
 * Returns true if **any** of the given glob `patterns` match the specified `string`.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.isMatch(string, patterns[, options]);
 *
 * console.log(mm.isMatch('a.a', ['b.*', '*.a'])); //=> true
 * console.log(mm.isMatch('a.a', 'b.*')); //=> false
 * ```
 * @param {String} `str` The string to test.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `[options]` See available [options](#options).
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */

micromatch$1.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);

/**
 * Backwards compatibility
 */

micromatch$1.any = micromatch$1.isMatch;

/**
 * Returns a list of strings that _**do not match any**_ of the given `patterns`.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.not(list, patterns[, options]);
 *
 * console.log(mm.not(['a.a', 'b.b', 'c.c'], '*.a'));
 * //=> ['b.b', 'c.c']
 * ```
 * @param {Array} `list` Array of strings to match.
 * @param {String|Array} `patterns` One or more glob pattern to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Array} Returns an array of strings that **do not match** the given patterns.
 * @api public
 */

micromatch$1.not = (list, patterns, options = {}) => {
  patterns = [].concat(patterns).map(String);
  let result = new Set();
  let items = [];

  let onResult = state => {
    if (options.onResult) options.onResult(state);
    items.push(state.output);
  };

  let matches = new Set(micromatch$1(list, patterns, { ...options, onResult }));

  for (let item of items) {
    if (!matches.has(item)) {
      result.add(item);
    }
  }
  return [...result];
};

/**
 * Returns true if the given `string` contains the given pattern. Similar
 * to [.isMatch](#isMatch) but the pattern can match any part of the string.
 *
 * ```js
 * var mm = require('micromatch');
 * // mm.contains(string, pattern[, options]);
 *
 * console.log(mm.contains('aa/bb/cc', '*b'));
 * //=> true
 * console.log(mm.contains('aa/bb/cc', '*d'));
 * //=> false
 * ```
 * @param {String} `str` The string to match.
 * @param {String|Array} `patterns` Glob pattern to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if any of the patterns matches any part of `str`.
 * @api public
 */

micromatch$1.contains = (str, pattern, options) => {
  if (typeof str !== 'string') {
    throw new TypeError(`Expected a string: "${util$2.inspect(str)}"`);
  }

  if (Array.isArray(pattern)) {
    return pattern.some(p => micromatch$1.contains(str, p, options));
  }

  if (typeof pattern === 'string') {
    if (isEmptyString(str) || isEmptyString(pattern)) {
      return false;
    }

    if (str.includes(pattern) || (str.startsWith('./') && str.slice(2).includes(pattern))) {
      return true;
    }
  }

  return micromatch$1.isMatch(str, pattern, { ...options, contains: true });
};

/**
 * Filter the keys of the given object with the given `glob` pattern
 * and `options`. Does not attempt to match nested keys. If you need this feature,
 * use [glob-object][] instead.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.matchKeys(object, patterns[, options]);
 *
 * const obj = { aa: 'a', ab: 'b', ac: 'c' };
 * console.log(mm.matchKeys(obj, '*b'));
 * //=> { ab: 'b' }
 * ```
 * @param {Object} `object` The object with keys to filter.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Object} Returns an object with only keys that match the given patterns.
 * @api public
 */

micromatch$1.matchKeys = (obj, patterns, options) => {
  if (!utils$b.isObject(obj)) {
    throw new TypeError('Expected the first argument to be an object');
  }
  let keys = micromatch$1(Object.keys(obj), patterns, options);
  let res = {};
  for (let key of keys) res[key] = obj[key];
  return res;
};

/**
 * Returns true if some of the strings in the given `list` match any of the given glob `patterns`.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.some(list, patterns[, options]);
 *
 * console.log(mm.some(['foo.js', 'bar.js'], ['*.js', '!foo.js']));
 * // true
 * console.log(mm.some(['foo.js'], ['*.js', '!foo.js']));
 * // false
 * ```
 * @param {String|Array} `list` The string or array of strings to test. Returns as soon as the first match is found.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if any `patterns` matches any of the strings in `list`
 * @api public
 */

micromatch$1.some = (list, patterns, options) => {
  let items = [].concat(list);

  for (let pattern of [].concat(patterns)) {
    let isMatch = picomatch(String(pattern), options);
    if (items.some(item => isMatch(item))) {
      return true;
    }
  }
  return false;
};

/**
 * Returns true if every string in the given `list` matches
 * any of the given glob `patterns`.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.every(list, patterns[, options]);
 *
 * console.log(mm.every('foo.js', ['foo.js']));
 * // true
 * console.log(mm.every(['foo.js', 'bar.js'], ['*.js']));
 * // true
 * console.log(mm.every(['foo.js', 'bar.js'], ['*.js', '!foo.js']));
 * // false
 * console.log(mm.every(['foo.js'], ['*.js', '!foo.js']));
 * // false
 * ```
 * @param {String|Array} `list` The string or array of strings to test.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if all `patterns` matches all of the strings in `list`
 * @api public
 */

micromatch$1.every = (list, patterns, options) => {
  let items = [].concat(list);

  for (let pattern of [].concat(patterns)) {
    let isMatch = picomatch(String(pattern), options);
    if (!items.every(item => isMatch(item))) {
      return false;
    }
  }
  return true;
};

/**
 * Returns true if **all** of the given `patterns` match
 * the specified string.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.all(string, patterns[, options]);
 *
 * console.log(mm.all('foo.js', ['foo.js']));
 * // true
 *
 * console.log(mm.all('foo.js', ['*.js', '!foo.js']));
 * // false
 *
 * console.log(mm.all('foo.js', ['*.js', 'foo.js']));
 * // true
 *
 * console.log(mm.all('foo.js', ['*.js', 'f*', '*o*', '*o.js']));
 * // true
 * ```
 * @param {String|Array} `str` The string to test.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */

micromatch$1.all = (str, patterns, options) => {
  if (typeof str !== 'string') {
    throw new TypeError(`Expected a string: "${util$2.inspect(str)}"`);
  }

  return [].concat(patterns).every(p => picomatch(p, options)(str));
};

/**
 * Returns an array of matches captured by `pattern` in `string, or `null` if the pattern did not match.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.capture(pattern, string[, options]);
 *
 * console.log(mm.capture('test/*.js', 'test/foo.js'));
 * //=> ['foo']
 * console.log(mm.capture('test/*.js', 'foo/bar.css'));
 * //=> null
 * ```
 * @param {String} `glob` Glob pattern to use for matching.
 * @param {String} `input` String to match
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Array|null} Returns an array of captures if the input matches the glob pattern, otherwise `null`.
 * @api public
 */

micromatch$1.capture = (glob, input, options) => {
  let posix = utils$b.isWindows(options);
  let regex = picomatch.makeRe(String(glob), { ...options, capture: true });
  let match = regex.exec(posix ? utils$b.toPosixSlashes(input) : input);

  if (match) {
    return match.slice(1).map(v => v === void 0 ? '' : v);
  }
};

/**
 * Create a regular expression from the given glob `pattern`.
 *
 * ```js
 * const mm = require('micromatch');
 * // mm.makeRe(pattern[, options]);
 *
 * console.log(mm.makeRe('*.js'));
 * //=> /^(?:(\.[\\\/])?(?!\.)(?=.)[^\/]*?\.js)$/
 * ```
 * @param {String} `pattern` A glob pattern to convert to regex.
 * @param {Object} `options`
 * @return {RegExp} Returns a regex created from the given pattern.
 * @api public
 */

micromatch$1.makeRe = (...args) => picomatch.makeRe(...args);

/**
 * Scan a glob pattern to separate the pattern into segments. Used
 * by the [split](#split) method.
 *
 * ```js
 * const mm = require('micromatch');
 * const state = mm.scan(pattern[, options]);
 * ```
 * @param {String} `pattern`
 * @param {Object} `options`
 * @return {Object} Returns an object with
 * @api public
 */

micromatch$1.scan = (...args) => picomatch.scan(...args);

/**
 * Parse a glob pattern to create the source string for a regular
 * expression.
 *
 * ```js
 * const mm = require('micromatch');
 * const state = mm.parse(pattern[, options]);
 * ```
 * @param {String} `glob`
 * @param {Object} `options`
 * @return {Object} Returns an object with useful properties and output to be used as regex source string.
 * @api public
 */

micromatch$1.parse = (patterns, options) => {
  let res = [];
  for (let pattern of [].concat(patterns || [])) {
    for (let str of braces(String(pattern), options)) {
      res.push(picomatch.parse(str, options));
    }
  }
  return res;
};

/**
 * Process the given brace `pattern`.
 *
 * ```js
 * const { braces } = require('micromatch');
 * console.log(braces('foo/{a,b,c}/bar'));
 * //=> [ 'foo/(a|b|c)/bar' ]
 *
 * console.log(braces('foo/{a,b,c}/bar', { expand: true }));
 * //=> [ 'foo/a/bar', 'foo/b/bar', 'foo/c/bar' ]
 * ```
 * @param {String} `pattern` String with brace pattern to process.
 * @param {Object} `options` Any [options](#options) to change how expansion is performed. See the [braces][] library for all available options.
 * @return {Array}
 * @api public
 */

micromatch$1.braces = (pattern, options) => {
  if (typeof pattern !== 'string') throw new TypeError('Expected a string');
  if ((options && options.nobrace === true) || !/\{.*\}/.test(pattern)) {
    return [pattern];
  }
  return braces(pattern, options);
};

/**
 * Expand braces
 */

micromatch$1.braceExpand = (pattern, options) => {
  if (typeof pattern !== 'string') throw new TypeError('Expected a string');
  return micromatch$1.braces(pattern, { ...options, expand: true });
};

/**
 * Expose micromatch
 */

var micromatch_1 = micromatch$1;

Object.defineProperty(pattern$1, "__esModule", { value: true });
pattern$1.matchAny = pattern$1.convertPatternsToRe = pattern$1.makeRe = pattern$1.getPatternParts = pattern$1.expandBraceExpansion = pattern$1.expandPatternsWithBraceExpansion = pattern$1.isAffectDepthOfReadingPattern = pattern$1.endsWithSlashGlobStar = pattern$1.hasGlobStar = pattern$1.getBaseDirectory = pattern$1.isPatternRelatedToParentDirectory = pattern$1.getPatternsOutsideCurrentDirectory = pattern$1.getPatternsInsideCurrentDirectory = pattern$1.getPositivePatterns = pattern$1.getNegativePatterns = pattern$1.isPositivePattern = pattern$1.isNegativePattern = pattern$1.convertToNegativePattern = pattern$1.convertToPositivePattern = pattern$1.isDynamicPattern = pattern$1.isStaticPattern = void 0;
const path$6 = require$$0__default$4["default"];
const globParent = globParent$1;
const micromatch = micromatch_1;
const GLOBSTAR = '**';
const ESCAPE_SYMBOL = '\\';
const COMMON_GLOB_SYMBOLS_RE = /[*?]|^!/;
const REGEX_CHARACTER_CLASS_SYMBOLS_RE = /\[[^[]*]/;
const REGEX_GROUP_SYMBOLS_RE = /(?:^|[^!*+?@])\([^(]*\|[^|]*\)/;
const GLOB_EXTENSION_SYMBOLS_RE = /[!*+?@]\([^(]*\)/;
const BRACE_EXPANSION_SEPARATORS_RE = /,|\.\./;
function isStaticPattern(pattern, options = {}) {
    return !isDynamicPattern$1(pattern, options);
}
pattern$1.isStaticPattern = isStaticPattern;
function isDynamicPattern$1(pattern, options = {}) {
    /**
     * A special case with an empty string is necessary for matching patterns that start with a forward slash.
     * An empty string cannot be a dynamic pattern.
     * For example, the pattern `/lib/*` will be spread into parts: '', 'lib', '*'.
     */
    if (pattern === '') {
        return false;
    }
    /**
     * When the `caseSensitiveMatch` option is disabled, all patterns must be marked as dynamic, because we cannot check
     * filepath directly (without read directory).
     */
    if (options.caseSensitiveMatch === false || pattern.includes(ESCAPE_SYMBOL)) {
        return true;
    }
    if (COMMON_GLOB_SYMBOLS_RE.test(pattern) || REGEX_CHARACTER_CLASS_SYMBOLS_RE.test(pattern) || REGEX_GROUP_SYMBOLS_RE.test(pattern)) {
        return true;
    }
    if (options.extglob !== false && GLOB_EXTENSION_SYMBOLS_RE.test(pattern)) {
        return true;
    }
    if (options.braceExpansion !== false && hasBraceExpansion(pattern)) {
        return true;
    }
    return false;
}
pattern$1.isDynamicPattern = isDynamicPattern$1;
function hasBraceExpansion(pattern) {
    const openingBraceIndex = pattern.indexOf('{');
    if (openingBraceIndex === -1) {
        return false;
    }
    const closingBraceIndex = pattern.indexOf('}', openingBraceIndex + 1);
    if (closingBraceIndex === -1) {
        return false;
    }
    const braceContent = pattern.slice(openingBraceIndex, closingBraceIndex);
    return BRACE_EXPANSION_SEPARATORS_RE.test(braceContent);
}
function convertToPositivePattern(pattern) {
    return isNegativePattern$1(pattern) ? pattern.slice(1) : pattern;
}
pattern$1.convertToPositivePattern = convertToPositivePattern;
function convertToNegativePattern(pattern) {
    return '!' + pattern;
}
pattern$1.convertToNegativePattern = convertToNegativePattern;
function isNegativePattern$1(pattern) {
    return pattern.startsWith('!') && pattern[1] !== '(';
}
pattern$1.isNegativePattern = isNegativePattern$1;
function isPositivePattern(pattern) {
    return !isNegativePattern$1(pattern);
}
pattern$1.isPositivePattern = isPositivePattern;
function getNegativePatterns(patterns) {
    return patterns.filter(isNegativePattern$1);
}
pattern$1.getNegativePatterns = getNegativePatterns;
function getPositivePatterns$1(patterns) {
    return patterns.filter(isPositivePattern);
}
pattern$1.getPositivePatterns = getPositivePatterns$1;
/**
 * Returns patterns that can be applied inside the current directory.
 *
 * @example
 * // ['./*', '*', 'a/*']
 * getPatternsInsideCurrentDirectory(['./*', '*', 'a/*', '../*', './../*'])
 */
function getPatternsInsideCurrentDirectory(patterns) {
    return patterns.filter((pattern) => !isPatternRelatedToParentDirectory(pattern));
}
pattern$1.getPatternsInsideCurrentDirectory = getPatternsInsideCurrentDirectory;
/**
 * Returns patterns to be expanded relative to (outside) the current directory.
 *
 * @example
 * // ['../*', './../*']
 * getPatternsInsideCurrentDirectory(['./*', '*', 'a/*', '../*', './../*'])
 */
function getPatternsOutsideCurrentDirectory(patterns) {
    return patterns.filter(isPatternRelatedToParentDirectory);
}
pattern$1.getPatternsOutsideCurrentDirectory = getPatternsOutsideCurrentDirectory;
function isPatternRelatedToParentDirectory(pattern) {
    return pattern.startsWith('..') || pattern.startsWith('./..');
}
pattern$1.isPatternRelatedToParentDirectory = isPatternRelatedToParentDirectory;
function getBaseDirectory(pattern) {
    return globParent(pattern, { flipBackslashes: false });
}
pattern$1.getBaseDirectory = getBaseDirectory;
function hasGlobStar(pattern) {
    return pattern.includes(GLOBSTAR);
}
pattern$1.hasGlobStar = hasGlobStar;
function endsWithSlashGlobStar(pattern) {
    return pattern.endsWith('/' + GLOBSTAR);
}
pattern$1.endsWithSlashGlobStar = endsWithSlashGlobStar;
function isAffectDepthOfReadingPattern(pattern) {
    const basename = path$6.basename(pattern);
    return endsWithSlashGlobStar(pattern) || isStaticPattern(basename);
}
pattern$1.isAffectDepthOfReadingPattern = isAffectDepthOfReadingPattern;
function expandPatternsWithBraceExpansion(patterns) {
    return patterns.reduce((collection, pattern) => {
        return collection.concat(expandBraceExpansion(pattern));
    }, []);
}
pattern$1.expandPatternsWithBraceExpansion = expandPatternsWithBraceExpansion;
function expandBraceExpansion(pattern) {
    return micromatch.braces(pattern, {
        expand: true,
        nodupes: true
    });
}
pattern$1.expandBraceExpansion = expandBraceExpansion;
function getPatternParts(pattern, options) {
    let { parts } = micromatch.scan(pattern, Object.assign(Object.assign({}, options), { parts: true }));
    /**
     * The scan method returns an empty array in some cases.
     * See micromatch/picomatch#58 for more details.
     */
    if (parts.length === 0) {
        parts = [pattern];
    }
    /**
     * The scan method does not return an empty part for the pattern with a forward slash.
     * This is another part of micromatch/picomatch#58.
     */
    if (parts[0].startsWith('/')) {
        parts[0] = parts[0].slice(1);
        parts.unshift('');
    }
    return parts;
}
pattern$1.getPatternParts = getPatternParts;
function makeRe(pattern, options) {
    return micromatch.makeRe(pattern, options);
}
pattern$1.makeRe = makeRe;
function convertPatternsToRe(patterns, options) {
    return patterns.map((pattern) => makeRe(pattern, options));
}
pattern$1.convertPatternsToRe = convertPatternsToRe;
function matchAny(entry, patternsRe) {
    return patternsRe.some((patternRe) => patternRe.test(entry));
}
pattern$1.matchAny = matchAny;

var stream$4 = {};

Object.defineProperty(stream$4, "__esModule", { value: true });
stream$4.merge = void 0;
const merge2 = merge2_1;
function merge(streams) {
    const mergedStream = merge2(streams);
    streams.forEach((stream) => {
        stream.once('error', (error) => mergedStream.emit('error', error));
    });
    mergedStream.once('close', () => propagateCloseEventToSources(streams));
    mergedStream.once('end', () => propagateCloseEventToSources(streams));
    return mergedStream;
}
stream$4.merge = merge;
function propagateCloseEventToSources(streams) {
    streams.forEach((stream) => stream.emit('close'));
}

var string$1 = {};

Object.defineProperty(string$1, "__esModule", { value: true });
string$1.isEmpty = string$1.isString = void 0;
function isString$1(input) {
    return typeof input === 'string';
}
string$1.isString = isString$1;
function isEmpty(input) {
    return input === '';
}
string$1.isEmpty = isEmpty;

Object.defineProperty(utils$k, "__esModule", { value: true });
utils$k.string = utils$k.stream = utils$k.pattern = utils$k.path = utils$k.fs = utils$k.errno = utils$k.array = void 0;
const array = array$1;
utils$k.array = array;
const errno = errno$1;
utils$k.errno = errno;
const fs$7 = fs$8;
utils$k.fs = fs$7;
const path$5 = path$a;
utils$k.path = path$5;
const pattern = pattern$1;
utils$k.pattern = pattern;
const stream$3 = stream$4;
utils$k.stream = stream$3;
const string = string$1;
utils$k.string = string;

Object.defineProperty(tasks, "__esModule", { value: true });
tasks.convertPatternGroupToTask = tasks.convertPatternGroupsToTasks = tasks.groupPatternsByBaseDirectory = tasks.getNegativePatternsAsPositive = tasks.getPositivePatterns = tasks.convertPatternsToTasks = tasks.generate = void 0;
const utils$a = utils$k;
function generate(patterns, settings) {
    const positivePatterns = getPositivePatterns(patterns);
    const negativePatterns = getNegativePatternsAsPositive(patterns, settings.ignore);
    const staticPatterns = positivePatterns.filter((pattern) => utils$a.pattern.isStaticPattern(pattern, settings));
    const dynamicPatterns = positivePatterns.filter((pattern) => utils$a.pattern.isDynamicPattern(pattern, settings));
    const staticTasks = convertPatternsToTasks(staticPatterns, negativePatterns, /* dynamic */ false);
    const dynamicTasks = convertPatternsToTasks(dynamicPatterns, negativePatterns, /* dynamic */ true);
    return staticTasks.concat(dynamicTasks);
}
tasks.generate = generate;
/**
 * Returns tasks grouped by basic pattern directories.
 *
 * Patterns that can be found inside (`./`) and outside (`../`) the current directory are handled separately.
 * This is necessary because directory traversal starts at the base directory and goes deeper.
 */
function convertPatternsToTasks(positive, negative, dynamic) {
    const tasks = [];
    const patternsOutsideCurrentDirectory = utils$a.pattern.getPatternsOutsideCurrentDirectory(positive);
    const patternsInsideCurrentDirectory = utils$a.pattern.getPatternsInsideCurrentDirectory(positive);
    const outsideCurrentDirectoryGroup = groupPatternsByBaseDirectory(patternsOutsideCurrentDirectory);
    const insideCurrentDirectoryGroup = groupPatternsByBaseDirectory(patternsInsideCurrentDirectory);
    tasks.push(...convertPatternGroupsToTasks(outsideCurrentDirectoryGroup, negative, dynamic));
    /*
     * For the sake of reducing future accesses to the file system, we merge all tasks within the current directory
     * into a global task, if at least one pattern refers to the root (`.`). In this case, the global task covers the rest.
     */
    if ('.' in insideCurrentDirectoryGroup) {
        tasks.push(convertPatternGroupToTask('.', patternsInsideCurrentDirectory, negative, dynamic));
    }
    else {
        tasks.push(...convertPatternGroupsToTasks(insideCurrentDirectoryGroup, negative, dynamic));
    }
    return tasks;
}
tasks.convertPatternsToTasks = convertPatternsToTasks;
function getPositivePatterns(patterns) {
    return utils$a.pattern.getPositivePatterns(patterns);
}
tasks.getPositivePatterns = getPositivePatterns;
function getNegativePatternsAsPositive(patterns, ignore) {
    const negative = utils$a.pattern.getNegativePatterns(patterns).concat(ignore);
    const positive = negative.map(utils$a.pattern.convertToPositivePattern);
    return positive;
}
tasks.getNegativePatternsAsPositive = getNegativePatternsAsPositive;
function groupPatternsByBaseDirectory(patterns) {
    const group = {};
    return patterns.reduce((collection, pattern) => {
        const base = utils$a.pattern.getBaseDirectory(pattern);
        if (base in collection) {
            collection[base].push(pattern);
        }
        else {
            collection[base] = [pattern];
        }
        return collection;
    }, group);
}
tasks.groupPatternsByBaseDirectory = groupPatternsByBaseDirectory;
function convertPatternGroupsToTasks(positive, negative, dynamic) {
    return Object.keys(positive).map((base) => {
        return convertPatternGroupToTask(base, positive[base], negative, dynamic);
    });
}
tasks.convertPatternGroupsToTasks = convertPatternGroupsToTasks;
function convertPatternGroupToTask(base, positive, negative, dynamic) {
    return {
        dynamic,
        positive,
        negative,
        base,
        patterns: [].concat(positive, negative.map(utils$a.pattern.convertToNegativePattern))
    };
}
tasks.convertPatternGroupToTask = convertPatternGroupToTask;

var patterns = {};

Object.defineProperty(patterns, "__esModule", { value: true });
patterns.removeDuplicateSlashes = patterns.transform = void 0;
/**
 * Matches a sequence of two or more consecutive slashes, excluding the first two slashes at the beginning of the string.
 * The latter is due to the presence of the device path at the beginning of the UNC path.
 * @todo rewrite to negative lookbehind with the next major release.
 */
const DOUBLE_SLASH_RE = /(?!^)\/{2,}/g;
function transform(patterns) {
    return patterns.map((pattern) => removeDuplicateSlashes(pattern));
}
patterns.transform = transform;
/**
 * This package only works with forward slashes as a path separator.
 * Because of this, we cannot use the standard `path.normalize` method, because on Windows platform it will use of backslashes.
 */
function removeDuplicateSlashes(pattern) {
    return pattern.replace(DOUBLE_SLASH_RE, '/');
}
patterns.removeDuplicateSlashes = removeDuplicateSlashes;

var async$6 = {};

var stream$2 = {};

var out$3 = {};

var async$5 = {};

Object.defineProperty(async$5, "__esModule", { value: true });
async$5.read = void 0;
function read$3(path, settings, callback) {
    settings.fs.lstat(path, (lstatError, lstat) => {
        if (lstatError !== null) {
            callFailureCallback$2(callback, lstatError);
            return;
        }
        if (!lstat.isSymbolicLink() || !settings.followSymbolicLink) {
            callSuccessCallback$2(callback, lstat);
            return;
        }
        settings.fs.stat(path, (statError, stat) => {
            if (statError !== null) {
                if (settings.throwErrorOnBrokenSymbolicLink) {
                    callFailureCallback$2(callback, statError);
                    return;
                }
                callSuccessCallback$2(callback, lstat);
                return;
            }
            if (settings.markSymbolicLink) {
                stat.isSymbolicLink = () => true;
            }
            callSuccessCallback$2(callback, stat);
        });
    });
}
async$5.read = read$3;
function callFailureCallback$2(callback, error) {
    callback(error);
}
function callSuccessCallback$2(callback, result) {
    callback(null, result);
}

var sync$7 = {};

Object.defineProperty(sync$7, "__esModule", { value: true });
sync$7.read = void 0;
function read$2(path, settings) {
    const lstat = settings.fs.lstatSync(path);
    if (!lstat.isSymbolicLink() || !settings.followSymbolicLink) {
        return lstat;
    }
    try {
        const stat = settings.fs.statSync(path);
        if (settings.markSymbolicLink) {
            stat.isSymbolicLink = () => true;
        }
        return stat;
    }
    catch (error) {
        if (!settings.throwErrorOnBrokenSymbolicLink) {
            return lstat;
        }
        throw error;
    }
}
sync$7.read = read$2;

var settings$3 = {};

var fs$6 = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createFileSystemAdapter = exports.FILE_SYSTEM_ADAPTER = void 0;
	const fs = require$$0__default$2["default"];
	exports.FILE_SYSTEM_ADAPTER = {
	    lstat: fs.lstat,
	    stat: fs.stat,
	    lstatSync: fs.lstatSync,
	    statSync: fs.statSync
	};
	function createFileSystemAdapter(fsMethods) {
	    if (fsMethods === undefined) {
	        return exports.FILE_SYSTEM_ADAPTER;
	    }
	    return Object.assign(Object.assign({}, exports.FILE_SYSTEM_ADAPTER), fsMethods);
	}
	exports.createFileSystemAdapter = createFileSystemAdapter;
} (fs$6));

Object.defineProperty(settings$3, "__esModule", { value: true });
const fs$5 = fs$6;
class Settings$2 {
    constructor(_options = {}) {
        this._options = _options;
        this.followSymbolicLink = this._getValue(this._options.followSymbolicLink, true);
        this.fs = fs$5.createFileSystemAdapter(this._options.fs);
        this.markSymbolicLink = this._getValue(this._options.markSymbolicLink, false);
        this.throwErrorOnBrokenSymbolicLink = this._getValue(this._options.throwErrorOnBrokenSymbolicLink, true);
    }
    _getValue(option, value) {
        return option !== null && option !== void 0 ? option : value;
    }
}
settings$3.default = Settings$2;

Object.defineProperty(out$3, "__esModule", { value: true });
out$3.statSync = out$3.stat = out$3.Settings = void 0;
const async$4 = async$5;
const sync$6 = sync$7;
const settings_1$3 = settings$3;
out$3.Settings = settings_1$3.default;
function stat(path, optionsOrSettingsOrCallback, callback) {
    if (typeof optionsOrSettingsOrCallback === 'function') {
        async$4.read(path, getSettings$2(), optionsOrSettingsOrCallback);
        return;
    }
    async$4.read(path, getSettings$2(optionsOrSettingsOrCallback), callback);
}
out$3.stat = stat;
function statSync(path, optionsOrSettings) {
    const settings = getSettings$2(optionsOrSettings);
    return sync$6.read(path, settings);
}
out$3.statSync = statSync;
function getSettings$2(settingsOrOptions = {}) {
    if (settingsOrOptions instanceof settings_1$3.default) {
        return settingsOrOptions;
    }
    return new settings_1$3.default(settingsOrOptions);
}

var out$2 = {};

var async$3 = {};

var async$2 = {};

var out$1 = {};

var async$1 = {};

/*! queue-microtask. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */

let promise;

var queueMicrotask_1 = typeof queueMicrotask === 'function'
  ? queueMicrotask.bind(typeof window !== 'undefined' ? window : commonjsGlobal)
  // reuse resolved promise, and allocate it lazily
  : cb => (promise || (promise = Promise.resolve()))
    .then(cb)
    .catch(err => setTimeout(() => { throw err }, 0));

/*! run-parallel. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */

var runParallel_1 = runParallel;

const queueMicrotask$1 = queueMicrotask_1;

function runParallel (tasks, cb) {
  let results, pending, keys;
  let isSync = true;

  if (Array.isArray(tasks)) {
    results = [];
    pending = tasks.length;
  } else {
    keys = Object.keys(tasks);
    results = {};
    pending = keys.length;
  }

  function done (err) {
    function end () {
      if (cb) cb(err, results);
      cb = null;
    }
    if (isSync) queueMicrotask$1(end);
    else end();
  }

  function each (i, err, result) {
    results[i] = result;
    if (--pending === 0 || err) {
      done(err);
    }
  }

  if (!pending) {
    // empty
    done(null);
  } else if (keys) {
    // object
    keys.forEach(function (key) {
      tasks[key](function (err, result) { each(key, err, result); });
    });
  } else {
    // array
    tasks.forEach(function (task, i) {
      task(function (err, result) { each(i, err, result); });
    });
  }

  isSync = false;
}

var constants = {};

Object.defineProperty(constants, "__esModule", { value: true });
constants.IS_SUPPORT_READDIR_WITH_FILE_TYPES = void 0;
const NODE_PROCESS_VERSION_PARTS = process.versions.node.split('.');
if (NODE_PROCESS_VERSION_PARTS[0] === undefined || NODE_PROCESS_VERSION_PARTS[1] === undefined) {
    throw new Error(`Unexpected behavior. The 'process.versions.node' variable has invalid value: ${process.versions.node}`);
}
const MAJOR_VERSION = Number.parseInt(NODE_PROCESS_VERSION_PARTS[0], 10);
const MINOR_VERSION = Number.parseInt(NODE_PROCESS_VERSION_PARTS[1], 10);
const SUPPORTED_MAJOR_VERSION = 10;
const SUPPORTED_MINOR_VERSION = 10;
const IS_MATCHED_BY_MAJOR = MAJOR_VERSION > SUPPORTED_MAJOR_VERSION;
const IS_MATCHED_BY_MAJOR_AND_MINOR = MAJOR_VERSION === SUPPORTED_MAJOR_VERSION && MINOR_VERSION >= SUPPORTED_MINOR_VERSION;
/**
 * IS `true` for Node.js 10.10 and greater.
 */
constants.IS_SUPPORT_READDIR_WITH_FILE_TYPES = IS_MATCHED_BY_MAJOR || IS_MATCHED_BY_MAJOR_AND_MINOR;

var utils$9 = {};

var fs$4 = {};

Object.defineProperty(fs$4, "__esModule", { value: true });
fs$4.createDirentFromStats = void 0;
class DirentFromStats {
    constructor(name, stats) {
        this.name = name;
        this.isBlockDevice = stats.isBlockDevice.bind(stats);
        this.isCharacterDevice = stats.isCharacterDevice.bind(stats);
        this.isDirectory = stats.isDirectory.bind(stats);
        this.isFIFO = stats.isFIFO.bind(stats);
        this.isFile = stats.isFile.bind(stats);
        this.isSocket = stats.isSocket.bind(stats);
        this.isSymbolicLink = stats.isSymbolicLink.bind(stats);
    }
}
function createDirentFromStats(name, stats) {
    return new DirentFromStats(name, stats);
}
fs$4.createDirentFromStats = createDirentFromStats;

Object.defineProperty(utils$9, "__esModule", { value: true });
utils$9.fs = void 0;
const fs$3 = fs$4;
utils$9.fs = fs$3;

var common$6 = {};

Object.defineProperty(common$6, "__esModule", { value: true });
common$6.joinPathSegments = void 0;
function joinPathSegments$1(a, b, separator) {
    /**
     * The correct handling of cases when the first segment is a root (`/`, `C:/`) or UNC path (`//?/C:/`).
     */
    if (a.endsWith(separator)) {
        return a + b;
    }
    return a + separator + b;
}
common$6.joinPathSegments = joinPathSegments$1;

Object.defineProperty(async$1, "__esModule", { value: true });
async$1.readdir = async$1.readdirWithFileTypes = async$1.read = void 0;
const fsStat$5 = out$3;
const rpl = runParallel_1;
const constants_1$1 = constants;
const utils$8 = utils$9;
const common$5 = common$6;
function read$1(directory, settings, callback) {
    if (!settings.stats && constants_1$1.IS_SUPPORT_READDIR_WITH_FILE_TYPES) {
        readdirWithFileTypes$1(directory, settings, callback);
        return;
    }
    readdir$1(directory, settings, callback);
}
async$1.read = read$1;
function readdirWithFileTypes$1(directory, settings, callback) {
    settings.fs.readdir(directory, { withFileTypes: true }, (readdirError, dirents) => {
        if (readdirError !== null) {
            callFailureCallback$1(callback, readdirError);
            return;
        }
        const entries = dirents.map((dirent) => ({
            dirent,
            name: dirent.name,
            path: common$5.joinPathSegments(directory, dirent.name, settings.pathSegmentSeparator)
        }));
        if (!settings.followSymbolicLinks) {
            callSuccessCallback$1(callback, entries);
            return;
        }
        const tasks = entries.map((entry) => makeRplTaskEntry(entry, settings));
        rpl(tasks, (rplError, rplEntries) => {
            if (rplError !== null) {
                callFailureCallback$1(callback, rplError);
                return;
            }
            callSuccessCallback$1(callback, rplEntries);
        });
    });
}
async$1.readdirWithFileTypes = readdirWithFileTypes$1;
function makeRplTaskEntry(entry, settings) {
    return (done) => {
        if (!entry.dirent.isSymbolicLink()) {
            done(null, entry);
            return;
        }
        settings.fs.stat(entry.path, (statError, stats) => {
            if (statError !== null) {
                if (settings.throwErrorOnBrokenSymbolicLink) {
                    done(statError);
                    return;
                }
                done(null, entry);
                return;
            }
            entry.dirent = utils$8.fs.createDirentFromStats(entry.name, stats);
            done(null, entry);
        });
    };
}
function readdir$1(directory, settings, callback) {
    settings.fs.readdir(directory, (readdirError, names) => {
        if (readdirError !== null) {
            callFailureCallback$1(callback, readdirError);
            return;
        }
        const tasks = names.map((name) => {
            const path = common$5.joinPathSegments(directory, name, settings.pathSegmentSeparator);
            return (done) => {
                fsStat$5.stat(path, settings.fsStatSettings, (error, stats) => {
                    if (error !== null) {
                        done(error);
                        return;
                    }
                    const entry = {
                        name,
                        path,
                        dirent: utils$8.fs.createDirentFromStats(name, stats)
                    };
                    if (settings.stats) {
                        entry.stats = stats;
                    }
                    done(null, entry);
                });
            };
        });
        rpl(tasks, (rplError, entries) => {
            if (rplError !== null) {
                callFailureCallback$1(callback, rplError);
                return;
            }
            callSuccessCallback$1(callback, entries);
        });
    });
}
async$1.readdir = readdir$1;
function callFailureCallback$1(callback, error) {
    callback(error);
}
function callSuccessCallback$1(callback, result) {
    callback(null, result);
}

var sync$5 = {};

Object.defineProperty(sync$5, "__esModule", { value: true });
sync$5.readdir = sync$5.readdirWithFileTypes = sync$5.read = void 0;
const fsStat$4 = out$3;
const constants_1 = constants;
const utils$7 = utils$9;
const common$4 = common$6;
function read(directory, settings) {
    if (!settings.stats && constants_1.IS_SUPPORT_READDIR_WITH_FILE_TYPES) {
        return readdirWithFileTypes(directory, settings);
    }
    return readdir(directory, settings);
}
sync$5.read = read;
function readdirWithFileTypes(directory, settings) {
    const dirents = settings.fs.readdirSync(directory, { withFileTypes: true });
    return dirents.map((dirent) => {
        const entry = {
            dirent,
            name: dirent.name,
            path: common$4.joinPathSegments(directory, dirent.name, settings.pathSegmentSeparator)
        };
        if (entry.dirent.isSymbolicLink() && settings.followSymbolicLinks) {
            try {
                const stats = settings.fs.statSync(entry.path);
                entry.dirent = utils$7.fs.createDirentFromStats(entry.name, stats);
            }
            catch (error) {
                if (settings.throwErrorOnBrokenSymbolicLink) {
                    throw error;
                }
            }
        }
        return entry;
    });
}
sync$5.readdirWithFileTypes = readdirWithFileTypes;
function readdir(directory, settings) {
    const names = settings.fs.readdirSync(directory);
    return names.map((name) => {
        const entryPath = common$4.joinPathSegments(directory, name, settings.pathSegmentSeparator);
        const stats = fsStat$4.statSync(entryPath, settings.fsStatSettings);
        const entry = {
            name,
            path: entryPath,
            dirent: utils$7.fs.createDirentFromStats(name, stats)
        };
        if (settings.stats) {
            entry.stats = stats;
        }
        return entry;
    });
}
sync$5.readdir = readdir;

var settings$2 = {};

var fs$2 = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createFileSystemAdapter = exports.FILE_SYSTEM_ADAPTER = void 0;
	const fs = require$$0__default$2["default"];
	exports.FILE_SYSTEM_ADAPTER = {
	    lstat: fs.lstat,
	    stat: fs.stat,
	    lstatSync: fs.lstatSync,
	    statSync: fs.statSync,
	    readdir: fs.readdir,
	    readdirSync: fs.readdirSync
	};
	function createFileSystemAdapter(fsMethods) {
	    if (fsMethods === undefined) {
	        return exports.FILE_SYSTEM_ADAPTER;
	    }
	    return Object.assign(Object.assign({}, exports.FILE_SYSTEM_ADAPTER), fsMethods);
	}
	exports.createFileSystemAdapter = createFileSystemAdapter;
} (fs$2));

Object.defineProperty(settings$2, "__esModule", { value: true });
const path$4 = require$$0__default$4["default"];
const fsStat$3 = out$3;
const fs$1 = fs$2;
class Settings$1 {
    constructor(_options = {}) {
        this._options = _options;
        this.followSymbolicLinks = this._getValue(this._options.followSymbolicLinks, false);
        this.fs = fs$1.createFileSystemAdapter(this._options.fs);
        this.pathSegmentSeparator = this._getValue(this._options.pathSegmentSeparator, path$4.sep);
        this.stats = this._getValue(this._options.stats, false);
        this.throwErrorOnBrokenSymbolicLink = this._getValue(this._options.throwErrorOnBrokenSymbolicLink, true);
        this.fsStatSettings = new fsStat$3.Settings({
            followSymbolicLink: this.followSymbolicLinks,
            fs: this.fs,
            throwErrorOnBrokenSymbolicLink: this.throwErrorOnBrokenSymbolicLink
        });
    }
    _getValue(option, value) {
        return option !== null && option !== void 0 ? option : value;
    }
}
settings$2.default = Settings$1;

Object.defineProperty(out$1, "__esModule", { value: true });
out$1.Settings = out$1.scandirSync = out$1.scandir = void 0;
const async = async$1;
const sync$4 = sync$5;
const settings_1$2 = settings$2;
out$1.Settings = settings_1$2.default;
function scandir(path, optionsOrSettingsOrCallback, callback) {
    if (typeof optionsOrSettingsOrCallback === 'function') {
        async.read(path, getSettings$1(), optionsOrSettingsOrCallback);
        return;
    }
    async.read(path, getSettings$1(optionsOrSettingsOrCallback), callback);
}
out$1.scandir = scandir;
function scandirSync(path, optionsOrSettings) {
    const settings = getSettings$1(optionsOrSettings);
    return sync$4.read(path, settings);
}
out$1.scandirSync = scandirSync;
function getSettings$1(settingsOrOptions = {}) {
    if (settingsOrOptions instanceof settings_1$2.default) {
        return settingsOrOptions;
    }
    return new settings_1$2.default(settingsOrOptions);
}

var queue = {exports: {}};

function reusify$1 (Constructor) {
  var head = new Constructor();
  var tail = head;

  function get () {
    var current = head;

    if (current.next) {
      head = current.next;
    } else {
      head = new Constructor();
      tail = head;
    }

    current.next = null;

    return current
  }

  function release (obj) {
    tail.next = obj;
    tail = obj;
  }

  return {
    get: get,
    release: release
  }
}

var reusify_1 = reusify$1;

/* eslint-disable no-var */

var reusify = reusify_1;

function fastqueue (context, worker, concurrency) {
  if (typeof context === 'function') {
    concurrency = worker;
    worker = context;
    context = null;
  }

  if (concurrency < 1) {
    throw new Error('fastqueue concurrency must be greater than 1')
  }

  var cache = reusify(Task);
  var queueHead = null;
  var queueTail = null;
  var _running = 0;
  var errorHandler = null;

  var self = {
    push: push,
    drain: noop,
    saturated: noop,
    pause: pause,
    paused: false,
    concurrency: concurrency,
    running: running,
    resume: resume,
    idle: idle,
    length: length,
    getQueue: getQueue,
    unshift: unshift,
    empty: noop,
    kill: kill,
    killAndDrain: killAndDrain,
    error: error
  };

  return self

  function running () {
    return _running
  }

  function pause () {
    self.paused = true;
  }

  function length () {
    var current = queueHead;
    var counter = 0;

    while (current) {
      current = current.next;
      counter++;
    }

    return counter
  }

  function getQueue () {
    var current = queueHead;
    var tasks = [];

    while (current) {
      tasks.push(current.value);
      current = current.next;
    }

    return tasks
  }

  function resume () {
    if (!self.paused) return
    self.paused = false;
    for (var i = 0; i < self.concurrency; i++) {
      _running++;
      release();
    }
  }

  function idle () {
    return _running === 0 && self.length() === 0
  }

  function push (value, done) {
    var current = cache.get();

    current.context = context;
    current.release = release;
    current.value = value;
    current.callback = done || noop;
    current.errorHandler = errorHandler;

    if (_running === self.concurrency || self.paused) {
      if (queueTail) {
        queueTail.next = current;
        queueTail = current;
      } else {
        queueHead = current;
        queueTail = current;
        self.saturated();
      }
    } else {
      _running++;
      worker.call(context, current.value, current.worked);
    }
  }

  function unshift (value, done) {
    var current = cache.get();

    current.context = context;
    current.release = release;
    current.value = value;
    current.callback = done || noop;

    if (_running === self.concurrency || self.paused) {
      if (queueHead) {
        current.next = queueHead;
        queueHead = current;
      } else {
        queueHead = current;
        queueTail = current;
        self.saturated();
      }
    } else {
      _running++;
      worker.call(context, current.value, current.worked);
    }
  }

  function release (holder) {
    if (holder) {
      cache.release(holder);
    }
    var next = queueHead;
    if (next) {
      if (!self.paused) {
        if (queueTail === queueHead) {
          queueTail = null;
        }
        queueHead = next.next;
        next.next = null;
        worker.call(context, next.value, next.worked);
        if (queueTail === null) {
          self.empty();
        }
      } else {
        _running--;
      }
    } else if (--_running === 0) {
      self.drain();
    }
  }

  function kill () {
    queueHead = null;
    queueTail = null;
    self.drain = noop;
  }

  function killAndDrain () {
    queueHead = null;
    queueTail = null;
    self.drain();
    self.drain = noop;
  }

  function error (handler) {
    errorHandler = handler;
  }
}

function noop () {}

function Task () {
  this.value = null;
  this.callback = noop;
  this.next = null;
  this.release = noop;
  this.context = null;
  this.errorHandler = null;

  var self = this;

  this.worked = function worked (err, result) {
    var callback = self.callback;
    var errorHandler = self.errorHandler;
    var val = self.value;
    self.value = null;
    self.callback = noop;
    if (self.errorHandler) {
      errorHandler(err, val);
    }
    callback.call(self.context, err, result);
    self.release(self);
  };
}

function queueAsPromised (context, worker, concurrency) {
  if (typeof context === 'function') {
    concurrency = worker;
    worker = context;
    context = null;
  }

  function asyncWrapper (arg, cb) {
    worker.call(this, arg)
      .then(function (res) {
        cb(null, res);
      }, cb);
  }

  var queue = fastqueue(context, asyncWrapper, concurrency);

  var pushCb = queue.push;
  var unshiftCb = queue.unshift;

  queue.push = push;
  queue.unshift = unshift;
  queue.drained = drained;

  return queue

  function push (value) {
    var p = new Promise(function (resolve, reject) {
      pushCb(value, function (err, result) {
        if (err) {
          reject(err);
          return
        }
        resolve(result);
      });
    });

    // Let's fork the promise chain to
    // make the error bubble up to the user but
    // not lead to a unhandledRejection
    p.catch(noop);

    return p
  }

  function unshift (value) {
    var p = new Promise(function (resolve, reject) {
      unshiftCb(value, function (err, result) {
        if (err) {
          reject(err);
          return
        }
        resolve(result);
      });
    });

    // Let's fork the promise chain to
    // make the error bubble up to the user but
    // not lead to a unhandledRejection
    p.catch(noop);

    return p
  }

  function drained () {
    var previousDrain = queue.drain;

    var p = new Promise(function (resolve) {
      queue.drain = function () {
        previousDrain();
        resolve();
      };
    });

    return p
  }
}

queue.exports = fastqueue;
queue.exports.promise = queueAsPromised;

var common$3 = {};

Object.defineProperty(common$3, "__esModule", { value: true });
common$3.joinPathSegments = common$3.replacePathSegmentSeparator = common$3.isAppliedFilter = common$3.isFatalError = void 0;
function isFatalError(settings, error) {
    if (settings.errorFilter === null) {
        return true;
    }
    return !settings.errorFilter(error);
}
common$3.isFatalError = isFatalError;
function isAppliedFilter(filter, value) {
    return filter === null || filter(value);
}
common$3.isAppliedFilter = isAppliedFilter;
function replacePathSegmentSeparator(filepath, separator) {
    return filepath.split(/[/\\]/).join(separator);
}
common$3.replacePathSegmentSeparator = replacePathSegmentSeparator;
function joinPathSegments(a, b, separator) {
    if (a === '') {
        return b;
    }
    /**
     * The correct handling of cases when the first segment is a root (`/`, `C:/`) or UNC path (`//?/C:/`).
     */
    if (a.endsWith(separator)) {
        return a + b;
    }
    return a + separator + b;
}
common$3.joinPathSegments = joinPathSegments;

var reader$1 = {};

Object.defineProperty(reader$1, "__esModule", { value: true });
const common$2 = common$3;
class Reader$1 {
    constructor(_root, _settings) {
        this._root = _root;
        this._settings = _settings;
        this._root = common$2.replacePathSegmentSeparator(_root, _settings.pathSegmentSeparator);
    }
}
reader$1.default = Reader$1;

Object.defineProperty(async$2, "__esModule", { value: true });
const events_1 = require$$2__default$1["default"];
const fsScandir$2 = out$1;
const fastq = queue.exports;
const common$1 = common$3;
const reader_1$3 = reader$1;
class AsyncReader extends reader_1$3.default {
    constructor(_root, _settings) {
        super(_root, _settings);
        this._settings = _settings;
        this._scandir = fsScandir$2.scandir;
        this._emitter = new events_1.EventEmitter();
        this._queue = fastq(this._worker.bind(this), this._settings.concurrency);
        this._isFatalError = false;
        this._isDestroyed = false;
        this._queue.drain = () => {
            if (!this._isFatalError) {
                this._emitter.emit('end');
            }
        };
    }
    read() {
        this._isFatalError = false;
        this._isDestroyed = false;
        setImmediate(() => {
            this._pushToQueue(this._root, this._settings.basePath);
        });
        return this._emitter;
    }
    get isDestroyed() {
        return this._isDestroyed;
    }
    destroy() {
        if (this._isDestroyed) {
            throw new Error('The reader is already destroyed');
        }
        this._isDestroyed = true;
        this._queue.killAndDrain();
    }
    onEntry(callback) {
        this._emitter.on('entry', callback);
    }
    onError(callback) {
        this._emitter.once('error', callback);
    }
    onEnd(callback) {
        this._emitter.once('end', callback);
    }
    _pushToQueue(directory, base) {
        const queueItem = { directory, base };
        this._queue.push(queueItem, (error) => {
            if (error !== null) {
                this._handleError(error);
            }
        });
    }
    _worker(item, done) {
        this._scandir(item.directory, this._settings.fsScandirSettings, (error, entries) => {
            if (error !== null) {
                done(error, undefined);
                return;
            }
            for (const entry of entries) {
                this._handleEntry(entry, item.base);
            }
            done(null, undefined);
        });
    }
    _handleError(error) {
        if (this._isDestroyed || !common$1.isFatalError(this._settings, error)) {
            return;
        }
        this._isFatalError = true;
        this._isDestroyed = true;
        this._emitter.emit('error', error);
    }
    _handleEntry(entry, base) {
        if (this._isDestroyed || this._isFatalError) {
            return;
        }
        const fullpath = entry.path;
        if (base !== undefined) {
            entry.path = common$1.joinPathSegments(base, entry.name, this._settings.pathSegmentSeparator);
        }
        if (common$1.isAppliedFilter(this._settings.entryFilter, entry)) {
            this._emitEntry(entry);
        }
        if (entry.dirent.isDirectory() && common$1.isAppliedFilter(this._settings.deepFilter, entry)) {
            this._pushToQueue(fullpath, base === undefined ? undefined : entry.path);
        }
    }
    _emitEntry(entry) {
        this._emitter.emit('entry', entry);
    }
}
async$2.default = AsyncReader;

Object.defineProperty(async$3, "__esModule", { value: true });
const async_1$3 = async$2;
class AsyncProvider {
    constructor(_root, _settings) {
        this._root = _root;
        this._settings = _settings;
        this._reader = new async_1$3.default(this._root, this._settings);
        this._storage = [];
    }
    read(callback) {
        this._reader.onError((error) => {
            callFailureCallback(callback, error);
        });
        this._reader.onEntry((entry) => {
            this._storage.push(entry);
        });
        this._reader.onEnd(() => {
            callSuccessCallback(callback, this._storage);
        });
        this._reader.read();
    }
}
async$3.default = AsyncProvider;
function callFailureCallback(callback, error) {
    callback(error);
}
function callSuccessCallback(callback, entries) {
    callback(null, entries);
}

var stream$1 = {};

Object.defineProperty(stream$1, "__esModule", { value: true });
const stream_1$5 = require$$0__default$1["default"];
const async_1$2 = async$2;
class StreamProvider {
    constructor(_root, _settings) {
        this._root = _root;
        this._settings = _settings;
        this._reader = new async_1$2.default(this._root, this._settings);
        this._stream = new stream_1$5.Readable({
            objectMode: true,
            read: () => { },
            destroy: () => {
                if (!this._reader.isDestroyed) {
                    this._reader.destroy();
                }
            }
        });
    }
    read() {
        this._reader.onError((error) => {
            this._stream.emit('error', error);
        });
        this._reader.onEntry((entry) => {
            this._stream.push(entry);
        });
        this._reader.onEnd(() => {
            this._stream.push(null);
        });
        this._reader.read();
        return this._stream;
    }
}
stream$1.default = StreamProvider;

var sync$3 = {};

var sync$2 = {};

Object.defineProperty(sync$2, "__esModule", { value: true });
const fsScandir$1 = out$1;
const common = common$3;
const reader_1$2 = reader$1;
class SyncReader extends reader_1$2.default {
    constructor() {
        super(...arguments);
        this._scandir = fsScandir$1.scandirSync;
        this._storage = [];
        this._queue = new Set();
    }
    read() {
        this._pushToQueue(this._root, this._settings.basePath);
        this._handleQueue();
        return this._storage;
    }
    _pushToQueue(directory, base) {
        this._queue.add({ directory, base });
    }
    _handleQueue() {
        for (const item of this._queue.values()) {
            this._handleDirectory(item.directory, item.base);
        }
    }
    _handleDirectory(directory, base) {
        try {
            const entries = this._scandir(directory, this._settings.fsScandirSettings);
            for (const entry of entries) {
                this._handleEntry(entry, base);
            }
        }
        catch (error) {
            this._handleError(error);
        }
    }
    _handleError(error) {
        if (!common.isFatalError(this._settings, error)) {
            return;
        }
        throw error;
    }
    _handleEntry(entry, base) {
        const fullpath = entry.path;
        if (base !== undefined) {
            entry.path = common.joinPathSegments(base, entry.name, this._settings.pathSegmentSeparator);
        }
        if (common.isAppliedFilter(this._settings.entryFilter, entry)) {
            this._pushToStorage(entry);
        }
        if (entry.dirent.isDirectory() && common.isAppliedFilter(this._settings.deepFilter, entry)) {
            this._pushToQueue(fullpath, base === undefined ? undefined : entry.path);
        }
    }
    _pushToStorage(entry) {
        this._storage.push(entry);
    }
}
sync$2.default = SyncReader;

Object.defineProperty(sync$3, "__esModule", { value: true });
const sync_1$3 = sync$2;
class SyncProvider {
    constructor(_root, _settings) {
        this._root = _root;
        this._settings = _settings;
        this._reader = new sync_1$3.default(this._root, this._settings);
    }
    read() {
        return this._reader.read();
    }
}
sync$3.default = SyncProvider;

var settings$1 = {};

Object.defineProperty(settings$1, "__esModule", { value: true });
const path$3 = require$$0__default$4["default"];
const fsScandir = out$1;
class Settings {
    constructor(_options = {}) {
        this._options = _options;
        this.basePath = this._getValue(this._options.basePath, undefined);
        this.concurrency = this._getValue(this._options.concurrency, Number.POSITIVE_INFINITY);
        this.deepFilter = this._getValue(this._options.deepFilter, null);
        this.entryFilter = this._getValue(this._options.entryFilter, null);
        this.errorFilter = this._getValue(this._options.errorFilter, null);
        this.pathSegmentSeparator = this._getValue(this._options.pathSegmentSeparator, path$3.sep);
        this.fsScandirSettings = new fsScandir.Settings({
            followSymbolicLinks: this._options.followSymbolicLinks,
            fs: this._options.fs,
            pathSegmentSeparator: this._options.pathSegmentSeparator,
            stats: this._options.stats,
            throwErrorOnBrokenSymbolicLink: this._options.throwErrorOnBrokenSymbolicLink
        });
    }
    _getValue(option, value) {
        return option !== null && option !== void 0 ? option : value;
    }
}
settings$1.default = Settings;

Object.defineProperty(out$2, "__esModule", { value: true });
out$2.Settings = out$2.walkStream = out$2.walkSync = out$2.walk = void 0;
const async_1$1 = async$3;
const stream_1$4 = stream$1;
const sync_1$2 = sync$3;
const settings_1$1 = settings$1;
out$2.Settings = settings_1$1.default;
function walk(directory, optionsOrSettingsOrCallback, callback) {
    if (typeof optionsOrSettingsOrCallback === 'function') {
        new async_1$1.default(directory, getSettings()).read(optionsOrSettingsOrCallback);
        return;
    }
    new async_1$1.default(directory, getSettings(optionsOrSettingsOrCallback)).read(callback);
}
out$2.walk = walk;
function walkSync(directory, optionsOrSettings) {
    const settings = getSettings(optionsOrSettings);
    const provider = new sync_1$2.default(directory, settings);
    return provider.read();
}
out$2.walkSync = walkSync;
function walkStream(directory, optionsOrSettings) {
    const settings = getSettings(optionsOrSettings);
    const provider = new stream_1$4.default(directory, settings);
    return provider.read();
}
out$2.walkStream = walkStream;
function getSettings(settingsOrOptions = {}) {
    if (settingsOrOptions instanceof settings_1$1.default) {
        return settingsOrOptions;
    }
    return new settings_1$1.default(settingsOrOptions);
}

var reader = {};

Object.defineProperty(reader, "__esModule", { value: true });
const path$2 = require$$0__default$4["default"];
const fsStat$2 = out$3;
const utils$6 = utils$k;
class Reader {
    constructor(_settings) {
        this._settings = _settings;
        this._fsStatSettings = new fsStat$2.Settings({
            followSymbolicLink: this._settings.followSymbolicLinks,
            fs: this._settings.fs,
            throwErrorOnBrokenSymbolicLink: this._settings.followSymbolicLinks
        });
    }
    _getFullEntryPath(filepath) {
        return path$2.resolve(this._settings.cwd, filepath);
    }
    _makeEntry(stats, pattern) {
        const entry = {
            name: pattern,
            path: pattern,
            dirent: utils$6.fs.createDirentFromStats(pattern, stats)
        };
        if (this._settings.stats) {
            entry.stats = stats;
        }
        return entry;
    }
    _isFatalError(error) {
        return !utils$6.errno.isEnoentCodeError(error) && !this._settings.suppressErrors;
    }
}
reader.default = Reader;

Object.defineProperty(stream$2, "__esModule", { value: true });
const stream_1$3 = require$$0__default$1["default"];
const fsStat$1 = out$3;
const fsWalk$1 = out$2;
const reader_1$1 = reader;
class ReaderStream extends reader_1$1.default {
    constructor() {
        super(...arguments);
        this._walkStream = fsWalk$1.walkStream;
        this._stat = fsStat$1.stat;
    }
    dynamic(root, options) {
        return this._walkStream(root, options);
    }
    static(patterns, options) {
        const filepaths = patterns.map(this._getFullEntryPath, this);
        const stream = new stream_1$3.PassThrough({ objectMode: true });
        stream._write = (index, _enc, done) => {
            return this._getEntry(filepaths[index], patterns[index], options)
                .then((entry) => {
                if (entry !== null && options.entryFilter(entry)) {
                    stream.push(entry);
                }
                if (index === filepaths.length - 1) {
                    stream.end();
                }
                done();
            })
                .catch(done);
        };
        for (let i = 0; i < filepaths.length; i++) {
            stream.write(i);
        }
        return stream;
    }
    _getEntry(filepath, pattern, options) {
        return this._getStat(filepath)
            .then((stats) => this._makeEntry(stats, pattern))
            .catch((error) => {
            if (options.errorFilter(error)) {
                return null;
            }
            throw error;
        });
    }
    _getStat(filepath) {
        return new Promise((resolve, reject) => {
            this._stat(filepath, this._fsStatSettings, (error, stats) => {
                return error === null ? resolve(stats) : reject(error);
            });
        });
    }
}
stream$2.default = ReaderStream;

var provider = {};

var deep = {};

var partial = {};

var matcher = {};

Object.defineProperty(matcher, "__esModule", { value: true });
const utils$5 = utils$k;
class Matcher {
    constructor(_patterns, _settings, _micromatchOptions) {
        this._patterns = _patterns;
        this._settings = _settings;
        this._micromatchOptions = _micromatchOptions;
        this._storage = [];
        this._fillStorage();
    }
    _fillStorage() {
        /**
         * The original pattern may include `{,*,**,a/*}`, which will lead to problems with matching (unresolved level).
         * So, before expand patterns with brace expansion into separated patterns.
         */
        const patterns = utils$5.pattern.expandPatternsWithBraceExpansion(this._patterns);
        for (const pattern of patterns) {
            const segments = this._getPatternSegments(pattern);
            const sections = this._splitSegmentsIntoSections(segments);
            this._storage.push({
                complete: sections.length <= 1,
                pattern,
                segments,
                sections
            });
        }
    }
    _getPatternSegments(pattern) {
        const parts = utils$5.pattern.getPatternParts(pattern, this._micromatchOptions);
        return parts.map((part) => {
            const dynamic = utils$5.pattern.isDynamicPattern(part, this._settings);
            if (!dynamic) {
                return {
                    dynamic: false,
                    pattern: part
                };
            }
            return {
                dynamic: true,
                pattern: part,
                patternRe: utils$5.pattern.makeRe(part, this._micromatchOptions)
            };
        });
    }
    _splitSegmentsIntoSections(segments) {
        return utils$5.array.splitWhen(segments, (segment) => segment.dynamic && utils$5.pattern.hasGlobStar(segment.pattern));
    }
}
matcher.default = Matcher;

Object.defineProperty(partial, "__esModule", { value: true });
const matcher_1 = matcher;
class PartialMatcher extends matcher_1.default {
    match(filepath) {
        const parts = filepath.split('/');
        const levels = parts.length;
        const patterns = this._storage.filter((info) => !info.complete || info.segments.length > levels);
        for (const pattern of patterns) {
            const section = pattern.sections[0];
            /**
             * In this case, the pattern has a globstar and we must read all directories unconditionally,
             * but only if the level has reached the end of the first group.
             *
             * fixtures/{a,b}/**
             *  ^ true/false  ^ always true
            */
            if (!pattern.complete && levels > section.length) {
                return true;
            }
            const match = parts.every((part, index) => {
                const segment = pattern.segments[index];
                if (segment.dynamic && segment.patternRe.test(part)) {
                    return true;
                }
                if (!segment.dynamic && segment.pattern === part) {
                    return true;
                }
                return false;
            });
            if (match) {
                return true;
            }
        }
        return false;
    }
}
partial.default = PartialMatcher;

Object.defineProperty(deep, "__esModule", { value: true });
const utils$4 = utils$k;
const partial_1 = partial;
class DeepFilter {
    constructor(_settings, _micromatchOptions) {
        this._settings = _settings;
        this._micromatchOptions = _micromatchOptions;
    }
    getFilter(basePath, positive, negative) {
        const matcher = this._getMatcher(positive);
        const negativeRe = this._getNegativePatternsRe(negative);
        return (entry) => this._filter(basePath, entry, matcher, negativeRe);
    }
    _getMatcher(patterns) {
        return new partial_1.default(patterns, this._settings, this._micromatchOptions);
    }
    _getNegativePatternsRe(patterns) {
        const affectDepthOfReadingPatterns = patterns.filter(utils$4.pattern.isAffectDepthOfReadingPattern);
        return utils$4.pattern.convertPatternsToRe(affectDepthOfReadingPatterns, this._micromatchOptions);
    }
    _filter(basePath, entry, matcher, negativeRe) {
        if (this._isSkippedByDeep(basePath, entry.path)) {
            return false;
        }
        if (this._isSkippedSymbolicLink(entry)) {
            return false;
        }
        const filepath = utils$4.path.removeLeadingDotSegment(entry.path);
        if (this._isSkippedByPositivePatterns(filepath, matcher)) {
            return false;
        }
        return this._isSkippedByNegativePatterns(filepath, negativeRe);
    }
    _isSkippedByDeep(basePath, entryPath) {
        /**
         * Avoid unnecessary depth calculations when it doesn't matter.
         */
        if (this._settings.deep === Infinity) {
            return false;
        }
        return this._getEntryLevel(basePath, entryPath) >= this._settings.deep;
    }
    _getEntryLevel(basePath, entryPath) {
        const entryPathDepth = entryPath.split('/').length;
        if (basePath === '') {
            return entryPathDepth;
        }
        const basePathDepth = basePath.split('/').length;
        return entryPathDepth - basePathDepth;
    }
    _isSkippedSymbolicLink(entry) {
        return !this._settings.followSymbolicLinks && entry.dirent.isSymbolicLink();
    }
    _isSkippedByPositivePatterns(entryPath, matcher) {
        return !this._settings.baseNameMatch && !matcher.match(entryPath);
    }
    _isSkippedByNegativePatterns(entryPath, patternsRe) {
        return !utils$4.pattern.matchAny(entryPath, patternsRe);
    }
}
deep.default = DeepFilter;

var entry$1 = {};

Object.defineProperty(entry$1, "__esModule", { value: true });
const utils$3 = utils$k;
class EntryFilter {
    constructor(_settings, _micromatchOptions) {
        this._settings = _settings;
        this._micromatchOptions = _micromatchOptions;
        this.index = new Map();
    }
    getFilter(positive, negative) {
        const positiveRe = utils$3.pattern.convertPatternsToRe(positive, this._micromatchOptions);
        const negativeRe = utils$3.pattern.convertPatternsToRe(negative, this._micromatchOptions);
        return (entry) => this._filter(entry, positiveRe, negativeRe);
    }
    _filter(entry, positiveRe, negativeRe) {
        if (this._settings.unique && this._isDuplicateEntry(entry)) {
            return false;
        }
        if (this._onlyFileFilter(entry) || this._onlyDirectoryFilter(entry)) {
            return false;
        }
        if (this._isSkippedByAbsoluteNegativePatterns(entry.path, negativeRe)) {
            return false;
        }
        const filepath = this._settings.baseNameMatch ? entry.name : entry.path;
        const isMatched = this._isMatchToPatterns(filepath, positiveRe) && !this._isMatchToPatterns(entry.path, negativeRe);
        if (this._settings.unique && isMatched) {
            this._createIndexRecord(entry);
        }
        return isMatched;
    }
    _isDuplicateEntry(entry) {
        return this.index.has(entry.path);
    }
    _createIndexRecord(entry) {
        this.index.set(entry.path, undefined);
    }
    _onlyFileFilter(entry) {
        return this._settings.onlyFiles && !entry.dirent.isFile();
    }
    _onlyDirectoryFilter(entry) {
        return this._settings.onlyDirectories && !entry.dirent.isDirectory();
    }
    _isSkippedByAbsoluteNegativePatterns(entryPath, patternsRe) {
        if (!this._settings.absolute) {
            return false;
        }
        const fullpath = utils$3.path.makeAbsolute(this._settings.cwd, entryPath);
        return utils$3.pattern.matchAny(fullpath, patternsRe);
    }
    /**
     * First, just trying to apply patterns to the path.
     * Second, trying to apply patterns to the path with final slash.
     */
    _isMatchToPatterns(entryPath, patternsRe) {
        const filepath = utils$3.path.removeLeadingDotSegment(entryPath);
        return utils$3.pattern.matchAny(filepath, patternsRe) || utils$3.pattern.matchAny(filepath + '/', patternsRe);
    }
}
entry$1.default = EntryFilter;

var error = {};

Object.defineProperty(error, "__esModule", { value: true });
const utils$2 = utils$k;
class ErrorFilter {
    constructor(_settings) {
        this._settings = _settings;
    }
    getFilter() {
        return (error) => this._isNonFatalError(error);
    }
    _isNonFatalError(error) {
        return utils$2.errno.isEnoentCodeError(error) || this._settings.suppressErrors;
    }
}
error.default = ErrorFilter;

var entry = {};

Object.defineProperty(entry, "__esModule", { value: true });
const utils$1 = utils$k;
class EntryTransformer {
    constructor(_settings) {
        this._settings = _settings;
    }
    getTransformer() {
        return (entry) => this._transform(entry);
    }
    _transform(entry) {
        let filepath = entry.path;
        if (this._settings.absolute) {
            filepath = utils$1.path.makeAbsolute(this._settings.cwd, filepath);
            filepath = utils$1.path.unixify(filepath);
        }
        if (this._settings.markDirectories && entry.dirent.isDirectory()) {
            filepath += '/';
        }
        if (!this._settings.objectMode) {
            return filepath;
        }
        return Object.assign(Object.assign({}, entry), { path: filepath });
    }
}
entry.default = EntryTransformer;

Object.defineProperty(provider, "__esModule", { value: true });
const path$1 = require$$0__default$4["default"];
const deep_1 = deep;
const entry_1 = entry$1;
const error_1 = error;
const entry_2 = entry;
class Provider {
    constructor(_settings) {
        this._settings = _settings;
        this.errorFilter = new error_1.default(this._settings);
        this.entryFilter = new entry_1.default(this._settings, this._getMicromatchOptions());
        this.deepFilter = new deep_1.default(this._settings, this._getMicromatchOptions());
        this.entryTransformer = new entry_2.default(this._settings);
    }
    _getRootDirectory(task) {
        return path$1.resolve(this._settings.cwd, task.base);
    }
    _getReaderOptions(task) {
        const basePath = task.base === '.' ? '' : task.base;
        return {
            basePath,
            pathSegmentSeparator: '/',
            concurrency: this._settings.concurrency,
            deepFilter: this.deepFilter.getFilter(basePath, task.positive, task.negative),
            entryFilter: this.entryFilter.getFilter(task.positive, task.negative),
            errorFilter: this.errorFilter.getFilter(),
            followSymbolicLinks: this._settings.followSymbolicLinks,
            fs: this._settings.fs,
            stats: this._settings.stats,
            throwErrorOnBrokenSymbolicLink: this._settings.throwErrorOnBrokenSymbolicLink,
            transform: this.entryTransformer.getTransformer()
        };
    }
    _getMicromatchOptions() {
        return {
            dot: this._settings.dot,
            matchBase: this._settings.baseNameMatch,
            nobrace: !this._settings.braceExpansion,
            nocase: !this._settings.caseSensitiveMatch,
            noext: !this._settings.extglob,
            noglobstar: !this._settings.globstar,
            posix: true,
            strictSlashes: false
        };
    }
}
provider.default = Provider;

Object.defineProperty(async$6, "__esModule", { value: true });
const stream_1$2 = stream$2;
const provider_1$2 = provider;
class ProviderAsync extends provider_1$2.default {
    constructor() {
        super(...arguments);
        this._reader = new stream_1$2.default(this._settings);
    }
    read(task) {
        const root = this._getRootDirectory(task);
        const options = this._getReaderOptions(task);
        const entries = [];
        return new Promise((resolve, reject) => {
            const stream = this.api(root, task, options);
            stream.once('error', reject);
            stream.on('data', (entry) => entries.push(options.transform(entry)));
            stream.once('end', () => resolve(entries));
        });
    }
    api(root, task, options) {
        if (task.dynamic) {
            return this._reader.dynamic(root, options);
        }
        return this._reader.static(task.patterns, options);
    }
}
async$6.default = ProviderAsync;

var stream = {};

Object.defineProperty(stream, "__esModule", { value: true });
const stream_1$1 = require$$0__default$1["default"];
const stream_2 = stream$2;
const provider_1$1 = provider;
class ProviderStream extends provider_1$1.default {
    constructor() {
        super(...arguments);
        this._reader = new stream_2.default(this._settings);
    }
    read(task) {
        const root = this._getRootDirectory(task);
        const options = this._getReaderOptions(task);
        const source = this.api(root, task, options);
        const destination = new stream_1$1.Readable({ objectMode: true, read: () => { } });
        source
            .once('error', (error) => destination.emit('error', error))
            .on('data', (entry) => destination.emit('data', options.transform(entry)))
            .once('end', () => destination.emit('end'));
        destination
            .once('close', () => source.destroy());
        return destination;
    }
    api(root, task, options) {
        if (task.dynamic) {
            return this._reader.dynamic(root, options);
        }
        return this._reader.static(task.patterns, options);
    }
}
stream.default = ProviderStream;

var sync$1 = {};

var sync = {};

Object.defineProperty(sync, "__esModule", { value: true });
const fsStat = out$3;
const fsWalk = out$2;
const reader_1 = reader;
class ReaderSync extends reader_1.default {
    constructor() {
        super(...arguments);
        this._walkSync = fsWalk.walkSync;
        this._statSync = fsStat.statSync;
    }
    dynamic(root, options) {
        return this._walkSync(root, options);
    }
    static(patterns, options) {
        const entries = [];
        for (const pattern of patterns) {
            const filepath = this._getFullEntryPath(pattern);
            const entry = this._getEntry(filepath, pattern, options);
            if (entry === null || !options.entryFilter(entry)) {
                continue;
            }
            entries.push(entry);
        }
        return entries;
    }
    _getEntry(filepath, pattern, options) {
        try {
            const stats = this._getStat(filepath);
            return this._makeEntry(stats, pattern);
        }
        catch (error) {
            if (options.errorFilter(error)) {
                return null;
            }
            throw error;
        }
    }
    _getStat(filepath) {
        return this._statSync(filepath, this._fsStatSettings);
    }
}
sync.default = ReaderSync;

Object.defineProperty(sync$1, "__esModule", { value: true });
const sync_1$1 = sync;
const provider_1 = provider;
class ProviderSync extends provider_1.default {
    constructor() {
        super(...arguments);
        this._reader = new sync_1$1.default(this._settings);
    }
    read(task) {
        const root = this._getRootDirectory(task);
        const options = this._getReaderOptions(task);
        const entries = this.api(root, task, options);
        return entries.map(options.transform);
    }
    api(root, task, options) {
        if (task.dynamic) {
            return this._reader.dynamic(root, options);
        }
        return this._reader.static(task.patterns, options);
    }
}
sync$1.default = ProviderSync;

var settings = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DEFAULT_FILE_SYSTEM_ADAPTER = void 0;
	const fs = require$$0__default$2["default"];
	const os = require$$2__default["default"];
	/**
	 * The `os.cpus` method can return zero. We expect the number of cores to be greater than zero.
	 * https://github.com/nodejs/node/blob/7faeddf23a98c53896f8b574a6e66589e8fb1eb8/lib/os.js#L106-L107
	 */
	const CPU_COUNT = Math.max(os.cpus().length, 1);
	exports.DEFAULT_FILE_SYSTEM_ADAPTER = {
	    lstat: fs.lstat,
	    lstatSync: fs.lstatSync,
	    stat: fs.stat,
	    statSync: fs.statSync,
	    readdir: fs.readdir,
	    readdirSync: fs.readdirSync
	};
	class Settings {
	    constructor(_options = {}) {
	        this._options = _options;
	        this.absolute = this._getValue(this._options.absolute, false);
	        this.baseNameMatch = this._getValue(this._options.baseNameMatch, false);
	        this.braceExpansion = this._getValue(this._options.braceExpansion, true);
	        this.caseSensitiveMatch = this._getValue(this._options.caseSensitiveMatch, true);
	        this.concurrency = this._getValue(this._options.concurrency, CPU_COUNT);
	        this.cwd = this._getValue(this._options.cwd, process.cwd());
	        this.deep = this._getValue(this._options.deep, Infinity);
	        this.dot = this._getValue(this._options.dot, false);
	        this.extglob = this._getValue(this._options.extglob, true);
	        this.followSymbolicLinks = this._getValue(this._options.followSymbolicLinks, true);
	        this.fs = this._getFileSystemMethods(this._options.fs);
	        this.globstar = this._getValue(this._options.globstar, true);
	        this.ignore = this._getValue(this._options.ignore, []);
	        this.markDirectories = this._getValue(this._options.markDirectories, false);
	        this.objectMode = this._getValue(this._options.objectMode, false);
	        this.onlyDirectories = this._getValue(this._options.onlyDirectories, false);
	        this.onlyFiles = this._getValue(this._options.onlyFiles, true);
	        this.stats = this._getValue(this._options.stats, false);
	        this.suppressErrors = this._getValue(this._options.suppressErrors, false);
	        this.throwErrorOnBrokenSymbolicLink = this._getValue(this._options.throwErrorOnBrokenSymbolicLink, false);
	        this.unique = this._getValue(this._options.unique, true);
	        if (this.onlyDirectories) {
	            this.onlyFiles = false;
	        }
	        if (this.stats) {
	            this.objectMode = true;
	        }
	    }
	    _getValue(option, value) {
	        return option === undefined ? value : option;
	    }
	    _getFileSystemMethods(methods = {}) {
	        return Object.assign(Object.assign({}, exports.DEFAULT_FILE_SYSTEM_ADAPTER), methods);
	    }
	}
	exports.default = Settings;
} (settings));

const taskManager = tasks;
const patternManager = patterns;
const async_1 = async$6;
const stream_1 = stream;
const sync_1 = sync$1;
const settings_1 = settings;
const utils = utils$k;
async function FastGlob(source, options) {
    assertPatternsInput$1(source);
    const works = getWorks(source, async_1.default, options);
    const result = await Promise.all(works);
    return utils.array.flatten(result);
}
// https://github.com/typescript-eslint/typescript-eslint/issues/60
// eslint-disable-next-line no-redeclare
(function (FastGlob) {
    function sync(source, options) {
        assertPatternsInput$1(source);
        const works = getWorks(source, sync_1.default, options);
        return utils.array.flatten(works);
    }
    FastGlob.sync = sync;
    function stream(source, options) {
        assertPatternsInput$1(source);
        const works = getWorks(source, stream_1.default, options);
        /**
         * The stream returned by the provider cannot work with an asynchronous iterator.
         * To support asynchronous iterators, regardless of the number of tasks, we always multiplex streams.
         * This affects performance (+25%). I don't see best solution right now.
         */
        return utils.stream.merge(works);
    }
    FastGlob.stream = stream;
    function generateTasks(source, options) {
        assertPatternsInput$1(source);
        const patterns = patternManager.transform([].concat(source));
        const settings = new settings_1.default(options);
        return taskManager.generate(patterns, settings);
    }
    FastGlob.generateTasks = generateTasks;
    function isDynamicPattern(source, options) {
        assertPatternsInput$1(source);
        const settings = new settings_1.default(options);
        return utils.pattern.isDynamicPattern(source, settings);
    }
    FastGlob.isDynamicPattern = isDynamicPattern;
    function escapePath(source) {
        assertPatternsInput$1(source);
        return utils.path.escape(source);
    }
    FastGlob.escapePath = escapePath;
})(FastGlob || (FastGlob = {}));
function getWorks(source, _Provider, options) {
    const patterns = patternManager.transform([].concat(source));
    const settings = new settings_1.default(options);
    const tasks = taskManager.generate(patterns, settings);
    const provider = new _Provider(settings);
    return tasks.map(provider.read, provider);
}
function assertPatternsInput$1(input) {
    const source = [].concat(input);
    const isValidSource = source.every((item) => utils.string.isString(item) && !utils.string.isEmpty(item));
    if (!isValidSource) {
        throw new TypeError('Patterns must be a string (non empty) or an array of strings');
    }
}
var out = FastGlob;

var dirGlob = {exports: {}};

var pathType$1 = {};

const {promisify} = require$$0__default$3["default"];
const fs = require$$0__default$2["default"];

async function isType(fsStatType, statsMethodName, filePath) {
	if (typeof filePath !== 'string') {
		throw new TypeError(`Expected a string, got ${typeof filePath}`);
	}

	try {
		const stats = await promisify(fs[fsStatType])(filePath);
		return stats[statsMethodName]();
	} catch (error) {
		if (error.code === 'ENOENT') {
			return false;
		}

		throw error;
	}
}

function isTypeSync(fsStatType, statsMethodName, filePath) {
	if (typeof filePath !== 'string') {
		throw new TypeError(`Expected a string, got ${typeof filePath}`);
	}

	try {
		return fs[fsStatType](filePath)[statsMethodName]();
	} catch (error) {
		if (error.code === 'ENOENT') {
			return false;
		}

		throw error;
	}
}

pathType$1.isFile = isType.bind(null, 'stat', 'isFile');
pathType$1.isDirectory = isType.bind(null, 'stat', 'isDirectory');
pathType$1.isSymlink = isType.bind(null, 'lstat', 'isSymbolicLink');
pathType$1.isFileSync = isTypeSync.bind(null, 'statSync', 'isFile');
pathType$1.isDirectorySync = isTypeSync.bind(null, 'statSync', 'isDirectory');
pathType$1.isSymlinkSync = isTypeSync.bind(null, 'lstatSync', 'isSymbolicLink');

const path = require$$0__default$4["default"];
const pathType = pathType$1;

const getExtensions = extensions => extensions.length > 1 ? `{${extensions.join(',')}}` : extensions[0];

const getPath = (filepath, cwd) => {
	const pth = filepath[0] === '!' ? filepath.slice(1) : filepath;
	return path.isAbsolute(pth) ? pth : path.join(cwd, pth);
};

const addExtensions = (file, extensions) => {
	if (path.extname(file)) {
		return `**/${file}`;
	}

	return `**/${file}.${getExtensions(extensions)}`;
};

const getGlob = (directory, options) => {
	if (options.files && !Array.isArray(options.files)) {
		throw new TypeError(`Expected \`files\` to be of type \`Array\` but received type \`${typeof options.files}\``);
	}

	if (options.extensions && !Array.isArray(options.extensions)) {
		throw new TypeError(`Expected \`extensions\` to be of type \`Array\` but received type \`${typeof options.extensions}\``);
	}

	if (options.files && options.extensions) {
		return options.files.map(x => path.posix.join(directory, addExtensions(x, options.extensions)));
	}

	if (options.files) {
		return options.files.map(x => path.posix.join(directory, `**/${x}`));
	}

	if (options.extensions) {
		return [path.posix.join(directory, `**/*.${getExtensions(options.extensions)}`)];
	}

	return [path.posix.join(directory, '**')];
};

dirGlob.exports = async (input, options) => {
	options = {
		cwd: process.cwd(),
		...options
	};

	if (typeof options.cwd !== 'string') {
		throw new TypeError(`Expected \`cwd\` to be of type \`string\` but received type \`${typeof options.cwd}\``);
	}

	const globs = await Promise.all([].concat(input).map(async x => {
		const isDirectory = await pathType.isDirectory(getPath(x, options.cwd));
		return isDirectory ? getGlob(x, options) : x;
	}));

	return [].concat.apply([], globs); // eslint-disable-line prefer-spread
};

dirGlob.exports.sync = (input, options) => {
	options = {
		cwd: process.cwd(),
		...options
	};

	if (typeof options.cwd !== 'string') {
		throw new TypeError(`Expected \`cwd\` to be of type \`string\` but received type \`${typeof options.cwd}\``);
	}

	const globs = [].concat(input).map(x => pathType.isDirectorySync(getPath(x, options.cwd)) ? getGlob(x, options) : x);

	return [].concat.apply([], globs); // eslint-disable-line prefer-spread
};

// A simple implementation of make-array
function makeArray (subject) {
  return Array.isArray(subject)
    ? subject
    : [subject]
}

const EMPTY = '';
const SPACE = ' ';
const ESCAPE = '\\';
const REGEX_TEST_BLANK_LINE = /^\s+$/;
const REGEX_REPLACE_LEADING_EXCAPED_EXCLAMATION = /^\\!/;
const REGEX_REPLACE_LEADING_EXCAPED_HASH = /^\\#/;
const REGEX_SPLITALL_CRLF = /\r?\n/g;
// /foo,
// ./foo,
// ../foo,
// .
// ..
const REGEX_TEST_INVALID_PATH = /^\.*\/|^\.+$/;

const SLASH = '/';
const KEY_IGNORE = typeof Symbol !== 'undefined'
  ? Symbol.for('node-ignore')
  /* istanbul ignore next */
  : 'node-ignore';

const define = (object, key, value) =>
  Object.defineProperty(object, key, {value});

const REGEX_REGEXP_RANGE = /([0-z])-([0-z])/g;

const RETURN_FALSE = () => false;

// Sanitize the range of a regular expression
// The cases are complicated, see test cases for details
const sanitizeRange = range => range.replace(
  REGEX_REGEXP_RANGE,
  (match, from, to) => from.charCodeAt(0) <= to.charCodeAt(0)
    ? match
    // Invalid range (out of order) which is ok for gitignore rules but
    //   fatal for JavaScript regular expression, so eliminate it.
    : EMPTY
);

// See fixtures #59
const cleanRangeBackSlash = slashes => {
  const {length} = slashes;
  return slashes.slice(0, length - length % 2)
};

// > If the pattern ends with a slash,
// > it is removed for the purpose of the following description,
// > but it would only find a match with a directory.
// > In other words, foo/ will match a directory foo and paths underneath it,
// > but will not match a regular file or a symbolic link foo
// >  (this is consistent with the way how pathspec works in general in Git).
// '`foo/`' will not match regular file '`foo`' or symbolic link '`foo`'
// -> ignore-rules will not deal with it, because it costs extra `fs.stat` call
//      you could use option `mark: true` with `glob`

// '`foo/`' should not continue with the '`..`'
const REPLACERS = [

  // > Trailing spaces are ignored unless they are quoted with backslash ("\")
  [
    // (a\ ) -> (a )
    // (a  ) -> (a)
    // (a \ ) -> (a  )
    /\\?\s+$/,
    match => match.indexOf('\\') === 0
      ? SPACE
      : EMPTY
  ],

  // replace (\ ) with ' '
  [
    /\\\s/g,
    () => SPACE
  ],

  // Escape metacharacters
  // which is written down by users but means special for regular expressions.

  // > There are 12 characters with special meanings:
  // > - the backslash \,
  // > - the caret ^,
  // > - the dollar sign $,
  // > - the period or dot .,
  // > - the vertical bar or pipe symbol |,
  // > - the question mark ?,
  // > - the asterisk or star *,
  // > - the plus sign +,
  // > - the opening parenthesis (,
  // > - the closing parenthesis ),
  // > - and the opening square bracket [,
  // > - the opening curly brace {,
  // > These special characters are often called "metacharacters".
  [
    /[\\$.|*+(){^]/g,
    match => `\\${match}`
  ],

  [
    // > a question mark (?) matches a single character
    /(?!\\)\?/g,
    () => '[^/]'
  ],

  // leading slash
  [

    // > A leading slash matches the beginning of the pathname.
    // > For example, "/*.c" matches "cat-file.c" but not "mozilla-sha1/sha1.c".
    // A leading slash matches the beginning of the pathname
    /^\//,
    () => '^'
  ],

  // replace special metacharacter slash after the leading slash
  [
    /\//g,
    () => '\\/'
  ],

  [
    // > A leading "**" followed by a slash means match in all directories.
    // > For example, "**/foo" matches file or directory "foo" anywhere,
    // > the same as pattern "foo".
    // > "**/foo/bar" matches file or directory "bar" anywhere that is directly
    // >   under directory "foo".
    // Notice that the '*'s have been replaced as '\\*'
    /^\^*\\\*\\\*\\\//,

    // '**/foo' <-> 'foo'
    () => '^(?:.*\\/)?'
  ],

  // starting
  [
    // there will be no leading '/'
    //   (which has been replaced by section "leading slash")
    // If starts with '**', adding a '^' to the regular expression also works
    /^(?=[^^])/,
    function startingReplacer () {
      // If has a slash `/` at the beginning or middle
      return !/\/(?!$)/.test(this)
        // > Prior to 2.22.1
        // > If the pattern does not contain a slash /,
        // >   Git treats it as a shell glob pattern
        // Actually, if there is only a trailing slash,
        //   git also treats it as a shell glob pattern

        // After 2.22.1 (compatible but clearer)
        // > If there is a separator at the beginning or middle (or both)
        // > of the pattern, then the pattern is relative to the directory
        // > level of the particular .gitignore file itself.
        // > Otherwise the pattern may also match at any level below
        // > the .gitignore level.
        ? '(?:^|\\/)'

        // > Otherwise, Git treats the pattern as a shell glob suitable for
        // >   consumption by fnmatch(3)
        : '^'
    }
  ],

  // two globstars
  [
    // Use lookahead assertions so that we could match more than one `'/**'`
    /\\\/\\\*\\\*(?=\\\/|$)/g,

    // Zero, one or several directories
    // should not use '*', or it will be replaced by the next replacer

    // Check if it is not the last `'/**'`
    (_, index, str) => index + 6 < str.length

      // case: /**/
      // > A slash followed by two consecutive asterisks then a slash matches
      // >   zero or more directories.
      // > For example, "a/**/b" matches "a/b", "a/x/b", "a/x/y/b" and so on.
      // '/**/'
      ? '(?:\\/[^\\/]+)*'

      // case: /**
      // > A trailing `"/**"` matches everything inside.

      // #21: everything inside but it should not include the current folder
      : '\\/.+'
  ],

  // intermediate wildcards
  [
    // Never replace escaped '*'
    // ignore rule '\*' will match the path '*'

    // 'abc.*/' -> go
    // 'abc.*'  -> skip this rule
    /(^|[^\\]+)\\\*(?=.+)/g,

    // '*.js' matches '.js'
    // '*.js' doesn't match 'abc'
    (_, p1) => `${p1}[^\\/]*`
  ],

  [
    // unescape, revert step 3 except for back slash
    // For example, if a user escape a '\\*',
    // after step 3, the result will be '\\\\\\*'
    /\\\\\\(?=[$.|*+(){^])/g,
    () => ESCAPE
  ],

  [
    // '\\\\' -> '\\'
    /\\\\/g,
    () => ESCAPE
  ],

  [
    // > The range notation, e.g. [a-zA-Z],
    // > can be used to match one of the characters in a range.

    // `\` is escaped by step 3
    /(\\)?\[([^\]/]*?)(\\*)($|\])/g,
    (match, leadEscape, range, endEscape, close) => leadEscape === ESCAPE
      // '\\[bar]' -> '\\\\[bar\\]'
      ? `\\[${range}${cleanRangeBackSlash(endEscape)}${close}`
      : close === ']'
        ? endEscape.length % 2 === 0
          // A normal case, and it is a range notation
          // '[bar]'
          // '[bar\\\\]'
          ? `[${sanitizeRange(range)}${endEscape}]`
          // Invalid range notaton
          // '[bar\\]' -> '[bar\\\\]'
          : '[]'
        : '[]'
  ],

  // ending
  [
    // 'js' will not match 'js.'
    // 'ab' will not match 'abc'
    /(?:[^*])$/,

    // WTF!
    // https://git-scm.com/docs/gitignore
    // changes in [2.22.1](https://git-scm.com/docs/gitignore/2.22.1)
    // which re-fixes #24, #38

    // > If there is a separator at the end of the pattern then the pattern
    // > will only match directories, otherwise the pattern can match both
    // > files and directories.

    // 'js*' will not match 'a.js'
    // 'js/' will not match 'a.js'
    // 'js' will match 'a.js' and 'a.js/'
    match => /\/$/.test(match)
      // foo/ will not match 'foo'
      ? `${match}$`
      // foo matches 'foo' and 'foo/'
      : `${match}(?=$|\\/$)`
  ],

  // trailing wildcard
  [
    /(\^|\\\/)?\\\*$/,
    (_, p1) => {
      const prefix = p1
        // '\^':
        // '/*' does not match EMPTY
        // '/*' does not match everything

        // '\\\/':
        // 'abc/*' does not match 'abc/'
        ? `${p1}[^/]+`

        // 'a*' matches 'a'
        // 'a*' matches 'aa'
        : '[^/]*';

      return `${prefix}(?=$|\\/$)`
    }
  ],
];

// A simple cache, because an ignore rule only has only one certain meaning
const regexCache = Object.create(null);

// @param {pattern}
const makeRegex = (pattern, ignoreCase) => {
  let source = regexCache[pattern];

  if (!source) {
    source = REPLACERS.reduce(
      (prev, current) => prev.replace(current[0], current[1].bind(pattern)),
      pattern
    );
    regexCache[pattern] = source;
  }

  return ignoreCase
    ? new RegExp(source, 'i')
    : new RegExp(source)
};

const isString = subject => typeof subject === 'string';

// > A blank line matches no files, so it can serve as a separator for readability.
const checkPattern = pattern => pattern
  && isString(pattern)
  && !REGEX_TEST_BLANK_LINE.test(pattern)

  // > A line starting with # serves as a comment.
  && pattern.indexOf('#') !== 0;

const splitPattern = pattern => pattern.split(REGEX_SPLITALL_CRLF);

class IgnoreRule {
  constructor (
    origin,
    pattern,
    negative,
    regex
  ) {
    this.origin = origin;
    this.pattern = pattern;
    this.negative = negative;
    this.regex = regex;
  }
}

const createRule = (pattern, ignoreCase) => {
  const origin = pattern;
  let negative = false;

  // > An optional prefix "!" which negates the pattern;
  if (pattern.indexOf('!') === 0) {
    negative = true;
    pattern = pattern.substr(1);
  }

  pattern = pattern
  // > Put a backslash ("\") in front of the first "!" for patterns that
  // >   begin with a literal "!", for example, `"\!important!.txt"`.
  .replace(REGEX_REPLACE_LEADING_EXCAPED_EXCLAMATION, '!')
  // > Put a backslash ("\") in front of the first hash for patterns that
  // >   begin with a hash.
  .replace(REGEX_REPLACE_LEADING_EXCAPED_HASH, '#');

  const regex = makeRegex(pattern, ignoreCase);

  return new IgnoreRule(
    origin,
    pattern,
    negative,
    regex
  )
};

const throwError = (message, Ctor) => {
  throw new Ctor(message)
};

const checkPath = (path, originalPath, doThrow) => {
  if (!isString(path)) {
    return doThrow(
      `path must be a string, but got \`${originalPath}\``,
      TypeError
    )
  }

  // We don't know if we should ignore EMPTY, so throw
  if (!path) {
    return doThrow(`path must not be empty`, TypeError)
  }

  // Check if it is a relative path
  if (checkPath.isNotRelative(path)) {
    const r = '`path.relative()`d';
    return doThrow(
      `path should be a ${r} string, but got "${originalPath}"`,
      RangeError
    )
  }

  return true
};

const isNotRelative = path => REGEX_TEST_INVALID_PATH.test(path);

checkPath.isNotRelative = isNotRelative;
checkPath.convert = p => p;

class Ignore {
  constructor ({
    ignorecase = true,
    ignoreCase = ignorecase,
    allowRelativePaths = false
  } = {}) {
    define(this, KEY_IGNORE, true);

    this._rules = [];
    this._ignoreCase = ignoreCase;
    this._allowRelativePaths = allowRelativePaths;
    this._initCache();
  }

  _initCache () {
    this._ignoreCache = Object.create(null);
    this._testCache = Object.create(null);
  }

  _addPattern (pattern) {
    // #32
    if (pattern && pattern[KEY_IGNORE]) {
      this._rules = this._rules.concat(pattern._rules);
      this._added = true;
      return
    }

    if (checkPattern(pattern)) {
      const rule = createRule(pattern, this._ignoreCase);
      this._added = true;
      this._rules.push(rule);
    }
  }

  // @param {Array<string> | string | Ignore} pattern
  add (pattern) {
    this._added = false;

    makeArray(
      isString(pattern)
        ? splitPattern(pattern)
        : pattern
    ).forEach(this._addPattern, this);

    // Some rules have just added to the ignore,
    // making the behavior changed.
    if (this._added) {
      this._initCache();
    }

    return this
  }

  // legacy
  addPattern (pattern) {
    return this.add(pattern)
  }

  //          |           ignored : unignored
  // negative |   0:0   |   0:1   |   1:0   |   1:1
  // -------- | ------- | ------- | ------- | --------
  //     0    |  TEST   |  TEST   |  SKIP   |    X
  //     1    |  TESTIF |  SKIP   |  TEST   |    X

  // - SKIP: always skip
  // - TEST: always test
  // - TESTIF: only test if checkUnignored
  // - X: that never happen

  // @param {boolean} whether should check if the path is unignored,
  //   setting `checkUnignored` to `false` could reduce additional
  //   path matching.

  // @returns {TestResult} true if a file is ignored
  _testOne (path, checkUnignored) {
    let ignored = false;
    let unignored = false;

    this._rules.forEach(rule => {
      const {negative} = rule;
      if (
        unignored === negative && ignored !== unignored
        || negative && !ignored && !unignored && !checkUnignored
      ) {
        return
      }

      const matched = rule.regex.test(path);

      if (matched) {
        ignored = !negative;
        unignored = negative;
      }
    });

    return {
      ignored,
      unignored
    }
  }

  // @returns {TestResult}
  _test (originalPath, cache, checkUnignored, slices) {
    const path = originalPath
      // Supports nullable path
      && checkPath.convert(originalPath);

    checkPath(
      path,
      originalPath,
      this._allowRelativePaths
        ? RETURN_FALSE
        : throwError
    );

    return this._t(path, cache, checkUnignored, slices)
  }

  _t (path, cache, checkUnignored, slices) {
    if (path in cache) {
      return cache[path]
    }

    if (!slices) {
      // path/to/a.js
      // ['path', 'to', 'a.js']
      slices = path.split(SLASH);
    }

    slices.pop();

    // If the path has no parent directory, just test it
    if (!slices.length) {
      return cache[path] = this._testOne(path, checkUnignored)
    }

    const parent = this._t(
      slices.join(SLASH) + SLASH,
      cache,
      checkUnignored,
      slices
    );

    // If the path contains a parent directory, check the parent first
    return cache[path] = parent.ignored
      // > It is not possible to re-include a file if a parent directory of
      // >   that file is excluded.
      ? parent
      : this._testOne(path, checkUnignored)
  }

  ignores (path) {
    return this._test(path, this._ignoreCache, false).ignored
  }

  createFilter () {
    return path => !this.ignores(path)
  }

  filter (paths) {
    return makeArray(paths).filter(this.createFilter())
  }

  // @returns {TestResult}
  test (path) {
    return this._test(path, this._testCache, true)
  }
}

const factory = options => new Ignore(options);

const isPathValid = path =>
  checkPath(path && checkPath.convert(path), path, RETURN_FALSE);

factory.isPathValid = isPathValid;

// Fixes typescript
factory.default = factory;

var ignore = factory;

// Windows
// --------------------------------------------------------------
/* istanbul ignore if  */
if (
  // Detect `process` so that it can run in browsers.
  typeof process !== 'undefined'
  && (
    process.env && process.env.IGNORE_TEST_WIN32
    || process.platform === 'win32'
  )
) {
  /* eslint no-control-regex: "off" */
  const makePosix = str => /^\\\\\?\\/.test(str)
  || /["<>|\u0000-\u001F]+/u.test(str)
    ? str
    : str.replace(/\\/g, '/');

  checkPath.convert = makePosix;

  // 'C:\\foo'     <- 'C:\\foo' has been converted to 'C:/'
  // 'd:\\foo'
  const REGIX_IS_WINDOWS_PATH_ABSOLUTE = /^[a-z]:\//i;
  checkPath.isNotRelative = path =>
    REGIX_IS_WINDOWS_PATH_ABSOLUTE.test(path)
    || isNotRelative(path);
}

function slash(path) {
	const isExtendedLengthPath = /^\\\\\?\\/.test(path);
	const hasNonAscii = /[^\u0000-\u0080]+/.test(path); // eslint-disable-line no-control-regex

	if (isExtendedLengthPath || hasNonAscii) {
		return path;
	}

	return path.replace(/\\/g, '/');
}

const toPath = urlOrPath => urlOrPath instanceof URL ? node_url.fileURLToPath(urlOrPath) : urlOrPath;

class FilterStream extends Stream$5.Transform {
	constructor(filter) {
		super({
			objectMode: true,
			transform(data, encoding, callback) {
				callback(undefined, filter(data) ? data : undefined);
			},
		});
	}
}

const isNegativePattern = pattern => pattern[0] === '!';

const ignoreFilesGlobOptions = {
	ignore: [
		'**/node_modules',
		'**/flow-typed',
		'**/coverage',
		'**/.git',
	],
	absolute: true,
	dot: true,
};

const GITIGNORE_FILES_PATTERN = '**/.gitignore';

const applyBaseToPattern = (pattern, base) => isNegativePattern(pattern)
	? '!' + path__default["default"].posix.join(base, pattern.slice(1))
	: path__default["default"].posix.join(base, pattern);

const parseIgnoreFile = (file, cwd) => {
	const base = slash(path__default["default"].relative(cwd, path__default["default"].dirname(file.filePath)));

	return file.content
		.split(/\r?\n/)
		.filter(line => line && !line.startsWith('#'))
		.map(pattern => applyBaseToPattern(pattern, base));
};

const toRelativePath = (fileOrDirectory, cwd) => {
	cwd = slash(cwd);
	if (path__default["default"].isAbsolute(fileOrDirectory)) {
		if (slash(fileOrDirectory).startsWith(cwd)) {
			return path__default["default"].relative(cwd, fileOrDirectory);
		}

		throw new Error(`Path ${fileOrDirectory} is not in cwd ${cwd}`);
	}

	return fileOrDirectory;
};

const getIsIgnoredPredicate = (files, cwd) => {
	const patterns = files.flatMap(file => parseIgnoreFile(file, cwd));
	const ignores = ignore().add(patterns);

	return fileOrDirectory => {
		fileOrDirectory = toPath(fileOrDirectory);
		fileOrDirectory = toRelativePath(fileOrDirectory, cwd);
		return ignores.ignores(slash(fileOrDirectory));
	};
};

const normalizeOptions$1 = (options = {}) => ({
	cwd: toPath(options.cwd) || process__default["default"].cwd(),
});

const isIgnoredByIgnoreFiles = async (patterns, options) => {
	const {cwd} = normalizeOptions$1(options);

	const paths = await out(patterns, {cwd, ...ignoreFilesGlobOptions});

	const files = await Promise.all(
		paths.map(async filePath => ({
			filePath,
			content: await fs__default["default"].promises.readFile(filePath, 'utf8'),
		})),
	);

	return getIsIgnoredPredicate(files, cwd);
};

const isIgnoredByIgnoreFilesSync = (patterns, options) => {
	const {cwd} = normalizeOptions$1(options);

	const paths = out.sync(patterns, {cwd, ...ignoreFilesGlobOptions});

	const files = paths.map(filePath => ({
		filePath,
		content: fs__default["default"].readFileSync(filePath, 'utf8'),
	}));

	return getIsIgnoredPredicate(files, cwd);
};

const isGitIgnored = options => isIgnoredByIgnoreFiles(GITIGNORE_FILES_PATTERN, options);
const isGitIgnoredSync = options => isIgnoredByIgnoreFilesSync(GITIGNORE_FILES_PATTERN, options);

const assertPatternsInput = patterns => {
	if (patterns.some(pattern => typeof pattern !== 'string')) {
		throw new TypeError('Patterns must be a string or an array of strings');
	}
};

const toPatternsArray = patterns => {
	patterns = [...new Set([patterns].flat())];
	assertPatternsInput(patterns);
	return patterns;
};

const checkCwdOption = options => {
	if (!options.cwd) {
		return;
	}

	let stat;
	try {
		stat = fs__default["default"].statSync(options.cwd);
	} catch {
		return;
	}

	if (!stat.isDirectory()) {
		throw new Error('The `cwd` option must be a path to a directory');
	}
};

const normalizeOptions = (options = {}) => {
	options = {
		ignore: [],
		expandDirectories: true,
		...options,
		cwd: toPath(options.cwd),
	};

	checkCwdOption(options);

	return options;
};

const normalizeArguments = fn => async (patterns, options) => fn(toPatternsArray(patterns), normalizeOptions(options));
const normalizeArgumentsSync = fn => (patterns, options) => fn(toPatternsArray(patterns), normalizeOptions(options));

const getIgnoreFilesPatterns = options => {
	const {ignoreFiles, gitignore} = options;

	const patterns = ignoreFiles ? toPatternsArray(ignoreFiles) : [];
	if (gitignore) {
		patterns.push(GITIGNORE_FILES_PATTERN);
	}

	return patterns;
};

const getFilter = async options => {
	const ignoreFilesPatterns = getIgnoreFilesPatterns(options);
	return createFilterFunction(
		ignoreFilesPatterns.length > 0 && await isIgnoredByIgnoreFiles(ignoreFilesPatterns, {cwd: options.cwd}),
	);
};

const getFilterSync = options => {
	const ignoreFilesPatterns = getIgnoreFilesPatterns(options);
	return createFilterFunction(
		ignoreFilesPatterns.length > 0 && isIgnoredByIgnoreFilesSync(ignoreFilesPatterns, {cwd: options.cwd}),
	);
};

const createFilterFunction = isIgnored => {
	const seen = new Set();

	return fastGlobResult => {
		const path = fastGlobResult.path || fastGlobResult;
		const pathKey = path__default["default"].normalize(path);
		const seenOrIgnored = seen.has(pathKey) || (isIgnored && isIgnored(path));
		seen.add(pathKey);
		return !seenOrIgnored;
	};
};

const unionFastGlobResults = (results, filter) => results.flat().filter(fastGlobResult => filter(fastGlobResult));
const unionFastGlobStreams = (streams, filter) => merge2_1(streams).pipe(new FilterStream(fastGlobResult => filter(fastGlobResult)));

const convertNegativePatterns = (patterns, options) => {
	const tasks = [];

	while (patterns.length > 0) {
		const index = patterns.findIndex(pattern => isNegativePattern(pattern));

		if (index === -1) {
			tasks.push({patterns, options});
			break;
		}

		const ignorePattern = patterns[index].slice(1);

		for (const task of tasks) {
			task.options.ignore.push(ignorePattern);
		}

		if (index !== 0) {
			tasks.push({
				patterns: patterns.slice(0, index),
				options: {
					...options,
					ignore: [
						...options.ignore,
						ignorePattern,
					],
				},
			});
		}

		patterns = patterns.slice(index + 1);
	}

	return tasks;
};

const getDirGlobOptions = (options, cwd) => ({
	...(cwd ? {cwd} : {}),
	...(Array.isArray(options) ? {files: options} : options),
});

const generateTasks = async (patterns, options) => {
	const globTasks = convertNegativePatterns(patterns, options);

	const {cwd, expandDirectories} = options;

	if (!expandDirectories) {
		return globTasks;
	}

	const patternExpandOptions = getDirGlobOptions(expandDirectories, cwd);
	const ignoreExpandOptions = cwd ? {cwd} : undefined;

	return Promise.all(
		globTasks.map(async task => {
			let {patterns, options} = task;

			[
				patterns,
				options.ignore,
			] = await Promise.all([
				dirGlob.exports(patterns, patternExpandOptions),
				dirGlob.exports(options.ignore, ignoreExpandOptions),
			]);

			return {patterns, options};
		}),
	);
};

const generateTasksSync = (patterns, options) => {
	const globTasks = convertNegativePatterns(patterns, options);

	const {cwd, expandDirectories} = options;

	if (!expandDirectories) {
		return globTasks;
	}

	const patternExpandOptions = getDirGlobOptions(expandDirectories, cwd);
	const ignoreExpandOptions = cwd ? {cwd} : undefined;

	return globTasks.map(task => {
		let {patterns, options} = task;
		patterns = dirGlob.exports.sync(patterns, patternExpandOptions);
		options.ignore = dirGlob.exports.sync(options.ignore, ignoreExpandOptions);
		return {patterns, options};
	});
};

const globby = normalizeArguments(async (patterns, options) => {
	const [
		tasks,
		filter,
	] = await Promise.all([
		generateTasks(patterns, options),
		getFilter(options),
	]);
	const results = await Promise.all(tasks.map(task => out(task.patterns, task.options)));

	return unionFastGlobResults(results, filter);
});

const globbySync = normalizeArgumentsSync((patterns, options) => {
	const tasks = generateTasksSync(patterns, options);
	const filter = getFilterSync(options);
	const results = tasks.map(task => out.sync(task.patterns, task.options));

	return unionFastGlobResults(results, filter);
});

const globbyStream = normalizeArgumentsSync((patterns, options) => {
	const tasks = generateTasksSync(patterns, options);
	const filter = getFilterSync(options);
	const streams = tasks.map(task => out.stream(task.patterns, task.options));

	return unionFastGlobStreams(streams, filter);
});

const isDynamicPattern = normalizeArgumentsSync(
	(patterns, options) => patterns.some(pattern => out.isDynamicPattern(pattern, options)),
);

const generateGlobTasks = normalizeArguments(generateTasks);
const generateGlobTasksSync = normalizeArgumentsSync(generateTasksSync);

var globbyModule = /*#__PURE__*/Object.freeze({
	__proto__: null,
	globby: globby,
	globbySync: globbySync,
	globbyStream: globbyStream,
	isDynamicPattern: isDynamicPattern,
	generateGlobTasks: generateGlobTasks,
	generateGlobTasksSync: generateGlobTasksSync,
	isGitIgnored: isGitIgnored,
	isGitIgnoredSync: isGitIgnoredSync
});

var minimist = function (args, opts) {
    if (!opts) opts = {};
    
    var flags = { bools : {}, strings : {}, unknownFn: null };

    if (typeof opts['unknown'] === 'function') {
        flags.unknownFn = opts['unknown'];
    }

    if (typeof opts['boolean'] === 'boolean' && opts['boolean']) {
      flags.allBools = true;
    } else {
      [].concat(opts['boolean']).filter(Boolean).forEach(function (key) {
          flags.bools[key] = true;
      });
    }
    
    var aliases = {};
    Object.keys(opts.alias || {}).forEach(function (key) {
        aliases[key] = [].concat(opts.alias[key]);
        aliases[key].forEach(function (x) {
            aliases[x] = [key].concat(aliases[key].filter(function (y) {
                return x !== y;
            }));
        });
    });

    [].concat(opts.string).filter(Boolean).forEach(function (key) {
        flags.strings[key] = true;
        if (aliases[key]) {
            flags.strings[aliases[key]] = true;
        }
     });

    var defaults = opts['default'] || {};
    
    var argv = { _ : [] };
    Object.keys(flags.bools).forEach(function (key) {
        setArg(key, defaults[key] === undefined ? false : defaults[key]);
    });
    
    var notFlags = [];

    if (args.indexOf('--') !== -1) {
        notFlags = args.slice(args.indexOf('--')+1);
        args = args.slice(0, args.indexOf('--'));
    }

    function argDefined(key, arg) {
        return (flags.allBools && /^--[^=]+$/.test(arg)) ||
            flags.strings[key] || flags.bools[key] || aliases[key];
    }

    function setArg (key, val, arg) {
        if (arg && flags.unknownFn && !argDefined(key, arg)) {
            if (flags.unknownFn(arg) === false) return;
        }

        var value = !flags.strings[key] && isNumber(val)
            ? Number(val) : val
        ;
        setKey(argv, key.split('.'), value);
        
        (aliases[key] || []).forEach(function (x) {
            setKey(argv, x.split('.'), value);
        });
    }

    function setKey (obj, keys, value) {
        var o = obj;
        for (var i = 0; i < keys.length-1; i++) {
            var key = keys[i];
            if (isConstructorOrProto(o, key)) return;
            if (o[key] === undefined) o[key] = {};
            if (o[key] === Object.prototype || o[key] === Number.prototype
                || o[key] === String.prototype) o[key] = {};
            if (o[key] === Array.prototype) o[key] = [];
            o = o[key];
        }

        var key = keys[keys.length - 1];
        if (isConstructorOrProto(o, key)) return;
        if (o === Object.prototype || o === Number.prototype
            || o === String.prototype) o = {};
        if (o === Array.prototype) o = [];
        if (o[key] === undefined || flags.bools[key] || typeof o[key] === 'boolean') {
            o[key] = value;
        }
        else if (Array.isArray(o[key])) {
            o[key].push(value);
        }
        else {
            o[key] = [ o[key], value ];
        }
    }
    
    function aliasIsBoolean(key) {
      return aliases[key].some(function (x) {
          return flags.bools[x];
      });
    }

    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        
        if (/^--.+=/.test(arg)) {
            // Using [\s\S] instead of . because js doesn't support the
            // 'dotall' regex modifier. See:
            // http://stackoverflow.com/a/1068308/13216
            var m = arg.match(/^--([^=]+)=([\s\S]*)$/);
            var key = m[1];
            var value = m[2];
            if (flags.bools[key]) {
                value = value !== 'false';
            }
            setArg(key, value, arg);
        }
        else if (/^--no-.+/.test(arg)) {
            var key = arg.match(/^--no-(.+)/)[1];
            setArg(key, false, arg);
        }
        else if (/^--.+/.test(arg)) {
            var key = arg.match(/^--(.+)/)[1];
            var next = args[i + 1];
            if (next !== undefined && !/^-/.test(next)
            && !flags.bools[key]
            && !flags.allBools
            && (aliases[key] ? !aliasIsBoolean(key) : true)) {
                setArg(key, next, arg);
                i++;
            }
            else if (/^(true|false)$/.test(next)) {
                setArg(key, next === 'true', arg);
                i++;
            }
            else {
                setArg(key, flags.strings[key] ? '' : true, arg);
            }
        }
        else if (/^-[^-]+/.test(arg)) {
            var letters = arg.slice(1,-1).split('');
            
            var broken = false;
            for (var j = 0; j < letters.length; j++) {
                var next = arg.slice(j+2);
                
                if (next === '-') {
                    setArg(letters[j], next, arg);
                    continue;
                }
                
                if (/[A-Za-z]/.test(letters[j]) && /=/.test(next)) {
                    setArg(letters[j], next.split('=')[1], arg);
                    broken = true;
                    break;
                }
                
                if (/[A-Za-z]/.test(letters[j])
                && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
                    setArg(letters[j], next, arg);
                    broken = true;
                    break;
                }
                
                if (letters[j+1] && letters[j+1].match(/\W/)) {
                    setArg(letters[j], arg.slice(j+2), arg);
                    broken = true;
                    break;
                }
                else {
                    setArg(letters[j], flags.strings[letters[j]] ? '' : true, arg);
                }
            }
            
            var key = arg.slice(-1)[0];
            if (!broken && key !== '-') {
                if (args[i+1] && !/^(-|--)[^-]/.test(args[i+1])
                && !flags.bools[key]
                && (aliases[key] ? !aliasIsBoolean(key) : true)) {
                    setArg(key, args[i+1], arg);
                    i++;
                }
                else if (args[i+1] && /^(true|false)$/.test(args[i+1])) {
                    setArg(key, args[i+1] === 'true', arg);
                    i++;
                }
                else {
                    setArg(key, flags.strings[key] ? '' : true, arg);
                }
            }
        }
        else {
            if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
                argv._.push(
                    flags.strings['_'] || !isNumber(arg) ? arg : Number(arg)
                );
            }
            if (opts.stopEarly) {
                argv._.push.apply(argv._, args.slice(i + 1));
                break;
            }
        }
    }
    
    Object.keys(defaults).forEach(function (key) {
        if (!hasKey(argv, key.split('.'))) {
            setKey(argv, key.split('.'), defaults[key]);
            
            (aliases[key] || []).forEach(function (x) {
                setKey(argv, x.split('.'), defaults[key]);
            });
        }
    });
    
    if (opts['--']) {
        argv['--'] = new Array();
        notFlags.forEach(function(key) {
            argv['--'].push(key);
        });
    }
    else {
        notFlags.forEach(function(key) {
            argv._.push(key);
        });
    }

    return argv;
};

function hasKey (obj, keys) {
    var o = obj;
    keys.slice(0,-1).forEach(function (key) {
        o = (o[key] || {});
    });

    var key = keys[keys.length - 1];
    return key in o;
}

function isNumber (x) {
    if (typeof x === 'number') return true;
    if (/^0x[0-9a-f]+$/i.test(x)) return true;
    return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
}


function isConstructorOrProto (obj, key) {
    return key === 'constructor' && typeof obj[key] === 'function' || key === '__proto__';
}

var ponyfill_es2018 = {exports: {}};

/**
 * web-streams-polyfill v3.2.1
 */

var hasRequiredPonyfill_es2018;

function requirePonyfill_es2018 () {
	if (hasRequiredPonyfill_es2018) return ponyfill_es2018.exports;
	hasRequiredPonyfill_es2018 = 1;
	(function (module, exports) {
		(function (global, factory) {
		    factory(exports) ;
		}(commonjsGlobal, (function (exports) {
		    /// <reference lib="es2015.symbol" />
		    const SymbolPolyfill = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ?
		        Symbol :
		        description => `Symbol(${description})`;

		    /// <reference lib="dom" />
		    function noop() {
		        return undefined;
		    }
		    function getGlobals() {
		        if (typeof self !== 'undefined') {
		            return self;
		        }
		        else if (typeof window !== 'undefined') {
		            return window;
		        }
		        else if (typeof commonjsGlobal !== 'undefined') {
		            return commonjsGlobal;
		        }
		        return undefined;
		    }
		    const globals = getGlobals();

		    function typeIsObject(x) {
		        return (typeof x === 'object' && x !== null) || typeof x === 'function';
		    }
		    const rethrowAssertionErrorRejection = noop;

		    const originalPromise = Promise;
		    const originalPromiseThen = Promise.prototype.then;
		    const originalPromiseResolve = Promise.resolve.bind(originalPromise);
		    const originalPromiseReject = Promise.reject.bind(originalPromise);
		    function newPromise(executor) {
		        return new originalPromise(executor);
		    }
		    function promiseResolvedWith(value) {
		        return originalPromiseResolve(value);
		    }
		    function promiseRejectedWith(reason) {
		        return originalPromiseReject(reason);
		    }
		    function PerformPromiseThen(promise, onFulfilled, onRejected) {
		        // There doesn't appear to be any way to correctly emulate the behaviour from JavaScript, so this is just an
		        // approximation.
		        return originalPromiseThen.call(promise, onFulfilled, onRejected);
		    }
		    function uponPromise(promise, onFulfilled, onRejected) {
		        PerformPromiseThen(PerformPromiseThen(promise, onFulfilled, onRejected), undefined, rethrowAssertionErrorRejection);
		    }
		    function uponFulfillment(promise, onFulfilled) {
		        uponPromise(promise, onFulfilled);
		    }
		    function uponRejection(promise, onRejected) {
		        uponPromise(promise, undefined, onRejected);
		    }
		    function transformPromiseWith(promise, fulfillmentHandler, rejectionHandler) {
		        return PerformPromiseThen(promise, fulfillmentHandler, rejectionHandler);
		    }
		    function setPromiseIsHandledToTrue(promise) {
		        PerformPromiseThen(promise, undefined, rethrowAssertionErrorRejection);
		    }
		    const queueMicrotask = (() => {
		        const globalQueueMicrotask = globals && globals.queueMicrotask;
		        if (typeof globalQueueMicrotask === 'function') {
		            return globalQueueMicrotask;
		        }
		        const resolvedPromise = promiseResolvedWith(undefined);
		        return (fn) => PerformPromiseThen(resolvedPromise, fn);
		    })();
		    function reflectCall(F, V, args) {
		        if (typeof F !== 'function') {
		            throw new TypeError('Argument is not a function');
		        }
		        return Function.prototype.apply.call(F, V, args);
		    }
		    function promiseCall(F, V, args) {
		        try {
		            return promiseResolvedWith(reflectCall(F, V, args));
		        }
		        catch (value) {
		            return promiseRejectedWith(value);
		        }
		    }

		    // Original from Chromium
		    // https://chromium.googlesource.com/chromium/src/+/0aee4434a4dba42a42abaea9bfbc0cd196a63bc1/third_party/blink/renderer/core/streams/SimpleQueue.js
		    const QUEUE_MAX_ARRAY_SIZE = 16384;
		    /**
		     * Simple queue structure.
		     *
		     * Avoids scalability issues with using a packed array directly by using
		     * multiple arrays in a linked list and keeping the array size bounded.
		     */
		    class SimpleQueue {
		        constructor() {
		            this._cursor = 0;
		            this._size = 0;
		            // _front and _back are always defined.
		            this._front = {
		                _elements: [],
		                _next: undefined
		            };
		            this._back = this._front;
		            // The cursor is used to avoid calling Array.shift().
		            // It contains the index of the front element of the array inside the
		            // front-most node. It is always in the range [0, QUEUE_MAX_ARRAY_SIZE).
		            this._cursor = 0;
		            // When there is only one node, size === elements.length - cursor.
		            this._size = 0;
		        }
		        get length() {
		            return this._size;
		        }
		        // For exception safety, this method is structured in order:
		        // 1. Read state
		        // 2. Calculate required state mutations
		        // 3. Perform state mutations
		        push(element) {
		            const oldBack = this._back;
		            let newBack = oldBack;
		            if (oldBack._elements.length === QUEUE_MAX_ARRAY_SIZE - 1) {
		                newBack = {
		                    _elements: [],
		                    _next: undefined
		                };
		            }
		            // push() is the mutation most likely to throw an exception, so it
		            // goes first.
		            oldBack._elements.push(element);
		            if (newBack !== oldBack) {
		                this._back = newBack;
		                oldBack._next = newBack;
		            }
		            ++this._size;
		        }
		        // Like push(), shift() follows the read -> calculate -> mutate pattern for
		        // exception safety.
		        shift() { // must not be called on an empty queue
		            const oldFront = this._front;
		            let newFront = oldFront;
		            const oldCursor = this._cursor;
		            let newCursor = oldCursor + 1;
		            const elements = oldFront._elements;
		            const element = elements[oldCursor];
		            if (newCursor === QUEUE_MAX_ARRAY_SIZE) {
		                newFront = oldFront._next;
		                newCursor = 0;
		            }
		            // No mutations before this point.
		            --this._size;
		            this._cursor = newCursor;
		            if (oldFront !== newFront) {
		                this._front = newFront;
		            }
		            // Permit shifted element to be garbage collected.
		            elements[oldCursor] = undefined;
		            return element;
		        }
		        // The tricky thing about forEach() is that it can be called
		        // re-entrantly. The queue may be mutated inside the callback. It is easy to
		        // see that push() within the callback has no negative effects since the end
		        // of the queue is checked for on every iteration. If shift() is called
		        // repeatedly within the callback then the next iteration may return an
		        // element that has been removed. In this case the callback will be called
		        // with undefined values until we either "catch up" with elements that still
		        // exist or reach the back of the queue.
		        forEach(callback) {
		            let i = this._cursor;
		            let node = this._front;
		            let elements = node._elements;
		            while (i !== elements.length || node._next !== undefined) {
		                if (i === elements.length) {
		                    node = node._next;
		                    elements = node._elements;
		                    i = 0;
		                    if (elements.length === 0) {
		                        break;
		                    }
		                }
		                callback(elements[i]);
		                ++i;
		            }
		        }
		        // Return the element that would be returned if shift() was called now,
		        // without modifying the queue.
		        peek() { // must not be called on an empty queue
		            const front = this._front;
		            const cursor = this._cursor;
		            return front._elements[cursor];
		        }
		    }

		    function ReadableStreamReaderGenericInitialize(reader, stream) {
		        reader._ownerReadableStream = stream;
		        stream._reader = reader;
		        if (stream._state === 'readable') {
		            defaultReaderClosedPromiseInitialize(reader);
		        }
		        else if (stream._state === 'closed') {
		            defaultReaderClosedPromiseInitializeAsResolved(reader);
		        }
		        else {
		            defaultReaderClosedPromiseInitializeAsRejected(reader, stream._storedError);
		        }
		    }
		    // A client of ReadableStreamDefaultReader and ReadableStreamBYOBReader may use these functions directly to bypass state
		    // check.
		    function ReadableStreamReaderGenericCancel(reader, reason) {
		        const stream = reader._ownerReadableStream;
		        return ReadableStreamCancel(stream, reason);
		    }
		    function ReadableStreamReaderGenericRelease(reader) {
		        if (reader._ownerReadableStream._state === 'readable') {
		            defaultReaderClosedPromiseReject(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
		        }
		        else {
		            defaultReaderClosedPromiseResetToRejected(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
		        }
		        reader._ownerReadableStream._reader = undefined;
		        reader._ownerReadableStream = undefined;
		    }
		    // Helper functions for the readers.
		    function readerLockException(name) {
		        return new TypeError('Cannot ' + name + ' a stream using a released reader');
		    }
		    // Helper functions for the ReadableStreamDefaultReader.
		    function defaultReaderClosedPromiseInitialize(reader) {
		        reader._closedPromise = newPromise((resolve, reject) => {
		            reader._closedPromise_resolve = resolve;
		            reader._closedPromise_reject = reject;
		        });
		    }
		    function defaultReaderClosedPromiseInitializeAsRejected(reader, reason) {
		        defaultReaderClosedPromiseInitialize(reader);
		        defaultReaderClosedPromiseReject(reader, reason);
		    }
		    function defaultReaderClosedPromiseInitializeAsResolved(reader) {
		        defaultReaderClosedPromiseInitialize(reader);
		        defaultReaderClosedPromiseResolve(reader);
		    }
		    function defaultReaderClosedPromiseReject(reader, reason) {
		        if (reader._closedPromise_reject === undefined) {
		            return;
		        }
		        setPromiseIsHandledToTrue(reader._closedPromise);
		        reader._closedPromise_reject(reason);
		        reader._closedPromise_resolve = undefined;
		        reader._closedPromise_reject = undefined;
		    }
		    function defaultReaderClosedPromiseResetToRejected(reader, reason) {
		        defaultReaderClosedPromiseInitializeAsRejected(reader, reason);
		    }
		    function defaultReaderClosedPromiseResolve(reader) {
		        if (reader._closedPromise_resolve === undefined) {
		            return;
		        }
		        reader._closedPromise_resolve(undefined);
		        reader._closedPromise_resolve = undefined;
		        reader._closedPromise_reject = undefined;
		    }

		    const AbortSteps = SymbolPolyfill('[[AbortSteps]]');
		    const ErrorSteps = SymbolPolyfill('[[ErrorSteps]]');
		    const CancelSteps = SymbolPolyfill('[[CancelSteps]]');
		    const PullSteps = SymbolPolyfill('[[PullSteps]]');

		    /// <reference lib="es2015.core" />
		    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite#Polyfill
		    const NumberIsFinite = Number.isFinite || function (x) {
		        return typeof x === 'number' && isFinite(x);
		    };

		    /// <reference lib="es2015.core" />
		    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc#Polyfill
		    const MathTrunc = Math.trunc || function (v) {
		        return v < 0 ? Math.ceil(v) : Math.floor(v);
		    };

		    // https://heycam.github.io/webidl/#idl-dictionaries
		    function isDictionary(x) {
		        return typeof x === 'object' || typeof x === 'function';
		    }
		    function assertDictionary(obj, context) {
		        if (obj !== undefined && !isDictionary(obj)) {
		            throw new TypeError(`${context} is not an object.`);
		        }
		    }
		    // https://heycam.github.io/webidl/#idl-callback-functions
		    function assertFunction(x, context) {
		        if (typeof x !== 'function') {
		            throw new TypeError(`${context} is not a function.`);
		        }
		    }
		    // https://heycam.github.io/webidl/#idl-object
		    function isObject(x) {
		        return (typeof x === 'object' && x !== null) || typeof x === 'function';
		    }
		    function assertObject(x, context) {
		        if (!isObject(x)) {
		            throw new TypeError(`${context} is not an object.`);
		        }
		    }
		    function assertRequiredArgument(x, position, context) {
		        if (x === undefined) {
		            throw new TypeError(`Parameter ${position} is required in '${context}'.`);
		        }
		    }
		    function assertRequiredField(x, field, context) {
		        if (x === undefined) {
		            throw new TypeError(`${field} is required in '${context}'.`);
		        }
		    }
		    // https://heycam.github.io/webidl/#idl-unrestricted-double
		    function convertUnrestrictedDouble(value) {
		        return Number(value);
		    }
		    function censorNegativeZero(x) {
		        return x === 0 ? 0 : x;
		    }
		    function integerPart(x) {
		        return censorNegativeZero(MathTrunc(x));
		    }
		    // https://heycam.github.io/webidl/#idl-unsigned-long-long
		    function convertUnsignedLongLongWithEnforceRange(value, context) {
		        const lowerBound = 0;
		        const upperBound = Number.MAX_SAFE_INTEGER;
		        let x = Number(value);
		        x = censorNegativeZero(x);
		        if (!NumberIsFinite(x)) {
		            throw new TypeError(`${context} is not a finite number`);
		        }
		        x = integerPart(x);
		        if (x < lowerBound || x > upperBound) {
		            throw new TypeError(`${context} is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`);
		        }
		        if (!NumberIsFinite(x) || x === 0) {
		            return 0;
		        }
		        // TODO Use BigInt if supported?
		        // let xBigInt = BigInt(integerPart(x));
		        // xBigInt = BigInt.asUintN(64, xBigInt);
		        // return Number(xBigInt);
		        return x;
		    }

		    function assertReadableStream(x, context) {
		        if (!IsReadableStream(x)) {
		            throw new TypeError(`${context} is not a ReadableStream.`);
		        }
		    }

		    // Abstract operations for the ReadableStream.
		    function AcquireReadableStreamDefaultReader(stream) {
		        return new ReadableStreamDefaultReader(stream);
		    }
		    // ReadableStream API exposed for controllers.
		    function ReadableStreamAddReadRequest(stream, readRequest) {
		        stream._reader._readRequests.push(readRequest);
		    }
		    function ReadableStreamFulfillReadRequest(stream, chunk, done) {
		        const reader = stream._reader;
		        const readRequest = reader._readRequests.shift();
		        if (done) {
		            readRequest._closeSteps();
		        }
		        else {
		            readRequest._chunkSteps(chunk);
		        }
		    }
		    function ReadableStreamGetNumReadRequests(stream) {
		        return stream._reader._readRequests.length;
		    }
		    function ReadableStreamHasDefaultReader(stream) {
		        const reader = stream._reader;
		        if (reader === undefined) {
		            return false;
		        }
		        if (!IsReadableStreamDefaultReader(reader)) {
		            return false;
		        }
		        return true;
		    }
		    /**
		     * A default reader vended by a {@link ReadableStream}.
		     *
		     * @public
		     */
		    class ReadableStreamDefaultReader {
		        constructor(stream) {
		            assertRequiredArgument(stream, 1, 'ReadableStreamDefaultReader');
		            assertReadableStream(stream, 'First parameter');
		            if (IsReadableStreamLocked(stream)) {
		                throw new TypeError('This stream has already been locked for exclusive reading by another reader');
		            }
		            ReadableStreamReaderGenericInitialize(this, stream);
		            this._readRequests = new SimpleQueue();
		        }
		        /**
		         * Returns a promise that will be fulfilled when the stream becomes closed,
		         * or rejected if the stream ever errors or the reader's lock is released before the stream finishes closing.
		         */
		        get closed() {
		            if (!IsReadableStreamDefaultReader(this)) {
		                return promiseRejectedWith(defaultReaderBrandCheckException('closed'));
		            }
		            return this._closedPromise;
		        }
		        /**
		         * If the reader is active, behaves the same as {@link ReadableStream.cancel | stream.cancel(reason)}.
		         */
		        cancel(reason = undefined) {
		            if (!IsReadableStreamDefaultReader(this)) {
		                return promiseRejectedWith(defaultReaderBrandCheckException('cancel'));
		            }
		            if (this._ownerReadableStream === undefined) {
		                return promiseRejectedWith(readerLockException('cancel'));
		            }
		            return ReadableStreamReaderGenericCancel(this, reason);
		        }
		        /**
		         * Returns a promise that allows access to the next chunk from the stream's internal queue, if available.
		         *
		         * If reading a chunk causes the queue to become empty, more data will be pulled from the underlying source.
		         */
		        read() {
		            if (!IsReadableStreamDefaultReader(this)) {
		                return promiseRejectedWith(defaultReaderBrandCheckException('read'));
		            }
		            if (this._ownerReadableStream === undefined) {
		                return promiseRejectedWith(readerLockException('read from'));
		            }
		            let resolvePromise;
		            let rejectPromise;
		            const promise = newPromise((resolve, reject) => {
		                resolvePromise = resolve;
		                rejectPromise = reject;
		            });
		            const readRequest = {
		                _chunkSteps: chunk => resolvePromise({ value: chunk, done: false }),
		                _closeSteps: () => resolvePromise({ value: undefined, done: true }),
		                _errorSteps: e => rejectPromise(e)
		            };
		            ReadableStreamDefaultReaderRead(this, readRequest);
		            return promise;
		        }
		        /**
		         * Releases the reader's lock on the corresponding stream. After the lock is released, the reader is no longer active.
		         * If the associated stream is errored when the lock is released, the reader will appear errored in the same way
		         * from now on; otherwise, the reader will appear closed.
		         *
		         * A reader's lock cannot be released while it still has a pending read request, i.e., if a promise returned by
		         * the reader's {@link ReadableStreamDefaultReader.read | read()} method has not yet been settled. Attempting to
		         * do so will throw a `TypeError` and leave the reader locked to the stream.
		         */
		        releaseLock() {
		            if (!IsReadableStreamDefaultReader(this)) {
		                throw defaultReaderBrandCheckException('releaseLock');
		            }
		            if (this._ownerReadableStream === undefined) {
		                return;
		            }
		            if (this._readRequests.length > 0) {
		                throw new TypeError('Tried to release a reader lock when that reader has pending read() calls un-settled');
		            }
		            ReadableStreamReaderGenericRelease(this);
		        }
		    }
		    Object.defineProperties(ReadableStreamDefaultReader.prototype, {
		        cancel: { enumerable: true },
		        read: { enumerable: true },
		        releaseLock: { enumerable: true },
		        closed: { enumerable: true }
		    });
		    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
		        Object.defineProperty(ReadableStreamDefaultReader.prototype, SymbolPolyfill.toStringTag, {
		            value: 'ReadableStreamDefaultReader',
		            configurable: true
		        });
		    }
		    // Abstract operations for the readers.
		    function IsReadableStreamDefaultReader(x) {
		        if (!typeIsObject(x)) {
		            return false;
		        }
		        if (!Object.prototype.hasOwnProperty.call(x, '_readRequests')) {
		            return false;
		        }
		        return x instanceof ReadableStreamDefaultReader;
		    }
		    function ReadableStreamDefaultReaderRead(reader, readRequest) {
		        const stream = reader._ownerReadableStream;
		        stream._disturbed = true;
		        if (stream._state === 'closed') {
		            readRequest._closeSteps();
		        }
		        else if (stream._state === 'errored') {
		            readRequest._errorSteps(stream._storedError);
		        }
		        else {
		            stream._readableStreamController[PullSteps](readRequest);
		        }
		    }
		    // Helper functions for the ReadableStreamDefaultReader.
		    function defaultReaderBrandCheckException(name) {
		        return new TypeError(`ReadableStreamDefaultReader.prototype.${name} can only be used on a ReadableStreamDefaultReader`);
		    }

		    /// <reference lib="es2018.asynciterable" />
		    /* eslint-disable @typescript-eslint/no-empty-function */
		    const AsyncIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(async function* () { }).prototype);

		    /// <reference lib="es2018.asynciterable" />
		    class ReadableStreamAsyncIteratorImpl {
		        constructor(reader, preventCancel) {
		            this._ongoingPromise = undefined;
		            this._isFinished = false;
		            this._reader = reader;
		            this._preventCancel = preventCancel;
		        }
		        next() {
		            const nextSteps = () => this._nextSteps();
		            this._ongoingPromise = this._ongoingPromise ?
		                transformPromiseWith(this._ongoingPromise, nextSteps, nextSteps) :
		                nextSteps();
		            return this._ongoingPromise;
		        }
		        return(value) {
		            const returnSteps = () => this._returnSteps(value);
		            return this._ongoingPromise ?
		                transformPromiseWith(this._ongoingPromise, returnSteps, returnSteps) :
		                returnSteps();
		        }
		        _nextSteps() {
		            if (this._isFinished) {
		                return Promise.resolve({ value: undefined, done: true });
		            }
		            const reader = this._reader;
		            if (reader._ownerReadableStream === undefined) {
		                return promiseRejectedWith(readerLockException('iterate'));
		            }
		            let resolvePromise;
		            let rejectPromise;
		            const promise = newPromise((resolve, reject) => {
		                resolvePromise = resolve;
		                rejectPromise = reject;
		            });
		            const readRequest = {
		                _chunkSteps: chunk => {
		                    this._ongoingPromise = undefined;
		                    // This needs to be delayed by one microtask, otherwise we stop pulling too early which breaks a test.
		                    // FIXME Is this a bug in the specification, or in the test?
		                    queueMicrotask(() => resolvePromise({ value: chunk, done: false }));
		                },
		                _closeSteps: () => {
		                    this._ongoingPromise = undefined;
		                    this._isFinished = true;
		                    ReadableStreamReaderGenericRelease(reader);
		                    resolvePromise({ value: undefined, done: true });
		                },
		                _errorSteps: reason => {
		                    this._ongoingPromise = undefined;
		                    this._isFinished = true;
		                    ReadableStreamReaderGenericRelease(reader);
		                    rejectPromise(reason);
		                }
		            };
		            ReadableStreamDefaultReaderRead(reader, readRequest);
		            return promise;
		        }
		        _returnSteps(value) {
		            if (this._isFinished) {
		                return Promise.resolve({ value, done: true });
		            }
		            this._isFinished = true;
		            const reader = this._reader;
		            if (reader._ownerReadableStream === undefined) {
		                return promiseRejectedWith(readerLockException('finish iterating'));
		            }
		            if (!this._preventCancel) {
		                const result = ReadableStreamReaderGenericCancel(reader, value);
		                ReadableStreamReaderGenericRelease(reader);
		                return transformPromiseWith(result, () => ({ value, done: true }));
		            }
		            ReadableStreamReaderGenericRelease(reader);
		            return promiseResolvedWith({ value, done: true });
		        }
		    }
		    const ReadableStreamAsyncIteratorPrototype = {
		        next() {
		            if (!IsReadableStreamAsyncIterator(this)) {
		                return promiseRejectedWith(streamAsyncIteratorBrandCheckException('next'));
		            }
		            return this._asyncIteratorImpl.next();
		        },
		        return(value) {
		            if (!IsReadableStreamAsyncIterator(this)) {
		                return promiseRejectedWith(streamAsyncIteratorBrandCheckException('return'));
		            }
		            return this._asyncIteratorImpl.return(value);
		        }
		    };
		    if (AsyncIteratorPrototype !== undefined) {
		        Object.setPrototypeOf(ReadableStreamAsyncIteratorPrototype, AsyncIteratorPrototype);
		    }
		    // Abstract operations for the ReadableStream.
		    function AcquireReadableStreamAsyncIterator(stream, preventCancel) {
		        const reader = AcquireReadableStreamDefaultReader(stream);
		        const impl = new ReadableStreamAsyncIteratorImpl(reader, preventCancel);
		        const iterator = Object.create(ReadableStreamAsyncIteratorPrototype);
		        iterator._asyncIteratorImpl = impl;
		        return iterator;
		    }
		    function IsReadableStreamAsyncIterator(x) {
		        if (!typeIsObject(x)) {
		            return false;
		        }
		        if (!Object.prototype.hasOwnProperty.call(x, '_asyncIteratorImpl')) {
		            return false;
		        }
		        try {
		            // noinspection SuspiciousTypeOfGuard
		            return x._asyncIteratorImpl instanceof
		                ReadableStreamAsyncIteratorImpl;
		        }
		        catch (_a) {
		            return false;
		        }
		    }
		    // Helper functions for the ReadableStream.
		    function streamAsyncIteratorBrandCheckException(name) {
		        return new TypeError(`ReadableStreamAsyncIterator.${name} can only be used on a ReadableSteamAsyncIterator`);
		    }

		    /// <reference lib="es2015.core" />
		    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN#Polyfill
		    const NumberIsNaN = Number.isNaN || function (x) {
		        // eslint-disable-next-line no-self-compare
		        return x !== x;
		    };

		    function CreateArrayFromList(elements) {
		        // We use arrays to represent lists, so this is basically a no-op.
		        // Do a slice though just in case we happen to depend on the unique-ness.
		        return elements.slice();
		    }
		    function CopyDataBlockBytes(dest, destOffset, src, srcOffset, n) {
		        new Uint8Array(dest).set(new Uint8Array(src, srcOffset, n), destOffset);
		    }
		    // Not implemented correctly
		    function TransferArrayBuffer(O) {
		        return O;
		    }
		    // Not implemented correctly
		    // eslint-disable-next-line @typescript-eslint/no-unused-vars
		    function IsDetachedBuffer(O) {
		        return false;
		    }
		    function ArrayBufferSlice(buffer, begin, end) {
		        // ArrayBuffer.prototype.slice is not available on IE10
		        // https://www.caniuse.com/mdn-javascript_builtins_arraybuffer_slice
		        if (buffer.slice) {
		            return buffer.slice(begin, end);
		        }
		        const length = end - begin;
		        const slice = new ArrayBuffer(length);
		        CopyDataBlockBytes(slice, 0, buffer, begin, length);
		        return slice;
		    }

		    function IsNonNegativeNumber(v) {
		        if (typeof v !== 'number') {
		            return false;
		        }
		        if (NumberIsNaN(v)) {
		            return false;
		        }
		        if (v < 0) {
		            return false;
		        }
		        return true;
		    }
		    function CloneAsUint8Array(O) {
		        const buffer = ArrayBufferSlice(O.buffer, O.byteOffset, O.byteOffset + O.byteLength);
		        return new Uint8Array(buffer);
		    }

		    function DequeueValue(container) {
		        const pair = container._queue.shift();
		        container._queueTotalSize -= pair.size;
		        if (container._queueTotalSize < 0) {
		            container._queueTotalSize = 0;
		        }
		        return pair.value;
		    }
		    function EnqueueValueWithSize(container, value, size) {
		        if (!IsNonNegativeNumber(size) || size === Infinity) {
		            throw new RangeError('Size must be a finite, non-NaN, non-negative number.');
		        }
		        container._queue.push({ value, size });
		        container._queueTotalSize += size;
		    }
		    function PeekQueueValue(container) {
		        const pair = container._queue.peek();
		        return pair.value;
		    }
		    function ResetQueue(container) {
		        container._queue = new SimpleQueue();
		        container._queueTotalSize = 0;
		    }

		    /**
		     * A pull-into request in a {@link ReadableByteStreamController}.
		     *
		     * @public
		     */
		    class ReadableStreamBYOBRequest {
		        constructor() {
		            throw new TypeError('Illegal constructor');
		        }
		        /**
		         * Returns the view for writing in to, or `null` if the BYOB request has already been responded to.
		         */
		        get view() {
		            if (!IsReadableStreamBYOBRequest(this)) {
		                throw byobRequestBrandCheckException('view');
		            }
		            return this._view;
		        }
		        respond(bytesWritten) {
		            if (!IsReadableStreamBYOBRequest(this)) {
		                throw byobRequestBrandCheckException('respond');
		            }
		            assertRequiredArgument(bytesWritten, 1, 'respond');
		            bytesWritten = convertUnsignedLongLongWithEnforceRange(bytesWritten, 'First parameter');
		            if (this._associatedReadableByteStreamController === undefined) {
		                throw new TypeError('This BYOB request has been invalidated');
		            }
		            if (IsDetachedBuffer(this._view.buffer)) ;
		            ReadableByteStreamControllerRespond(this._associatedReadableByteStreamController, bytesWritten);
		        }
		        respondWithNewView(view) {
		            if (!IsReadableStreamBYOBRequest(this)) {
		                throw byobRequestBrandCheckException('respondWithNewView');
		            }
		            assertRequiredArgument(view, 1, 'respondWithNewView');
		            if (!ArrayBuffer.isView(view)) {
		                throw new TypeError('You can only respond with array buffer views');
		            }
		            if (this._associatedReadableByteStreamController === undefined) {
		                throw new TypeError('This BYOB request has been invalidated');
		            }
		            if (IsDetachedBuffer(view.buffer)) ;
		            ReadableByteStreamControllerRespondWithNewView(this._associatedReadableByteStreamController, view);
		        }
		    }
		    Object.defineProperties(ReadableStreamBYOBRequest.prototype, {
		        respond: { enumerable: true },
		        respondWithNewView: { enumerable: true },
		        view: { enumerable: true }
		    });
		    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
		        Object.defineProperty(ReadableStreamBYOBRequest.prototype, SymbolPolyfill.toStringTag, {
		            value: 'ReadableStreamBYOBRequest',
		            configurable: true
		        });
		    }
		    /**
		     * Allows control of a {@link ReadableStream | readable byte stream}'s state and internal queue.
		     *
		     * @public
		     */
		    class ReadableByteStreamController {
		        constructor() {
		            throw new TypeError('Illegal constructor');
		        }
		        /**
		         * Returns the current BYOB pull request, or `null` if there isn't one.
		         */
		        get byobRequest() {
		            if (!IsReadableByteStreamController(this)) {
		                throw byteStreamControllerBrandCheckException('byobRequest');
		            }
		            return ReadableByteStreamControllerGetBYOBRequest(this);
		        }
		        /**
		         * Returns the desired size to fill the controlled stream's internal queue. It can be negative, if the queue is
		         * over-full. An underlying byte source ought to use this information to determine when and how to apply backpressure.
		         */
		        get desiredSize() {
		            if (!IsReadableByteStreamController(this)) {
		                throw byteStreamControllerBrandCheckException('desiredSize');
		            }
		            return ReadableByteStreamControllerGetDesiredSize(this);
		        }
		        /**
		         * Closes the controlled readable stream. Consumers will still be able to read any previously-enqueued chunks from
		         * the stream, but once those are read, the stream will become closed.
		         */
		        close() {
		            if (!IsReadableByteStreamController(this)) {
		                throw byteStreamControllerBrandCheckException('close');
		            }
		            if (this._closeRequested) {
		                throw new TypeError('The stream has already been closed; do not close it again!');
		            }
		            const state = this._controlledReadableByteStream._state;
		            if (state !== 'readable') {
		                throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be closed`);
		            }
		            ReadableByteStreamControllerClose(this);
		        }
		        enqueue(chunk) {
		            if (!IsReadableByteStreamController(this)) {
		                throw byteStreamControllerBrandCheckException('enqueue');
		            }
		            assertRequiredArgument(chunk, 1, 'enqueue');
		            if (!ArrayBuffer.isView(chunk)) {
		                throw new TypeError('chunk must be an array buffer view');
		            }
		            if (chunk.byteLength === 0) {
		                throw new TypeError('chunk must have non-zero byteLength');
		            }
		            if (chunk.buffer.byteLength === 0) {
		                throw new TypeError(`chunk's buffer must have non-zero byteLength`);
		            }
		            if (this._closeRequested) {
		                throw new TypeError('stream is closed or draining');
		            }
		            const state = this._controlledReadableByteStream._state;
		            if (state !== 'readable') {
		                throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be enqueued to`);
		            }
		            ReadableByteStreamControllerEnqueue(this, chunk);
		        }
		        /**
		         * Errors the controlled readable stream, making all future interactions with it fail with the given error `e`.
		         */
		        error(e = undefined) {
		            if (!IsReadableByteStreamController(this)) {
		                throw byteStreamControllerBrandCheckException('error');
		            }
		            ReadableByteStreamControllerError(this, e);
		        }
		        /** @internal */
		        [CancelSteps](reason) {
		            ReadableByteStreamControllerClearPendingPullIntos(this);
		            ResetQueue(this);
		            const result = this._cancelAlgorithm(reason);
		            ReadableByteStreamControllerClearAlgorithms(this);
		            return result;
		        }
		        /** @internal */
		        [PullSteps](readRequest) {
		            const stream = this._controlledReadableByteStream;
		            if (this._queueTotalSize > 0) {
		                const entry = this._queue.shift();
		                this._queueTotalSize -= entry.byteLength;
		                ReadableByteStreamControllerHandleQueueDrain(this);
		                const view = new Uint8Array(entry.buffer, entry.byteOffset, entry.byteLength);
		                readRequest._chunkSteps(view);
		                return;
		            }
		            const autoAllocateChunkSize = this._autoAllocateChunkSize;
		            if (autoAllocateChunkSize !== undefined) {
		                let buffer;
		                try {
		                    buffer = new ArrayBuffer(autoAllocateChunkSize);
		                }
		                catch (bufferE) {
		                    readRequest._errorSteps(bufferE);
		                    return;
		                }
		                const pullIntoDescriptor = {
		                    buffer,
		                    bufferByteLength: autoAllocateChunkSize,
		                    byteOffset: 0,
		                    byteLength: autoAllocateChunkSize,
		                    bytesFilled: 0,
		                    elementSize: 1,
		                    viewConstructor: Uint8Array,
		                    readerType: 'default'
		                };
		                this._pendingPullIntos.push(pullIntoDescriptor);
		            }
		            ReadableStreamAddReadRequest(stream, readRequest);
		            ReadableByteStreamControllerCallPullIfNeeded(this);
		        }
		    }
		    Object.defineProperties(ReadableByteStreamController.prototype, {
		        close: { enumerable: true },
		        enqueue: { enumerable: true },
		        error: { enumerable: true },
		        byobRequest: { enumerable: true },
		        desiredSize: { enumerable: true }
		    });
		    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
		        Object.defineProperty(ReadableByteStreamController.prototype, SymbolPolyfill.toStringTag, {
		            value: 'ReadableByteStreamController',
		            configurable: true
		        });
		    }
		    // Abstract operations for the ReadableByteStreamController.
		    function IsReadableByteStreamController(x) {
		        if (!typeIsObject(x)) {
		            return false;
		        }
		        if (!Object.prototype.hasOwnProperty.call(x, '_controlledReadableByteStream')) {
		            return false;
		        }
		        return x instanceof ReadableByteStreamController;
		    }
		    function IsReadableStreamBYOBRequest(x) {
		        if (!typeIsObject(x)) {
		            return false;
		        }
		        if (!Object.prototype.hasOwnProperty.call(x, '_associatedReadableByteStreamController')) {
		            return false;
		        }
		        return x instanceof ReadableStreamBYOBRequest;
		    }
		    function ReadableByteStreamControllerCallPullIfNeeded(controller) {
		        const shouldPull = ReadableByteStreamControllerShouldCallPull(controller);
		        if (!shouldPull) {
		            return;
		        }
		        if (controller._pulling) {
		            controller._pullAgain = true;
		            return;
		        }
		        controller._pulling = true;
		        // TODO: Test controller argument
		        const pullPromise = controller._pullAlgorithm();
		        uponPromise(pullPromise, () => {
		            controller._pulling = false;
		            if (controller._pullAgain) {
		                controller._pullAgain = false;
		                ReadableByteStreamControllerCallPullIfNeeded(controller);
		            }
		        }, e => {
		            ReadableByteStreamControllerError(controller, e);
		        });
		    }
		    function ReadableByteStreamControllerClearPendingPullIntos(controller) {
		        ReadableByteStreamControllerInvalidateBYOBRequest(controller);
		        controller._pendingPullIntos = new SimpleQueue();
		    }
		    function ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor) {
		        let done = false;
		        if (stream._state === 'closed') {
		            done = true;
		        }
		        const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
		        if (pullIntoDescriptor.readerType === 'default') {
		            ReadableStreamFulfillReadRequest(stream, filledView, done);
		        }
		        else {
		            ReadableStreamFulfillReadIntoRequest(stream, filledView, done);
		        }
		    }
		    function ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor) {
		        const bytesFilled = pullIntoDescriptor.bytesFilled;
		        const elementSize = pullIntoDescriptor.elementSize;
		        return new pullIntoDescriptor.viewConstructor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, bytesFilled / elementSize);
		    }
		    function ReadableByteStreamControllerEnqueueChunkToQueue(controller, buffer, byteOffset, byteLength) {
		        controller._queue.push({ buffer, byteOffset, byteLength });
		        controller._queueTotalSize += byteLength;
		    }
		    function ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor) {
		        const elementSize = pullIntoDescriptor.elementSize;
		        const currentAlignedBytes = pullIntoDescriptor.bytesFilled - pullIntoDescriptor.bytesFilled % elementSize;
		        const maxBytesToCopy = Math.min(controller._queueTotalSize, pullIntoDescriptor.byteLength - pullIntoDescriptor.bytesFilled);
		        const maxBytesFilled = pullIntoDescriptor.bytesFilled + maxBytesToCopy;
		        const maxAlignedBytes = maxBytesFilled - maxBytesFilled % elementSize;
		        let totalBytesToCopyRemaining = maxBytesToCopy;
		        let ready = false;
		        if (maxAlignedBytes > currentAlignedBytes) {
		            totalBytesToCopyRemaining = maxAlignedBytes - pullIntoDescriptor.bytesFilled;
		            ready = true;
		        }
		        const queue = controller._queue;
		        while (totalBytesToCopyRemaining > 0) {
		            const headOfQueue = queue.peek();
		            const bytesToCopy = Math.min(totalBytesToCopyRemaining, headOfQueue.byteLength);
		            const destStart = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
		            CopyDataBlockBytes(pullIntoDescriptor.buffer, destStart, headOfQueue.buffer, headOfQueue.byteOffset, bytesToCopy);
		            if (headOfQueue.byteLength === bytesToCopy) {
		                queue.shift();
		            }
		            else {
		                headOfQueue.byteOffset += bytesToCopy;
		                headOfQueue.byteLength -= bytesToCopy;
		            }
		            controller._queueTotalSize -= bytesToCopy;
		            ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesToCopy, pullIntoDescriptor);
		            totalBytesToCopyRemaining -= bytesToCopy;
		        }
		        return ready;
		    }
		    function ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, size, pullIntoDescriptor) {
		        pullIntoDescriptor.bytesFilled += size;
		    }
		    function ReadableByteStreamControllerHandleQueueDrain(controller) {
		        if (controller._queueTotalSize === 0 && controller._closeRequested) {
		            ReadableByteStreamControllerClearAlgorithms(controller);
		            ReadableStreamClose(controller._controlledReadableByteStream);
		        }
		        else {
		            ReadableByteStreamControllerCallPullIfNeeded(controller);
		        }
		    }
		    function ReadableByteStreamControllerInvalidateBYOBRequest(controller) {
		        if (controller._byobRequest === null) {
		            return;
		        }
		        controller._byobRequest._associatedReadableByteStreamController = undefined;
		        controller._byobRequest._view = null;
		        controller._byobRequest = null;
		    }
		    function ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller) {
		        while (controller._pendingPullIntos.length > 0) {
		            if (controller._queueTotalSize === 0) {
		                return;
		            }
		            const pullIntoDescriptor = controller._pendingPullIntos.peek();
		            if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
		                ReadableByteStreamControllerShiftPendingPullInto(controller);
		                ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
		            }
		        }
		    }
		    function ReadableByteStreamControllerPullInto(controller, view, readIntoRequest) {
		        const stream = controller._controlledReadableByteStream;
		        let elementSize = 1;
		        if (view.constructor !== DataView) {
		            elementSize = view.constructor.BYTES_PER_ELEMENT;
		        }
		        const ctor = view.constructor;
		        // try {
		        const buffer = TransferArrayBuffer(view.buffer);
		        // } catch (e) {
		        //   readIntoRequest._errorSteps(e);
		        //   return;
		        // }
		        const pullIntoDescriptor = {
		            buffer,
		            bufferByteLength: buffer.byteLength,
		            byteOffset: view.byteOffset,
		            byteLength: view.byteLength,
		            bytesFilled: 0,
		            elementSize,
		            viewConstructor: ctor,
		            readerType: 'byob'
		        };
		        if (controller._pendingPullIntos.length > 0) {
		            controller._pendingPullIntos.push(pullIntoDescriptor);
		            // No ReadableByteStreamControllerCallPullIfNeeded() call since:
		            // - No change happens on desiredSize
		            // - The source has already been notified of that there's at least 1 pending read(view)
		            ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
		            return;
		        }
		        if (stream._state === 'closed') {
		            const emptyView = new ctor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, 0);
		            readIntoRequest._closeSteps(emptyView);
		            return;
		        }
		        if (controller._queueTotalSize > 0) {
		            if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
		                const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
		                ReadableByteStreamControllerHandleQueueDrain(controller);
		                readIntoRequest._chunkSteps(filledView);
		                return;
		            }
		            if (controller._closeRequested) {
		                const e = new TypeError('Insufficient bytes to fill elements in the given buffer');
		                ReadableByteStreamControllerError(controller, e);
		                readIntoRequest._errorSteps(e);
		                return;
		            }
		        }
		        controller._pendingPullIntos.push(pullIntoDescriptor);
		        ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
		        ReadableByteStreamControllerCallPullIfNeeded(controller);
		    }
		    function ReadableByteStreamControllerRespondInClosedState(controller, firstDescriptor) {
		        const stream = controller._controlledReadableByteStream;
		        if (ReadableStreamHasBYOBReader(stream)) {
		            while (ReadableStreamGetNumReadIntoRequests(stream) > 0) {
		                const pullIntoDescriptor = ReadableByteStreamControllerShiftPendingPullInto(controller);
		                ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor);
		            }
		        }
		    }
		    function ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, pullIntoDescriptor) {
		        ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesWritten, pullIntoDescriptor);
		        if (pullIntoDescriptor.bytesFilled < pullIntoDescriptor.elementSize) {
		            return;
		        }
		        ReadableByteStreamControllerShiftPendingPullInto(controller);
		        const remainderSize = pullIntoDescriptor.bytesFilled % pullIntoDescriptor.elementSize;
		        if (remainderSize > 0) {
		            const end = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
		            const remainder = ArrayBufferSlice(pullIntoDescriptor.buffer, end - remainderSize, end);
		            ReadableByteStreamControllerEnqueueChunkToQueue(controller, remainder, 0, remainder.byteLength);
		        }
		        pullIntoDescriptor.bytesFilled -= remainderSize;
		        ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
		        ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
		    }
		    function ReadableByteStreamControllerRespondInternal(controller, bytesWritten) {
		        const firstDescriptor = controller._pendingPullIntos.peek();
		        ReadableByteStreamControllerInvalidateBYOBRequest(controller);
		        const state = controller._controlledReadableByteStream._state;
		        if (state === 'closed') {
		            ReadableByteStreamControllerRespondInClosedState(controller);
		        }
		        else {
		            ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, firstDescriptor);
		        }
		        ReadableByteStreamControllerCallPullIfNeeded(controller);
		    }
		    function ReadableByteStreamControllerShiftPendingPullInto(controller) {
		        const descriptor = controller._pendingPullIntos.shift();
		        return descriptor;
		    }
		    function ReadableByteStreamControllerShouldCallPull(controller) {
		        const stream = controller._controlledReadableByteStream;
		        if (stream._state !== 'readable') {
		            return false;
		        }
		        if (controller._closeRequested) {
		            return false;
		        }
		        if (!controller._started) {
		            return false;
		        }
		        if (ReadableStreamHasDefaultReader(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
		            return true;
		        }
		        if (ReadableStreamHasBYOBReader(stream) && ReadableStreamGetNumReadIntoRequests(stream) > 0) {
		            return true;
		        }
		        const desiredSize = ReadableByteStreamControllerGetDesiredSize(controller);
		        if (desiredSize > 0) {
		            return true;
		        }
		        return false;
		    }
		    function ReadableByteStreamControllerClearAlgorithms(controller) {
		        controller._pullAlgorithm = undefined;
		        controller._cancelAlgorithm = undefined;
		    }
		    // A client of ReadableByteStreamController may use these functions directly to bypass state check.
		    function ReadableByteStreamControllerClose(controller) {
		        const stream = controller._controlledReadableByteStream;
		        if (controller._closeRequested || stream._state !== 'readable') {
		            return;
		        }
		        if (controller._queueTotalSize > 0) {
		            controller._closeRequested = true;
		            return;
		        }
		        if (controller._pendingPullIntos.length > 0) {
		            const firstPendingPullInto = controller._pendingPullIntos.peek();
		            if (firstPendingPullInto.bytesFilled > 0) {
		                const e = new TypeError('Insufficient bytes to fill elements in the given buffer');
		                ReadableByteStreamControllerError(controller, e);
		                throw e;
		            }
		        }
		        ReadableByteStreamControllerClearAlgorithms(controller);
		        ReadableStreamClose(stream);
		    }
		    function ReadableByteStreamControllerEnqueue(controller, chunk) {
		        const stream = controller._controlledReadableByteStream;
		        if (controller._closeRequested || stream._state !== 'readable') {
		            return;
		        }
		        const buffer = chunk.buffer;
		        const byteOffset = chunk.byteOffset;
		        const byteLength = chunk.byteLength;
		        const transferredBuffer = TransferArrayBuffer(buffer);
		        if (controller._pendingPullIntos.length > 0) {
		            const firstPendingPullInto = controller._pendingPullIntos.peek();
		            if (IsDetachedBuffer(firstPendingPullInto.buffer)) ;
		            firstPendingPullInto.buffer = TransferArrayBuffer(firstPendingPullInto.buffer);
		        }
		        ReadableByteStreamControllerInvalidateBYOBRequest(controller);
		        if (ReadableStreamHasDefaultReader(stream)) {
		            if (ReadableStreamGetNumReadRequests(stream) === 0) {
		                ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
		            }
		            else {
		                if (controller._pendingPullIntos.length > 0) {
		                    ReadableByteStreamControllerShiftPendingPullInto(controller);
		                }
		                const transferredView = new Uint8Array(transferredBuffer, byteOffset, byteLength);
		                ReadableStreamFulfillReadRequest(stream, transferredView, false);
		            }
		        }
		        else if (ReadableStreamHasBYOBReader(stream)) {
		            // TODO: Ideally in this branch detaching should happen only if the buffer is not consumed fully.
		            ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
		            ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
		        }
		        else {
		            ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
		        }
		        ReadableByteStreamControllerCallPullIfNeeded(controller);
		    }
		    function ReadableByteStreamControllerError(controller, e) {
		        const stream = controller._controlledReadableByteStream;
		        if (stream._state !== 'readable') {
		            return;
		        }
		        ReadableByteStreamControllerClearPendingPullIntos(controller);
		        ResetQueue(controller);
		        ReadableByteStreamControllerClearAlgorithms(controller);
		        ReadableStreamError(stream, e);
		    }
		    function ReadableByteStreamControllerGetBYOBRequest(controller) {
		        if (controller._byobRequest === null && controller._pendingPullIntos.length > 0) {
		            const firstDescriptor = controller._pendingPullIntos.peek();
		            const view = new Uint8Array(firstDescriptor.buffer, firstDescriptor.byteOffset + firstDescriptor.bytesFilled, firstDescriptor.byteLength - firstDescriptor.bytesFilled);
		            const byobRequest = Object.create(ReadableStreamBYOBRequest.prototype);
		            SetUpReadableStreamBYOBRequest(byobRequest, controller, view);
		            controller._byobRequest = byobRequest;
		        }
		        return controller._byobRequest;
		    }
		    function ReadableByteStreamControllerGetDesiredSize(controller) {
		        const state = controller._controlledReadableByteStream._state;
		        if (state === 'errored') {
		            return null;
		        }
		        if (state === 'closed') {
		            return 0;
		        }
		        return controller._strategyHWM - controller._queueTotalSize;
		    }
		    function ReadableByteStreamControllerRespond(controller, bytesWritten) {
		        const firstDescriptor = controller._pendingPullIntos.peek();
		        const state = controller._controlledReadableByteStream._state;
		        if (state === 'closed') {
		            if (bytesWritten !== 0) {
		                throw new TypeError('bytesWritten must be 0 when calling respond() on a closed stream');
		            }
		        }
		        else {
		            if (bytesWritten === 0) {
		                throw new TypeError('bytesWritten must be greater than 0 when calling respond() on a readable stream');
		            }
		            if (firstDescriptor.bytesFilled + bytesWritten > firstDescriptor.byteLength) {
		                throw new RangeError('bytesWritten out of range');
		            }
		        }
		        firstDescriptor.buffer = TransferArrayBuffer(firstDescriptor.buffer);
		        ReadableByteStreamControllerRespondInternal(controller, bytesWritten);
		    }
		    function ReadableByteStreamControllerRespondWithNewView(controller, view) {
		        const firstDescriptor = controller._pendingPullIntos.peek();
		        const state = controller._controlledReadableByteStream._state;
		        if (state === 'closed') {
		            if (view.byteLength !== 0) {
		                throw new TypeError('The view\'s length must be 0 when calling respondWithNewView() on a closed stream');
		            }
		        }
		        else {
		            if (view.byteLength === 0) {
		                throw new TypeError('The view\'s length must be greater than 0 when calling respondWithNewView() on a readable stream');
		            }
		        }
		        if (firstDescriptor.byteOffset + firstDescriptor.bytesFilled !== view.byteOffset) {
		            throw new RangeError('The region specified by view does not match byobRequest');
		        }
		        if (firstDescriptor.bufferByteLength !== view.buffer.byteLength) {
		            throw new RangeError('The buffer of view has different capacity than byobRequest');
		        }
		        if (firstDescriptor.bytesFilled + view.byteLength > firstDescriptor.byteLength) {
		            throw new RangeError('The region specified by view is larger than byobRequest');
		        }
		        const viewByteLength = view.byteLength;
		        firstDescriptor.buffer = TransferArrayBuffer(view.buffer);
		        ReadableByteStreamControllerRespondInternal(controller, viewByteLength);
		    }
		    function SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize) {
		        controller._controlledReadableByteStream = stream;
		        controller._pullAgain = false;
		        controller._pulling = false;
		        controller._byobRequest = null;
		        // Need to set the slots so that the assert doesn't fire. In the spec the slots already exist implicitly.
		        controller._queue = controller._queueTotalSize = undefined;
		        ResetQueue(controller);
		        controller._closeRequested = false;
		        controller._started = false;
		        controller._strategyHWM = highWaterMark;
		        controller._pullAlgorithm = pullAlgorithm;
		        controller._cancelAlgorithm = cancelAlgorithm;
		        controller._autoAllocateChunkSize = autoAllocateChunkSize;
		        controller._pendingPullIntos = new SimpleQueue();
		        stream._readableStreamController = controller;
		        const startResult = startAlgorithm();
		        uponPromise(promiseResolvedWith(startResult), () => {
		            controller._started = true;
		            ReadableByteStreamControllerCallPullIfNeeded(controller);
		        }, r => {
		            ReadableByteStreamControllerError(controller, r);
		        });
		    }
		    function SetUpReadableByteStreamControllerFromUnderlyingSource(stream, underlyingByteSource, highWaterMark) {
		        const controller = Object.create(ReadableByteStreamController.prototype);
		        let startAlgorithm = () => undefined;
		        let pullAlgorithm = () => promiseResolvedWith(undefined);
		        let cancelAlgorithm = () => promiseResolvedWith(undefined);
		        if (underlyingByteSource.start !== undefined) {
		            startAlgorithm = () => underlyingByteSource.start(controller);
		        }
		        if (underlyingByteSource.pull !== undefined) {
		            pullAlgorithm = () => underlyingByteSource.pull(controller);
		        }
		        if (underlyingByteSource.cancel !== undefined) {
		            cancelAlgorithm = reason => underlyingByteSource.cancel(reason);
		        }
		        const autoAllocateChunkSize = underlyingByteSource.autoAllocateChunkSize;
		        if (autoAllocateChunkSize === 0) {
		            throw new TypeError('autoAllocateChunkSize must be greater than 0');
		        }
		        SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize);
		    }
		    function SetUpReadableStreamBYOBRequest(request, controller, view) {
		        request._associatedReadableByteStreamController = controller;
		        request._view = view;
		    }
		    // Helper functions for the ReadableStreamBYOBRequest.
		    function byobRequestBrandCheckException(name) {
		        return new TypeError(`ReadableStreamBYOBRequest.prototype.${name} can only be used on a ReadableStreamBYOBRequest`);
		    }
		    // Helper functions for the ReadableByteStreamController.
		    function byteStreamControllerBrandCheckException(name) {
		        return new TypeError(`ReadableByteStreamController.prototype.${name} can only be used on a ReadableByteStreamController`);
		    }

		    // Abstract operations for the ReadableStream.
		    function AcquireReadableStreamBYOBReader(stream) {
		        return new ReadableStreamBYOBReader(stream);
		    }
		    // ReadableStream API exposed for controllers.
		    function ReadableStreamAddReadIntoRequest(stream, readIntoRequest) {
		        stream._reader._readIntoRequests.push(readIntoRequest);
		    }
		    function ReadableStreamFulfillReadIntoRequest(stream, chunk, done) {
		        const reader = stream._reader;
		        const readIntoRequest = reader._readIntoRequests.shift();
		        if (done) {
		            readIntoRequest._closeSteps(chunk);
		        }
		        else {
		            readIntoRequest._chunkSteps(chunk);
		        }
		    }
		    function ReadableStreamGetNumReadIntoRequests(stream) {
		        return stream._reader._readIntoRequests.length;
		    }
		    function ReadableStreamHasBYOBReader(stream) {
		        const reader = stream._reader;
		        if (reader === undefined) {
		            return false;
		        }
		        if (!IsReadableStreamBYOBReader(reader)) {
		            return false;
		        }
		        return true;
		    }
		    /**
		     * A BYOB reader vended by a {@link ReadableStream}.
		     *
		     * @public
		     */
		    class ReadableStreamBYOBReader {
		        constructor(stream) {
		            assertRequiredArgument(stream, 1, 'ReadableStreamBYOBReader');
		            assertReadableStream(stream, 'First parameter');
		            if (IsReadableStreamLocked(stream)) {
		                throw new TypeError('This stream has already been locked for exclusive reading by another reader');
		            }
		            if (!IsReadableByteStreamController(stream._readableStreamController)) {
		                throw new TypeError('Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte ' +
		                    'source');
		            }
		            ReadableStreamReaderGenericInitialize(this, stream);
		            this._readIntoRequests = new SimpleQueue();
		        }
		        /**
		         * Returns a promise that will be fulfilled when the stream becomes closed, or rejected if the stream ever errors or
		         * the reader's lock is released before the stream finishes closing.
		         */
		        get closed() {
		            if (!IsReadableStreamBYOBReader(this)) {
		                return promiseRejectedWith(byobReaderBrandCheckException('closed'));
		            }
		            return this._closedPromise;
		        }
		        /**
		         * If the reader is active, behaves the same as {@link ReadableStream.cancel | stream.cancel(reason)}.
		         */
		        cancel(reason = undefined) {
		            if (!IsReadableStreamBYOBReader(this)) {
		                return promiseRejectedWith(byobReaderBrandCheckException('cancel'));
		            }
		            if (this._ownerReadableStream === undefined) {
		                return promiseRejectedWith(readerLockException('cancel'));
		            }
		            return ReadableStreamReaderGenericCancel(this, reason);
		        }
		        /**
		         * Attempts to reads bytes into view, and returns a promise resolved with the result.
		         *
		         * If reading a chunk causes the queue to become empty, more data will be pulled from the underlying source.
		         */
		        read(view) {
		            if (!IsReadableStreamBYOBReader(this)) {
		                return promiseRejectedWith(byobReaderBrandCheckException('read'));
		            }
		            if (!ArrayBuffer.isView(view)) {
		                return promiseRejectedWith(new TypeError('view must be an array buffer view'));
		            }
		            if (view.byteLength === 0) {
		                return promiseRejectedWith(new TypeError('view must have non-zero byteLength'));
		            }
		            if (view.buffer.byteLength === 0) {
		                return promiseRejectedWith(new TypeError(`view's buffer must have non-zero byteLength`));
		            }
		            if (IsDetachedBuffer(view.buffer)) ;
		            if (this._ownerReadableStream === undefined) {
		                return promiseRejectedWith(readerLockException('read from'));
		            }
		            let resolvePromise;
		            let rejectPromise;
		            const promise = newPromise((resolve, reject) => {
		                resolvePromise = resolve;
		                rejectPromise = reject;
		            });
		            const readIntoRequest = {
		                _chunkSteps: chunk => resolvePromise({ value: chunk, done: false }),
		                _closeSteps: chunk => resolvePromise({ value: chunk, done: true }),
		                _errorSteps: e => rejectPromise(e)
		            };
		            ReadableStreamBYOBReaderRead(this, view, readIntoRequest);
		            return promise;
		        }
		        /**
		         * Releases the reader's lock on the corresponding stream. After the lock is released, the reader is no longer active.
		         * If the associated stream is errored when the lock is released, the reader will appear errored in the same way
		         * from now on; otherwise, the reader will appear closed.
		         *
		         * A reader's lock cannot be released while it still has a pending read request, i.e., if a promise returned by
		         * the reader's {@link ReadableStreamBYOBReader.read | read()} method has not yet been settled. Attempting to
		         * do so will throw a `TypeError` and leave the reader locked to the stream.
		         */
		        releaseLock() {
		            if (!IsReadableStreamBYOBReader(this)) {
		                throw byobReaderBrandCheckException('releaseLock');
		            }
		            if (this._ownerReadableStream === undefined) {
		                return;
		            }
		            if (this._readIntoRequests.length > 0) {
		                throw new TypeError('Tried to release a reader lock when that reader has pending read() calls un-settled');
		            }
		            ReadableStreamReaderGenericRelease(this);
		        }
		    }
		    Object.defineProperties(ReadableStreamBYOBReader.prototype, {
		        cancel: { enumerable: true },
		        read: { enumerable: true },
		        releaseLock: { enumerable: true },
		        closed: { enumerable: true }
		    });
		    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
		        Object.defineProperty(ReadableStreamBYOBReader.prototype, SymbolPolyfill.toStringTag, {
		            value: 'ReadableStreamBYOBReader',
		            configurable: true
		        });
		    }
		    // Abstract operations for the readers.
		    function IsReadableStreamBYOBReader(x) {
		        if (!typeIsObject(x)) {
		            return false;
		        }
		        if (!Object.prototype.hasOwnProperty.call(x, '_readIntoRequests')) {
		            return false;
		        }
		        return x instanceof ReadableStreamBYOBReader;
		    }
		    function ReadableStreamBYOBReaderRead(reader, view, readIntoRequest) {
		        const stream = reader._ownerReadableStream;
		        stream._disturbed = true;
		        if (stream._state === 'errored') {
		            readIntoRequest._errorSteps(stream._storedError);
		        }
		        else {
		            ReadableByteStreamControllerPullInto(stream._readableStreamController, view, readIntoRequest);
		        }
		    }
		    // Helper functions for the ReadableStreamBYOBReader.
		    function byobReaderBrandCheckException(name) {
		        return new TypeError(`ReadableStreamBYOBReader.prototype.${name} can only be used on a ReadableStreamBYOBReader`);
		    }

		    function ExtractHighWaterMark(strategy, defaultHWM) {
		        const { highWaterMark } = strategy;
		        if (highWaterMark === undefined) {
		            return defaultHWM;
		        }
		        if (NumberIsNaN(highWaterMark) || highWaterMark < 0) {
		            throw new RangeError('Invalid highWaterMark');
		        }
		        return highWaterMark;
		    }
		    function ExtractSizeAlgorithm(strategy) {
		        const { size } = strategy;
		        if (!size) {
		            return () => 1;
		        }
		        return size;
		    }

		    function convertQueuingStrategy(init, context) {
		        assertDictionary(init, context);
		        const highWaterMark = init === null || init === void 0 ? void 0 : init.highWaterMark;
		        const size = init === null || init === void 0 ? void 0 : init.size;
		        return {
		            highWaterMark: highWaterMark === undefined ? undefined : convertUnrestrictedDouble(highWaterMark),
		            size: size === undefined ? undefined : convertQueuingStrategySize(size, `${context} has member 'size' that`)
		        };
		    }
		    function convertQueuingStrategySize(fn, context) {
		        assertFunction(fn, context);
		        return chunk => convertUnrestrictedDouble(fn(chunk));
		    }

		    function convertUnderlyingSink(original, context) {
		        assertDictionary(original, context);
		        const abort = original === null || original === void 0 ? void 0 : original.abort;
		        const close = original === null || original === void 0 ? void 0 : original.close;
		        const start = original === null || original === void 0 ? void 0 : original.start;
		        const type = original === null || original === void 0 ? void 0 : original.type;
		        const write = original === null || original === void 0 ? void 0 : original.write;
		        return {
		            abort: abort === undefined ?
		                undefined :
		                convertUnderlyingSinkAbortCallback(abort, original, `${context} has member 'abort' that`),
		            close: close === undefined ?
		                undefined :
		                convertUnderlyingSinkCloseCallback(close, original, `${context} has member 'close' that`),
		            start: start === undefined ?
		                undefined :
		                convertUnderlyingSinkStartCallback(start, original, `${context} has member 'start' that`),
		            write: write === undefined ?
		                undefined :
		                convertUnderlyingSinkWriteCallback(write, original, `${context} has member 'write' that`),
		            type
		        };
		    }
		    function convertUnderlyingSinkAbortCallback(fn, original, context) {
		        assertFunction(fn, context);
		        return (reason) => promiseCall(fn, original, [reason]);
		    }
		    function convertUnderlyingSinkCloseCallback(fn, original, context) {
		        assertFunction(fn, context);
		        return () => promiseCall(fn, original, []);
		    }
		    function convertUnderlyingSinkStartCallback(fn, original, context) {
		        assertFunction(fn, context);
		        return (controller) => reflectCall(fn, original, [controller]);
		    }
		    function convertUnderlyingSinkWriteCallback(fn, original, context) {
		        assertFunction(fn, context);
		        return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
		    }

		    function assertWritableStream(x, context) {
		        if (!IsWritableStream(x)) {
		            throw new TypeError(`${context} is not a WritableStream.`);
		        }
		    }

		    function isAbortSignal(value) {
		        if (typeof value !== 'object' || value === null) {
		            return false;
		        }
		        try {
		            return typeof value.aborted === 'boolean';
		        }
		        catch (_a) {
		            // AbortSignal.prototype.aborted throws if its brand check fails
		            return false;
		        }
		    }
		    const supportsAbortController = typeof AbortController === 'function';
		    /**
		     * Construct a new AbortController, if supported by the platform.
		     *
		     * @internal
		     */
		    function createAbortController() {
		        if (supportsAbortController) {
		            return new AbortController();
		        }
		        return undefined;
		    }

		    /**
		     * A writable stream represents a destination for data, into which you can write.
		     *
		     * @public
		     */
		    class WritableStream {
		        constructor(rawUnderlyingSink = {}, rawStrategy = {}) {
		            if (rawUnderlyingSink === undefined) {
		                rawUnderlyingSink = null;
		            }
		            else {
		                assertObject(rawUnderlyingSink, 'First parameter');
		            }
		            const strategy = convertQueuingStrategy(rawStrategy, 'Second parameter');
		            const underlyingSink = convertUnderlyingSink(rawUnderlyingSink, 'First parameter');
		            InitializeWritableStream(this);
		            const type = underlyingSink.type;
		            if (type !== undefined) {
		                throw new RangeError('Invalid type is specified');
		            }
		            const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
		            const highWaterMark = ExtractHighWaterMark(strategy, 1);
		            SetUpWritableStreamDefaultControllerFromUnderlyingSink(this, underlyingSink, highWaterMark, sizeAlgorithm);
		        }
		        /**
		         * Returns whether or not the writable stream is locked to a writer.
		         */
		        get locked() {
		            if (!IsWritableStream(this)) {
		                throw streamBrandCheckException$2('locked');
		            }
		            return IsWritableStreamLocked(this);
		        }
		        /**
		         * Aborts the stream, signaling that the producer can no longer successfully write to the stream and it is to be
		         * immediately moved to an errored state, with any queued-up writes discarded. This will also execute any abort
		         * mechanism of the underlying sink.
		         *
		         * The returned promise will fulfill if the stream shuts down successfully, or reject if the underlying sink signaled
		         * that there was an error doing so. Additionally, it will reject with a `TypeError` (without attempting to cancel
		         * the stream) if the stream is currently locked.
		         */
		        abort(reason = undefined) {
		            if (!IsWritableStream(this)) {
		                return promiseRejectedWith(streamBrandCheckException$2('abort'));
		            }
		            if (IsWritableStreamLocked(this)) {
		                return promiseRejectedWith(new TypeError('Cannot abort a stream that already has a writer'));
		            }
		            return WritableStreamAbort(this, reason);
		        }
		        /**
		         * Closes the stream. The underlying sink will finish processing any previously-written chunks, before invoking its
		         * close behavior. During this time any further attempts to write will fail (without erroring the stream).
		         *
		         * The method returns a promise that will fulfill if all remaining chunks are successfully written and the stream
		         * successfully closes, or rejects if an error is encountered during this process. Additionally, it will reject with
		         * a `TypeError` (without attempting to cancel the stream) if the stream is currently locked.
		         */
		        close() {
		            if (!IsWritableStream(this)) {
		                return promiseRejectedWith(streamBrandCheckException$2('close'));
		            }
		            if (IsWritableStreamLocked(this)) {
		                return promiseRejectedWith(new TypeError('Cannot close a stream that already has a writer'));
		            }
		            if (WritableStreamCloseQueuedOrInFlight(this)) {
		                return promiseRejectedWith(new TypeError('Cannot close an already-closing stream'));
		            }
		            return WritableStreamClose(this);
		        }
		        /**
		         * Creates a {@link WritableStreamDefaultWriter | writer} and locks the stream to the new writer. While the stream
		         * is locked, no other writer can be acquired until this one is released.
		         *
		         * This functionality is especially useful for creating abstractions that desire the ability to write to a stream
		         * without interruption or interleaving. By getting a writer for the stream, you can ensure nobody else can write at
		         * the same time, which would cause the resulting written data to be unpredictable and probably useless.
		         */
		        getWriter() {
		            if (!IsWritableStream(this)) {
		                throw streamBrandCheckException$2('getWriter');
		            }
		            return AcquireWritableStreamDefaultWriter(this);
		        }
		    }
		    Object.defineProperties(WritableStream.prototype, {
		        abort: { enumerable: true },
		        close: { enumerable: true },
		        getWriter: { enumerable: true },
		        locked: { enumerable: true }
		    });
		    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
		        Object.defineProperty(WritableStream.prototype, SymbolPolyfill.toStringTag, {
		            value: 'WritableStream',
		            configurable: true
		        });
		    }
		    // Abstract operations for the WritableStream.
		    function AcquireWritableStreamDefaultWriter(stream) {
		        return new WritableStreamDefaultWriter(stream);
		    }
		    // Throws if and only if startAlgorithm throws.
		    function CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
		        const stream = Object.create(WritableStream.prototype);
		        InitializeWritableStream(stream);
		        const controller = Object.create(WritableStreamDefaultController.prototype);
		        SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
		        return stream;
		    }
		    function InitializeWritableStream(stream) {
		        stream._state = 'writable';
		        // The error that will be reported by new method calls once the state becomes errored. Only set when [[state]] is
		        // 'erroring' or 'errored'. May be set to an undefined value.
		        stream._storedError = undefined;
		        stream._writer = undefined;
		        // Initialize to undefined first because the constructor of the controller checks this
		        // variable to validate the caller.
		        stream._writableStreamController = undefined;
		        // This queue is placed here instead of the writer class in order to allow for passing a writer to the next data
		        // producer without waiting for the queued writes to finish.
		        stream._writeRequests = new SimpleQueue();
		        // Write requests are removed from _writeRequests when write() is called on the underlying sink. This prevents
		        // them from being erroneously rejected on error. If a write() call is in-flight, the request is stored here.
		        stream._inFlightWriteRequest = undefined;
		        // The promise that was returned from writer.close(). Stored here because it may be fulfilled after the writer
		        // has been detached.
		        stream._closeRequest = undefined;
		        // Close request is removed from _closeRequest when close() is called on the underlying sink. This prevents it
		        // from being erroneously rejected on error. If a close() call is in-flight, the request is stored here.
		        stream._inFlightCloseRequest = undefined;
		        // The promise that was returned from writer.abort(). This may also be fulfilled after the writer has detached.
		        stream._pendingAbortRequest = undefined;
		        // The backpressure signal set by the controller.
		        stream._backpressure = false;
		    }
		    function IsWritableStream(x) {
		        if (!typeIsObject(x)) {
		            return false;
		        }
		        if (!Object.prototype.hasOwnProperty.call(x, '_writableStreamController')) {
		            return false;
		        }
		        return x instanceof WritableStream;
		    }
		    function IsWritableStreamLocked(stream) {
		        if (stream._writer === undefined) {
		            return false;
		        }
		        return true;
		    }
		    function WritableStreamAbort(stream, reason) {
		        var _a;
		        if (stream._state === 'closed' || stream._state === 'errored') {
		            return promiseResolvedWith(undefined);
		        }
		        stream._writableStreamController._abortReason = reason;
		        (_a = stream._writableStreamController._abortController) === null || _a === void 0 ? void 0 : _a.abort();
		        // TypeScript narrows the type of `stream._state` down to 'writable' | 'erroring',
		        // but it doesn't know that signaling abort runs author code that might have changed the state.
		        // Widen the type again by casting to WritableStreamState.
		        const state = stream._state;
		        if (state === 'closed' || state === 'errored') {
		            return promiseResolvedWith(undefined);
		        }
		        if (stream._pendingAbortRequest !== undefined) {
		            return stream._pendingAbortRequest._promise;
		        }
		        let wasAlreadyErroring = false;
		        if (state === 'erroring') {
		            wasAlreadyErroring = true;
		            // reason will not be used, so don't keep a reference to it.
		            reason = undefined;
		        }
		        const promise = newPromise((resolve, reject) => {
		            stream._pendingAbortRequest = {
		                _promise: undefined,
		                _resolve: resolve,
		                _reject: reject,
		                _reason: reason,
		                _wasAlreadyErroring: wasAlreadyErroring
		            };
		        });
		        stream._pendingAbortRequest._promise = promise;
		        if (!wasAlreadyErroring) {
		            WritableStreamStartErroring(stream, reason);
		        }
		        return promise;
		    }
		    function WritableStreamClose(stream) {
		        const state = stream._state;
		        if (state === 'closed' || state === 'errored') {
		            return promiseRejectedWith(new TypeError(`The stream (in ${state} state) is not in the writable state and cannot be closed`));
		        }
		        const promise = newPromise((resolve, reject) => {
		            const closeRequest = {
		                _resolve: resolve,
		                _reject: reject
		            };
		            stream._closeRequest = closeRequest;
		        });
		        const writer = stream._writer;
		        if (writer !== undefined && stream._backpressure && state === 'writable') {
		            defaultWriterReadyPromiseResolve(writer);
		        }
		        WritableStreamDefaultControllerClose(stream._writableStreamController);
		        return promise;
		    }
		    // WritableStream API exposed for controllers.
		    function WritableStreamAddWriteRequest(stream) {
		        const promise = newPromise((resolve, reject) => {
		            const writeRequest = {
		                _resolve: resolve,
		                _reject: reject
		            };
		            stream._writeRequests.push(writeRequest);
		        });
		        return promise;
		    }
		    function WritableStreamDealWithRejection(stream, error) {
		        const state = stream._state;
		        if (state === 'writable') {
		            WritableStreamStartErroring(stream, error);
		            return;
		        }
		        WritableStreamFinishErroring(stream);
		    }
		    function WritableStreamStartErroring(stream, reason) {
		        const controller = stream._writableStreamController;
		        stream._state = 'erroring';
		        stream._storedError = reason;
		        const writer = stream._writer;
		        if (writer !== undefined) {
		            WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, reason);
		        }
		        if (!WritableStreamHasOperationMarkedInFlight(stream) && controller._started) {
		            WritableStreamFinishErroring(stream);
		        }
		    }
		    function WritableStreamFinishErroring(stream) {
		        stream._state = 'errored';
		        stream._writableStreamController[ErrorSteps]();
		        const storedError = stream._storedError;
		        stream._writeRequests.forEach(writeRequest => {
		            writeRequest._reject(storedError);
		        });
		        stream._writeRequests = new SimpleQueue();
		        if (stream._pendingAbortRequest === undefined) {
		            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
		            return;
		        }
		        const abortRequest = stream._pendingAbortRequest;
		        stream._pendingAbortRequest = undefined;
		        if (abortRequest._wasAlreadyErroring) {
		            abortRequest._reject(storedError);
		            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
		            return;
		        }
		        const promise = stream._writableStreamController[AbortSteps](abortRequest._reason);
		        uponPromise(promise, () => {
		            abortRequest._resolve();
		            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
		        }, (reason) => {
		            abortRequest._reject(reason);
		            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
		        });
		    }
		    function WritableStreamFinishInFlightWrite(stream) {
		        stream._inFlightWriteRequest._resolve(undefined);
		        stream._inFlightWriteRequest = undefined;
		    }
		    function WritableStreamFinishInFlightWriteWithError(stream, error) {
		        stream._inFlightWriteRequest._reject(error);
		        stream._inFlightWriteRequest = undefined;
		        WritableStreamDealWithRejection(stream, error);
		    }
		    function WritableStreamFinishInFlightClose(stream) {
		        stream._inFlightCloseRequest._resolve(undefined);
		        stream._inFlightCloseRequest = undefined;
		        const state = stream._state;
		        if (state === 'erroring') {
		            // The error was too late to do anything, so it is ignored.
		            stream._storedError = undefined;
		            if (stream._pendingAbortRequest !== undefined) {
		                stream._pendingAbortRequest._resolve();
		                stream._pendingAbortRequest = undefined;
		            }
		        }
		        stream._state = 'closed';
		        const writer = stream._writer;
		        if (writer !== undefined) {
		            defaultWriterClosedPromiseResolve(writer);
		        }
		    }
		    function WritableStreamFinishInFlightCloseWithError(stream, error) {
		        stream._inFlightCloseRequest._reject(error);
		        stream._inFlightCloseRequest = undefined;
		        // Never execute sink abort() after sink close().
		        if (stream._pendingAbortRequest !== undefined) {
		            stream._pendingAbortRequest._reject(error);
		            stream._pendingAbortRequest = undefined;
		        }
		        WritableStreamDealWithRejection(stream, error);
		    }
		    // TODO(ricea): Fix alphabetical order.
		    function WritableStreamCloseQueuedOrInFlight(stream) {
		        if (stream._closeRequest === undefined && stream._inFlightCloseRequest === undefined) {
		            return false;
		        }
		        return true;
		    }
		    function WritableStreamHasOperationMarkedInFlight(stream) {
		        if (stream._inFlightWriteRequest === undefined && stream._inFlightCloseRequest === undefined) {
		            return false;
		        }
		        return true;
		    }
		    function WritableStreamMarkCloseRequestInFlight(stream) {
		        stream._inFlightCloseRequest = stream._closeRequest;
		        stream._closeRequest = undefined;
		    }
		    function WritableStreamMarkFirstWriteRequestInFlight(stream) {
		        stream._inFlightWriteRequest = stream._writeRequests.shift();
		    }
		    function WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream) {
		        if (stream._closeRequest !== undefined) {
		            stream._closeRequest._reject(stream._storedError);
		            stream._closeRequest = undefined;
		        }
		        const writer = stream._writer;
		        if (writer !== undefined) {
		            defaultWriterClosedPromiseReject(writer, stream._storedError);
		        }
		    }
		    function WritableStreamUpdateBackpressure(stream, backpressure) {
		        const writer = stream._writer;
		        if (writer !== undefined && backpressure !== stream._backpressure) {
		            if (backpressure) {
		                defaultWriterReadyPromiseReset(writer);
		            }
		            else {
		                defaultWriterReadyPromiseResolve(writer);
		            }
		        }
		        stream._backpressure = backpressure;
		    }
		    /**
		     * A default writer vended by a {@link WritableStream}.
		     *
		     * @public
		     */
		    class WritableStreamDefaultWriter {
		        constructor(stream) {
		            assertRequiredArgument(stream, 1, 'WritableStreamDefaultWriter');
		            assertWritableStream(stream, 'First parameter');
		            if (IsWritableStreamLocked(stream)) {
		                throw new TypeError('This stream has already been locked for exclusive writing by another writer');
		            }
		            this._ownerWritableStream = stream;
		            stream._writer = this;
		            const state = stream._state;
		            if (state === 'writable') {
		                if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._backpressure) {
		                    defaultWriterReadyPromiseInitialize(this);
		                }
		                else {
		                    defaultWriterReadyPromiseInitializeAsResolved(this);
		                }
		                defaultWriterClosedPromiseInitialize(this);
		            }
		            else if (state === 'erroring') {
		                defaultWriterReadyPromiseInitializeAsRejected(this, stream._storedError);
		                defaultWriterClosedPromiseInitialize(this);
		            }
		            else if (state === 'closed') {
		                defaultWriterReadyPromiseInitializeAsResolved(this);
		                defaultWriterClosedPromiseInitializeAsResolved(this);
		            }
		            else {
		                const storedError = stream._storedError;
		                defaultWriterReadyPromiseInitializeAsRejected(this, storedError);
		                defaultWriterClosedPromiseInitializeAsRejected(this, storedError);
		            }
		        }
		        /**
		         * Returns a promise that will be fulfilled when the stream becomes closed, or rejected if the stream ever errors or
		         * the writer’s lock is released before the stream finishes closing.
		         */
		        get closed() {
		            if (!IsWritableStreamDefaultWriter(this)) {
		                return promiseRejectedWith(defaultWriterBrandCheckException('closed'));
		            }
		            return this._closedPromise;
		        }
		        /**
		         * Returns the desired size to fill the stream’s internal queue. It can be negative, if the queue is over-full.
		         * A producer can use this information to determine the right amount of data to write.
		         *
		         * It will be `null` if the stream cannot be successfully written to (due to either being errored, or having an abort
		         * queued up). It will return zero if the stream is closed. And the getter will throw an exception if invoked when
		         * the writer’s lock is released.
		         */
		        get desiredSize() {
		            if (!IsWritableStreamDefaultWriter(this)) {
		                throw defaultWriterBrandCheckException('desiredSize');
		            }
		            if (this._ownerWritableStream === undefined) {
		                throw defaultWriterLockException('desiredSize');
		            }
		            return WritableStreamDefaultWriterGetDesiredSize(this);
		        }
		        /**
		         * Returns a promise that will be fulfilled when the desired size to fill the stream’s internal queue transitions
		         * from non-positive to positive, signaling that it is no longer applying backpressure. Once the desired size dips
		         * back to zero or below, the getter will return a new promise that stays pending until the next transition.
		         *
		         * If the stream becomes errored or aborted, or the writer’s lock is released, the returned promise will become
		         * rejected.
		         */
		        get ready() {
		            if (!IsWritableStreamDefaultWriter(this)) {
		                return promiseRejectedWith(defaultWriterBrandCheckException('ready'));
		            }
		            return this._readyPromise;
		        }
		        /**
		         * If the reader is active, behaves the same as {@link WritableStream.abort | stream.abort(reason)}.
		         */
		        abort(reason = undefined) {
		            if (!IsWritableStreamDefaultWriter(this)) {
		                return promiseRejectedWith(defaultWriterBrandCheckException('abort'));
		            }
		            if (this._ownerWritableStream === undefined) {
		                return promiseRejectedWith(defaultWriterLockException('abort'));
		            }
		            return WritableStreamDefaultWriterAbort(this, reason);
		        }
		        /**
		         * If the reader is active, behaves the same as {@link WritableStream.close | stream.close()}.
		         */
		        close() {
		            if (!IsWritableStreamDefaultWriter(this)) {
		                return promiseRejectedWith(defaultWriterBrandCheckException('close'));
		            }
		            const stream = this._ownerWritableStream;
		            if (stream === undefined) {
		                return promiseRejectedWith(defaultWriterLockException('close'));
		            }
		            if (WritableStreamCloseQueuedOrInFlight(stream)) {
		                return promiseRejectedWith(new TypeError('Cannot close an already-closing stream'));
		            }
		            return WritableStreamDefaultWriterClose(this);
		        }
		        /**
		         * Releases the writer’s lock on the corresponding stream. After the lock is released, the writer is no longer active.
		         * If the associated stream is errored when the lock is released, the writer will appear errored in the same way from
		         * now on; otherwise, the writer will appear closed.
		         *
		         * Note that the lock can still be released even if some ongoing writes have not yet finished (i.e. even if the
		         * promises returned from previous calls to {@link WritableStreamDefaultWriter.write | write()} have not yet settled).
		         * It’s not necessary to hold the lock on the writer for the duration of the write; the lock instead simply prevents
		         * other producers from writing in an interleaved manner.
		         */
		        releaseLock() {
		            if (!IsWritableStreamDefaultWriter(this)) {
		                throw defaultWriterBrandCheckException('releaseLock');
		            }
		            const stream = this._ownerWritableStream;
		            if (stream === undefined) {
		                return;
		            }
		            WritableStreamDefaultWriterRelease(this);
		        }
		        write(chunk = undefined) {
		            if (!IsWritableStreamDefaultWriter(this)) {
		                return promiseRejectedWith(defaultWriterBrandCheckException('write'));
		            }
		            if (this._ownerWritableStream === undefined) {
		                return promiseRejectedWith(defaultWriterLockException('write to'));
		            }
		            return WritableStreamDefaultWriterWrite(this, chunk);
		        }
		    }
		    Object.defineProperties(WritableStreamDefaultWriter.prototype, {
		        abort: { enumerable: true },
		        close: { enumerable: true },
		        releaseLock: { enumerable: true },
		        write: { enumerable: true },
		        closed: { enumerable: true },
		        desiredSize: { enumerable: true },
		        ready: { enumerable: true }
		    });
		    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
		        Object.defineProperty(WritableStreamDefaultWriter.prototype, SymbolPolyfill.toStringTag, {
		            value: 'WritableStreamDefaultWriter',
		            configurable: true
		        });
		    }
		    // Abstract operations for the WritableStreamDefaultWriter.
		    function IsWritableStreamDefaultWriter(x) {
		        if (!typeIsObject(x)) {
		            return false;
		        }
		        if (!Object.prototype.hasOwnProperty.call(x, '_ownerWritableStream')) {
		            return false;
		        }
		        return x instanceof WritableStreamDefaultWriter;
		    }
		    // A client of WritableStreamDefaultWriter may use these functions directly to bypass state check.
		    function WritableStreamDefaultWriterAbort(writer, reason) {
		        const stream = writer._ownerWritableStream;
		        return WritableStreamAbort(stream, reason);
		    }
		    function WritableStreamDefaultWriterClose(writer) {
		        const stream = writer._ownerWritableStream;
		        return WritableStreamClose(stream);
		    }
		    function WritableStreamDefaultWriterCloseWithErrorPropagation(writer) {
		        const stream = writer._ownerWritableStream;
		        const state = stream._state;
		        if (WritableStreamCloseQueuedOrInFlight(stream) || state === 'closed') {
		            return promiseResolvedWith(undefined);
		        }
		        if (state === 'errored') {
		            return promiseRejectedWith(stream._storedError);
		        }
		        return WritableStreamDefaultWriterClose(writer);
		    }
		    function WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, error) {
		        if (writer._closedPromiseState === 'pending') {
		            defaultWriterClosedPromiseReject(writer, error);
		        }
		        else {
		            defaultWriterClosedPromiseResetToRejected(writer, error);
		        }
		    }
		    function WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, error) {
		        if (writer._readyPromiseState === 'pending') {
		            defaultWriterReadyPromiseReject(writer, error);
		        }
		        else {
		            defaultWriterReadyPromiseResetToRejected(writer, error);
		        }
		    }
		    function WritableStreamDefaultWriterGetDesiredSize(writer) {
		        const stream = writer._ownerWritableStream;
		        const state = stream._state;
		        if (state === 'errored' || state === 'erroring') {
		            return null;
		        }
		        if (state === 'closed') {
		            return 0;
		        }
		        return WritableStreamDefaultControllerGetDesiredSize(stream._writableStreamController);
		    }
		    function WritableStreamDefaultWriterRelease(writer) {
		        const stream = writer._ownerWritableStream;
		        const releasedError = new TypeError(`Writer was released and can no longer be used to monitor the stream's closedness`);
		        WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, releasedError);
		        // The state transitions to "errored" before the sink abort() method runs, but the writer.closed promise is not
		        // rejected until afterwards. This means that simply testing state will not work.
		        WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, releasedError);
		        stream._writer = undefined;
		        writer._ownerWritableStream = undefined;
		    }
		    function WritableStreamDefaultWriterWrite(writer, chunk) {
		        const stream = writer._ownerWritableStream;
		        const controller = stream._writableStreamController;
		        const chunkSize = WritableStreamDefaultControllerGetChunkSize(controller, chunk);
		        if (stream !== writer._ownerWritableStream) {
		            return promiseRejectedWith(defaultWriterLockException('write to'));
		        }
		        const state = stream._state;
		        if (state === 'errored') {
		            return promiseRejectedWith(stream._storedError);
		        }
		        if (WritableStreamCloseQueuedOrInFlight(stream) || state === 'closed') {
		            return promiseRejectedWith(new TypeError('The stream is closing or closed and cannot be written to'));
		        }
		        if (state === 'erroring') {
		            return promiseRejectedWith(stream._storedError);
		        }
		        const promise = WritableStreamAddWriteRequest(stream);
		        WritableStreamDefaultControllerWrite(controller, chunk, chunkSize);
		        return promise;
		    }
		    const closeSentinel = {};
		    /**
		     * Allows control of a {@link WritableStream | writable stream}'s state and internal queue.
		     *
		     * @public
		     */
		    class WritableStreamDefaultController {
		        constructor() {
		            throw new TypeError('Illegal constructor');
		        }
		        /**
		         * The reason which was passed to `WritableStream.abort(reason)` when the stream was aborted.
		         *
		         * @deprecated
		         *  This property has been removed from the specification, see https://github.com/whatwg/streams/pull/1177.
		         *  Use {@link WritableStreamDefaultController.signal}'s `reason` instead.
		         */
		        get abortReason() {
		            if (!IsWritableStreamDefaultController(this)) {
		                throw defaultControllerBrandCheckException$2('abortReason');
		            }
		            return this._abortReason;
		        }
		        /**
		         * An `AbortSignal` that can be used to abort the pending write or close operation when the stream is aborted.
		         */
		        get signal() {
		            if (!IsWritableStreamDefaultController(this)) {
		                throw defaultControllerBrandCheckException$2('signal');
		            }
		            if (this._abortController === undefined) {
		                // Older browsers or older Node versions may not support `AbortController` or `AbortSignal`.
		                // We don't want to bundle and ship an `AbortController` polyfill together with our polyfill,
		                // so instead we only implement support for `signal` if we find a global `AbortController` constructor.
		                throw new TypeError('WritableStreamDefaultController.prototype.signal is not supported');
		            }
		            return this._abortController.signal;
		        }
		        /**
		         * Closes the controlled writable stream, making all future interactions with it fail with the given error `e`.
		         *
		         * This method is rarely used, since usually it suffices to return a rejected promise from one of the underlying
		         * sink's methods. However, it can be useful for suddenly shutting down a stream in response to an event outside the
		         * normal lifecycle of interactions with the underlying sink.
		         */
		        error(e = undefined) {
		            if (!IsWritableStreamDefaultController(this)) {
		                throw defaultControllerBrandCheckException$2('error');
		            }
		            const state = this._controlledWritableStream._state;
		            if (state !== 'writable') {
		                // The stream is closed, errored or will be soon. The sink can't do anything useful if it gets an error here, so
		                // just treat it as a no-op.
		                return;
		            }
		            WritableStreamDefaultControllerError(this, e);
		        }
		        /** @internal */
		        [AbortSteps](reason) {
		            const result = this._abortAlgorithm(reason);
		            WritableStreamDefaultControllerClearAlgorithms(this);
		            return result;
		        }
		        /** @internal */
		        [ErrorSteps]() {
		            ResetQueue(this);
		        }
		    }
		    Object.defineProperties(WritableStreamDefaultController.prototype, {
		        abortReason: { enumerable: true },
		        signal: { enumerable: true },
		        error: { enumerable: true }
		    });
		    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
		        Object.defineProperty(WritableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
		            value: 'WritableStreamDefaultController',
		            configurable: true
		        });
		    }
		    // Abstract operations implementing interface required by the WritableStream.
		    function IsWritableStreamDefaultController(x) {
		        if (!typeIsObject(x)) {
		            return false;
		        }
		        if (!Object.prototype.hasOwnProperty.call(x, '_controlledWritableStream')) {
		            return false;
		        }
		        return x instanceof WritableStreamDefaultController;
		    }
		    function SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm) {
		        controller._controlledWritableStream = stream;
		        stream._writableStreamController = controller;
		        // Need to set the slots so that the assert doesn't fire. In the spec the slots already exist implicitly.
		        controller._queue = undefined;
		        controller._queueTotalSize = undefined;
		        ResetQueue(controller);
		        controller._abortReason = undefined;
		        controller._abortController = createAbortController();
		        controller._started = false;
		        controller._strategySizeAlgorithm = sizeAlgorithm;
		        controller._strategyHWM = highWaterMark;
		        controller._writeAlgorithm = writeAlgorithm;
		        controller._closeAlgorithm = closeAlgorithm;
		        controller._abortAlgorithm = abortAlgorithm;
		        const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
		        WritableStreamUpdateBackpressure(stream, backpressure);
		        const startResult = startAlgorithm();
		        const startPromise = promiseResolvedWith(startResult);
		        uponPromise(startPromise, () => {
		            controller._started = true;
		            WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
		        }, r => {
		            controller._started = true;
		            WritableStreamDealWithRejection(stream, r);
		        });
		    }
		    function SetUpWritableStreamDefaultControllerFromUnderlyingSink(stream, underlyingSink, highWaterMark, sizeAlgorithm) {
		        const controller = Object.create(WritableStreamDefaultController.prototype);
		        let startAlgorithm = () => undefined;
		        let writeAlgorithm = () => promiseResolvedWith(undefined);
		        let closeAlgorithm = () => promiseResolvedWith(undefined);
		        let abortAlgorithm = () => promiseResolvedWith(undefined);
		        if (underlyingSink.start !== undefined) {
		            startAlgorithm = () => underlyingSink.start(controller);
		        }
		        if (underlyingSink.write !== undefined) {
		            writeAlgorithm = chunk => underlyingSink.write(chunk, controller);
		        }
		        if (underlyingSink.close !== undefined) {
		            closeAlgorithm = () => underlyingSink.close();
		        }
		        if (underlyingSink.abort !== undefined) {
		            abortAlgorithm = reason => underlyingSink.abort(reason);
		        }
		        SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
		    }
		    // ClearAlgorithms may be called twice. Erroring the same stream in multiple ways will often result in redundant calls.
		    function WritableStreamDefaultControllerClearAlgorithms(controller) {
		        controller._writeAlgorithm = undefined;
		        controller._closeAlgorithm = undefined;
		        controller._abortAlgorithm = undefined;
		        controller._strategySizeAlgorithm = undefined;
		    }
		    function WritableStreamDefaultControllerClose(controller) {
		        EnqueueValueWithSize(controller, closeSentinel, 0);
		        WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
		    }
		    function WritableStreamDefaultControllerGetChunkSize(controller, chunk) {
		        try {
		            return controller._strategySizeAlgorithm(chunk);
		        }
		        catch (chunkSizeE) {
		            WritableStreamDefaultControllerErrorIfNeeded(controller, chunkSizeE);
		            return 1;
		        }
		    }
		    function WritableStreamDefaultControllerGetDesiredSize(controller) {
		        return controller._strategyHWM - controller._queueTotalSize;
		    }
		    function WritableStreamDefaultControllerWrite(controller, chunk, chunkSize) {
		        try {
		            EnqueueValueWithSize(controller, chunk, chunkSize);
		        }
		        catch (enqueueE) {
		            WritableStreamDefaultControllerErrorIfNeeded(controller, enqueueE);
		            return;
		        }
		        const stream = controller._controlledWritableStream;
		        if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._state === 'writable') {
		            const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
		            WritableStreamUpdateBackpressure(stream, backpressure);
		        }
		        WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
		    }
		    // Abstract operations for the WritableStreamDefaultController.
		    function WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller) {
		        const stream = controller._controlledWritableStream;
		        if (!controller._started) {
		            return;
		        }
		        if (stream._inFlightWriteRequest !== undefined) {
		            return;
		        }
		        const state = stream._state;
		        if (state === 'erroring') {
		            WritableStreamFinishErroring(stream);
		            return;
		        }
		        if (controller._queue.length === 0) {
		            return;
		        }
		        const value = PeekQueueValue(controller);
		        if (value === closeSentinel) {
		            WritableStreamDefaultControllerProcessClose(controller);
		        }
		        else {
		            WritableStreamDefaultControllerProcessWrite(controller, value);
		        }
		    }
		    function WritableStreamDefaultControllerErrorIfNeeded(controller, error) {
		        if (controller._controlledWritableStream._state === 'writable') {
		            WritableStreamDefaultControllerError(controller, error);
		        }
		    }
		    function WritableStreamDefaultControllerProcessClose(controller) {
		        const stream = controller._controlledWritableStream;
		        WritableStreamMarkCloseRequestInFlight(stream);
		        DequeueValue(controller);
		        const sinkClosePromise = controller._closeAlgorithm();
		        WritableStreamDefaultControllerClearAlgorithms(controller);
		        uponPromise(sinkClosePromise, () => {
		            WritableStreamFinishInFlightClose(stream);
		        }, reason => {
		            WritableStreamFinishInFlightCloseWithError(stream, reason);
		        });
		    }
		    function WritableStreamDefaultControllerProcessWrite(controller, chunk) {
		        const stream = controller._controlledWritableStream;
		        WritableStreamMarkFirstWriteRequestInFlight(stream);
		        const sinkWritePromise = controller._writeAlgorithm(chunk);
		        uponPromise(sinkWritePromise, () => {
		            WritableStreamFinishInFlightWrite(stream);
		            const state = stream._state;
		            DequeueValue(controller);
		            if (!WritableStreamCloseQueuedOrInFlight(stream) && state === 'writable') {
		                const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
		                WritableStreamUpdateBackpressure(stream, backpressure);
		            }
		            WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
		        }, reason => {
		            if (stream._state === 'writable') {
		                WritableStreamDefaultControllerClearAlgorithms(controller);
		            }
		            WritableStreamFinishInFlightWriteWithError(stream, reason);
		        });
		    }
		    function WritableStreamDefaultControllerGetBackpressure(controller) {
		        const desiredSize = WritableStreamDefaultControllerGetDesiredSize(controller);
		        return desiredSize <= 0;
		    }
		    // A client of WritableStreamDefaultController may use these functions directly to bypass state check.
		    function WritableStreamDefaultControllerError(controller, error) {
		        const stream = controller._controlledWritableStream;
		        WritableStreamDefaultControllerClearAlgorithms(controller);
		        WritableStreamStartErroring(stream, error);
		    }
		    // Helper functions for the WritableStream.
		    function streamBrandCheckException$2(name) {
		        return new TypeError(`WritableStream.prototype.${name} can only be used on a WritableStream`);
		    }
		    // Helper functions for the WritableStreamDefaultController.
		    function defaultControllerBrandCheckException$2(name) {
		        return new TypeError(`WritableStreamDefaultController.prototype.${name} can only be used on a WritableStreamDefaultController`);
		    }
		    // Helper functions for the WritableStreamDefaultWriter.
		    function defaultWriterBrandCheckException(name) {
		        return new TypeError(`WritableStreamDefaultWriter.prototype.${name} can only be used on a WritableStreamDefaultWriter`);
		    }
		    function defaultWriterLockException(name) {
		        return new TypeError('Cannot ' + name + ' a stream using a released writer');
		    }
		    function defaultWriterClosedPromiseInitialize(writer) {
		        writer._closedPromise = newPromise((resolve, reject) => {
		            writer._closedPromise_resolve = resolve;
		            writer._closedPromise_reject = reject;
		            writer._closedPromiseState = 'pending';
		        });
		    }
		    function defaultWriterClosedPromiseInitializeAsRejected(writer, reason) {
		        defaultWriterClosedPromiseInitialize(writer);
		        defaultWriterClosedPromiseReject(writer, reason);
		    }
		    function defaultWriterClosedPromiseInitializeAsResolved(writer) {
		        defaultWriterClosedPromiseInitialize(writer);
		        defaultWriterClosedPromiseResolve(writer);
		    }
		    function defaultWriterClosedPromiseReject(writer, reason) {
		        if (writer._closedPromise_reject === undefined) {
		            return;
		        }
		        setPromiseIsHandledToTrue(writer._closedPromise);
		        writer._closedPromise_reject(reason);
		        writer._closedPromise_resolve = undefined;
		        writer._closedPromise_reject = undefined;
		        writer._closedPromiseState = 'rejected';
		    }
		    function defaultWriterClosedPromiseResetToRejected(writer, reason) {
		        defaultWriterClosedPromiseInitializeAsRejected(writer, reason);
		    }
		    function defaultWriterClosedPromiseResolve(writer) {
		        if (writer._closedPromise_resolve === undefined) {
		            return;
		        }
		        writer._closedPromise_resolve(undefined);
		        writer._closedPromise_resolve = undefined;
		        writer._closedPromise_reject = undefined;
		        writer._closedPromiseState = 'resolved';
		    }
		    function defaultWriterReadyPromiseInitialize(writer) {
		        writer._readyPromise = newPromise((resolve, reject) => {
		            writer._readyPromise_resolve = resolve;
		            writer._readyPromise_reject = reject;
		        });
		        writer._readyPromiseState = 'pending';
		    }
		    function defaultWriterReadyPromiseInitializeAsRejected(writer, reason) {
		        defaultWriterReadyPromiseInitialize(writer);
		        defaultWriterReadyPromiseReject(writer, reason);
		    }
		    function defaultWriterReadyPromiseInitializeAsResolved(writer) {
		        defaultWriterReadyPromiseInitialize(writer);
		        defaultWriterReadyPromiseResolve(writer);
		    }
		    function defaultWriterReadyPromiseReject(writer, reason) {
		        if (writer._readyPromise_reject === undefined) {
		            return;
		        }
		        setPromiseIsHandledToTrue(writer._readyPromise);
		        writer._readyPromise_reject(reason);
		        writer._readyPromise_resolve = undefined;
		        writer._readyPromise_reject = undefined;
		        writer._readyPromiseState = 'rejected';
		    }
		    function defaultWriterReadyPromiseReset(writer) {
		        defaultWriterReadyPromiseInitialize(writer);
		    }
		    function defaultWriterReadyPromiseResetToRejected(writer, reason) {
		        defaultWriterReadyPromiseInitializeAsRejected(writer, reason);
		    }
		    function defaultWriterReadyPromiseResolve(writer) {
		        if (writer._readyPromise_resolve === undefined) {
		            return;
		        }
		        writer._readyPromise_resolve(undefined);
		        writer._readyPromise_resolve = undefined;
		        writer._readyPromise_reject = undefined;
		        writer._readyPromiseState = 'fulfilled';
		    }

		    /// <reference lib="dom" />
		    const NativeDOMException = typeof DOMException !== 'undefined' ? DOMException : undefined;

		    /// <reference types="node" />
		    function isDOMExceptionConstructor(ctor) {
		        if (!(typeof ctor === 'function' || typeof ctor === 'object')) {
		            return false;
		        }
		        try {
		            new ctor();
		            return true;
		        }
		        catch (_a) {
		            return false;
		        }
		    }
		    function createDOMExceptionPolyfill() {
		        // eslint-disable-next-line no-shadow
		        const ctor = function DOMException(message, name) {
		            this.message = message || '';
		            this.name = name || 'Error';
		            if (Error.captureStackTrace) {
		                Error.captureStackTrace(this, this.constructor);
		            }
		        };
		        ctor.prototype = Object.create(Error.prototype);
		        Object.defineProperty(ctor.prototype, 'constructor', { value: ctor, writable: true, configurable: true });
		        return ctor;
		    }
		    // eslint-disable-next-line no-redeclare
		    const DOMException$1 = isDOMExceptionConstructor(NativeDOMException) ? NativeDOMException : createDOMExceptionPolyfill();

		    function ReadableStreamPipeTo(source, dest, preventClose, preventAbort, preventCancel, signal) {
		        const reader = AcquireReadableStreamDefaultReader(source);
		        const writer = AcquireWritableStreamDefaultWriter(dest);
		        source._disturbed = true;
		        let shuttingDown = false;
		        // This is used to keep track of the spec's requirement that we wait for ongoing writes during shutdown.
		        let currentWrite = promiseResolvedWith(undefined);
		        return newPromise((resolve, reject) => {
		            let abortAlgorithm;
		            if (signal !== undefined) {
		                abortAlgorithm = () => {
		                    const error = new DOMException$1('Aborted', 'AbortError');
		                    const actions = [];
		                    if (!preventAbort) {
		                        actions.push(() => {
		                            if (dest._state === 'writable') {
		                                return WritableStreamAbort(dest, error);
		                            }
		                            return promiseResolvedWith(undefined);
		                        });
		                    }
		                    if (!preventCancel) {
		                        actions.push(() => {
		                            if (source._state === 'readable') {
		                                return ReadableStreamCancel(source, error);
		                            }
		                            return promiseResolvedWith(undefined);
		                        });
		                    }
		                    shutdownWithAction(() => Promise.all(actions.map(action => action())), true, error);
		                };
		                if (signal.aborted) {
		                    abortAlgorithm();
		                    return;
		                }
		                signal.addEventListener('abort', abortAlgorithm);
		            }
		            // Using reader and writer, read all chunks from this and write them to dest
		            // - Backpressure must be enforced
		            // - Shutdown must stop all activity
		            function pipeLoop() {
		                return newPromise((resolveLoop, rejectLoop) => {
		                    function next(done) {
		                        if (done) {
		                            resolveLoop();
		                        }
		                        else {
		                            // Use `PerformPromiseThen` instead of `uponPromise` to avoid
		                            // adding unnecessary `.catch(rethrowAssertionErrorRejection)` handlers
		                            PerformPromiseThen(pipeStep(), next, rejectLoop);
		                        }
		                    }
		                    next(false);
		                });
		            }
		            function pipeStep() {
		                if (shuttingDown) {
		                    return promiseResolvedWith(true);
		                }
		                return PerformPromiseThen(writer._readyPromise, () => {
		                    return newPromise((resolveRead, rejectRead) => {
		                        ReadableStreamDefaultReaderRead(reader, {
		                            _chunkSteps: chunk => {
		                                currentWrite = PerformPromiseThen(WritableStreamDefaultWriterWrite(writer, chunk), undefined, noop);
		                                resolveRead(false);
		                            },
		                            _closeSteps: () => resolveRead(true),
		                            _errorSteps: rejectRead
		                        });
		                    });
		                });
		            }
		            // Errors must be propagated forward
		            isOrBecomesErrored(source, reader._closedPromise, storedError => {
		                if (!preventAbort) {
		                    shutdownWithAction(() => WritableStreamAbort(dest, storedError), true, storedError);
		                }
		                else {
		                    shutdown(true, storedError);
		                }
		            });
		            // Errors must be propagated backward
		            isOrBecomesErrored(dest, writer._closedPromise, storedError => {
		                if (!preventCancel) {
		                    shutdownWithAction(() => ReadableStreamCancel(source, storedError), true, storedError);
		                }
		                else {
		                    shutdown(true, storedError);
		                }
		            });
		            // Closing must be propagated forward
		            isOrBecomesClosed(source, reader._closedPromise, () => {
		                if (!preventClose) {
		                    shutdownWithAction(() => WritableStreamDefaultWriterCloseWithErrorPropagation(writer));
		                }
		                else {
		                    shutdown();
		                }
		            });
		            // Closing must be propagated backward
		            if (WritableStreamCloseQueuedOrInFlight(dest) || dest._state === 'closed') {
		                const destClosed = new TypeError('the destination writable stream closed before all data could be piped to it');
		                if (!preventCancel) {
		                    shutdownWithAction(() => ReadableStreamCancel(source, destClosed), true, destClosed);
		                }
		                else {
		                    shutdown(true, destClosed);
		                }
		            }
		            setPromiseIsHandledToTrue(pipeLoop());
		            function waitForWritesToFinish() {
		                // Another write may have started while we were waiting on this currentWrite, so we have to be sure to wait
		                // for that too.
		                const oldCurrentWrite = currentWrite;
		                return PerformPromiseThen(currentWrite, () => oldCurrentWrite !== currentWrite ? waitForWritesToFinish() : undefined);
		            }
		            function isOrBecomesErrored(stream, promise, action) {
		                if (stream._state === 'errored') {
		                    action(stream._storedError);
		                }
		                else {
		                    uponRejection(promise, action);
		                }
		            }
		            function isOrBecomesClosed(stream, promise, action) {
		                if (stream._state === 'closed') {
		                    action();
		                }
		                else {
		                    uponFulfillment(promise, action);
		                }
		            }
		            function shutdownWithAction(action, originalIsError, originalError) {
		                if (shuttingDown) {
		                    return;
		                }
		                shuttingDown = true;
		                if (dest._state === 'writable' && !WritableStreamCloseQueuedOrInFlight(dest)) {
		                    uponFulfillment(waitForWritesToFinish(), doTheRest);
		                }
		                else {
		                    doTheRest();
		                }
		                function doTheRest() {
		                    uponPromise(action(), () => finalize(originalIsError, originalError), newError => finalize(true, newError));
		                }
		            }
		            function shutdown(isError, error) {
		                if (shuttingDown) {
		                    return;
		                }
		                shuttingDown = true;
		                if (dest._state === 'writable' && !WritableStreamCloseQueuedOrInFlight(dest)) {
		                    uponFulfillment(waitForWritesToFinish(), () => finalize(isError, error));
		                }
		                else {
		                    finalize(isError, error);
		                }
		            }
		            function finalize(isError, error) {
		                WritableStreamDefaultWriterRelease(writer);
		                ReadableStreamReaderGenericRelease(reader);
		                if (signal !== undefined) {
		                    signal.removeEventListener('abort', abortAlgorithm);
		                }
		                if (isError) {
		                    reject(error);
		                }
		                else {
		                    resolve(undefined);
		                }
		            }
		        });
		    }

		    /**
		     * Allows control of a {@link ReadableStream | readable stream}'s state and internal queue.
		     *
		     * @public
		     */
		    class ReadableStreamDefaultController {
		        constructor() {
		            throw new TypeError('Illegal constructor');
		        }
		        /**
		         * Returns the desired size to fill the controlled stream's internal queue. It can be negative, if the queue is
		         * over-full. An underlying source ought to use this information to determine when and how to apply backpressure.
		         */
		        get desiredSize() {
		            if (!IsReadableStreamDefaultController(this)) {
		                throw defaultControllerBrandCheckException$1('desiredSize');
		            }
		            return ReadableStreamDefaultControllerGetDesiredSize(this);
		        }
		        /**
		         * Closes the controlled readable stream. Consumers will still be able to read any previously-enqueued chunks from
		         * the stream, but once those are read, the stream will become closed.
		         */
		        close() {
		            if (!IsReadableStreamDefaultController(this)) {
		                throw defaultControllerBrandCheckException$1('close');
		            }
		            if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
		                throw new TypeError('The stream is not in a state that permits close');
		            }
		            ReadableStreamDefaultControllerClose(this);
		        }
		        enqueue(chunk = undefined) {
		            if (!IsReadableStreamDefaultController(this)) {
		                throw defaultControllerBrandCheckException$1('enqueue');
		            }
		            if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
		                throw new TypeError('The stream is not in a state that permits enqueue');
		            }
		            return ReadableStreamDefaultControllerEnqueue(this, chunk);
		        }
		        /**
		         * Errors the controlled readable stream, making all future interactions with it fail with the given error `e`.
		         */
		        error(e = undefined) {
		            if (!IsReadableStreamDefaultController(this)) {
		                throw defaultControllerBrandCheckException$1('error');
		            }
		            ReadableStreamDefaultControllerError(this, e);
		        }
		        /** @internal */
		        [CancelSteps](reason) {
		            ResetQueue(this);
		            const result = this._cancelAlgorithm(reason);
		            ReadableStreamDefaultControllerClearAlgorithms(this);
		            return result;
		        }
		        /** @internal */
		        [PullSteps](readRequest) {
		            const stream = this._controlledReadableStream;
		            if (this._queue.length > 0) {
		                const chunk = DequeueValue(this);
		                if (this._closeRequested && this._queue.length === 0) {
		                    ReadableStreamDefaultControllerClearAlgorithms(this);
		                    ReadableStreamClose(stream);
		                }
		                else {
		                    ReadableStreamDefaultControllerCallPullIfNeeded(this);
		                }
		                readRequest._chunkSteps(chunk);
		            }
		            else {
		                ReadableStreamAddReadRequest(stream, readRequest);
		                ReadableStreamDefaultControllerCallPullIfNeeded(this);
		            }
		        }
		    }
		    Object.defineProperties(ReadableStreamDefaultController.prototype, {
		        close: { enumerable: true },
		        enqueue: { enumerable: true },
		        error: { enumerable: true },
		        desiredSize: { enumerable: true }
		    });
		    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
		        Object.defineProperty(ReadableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
		            value: 'ReadableStreamDefaultController',
		            configurable: true
		        });
		    }
		    // Abstract operations for the ReadableStreamDefaultController.
		    function IsReadableStreamDefaultController(x) {
		        if (!typeIsObject(x)) {
		            return false;
		        }
		        if (!Object.prototype.hasOwnProperty.call(x, '_controlledReadableStream')) {
		            return false;
		        }
		        return x instanceof ReadableStreamDefaultController;
		    }
		    function ReadableStreamDefaultControllerCallPullIfNeeded(controller) {
		        const shouldPull = ReadableStreamDefaultControllerShouldCallPull(controller);
		        if (!shouldPull) {
		            return;
		        }
		        if (controller._pulling) {
		            controller._pullAgain = true;
		            return;
		        }
		        controller._pulling = true;
		        const pullPromise = controller._pullAlgorithm();
		        uponPromise(pullPromise, () => {
		            controller._pulling = false;
		            if (controller._pullAgain) {
		                controller._pullAgain = false;
		                ReadableStreamDefaultControllerCallPullIfNeeded(controller);
		            }
		        }, e => {
		            ReadableStreamDefaultControllerError(controller, e);
		        });
		    }
		    function ReadableStreamDefaultControllerShouldCallPull(controller) {
		        const stream = controller._controlledReadableStream;
		        if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
		            return false;
		        }
		        if (!controller._started) {
		            return false;
		        }
		        if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
		            return true;
		        }
		        const desiredSize = ReadableStreamDefaultControllerGetDesiredSize(controller);
		        if (desiredSize > 0) {
		            return true;
		        }
		        return false;
		    }
		    function ReadableStreamDefaultControllerClearAlgorithms(controller) {
		        controller._pullAlgorithm = undefined;
		        controller._cancelAlgorithm = undefined;
		        controller._strategySizeAlgorithm = undefined;
		    }
		    // A client of ReadableStreamDefaultController may use these functions directly to bypass state check.
		    function ReadableStreamDefaultControllerClose(controller) {
		        if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
		            return;
		        }
		        const stream = controller._controlledReadableStream;
		        controller._closeRequested = true;
		        if (controller._queue.length === 0) {
		            ReadableStreamDefaultControllerClearAlgorithms(controller);
		            ReadableStreamClose(stream);
		        }
		    }
		    function ReadableStreamDefaultControllerEnqueue(controller, chunk) {
		        if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
		            return;
		        }
		        const stream = controller._controlledReadableStream;
		        if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
		            ReadableStreamFulfillReadRequest(stream, chunk, false);
		        }
		        else {
		            let chunkSize;
		            try {
		                chunkSize = controller._strategySizeAlgorithm(chunk);
		            }
		            catch (chunkSizeE) {
		                ReadableStreamDefaultControllerError(controller, chunkSizeE);
		                throw chunkSizeE;
		            }
		            try {
		                EnqueueValueWithSize(controller, chunk, chunkSize);
		            }
		            catch (enqueueE) {
		                ReadableStreamDefaultControllerError(controller, enqueueE);
		                throw enqueueE;
		            }
		        }
		        ReadableStreamDefaultControllerCallPullIfNeeded(controller);
		    }
		    function ReadableStreamDefaultControllerError(controller, e) {
		        const stream = controller._controlledReadableStream;
		        if (stream._state !== 'readable') {
		            return;
		        }
		        ResetQueue(controller);
		        ReadableStreamDefaultControllerClearAlgorithms(controller);
		        ReadableStreamError(stream, e);
		    }
		    function ReadableStreamDefaultControllerGetDesiredSize(controller) {
		        const state = controller._controlledReadableStream._state;
		        if (state === 'errored') {
		            return null;
		        }
		        if (state === 'closed') {
		            return 0;
		        }
		        return controller._strategyHWM - controller._queueTotalSize;
		    }
		    // This is used in the implementation of TransformStream.
		    function ReadableStreamDefaultControllerHasBackpressure(controller) {
		        if (ReadableStreamDefaultControllerShouldCallPull(controller)) {
		            return false;
		        }
		        return true;
		    }
		    function ReadableStreamDefaultControllerCanCloseOrEnqueue(controller) {
		        const state = controller._controlledReadableStream._state;
		        if (!controller._closeRequested && state === 'readable') {
		            return true;
		        }
		        return false;
		    }
		    function SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm) {
		        controller._controlledReadableStream = stream;
		        controller._queue = undefined;
		        controller._queueTotalSize = undefined;
		        ResetQueue(controller);
		        controller._started = false;
		        controller._closeRequested = false;
		        controller._pullAgain = false;
		        controller._pulling = false;
		        controller._strategySizeAlgorithm = sizeAlgorithm;
		        controller._strategyHWM = highWaterMark;
		        controller._pullAlgorithm = pullAlgorithm;
		        controller._cancelAlgorithm = cancelAlgorithm;
		        stream._readableStreamController = controller;
		        const startResult = startAlgorithm();
		        uponPromise(promiseResolvedWith(startResult), () => {
		            controller._started = true;
		            ReadableStreamDefaultControllerCallPullIfNeeded(controller);
		        }, r => {
		            ReadableStreamDefaultControllerError(controller, r);
		        });
		    }
		    function SetUpReadableStreamDefaultControllerFromUnderlyingSource(stream, underlyingSource, highWaterMark, sizeAlgorithm) {
		        const controller = Object.create(ReadableStreamDefaultController.prototype);
		        let startAlgorithm = () => undefined;
		        let pullAlgorithm = () => promiseResolvedWith(undefined);
		        let cancelAlgorithm = () => promiseResolvedWith(undefined);
		        if (underlyingSource.start !== undefined) {
		            startAlgorithm = () => underlyingSource.start(controller);
		        }
		        if (underlyingSource.pull !== undefined) {
		            pullAlgorithm = () => underlyingSource.pull(controller);
		        }
		        if (underlyingSource.cancel !== undefined) {
		            cancelAlgorithm = reason => underlyingSource.cancel(reason);
		        }
		        SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
		    }
		    // Helper functions for the ReadableStreamDefaultController.
		    function defaultControllerBrandCheckException$1(name) {
		        return new TypeError(`ReadableStreamDefaultController.prototype.${name} can only be used on a ReadableStreamDefaultController`);
		    }

		    function ReadableStreamTee(stream, cloneForBranch2) {
		        if (IsReadableByteStreamController(stream._readableStreamController)) {
		            return ReadableByteStreamTee(stream);
		        }
		        return ReadableStreamDefaultTee(stream);
		    }
		    function ReadableStreamDefaultTee(stream, cloneForBranch2) {
		        const reader = AcquireReadableStreamDefaultReader(stream);
		        let reading = false;
		        let readAgain = false;
		        let canceled1 = false;
		        let canceled2 = false;
		        let reason1;
		        let reason2;
		        let branch1;
		        let branch2;
		        let resolveCancelPromise;
		        const cancelPromise = newPromise(resolve => {
		            resolveCancelPromise = resolve;
		        });
		        function pullAlgorithm() {
		            if (reading) {
		                readAgain = true;
		                return promiseResolvedWith(undefined);
		            }
		            reading = true;
		            const readRequest = {
		                _chunkSteps: chunk => {
		                    // This needs to be delayed a microtask because it takes at least a microtask to detect errors (using
		                    // reader._closedPromise below), and we want errors in stream to error both branches immediately. We cannot let
		                    // successful synchronously-available reads get ahead of asynchronously-available errors.
		                    queueMicrotask(() => {
		                        readAgain = false;
		                        const chunk1 = chunk;
		                        const chunk2 = chunk;
		                        // There is no way to access the cloning code right now in the reference implementation.
		                        // If we add one then we'll need an implementation for serializable objects.
		                        // if (!canceled2 && cloneForBranch2) {
		                        //   chunk2 = StructuredDeserialize(StructuredSerialize(chunk2));
		                        // }
		                        if (!canceled1) {
		                            ReadableStreamDefaultControllerEnqueue(branch1._readableStreamController, chunk1);
		                        }
		                        if (!canceled2) {
		                            ReadableStreamDefaultControllerEnqueue(branch2._readableStreamController, chunk2);
		                        }
		                        reading = false;
		                        if (readAgain) {
		                            pullAlgorithm();
		                        }
		                    });
		                },
		                _closeSteps: () => {
		                    reading = false;
		                    if (!canceled1) {
		                        ReadableStreamDefaultControllerClose(branch1._readableStreamController);
		                    }
		                    if (!canceled2) {
		                        ReadableStreamDefaultControllerClose(branch2._readableStreamController);
		                    }
		                    if (!canceled1 || !canceled2) {
		                        resolveCancelPromise(undefined);
		                    }
		                },
		                _errorSteps: () => {
		                    reading = false;
		                }
		            };
		            ReadableStreamDefaultReaderRead(reader, readRequest);
		            return promiseResolvedWith(undefined);
		        }
		        function cancel1Algorithm(reason) {
		            canceled1 = true;
		            reason1 = reason;
		            if (canceled2) {
		                const compositeReason = CreateArrayFromList([reason1, reason2]);
		                const cancelResult = ReadableStreamCancel(stream, compositeReason);
		                resolveCancelPromise(cancelResult);
		            }
		            return cancelPromise;
		        }
		        function cancel2Algorithm(reason) {
		            canceled2 = true;
		            reason2 = reason;
		            if (canceled1) {
		                const compositeReason = CreateArrayFromList([reason1, reason2]);
		                const cancelResult = ReadableStreamCancel(stream, compositeReason);
		                resolveCancelPromise(cancelResult);
		            }
		            return cancelPromise;
		        }
		        function startAlgorithm() {
		            // do nothing
		        }
		        branch1 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel1Algorithm);
		        branch2 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel2Algorithm);
		        uponRejection(reader._closedPromise, (r) => {
		            ReadableStreamDefaultControllerError(branch1._readableStreamController, r);
		            ReadableStreamDefaultControllerError(branch2._readableStreamController, r);
		            if (!canceled1 || !canceled2) {
		                resolveCancelPromise(undefined);
		            }
		        });
		        return [branch1, branch2];
		    }
		    function ReadableByteStreamTee(stream) {
		        let reader = AcquireReadableStreamDefaultReader(stream);
		        let reading = false;
		        let readAgainForBranch1 = false;
		        let readAgainForBranch2 = false;
		        let canceled1 = false;
		        let canceled2 = false;
		        let reason1;
		        let reason2;
		        let branch1;
		        let branch2;
		        let resolveCancelPromise;
		        const cancelPromise = newPromise(resolve => {
		            resolveCancelPromise = resolve;
		        });
		        function forwardReaderError(thisReader) {
		            uponRejection(thisReader._closedPromise, r => {
		                if (thisReader !== reader) {
		                    return;
		                }
		                ReadableByteStreamControllerError(branch1._readableStreamController, r);
		                ReadableByteStreamControllerError(branch2._readableStreamController, r);
		                if (!canceled1 || !canceled2) {
		                    resolveCancelPromise(undefined);
		                }
		            });
		        }
		        function pullWithDefaultReader() {
		            if (IsReadableStreamBYOBReader(reader)) {
		                ReadableStreamReaderGenericRelease(reader);
		                reader = AcquireReadableStreamDefaultReader(stream);
		                forwardReaderError(reader);
		            }
		            const readRequest = {
		                _chunkSteps: chunk => {
		                    // This needs to be delayed a microtask because it takes at least a microtask to detect errors (using
		                    // reader._closedPromise below), and we want errors in stream to error both branches immediately. We cannot let
		                    // successful synchronously-available reads get ahead of asynchronously-available errors.
		                    queueMicrotask(() => {
		                        readAgainForBranch1 = false;
		                        readAgainForBranch2 = false;
		                        const chunk1 = chunk;
		                        let chunk2 = chunk;
		                        if (!canceled1 && !canceled2) {
		                            try {
		                                chunk2 = CloneAsUint8Array(chunk);
		                            }
		                            catch (cloneE) {
		                                ReadableByteStreamControllerError(branch1._readableStreamController, cloneE);
		                                ReadableByteStreamControllerError(branch2._readableStreamController, cloneE);
		                                resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
		                                return;
		                            }
		                        }
		                        if (!canceled1) {
		                            ReadableByteStreamControllerEnqueue(branch1._readableStreamController, chunk1);
		                        }
		                        if (!canceled2) {
		                            ReadableByteStreamControllerEnqueue(branch2._readableStreamController, chunk2);
		                        }
		                        reading = false;
		                        if (readAgainForBranch1) {
		                            pull1Algorithm();
		                        }
		                        else if (readAgainForBranch2) {
		                            pull2Algorithm();
		                        }
		                    });
		                },
		                _closeSteps: () => {
		                    reading = false;
		                    if (!canceled1) {
		                        ReadableByteStreamControllerClose(branch1._readableStreamController);
		                    }
		                    if (!canceled2) {
		                        ReadableByteStreamControllerClose(branch2._readableStreamController);
		                    }
		                    if (branch1._readableStreamController._pendingPullIntos.length > 0) {
		                        ReadableByteStreamControllerRespond(branch1._readableStreamController, 0);
		                    }
		                    if (branch2._readableStreamController._pendingPullIntos.length > 0) {
		                        ReadableByteStreamControllerRespond(branch2._readableStreamController, 0);
		                    }
		                    if (!canceled1 || !canceled2) {
		                        resolveCancelPromise(undefined);
		                    }
		                },
		                _errorSteps: () => {
		                    reading = false;
		                }
		            };
		            ReadableStreamDefaultReaderRead(reader, readRequest);
		        }
		        function pullWithBYOBReader(view, forBranch2) {
		            if (IsReadableStreamDefaultReader(reader)) {
		                ReadableStreamReaderGenericRelease(reader);
		                reader = AcquireReadableStreamBYOBReader(stream);
		                forwardReaderError(reader);
		            }
		            const byobBranch = forBranch2 ? branch2 : branch1;
		            const otherBranch = forBranch2 ? branch1 : branch2;
		            const readIntoRequest = {
		                _chunkSteps: chunk => {
		                    // This needs to be delayed a microtask because it takes at least a microtask to detect errors (using
		                    // reader._closedPromise below), and we want errors in stream to error both branches immediately. We cannot let
		                    // successful synchronously-available reads get ahead of asynchronously-available errors.
		                    queueMicrotask(() => {
		                        readAgainForBranch1 = false;
		                        readAgainForBranch2 = false;
		                        const byobCanceled = forBranch2 ? canceled2 : canceled1;
		                        const otherCanceled = forBranch2 ? canceled1 : canceled2;
		                        if (!otherCanceled) {
		                            let clonedChunk;
		                            try {
		                                clonedChunk = CloneAsUint8Array(chunk);
		                            }
		                            catch (cloneE) {
		                                ReadableByteStreamControllerError(byobBranch._readableStreamController, cloneE);
		                                ReadableByteStreamControllerError(otherBranch._readableStreamController, cloneE);
		                                resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
		                                return;
		                            }
		                            if (!byobCanceled) {
		                                ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
		                            }
		                            ReadableByteStreamControllerEnqueue(otherBranch._readableStreamController, clonedChunk);
		                        }
		                        else if (!byobCanceled) {
		                            ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
		                        }
		                        reading = false;
		                        if (readAgainForBranch1) {
		                            pull1Algorithm();
		                        }
		                        else if (readAgainForBranch2) {
		                            pull2Algorithm();
		                        }
		                    });
		                },
		                _closeSteps: chunk => {
		                    reading = false;
		                    const byobCanceled = forBranch2 ? canceled2 : canceled1;
		                    const otherCanceled = forBranch2 ? canceled1 : canceled2;
		                    if (!byobCanceled) {
		                        ReadableByteStreamControllerClose(byobBranch._readableStreamController);
		                    }
		                    if (!otherCanceled) {
		                        ReadableByteStreamControllerClose(otherBranch._readableStreamController);
		                    }
		                    if (chunk !== undefined) {
		                        if (!byobCanceled) {
		                            ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
		                        }
		                        if (!otherCanceled && otherBranch._readableStreamController._pendingPullIntos.length > 0) {
		                            ReadableByteStreamControllerRespond(otherBranch._readableStreamController, 0);
		                        }
		                    }
		                    if (!byobCanceled || !otherCanceled) {
		                        resolveCancelPromise(undefined);
		                    }
		                },
		                _errorSteps: () => {
		                    reading = false;
		                }
		            };
		            ReadableStreamBYOBReaderRead(reader, view, readIntoRequest);
		        }
		        function pull1Algorithm() {
		            if (reading) {
		                readAgainForBranch1 = true;
		                return promiseResolvedWith(undefined);
		            }
		            reading = true;
		            const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch1._readableStreamController);
		            if (byobRequest === null) {
		                pullWithDefaultReader();
		            }
		            else {
		                pullWithBYOBReader(byobRequest._view, false);
		            }
		            return promiseResolvedWith(undefined);
		        }
		        function pull2Algorithm() {
		            if (reading) {
		                readAgainForBranch2 = true;
		                return promiseResolvedWith(undefined);
		            }
		            reading = true;
		            const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch2._readableStreamController);
		            if (byobRequest === null) {
		                pullWithDefaultReader();
		            }
		            else {
		                pullWithBYOBReader(byobRequest._view, true);
		            }
		            return promiseResolvedWith(undefined);
		        }
		        function cancel1Algorithm(reason) {
		            canceled1 = true;
		            reason1 = reason;
		            if (canceled2) {
		                const compositeReason = CreateArrayFromList([reason1, reason2]);
		                const cancelResult = ReadableStreamCancel(stream, compositeReason);
		                resolveCancelPromise(cancelResult);
		            }
		            return cancelPromise;
		        }
		        function cancel2Algorithm(reason) {
		            canceled2 = true;
		            reason2 = reason;
		            if (canceled1) {
		                const compositeReason = CreateArrayFromList([reason1, reason2]);
		                const cancelResult = ReadableStreamCancel(stream, compositeReason);
		                resolveCancelPromise(cancelResult);
		            }
		            return cancelPromise;
		        }
		        function startAlgorithm() {
		            return;
		        }
		        branch1 = CreateReadableByteStream(startAlgorithm, pull1Algorithm, cancel1Algorithm);
		        branch2 = CreateReadableByteStream(startAlgorithm, pull2Algorithm, cancel2Algorithm);
		        forwardReaderError(reader);
		        return [branch1, branch2];
		    }

		    function convertUnderlyingDefaultOrByteSource(source, context) {
		        assertDictionary(source, context);
		        const original = source;
		        const autoAllocateChunkSize = original === null || original === void 0 ? void 0 : original.autoAllocateChunkSize;
		        const cancel = original === null || original === void 0 ? void 0 : original.cancel;
		        const pull = original === null || original === void 0 ? void 0 : original.pull;
		        const start = original === null || original === void 0 ? void 0 : original.start;
		        const type = original === null || original === void 0 ? void 0 : original.type;
		        return {
		            autoAllocateChunkSize: autoAllocateChunkSize === undefined ?
		                undefined :
		                convertUnsignedLongLongWithEnforceRange(autoAllocateChunkSize, `${context} has member 'autoAllocateChunkSize' that`),
		            cancel: cancel === undefined ?
		                undefined :
		                convertUnderlyingSourceCancelCallback(cancel, original, `${context} has member 'cancel' that`),
		            pull: pull === undefined ?
		                undefined :
		                convertUnderlyingSourcePullCallback(pull, original, `${context} has member 'pull' that`),
		            start: start === undefined ?
		                undefined :
		                convertUnderlyingSourceStartCallback(start, original, `${context} has member 'start' that`),
		            type: type === undefined ? undefined : convertReadableStreamType(type, `${context} has member 'type' that`)
		        };
		    }
		    function convertUnderlyingSourceCancelCallback(fn, original, context) {
		        assertFunction(fn, context);
		        return (reason) => promiseCall(fn, original, [reason]);
		    }
		    function convertUnderlyingSourcePullCallback(fn, original, context) {
		        assertFunction(fn, context);
		        return (controller) => promiseCall(fn, original, [controller]);
		    }
		    function convertUnderlyingSourceStartCallback(fn, original, context) {
		        assertFunction(fn, context);
		        return (controller) => reflectCall(fn, original, [controller]);
		    }
		    function convertReadableStreamType(type, context) {
		        type = `${type}`;
		        if (type !== 'bytes') {
		            throw new TypeError(`${context} '${type}' is not a valid enumeration value for ReadableStreamType`);
		        }
		        return type;
		    }

		    function convertReaderOptions(options, context) {
		        assertDictionary(options, context);
		        const mode = options === null || options === void 0 ? void 0 : options.mode;
		        return {
		            mode: mode === undefined ? undefined : convertReadableStreamReaderMode(mode, `${context} has member 'mode' that`)
		        };
		    }
		    function convertReadableStreamReaderMode(mode, context) {
		        mode = `${mode}`;
		        if (mode !== 'byob') {
		            throw new TypeError(`${context} '${mode}' is not a valid enumeration value for ReadableStreamReaderMode`);
		        }
		        return mode;
		    }

		    function convertIteratorOptions(options, context) {
		        assertDictionary(options, context);
		        const preventCancel = options === null || options === void 0 ? void 0 : options.preventCancel;
		        return { preventCancel: Boolean(preventCancel) };
		    }

		    function convertPipeOptions(options, context) {
		        assertDictionary(options, context);
		        const preventAbort = options === null || options === void 0 ? void 0 : options.preventAbort;
		        const preventCancel = options === null || options === void 0 ? void 0 : options.preventCancel;
		        const preventClose = options === null || options === void 0 ? void 0 : options.preventClose;
		        const signal = options === null || options === void 0 ? void 0 : options.signal;
		        if (signal !== undefined) {
		            assertAbortSignal(signal, `${context} has member 'signal' that`);
		        }
		        return {
		            preventAbort: Boolean(preventAbort),
		            preventCancel: Boolean(preventCancel),
		            preventClose: Boolean(preventClose),
		            signal
		        };
		    }
		    function assertAbortSignal(signal, context) {
		        if (!isAbortSignal(signal)) {
		            throw new TypeError(`${context} is not an AbortSignal.`);
		        }
		    }

		    function convertReadableWritablePair(pair, context) {
		        assertDictionary(pair, context);
		        const readable = pair === null || pair === void 0 ? void 0 : pair.readable;
		        assertRequiredField(readable, 'readable', 'ReadableWritablePair');
		        assertReadableStream(readable, `${context} has member 'readable' that`);
		        const writable = pair === null || pair === void 0 ? void 0 : pair.writable;
		        assertRequiredField(writable, 'writable', 'ReadableWritablePair');
		        assertWritableStream(writable, `${context} has member 'writable' that`);
		        return { readable, writable };
		    }

		    /**
		     * A readable stream represents a source of data, from which you can read.
		     *
		     * @public
		     */
		    class ReadableStream {
		        constructor(rawUnderlyingSource = {}, rawStrategy = {}) {
		            if (rawUnderlyingSource === undefined) {
		                rawUnderlyingSource = null;
		            }
		            else {
		                assertObject(rawUnderlyingSource, 'First parameter');
		            }
		            const strategy = convertQueuingStrategy(rawStrategy, 'Second parameter');
		            const underlyingSource = convertUnderlyingDefaultOrByteSource(rawUnderlyingSource, 'First parameter');
		            InitializeReadableStream(this);
		            if (underlyingSource.type === 'bytes') {
		                if (strategy.size !== undefined) {
		                    throw new RangeError('The strategy for a byte stream cannot have a size function');
		                }
		                const highWaterMark = ExtractHighWaterMark(strategy, 0);
		                SetUpReadableByteStreamControllerFromUnderlyingSource(this, underlyingSource, highWaterMark);
		            }
		            else {
		                const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
		                const highWaterMark = ExtractHighWaterMark(strategy, 1);
		                SetUpReadableStreamDefaultControllerFromUnderlyingSource(this, underlyingSource, highWaterMark, sizeAlgorithm);
		            }
		        }
		        /**
		         * Whether or not the readable stream is locked to a {@link ReadableStreamDefaultReader | reader}.
		         */
		        get locked() {
		            if (!IsReadableStream(this)) {
		                throw streamBrandCheckException$1('locked');
		            }
		            return IsReadableStreamLocked(this);
		        }
		        /**
		         * Cancels the stream, signaling a loss of interest in the stream by a consumer.
		         *
		         * The supplied `reason` argument will be given to the underlying source's {@link UnderlyingSource.cancel | cancel()}
		         * method, which might or might not use it.
		         */
		        cancel(reason = undefined) {
		            if (!IsReadableStream(this)) {
		                return promiseRejectedWith(streamBrandCheckException$1('cancel'));
		            }
		            if (IsReadableStreamLocked(this)) {
		                return promiseRejectedWith(new TypeError('Cannot cancel a stream that already has a reader'));
		            }
		            return ReadableStreamCancel(this, reason);
		        }
		        getReader(rawOptions = undefined) {
		            if (!IsReadableStream(this)) {
		                throw streamBrandCheckException$1('getReader');
		            }
		            const options = convertReaderOptions(rawOptions, 'First parameter');
		            if (options.mode === undefined) {
		                return AcquireReadableStreamDefaultReader(this);
		            }
		            return AcquireReadableStreamBYOBReader(this);
		        }
		        pipeThrough(rawTransform, rawOptions = {}) {
		            if (!IsReadableStream(this)) {
		                throw streamBrandCheckException$1('pipeThrough');
		            }
		            assertRequiredArgument(rawTransform, 1, 'pipeThrough');
		            const transform = convertReadableWritablePair(rawTransform, 'First parameter');
		            const options = convertPipeOptions(rawOptions, 'Second parameter');
		            if (IsReadableStreamLocked(this)) {
		                throw new TypeError('ReadableStream.prototype.pipeThrough cannot be used on a locked ReadableStream');
		            }
		            if (IsWritableStreamLocked(transform.writable)) {
		                throw new TypeError('ReadableStream.prototype.pipeThrough cannot be used on a locked WritableStream');
		            }
		            const promise = ReadableStreamPipeTo(this, transform.writable, options.preventClose, options.preventAbort, options.preventCancel, options.signal);
		            setPromiseIsHandledToTrue(promise);
		            return transform.readable;
		        }
		        pipeTo(destination, rawOptions = {}) {
		            if (!IsReadableStream(this)) {
		                return promiseRejectedWith(streamBrandCheckException$1('pipeTo'));
		            }
		            if (destination === undefined) {
		                return promiseRejectedWith(`Parameter 1 is required in 'pipeTo'.`);
		            }
		            if (!IsWritableStream(destination)) {
		                return promiseRejectedWith(new TypeError(`ReadableStream.prototype.pipeTo's first argument must be a WritableStream`));
		            }
		            let options;
		            try {
		                options = convertPipeOptions(rawOptions, 'Second parameter');
		            }
		            catch (e) {
		                return promiseRejectedWith(e);
		            }
		            if (IsReadableStreamLocked(this)) {
		                return promiseRejectedWith(new TypeError('ReadableStream.prototype.pipeTo cannot be used on a locked ReadableStream'));
		            }
		            if (IsWritableStreamLocked(destination)) {
		                return promiseRejectedWith(new TypeError('ReadableStream.prototype.pipeTo cannot be used on a locked WritableStream'));
		            }
		            return ReadableStreamPipeTo(this, destination, options.preventClose, options.preventAbort, options.preventCancel, options.signal);
		        }
		        /**
		         * Tees this readable stream, returning a two-element array containing the two resulting branches as
		         * new {@link ReadableStream} instances.
		         *
		         * Teeing a stream will lock it, preventing any other consumer from acquiring a reader.
		         * To cancel the stream, cancel both of the resulting branches; a composite cancellation reason will then be
		         * propagated to the stream's underlying source.
		         *
		         * Note that the chunks seen in each branch will be the same object. If the chunks are not immutable,
		         * this could allow interference between the two branches.
		         */
		        tee() {
		            if (!IsReadableStream(this)) {
		                throw streamBrandCheckException$1('tee');
		            }
		            const branches = ReadableStreamTee(this);
		            return CreateArrayFromList(branches);
		        }
		        values(rawOptions = undefined) {
		            if (!IsReadableStream(this)) {
		                throw streamBrandCheckException$1('values');
		            }
		            const options = convertIteratorOptions(rawOptions, 'First parameter');
		            return AcquireReadableStreamAsyncIterator(this, options.preventCancel);
		        }
		    }
		    Object.defineProperties(ReadableStream.prototype, {
		        cancel: { enumerable: true },
		        getReader: { enumerable: true },
		        pipeThrough: { enumerable: true },
		        pipeTo: { enumerable: true },
		        tee: { enumerable: true },
		        values: { enumerable: true },
		        locked: { enumerable: true }
		    });
		    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
		        Object.defineProperty(ReadableStream.prototype, SymbolPolyfill.toStringTag, {
		            value: 'ReadableStream',
		            configurable: true
		        });
		    }
		    if (typeof SymbolPolyfill.asyncIterator === 'symbol') {
		        Object.defineProperty(ReadableStream.prototype, SymbolPolyfill.asyncIterator, {
		            value: ReadableStream.prototype.values,
		            writable: true,
		            configurable: true
		        });
		    }
		    // Abstract operations for the ReadableStream.
		    // Throws if and only if startAlgorithm throws.
		    function CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
		        const stream = Object.create(ReadableStream.prototype);
		        InitializeReadableStream(stream);
		        const controller = Object.create(ReadableStreamDefaultController.prototype);
		        SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
		        return stream;
		    }
		    // Throws if and only if startAlgorithm throws.
		    function CreateReadableByteStream(startAlgorithm, pullAlgorithm, cancelAlgorithm) {
		        const stream = Object.create(ReadableStream.prototype);
		        InitializeReadableStream(stream);
		        const controller = Object.create(ReadableByteStreamController.prototype);
		        SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, 0, undefined);
		        return stream;
		    }
		    function InitializeReadableStream(stream) {
		        stream._state = 'readable';
		        stream._reader = undefined;
		        stream._storedError = undefined;
		        stream._disturbed = false;
		    }
		    function IsReadableStream(x) {
		        if (!typeIsObject(x)) {
		            return false;
		        }
		        if (!Object.prototype.hasOwnProperty.call(x, '_readableStreamController')) {
		            return false;
		        }
		        return x instanceof ReadableStream;
		    }
		    function IsReadableStreamLocked(stream) {
		        if (stream._reader === undefined) {
		            return false;
		        }
		        return true;
		    }
		    // ReadableStream API exposed for controllers.
		    function ReadableStreamCancel(stream, reason) {
		        stream._disturbed = true;
		        if (stream._state === 'closed') {
		            return promiseResolvedWith(undefined);
		        }
		        if (stream._state === 'errored') {
		            return promiseRejectedWith(stream._storedError);
		        }
		        ReadableStreamClose(stream);
		        const reader = stream._reader;
		        if (reader !== undefined && IsReadableStreamBYOBReader(reader)) {
		            reader._readIntoRequests.forEach(readIntoRequest => {
		                readIntoRequest._closeSteps(undefined);
		            });
		            reader._readIntoRequests = new SimpleQueue();
		        }
		        const sourceCancelPromise = stream._readableStreamController[CancelSteps](reason);
		        return transformPromiseWith(sourceCancelPromise, noop);
		    }
		    function ReadableStreamClose(stream) {
		        stream._state = 'closed';
		        const reader = stream._reader;
		        if (reader === undefined) {
		            return;
		        }
		        defaultReaderClosedPromiseResolve(reader);
		        if (IsReadableStreamDefaultReader(reader)) {
		            reader._readRequests.forEach(readRequest => {
		                readRequest._closeSteps();
		            });
		            reader._readRequests = new SimpleQueue();
		        }
		    }
		    function ReadableStreamError(stream, e) {
		        stream._state = 'errored';
		        stream._storedError = e;
		        const reader = stream._reader;
		        if (reader === undefined) {
		            return;
		        }
		        defaultReaderClosedPromiseReject(reader, e);
		        if (IsReadableStreamDefaultReader(reader)) {
		            reader._readRequests.forEach(readRequest => {
		                readRequest._errorSteps(e);
		            });
		            reader._readRequests = new SimpleQueue();
		        }
		        else {
		            reader._readIntoRequests.forEach(readIntoRequest => {
		                readIntoRequest._errorSteps(e);
		            });
		            reader._readIntoRequests = new SimpleQueue();
		        }
		    }
		    // Helper functions for the ReadableStream.
		    function streamBrandCheckException$1(name) {
		        return new TypeError(`ReadableStream.prototype.${name} can only be used on a ReadableStream`);
		    }

		    function convertQueuingStrategyInit(init, context) {
		        assertDictionary(init, context);
		        const highWaterMark = init === null || init === void 0 ? void 0 : init.highWaterMark;
		        assertRequiredField(highWaterMark, 'highWaterMark', 'QueuingStrategyInit');
		        return {
		            highWaterMark: convertUnrestrictedDouble(highWaterMark)
		        };
		    }

		    // The size function must not have a prototype property nor be a constructor
		    const byteLengthSizeFunction = (chunk) => {
		        return chunk.byteLength;
		    };
		    try {
		        Object.defineProperty(byteLengthSizeFunction, 'name', {
		            value: 'size',
		            configurable: true
		        });
		    }
		    catch (_a) {
		        // This property is non-configurable in older browsers, so ignore if this throws.
		        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name#browser_compatibility
		    }
		    /**
		     * A queuing strategy that counts the number of bytes in each chunk.
		     *
		     * @public
		     */
		    class ByteLengthQueuingStrategy {
		        constructor(options) {
		            assertRequiredArgument(options, 1, 'ByteLengthQueuingStrategy');
		            options = convertQueuingStrategyInit(options, 'First parameter');
		            this._byteLengthQueuingStrategyHighWaterMark = options.highWaterMark;
		        }
		        /**
		         * Returns the high water mark provided to the constructor.
		         */
		        get highWaterMark() {
		            if (!IsByteLengthQueuingStrategy(this)) {
		                throw byteLengthBrandCheckException('highWaterMark');
		            }
		            return this._byteLengthQueuingStrategyHighWaterMark;
		        }
		        /**
		         * Measures the size of `chunk` by returning the value of its `byteLength` property.
		         */
		        get size() {
		            if (!IsByteLengthQueuingStrategy(this)) {
		                throw byteLengthBrandCheckException('size');
		            }
		            return byteLengthSizeFunction;
		        }
		    }
		    Object.defineProperties(ByteLengthQueuingStrategy.prototype, {
		        highWaterMark: { enumerable: true },
		        size: { enumerable: true }
		    });
		    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
		        Object.defineProperty(ByteLengthQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
		            value: 'ByteLengthQueuingStrategy',
		            configurable: true
		        });
		    }
		    // Helper functions for the ByteLengthQueuingStrategy.
		    function byteLengthBrandCheckException(name) {
		        return new TypeError(`ByteLengthQueuingStrategy.prototype.${name} can only be used on a ByteLengthQueuingStrategy`);
		    }
		    function IsByteLengthQueuingStrategy(x) {
		        if (!typeIsObject(x)) {
		            return false;
		        }
		        if (!Object.prototype.hasOwnProperty.call(x, '_byteLengthQueuingStrategyHighWaterMark')) {
		            return false;
		        }
		        return x instanceof ByteLengthQueuingStrategy;
		    }

		    // The size function must not have a prototype property nor be a constructor
		    const countSizeFunction = () => {
		        return 1;
		    };
		    try {
		        Object.defineProperty(countSizeFunction, 'name', {
		            value: 'size',
		            configurable: true
		        });
		    }
		    catch (_a) {
		        // This property is non-configurable in older browsers, so ignore if this throws.
		        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name#browser_compatibility
		    }
		    /**
		     * A queuing strategy that counts the number of chunks.
		     *
		     * @public
		     */
		    class CountQueuingStrategy {
		        constructor(options) {
		            assertRequiredArgument(options, 1, 'CountQueuingStrategy');
		            options = convertQueuingStrategyInit(options, 'First parameter');
		            this._countQueuingStrategyHighWaterMark = options.highWaterMark;
		        }
		        /**
		         * Returns the high water mark provided to the constructor.
		         */
		        get highWaterMark() {
		            if (!IsCountQueuingStrategy(this)) {
		                throw countBrandCheckException('highWaterMark');
		            }
		            return this._countQueuingStrategyHighWaterMark;
		        }
		        /**
		         * Measures the size of `chunk` by always returning 1.
		         * This ensures that the total queue size is a count of the number of chunks in the queue.
		         */
		        get size() {
		            if (!IsCountQueuingStrategy(this)) {
		                throw countBrandCheckException('size');
		            }
		            return countSizeFunction;
		        }
		    }
		    Object.defineProperties(CountQueuingStrategy.prototype, {
		        highWaterMark: { enumerable: true },
		        size: { enumerable: true }
		    });
		    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
		        Object.defineProperty(CountQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
		            value: 'CountQueuingStrategy',
		            configurable: true
		        });
		    }
		    // Helper functions for the CountQueuingStrategy.
		    function countBrandCheckException(name) {
		        return new TypeError(`CountQueuingStrategy.prototype.${name} can only be used on a CountQueuingStrategy`);
		    }
		    function IsCountQueuingStrategy(x) {
		        if (!typeIsObject(x)) {
		            return false;
		        }
		        if (!Object.prototype.hasOwnProperty.call(x, '_countQueuingStrategyHighWaterMark')) {
		            return false;
		        }
		        return x instanceof CountQueuingStrategy;
		    }

		    function convertTransformer(original, context) {
		        assertDictionary(original, context);
		        const flush = original === null || original === void 0 ? void 0 : original.flush;
		        const readableType = original === null || original === void 0 ? void 0 : original.readableType;
		        const start = original === null || original === void 0 ? void 0 : original.start;
		        const transform = original === null || original === void 0 ? void 0 : original.transform;
		        const writableType = original === null || original === void 0 ? void 0 : original.writableType;
		        return {
		            flush: flush === undefined ?
		                undefined :
		                convertTransformerFlushCallback(flush, original, `${context} has member 'flush' that`),
		            readableType,
		            start: start === undefined ?
		                undefined :
		                convertTransformerStartCallback(start, original, `${context} has member 'start' that`),
		            transform: transform === undefined ?
		                undefined :
		                convertTransformerTransformCallback(transform, original, `${context} has member 'transform' that`),
		            writableType
		        };
		    }
		    function convertTransformerFlushCallback(fn, original, context) {
		        assertFunction(fn, context);
		        return (controller) => promiseCall(fn, original, [controller]);
		    }
		    function convertTransformerStartCallback(fn, original, context) {
		        assertFunction(fn, context);
		        return (controller) => reflectCall(fn, original, [controller]);
		    }
		    function convertTransformerTransformCallback(fn, original, context) {
		        assertFunction(fn, context);
		        return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
		    }

		    // Class TransformStream
		    /**
		     * A transform stream consists of a pair of streams: a {@link WritableStream | writable stream},
		     * known as its writable side, and a {@link ReadableStream | readable stream}, known as its readable side.
		     * In a manner specific to the transform stream in question, writes to the writable side result in new data being
		     * made available for reading from the readable side.
		     *
		     * @public
		     */
		    class TransformStream {
		        constructor(rawTransformer = {}, rawWritableStrategy = {}, rawReadableStrategy = {}) {
		            if (rawTransformer === undefined) {
		                rawTransformer = null;
		            }
		            const writableStrategy = convertQueuingStrategy(rawWritableStrategy, 'Second parameter');
		            const readableStrategy = convertQueuingStrategy(rawReadableStrategy, 'Third parameter');
		            const transformer = convertTransformer(rawTransformer, 'First parameter');
		            if (transformer.readableType !== undefined) {
		                throw new RangeError('Invalid readableType specified');
		            }
		            if (transformer.writableType !== undefined) {
		                throw new RangeError('Invalid writableType specified');
		            }
		            const readableHighWaterMark = ExtractHighWaterMark(readableStrategy, 0);
		            const readableSizeAlgorithm = ExtractSizeAlgorithm(readableStrategy);
		            const writableHighWaterMark = ExtractHighWaterMark(writableStrategy, 1);
		            const writableSizeAlgorithm = ExtractSizeAlgorithm(writableStrategy);
		            let startPromise_resolve;
		            const startPromise = newPromise(resolve => {
		                startPromise_resolve = resolve;
		            });
		            InitializeTransformStream(this, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
		            SetUpTransformStreamDefaultControllerFromTransformer(this, transformer);
		            if (transformer.start !== undefined) {
		                startPromise_resolve(transformer.start(this._transformStreamController));
		            }
		            else {
		                startPromise_resolve(undefined);
		            }
		        }
		        /**
		         * The readable side of the transform stream.
		         */
		        get readable() {
		            if (!IsTransformStream(this)) {
		                throw streamBrandCheckException('readable');
		            }
		            return this._readable;
		        }
		        /**
		         * The writable side of the transform stream.
		         */
		        get writable() {
		            if (!IsTransformStream(this)) {
		                throw streamBrandCheckException('writable');
		            }
		            return this._writable;
		        }
		    }
		    Object.defineProperties(TransformStream.prototype, {
		        readable: { enumerable: true },
		        writable: { enumerable: true }
		    });
		    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
		        Object.defineProperty(TransformStream.prototype, SymbolPolyfill.toStringTag, {
		            value: 'TransformStream',
		            configurable: true
		        });
		    }
		    function InitializeTransformStream(stream, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm) {
		        function startAlgorithm() {
		            return startPromise;
		        }
		        function writeAlgorithm(chunk) {
		            return TransformStreamDefaultSinkWriteAlgorithm(stream, chunk);
		        }
		        function abortAlgorithm(reason) {
		            return TransformStreamDefaultSinkAbortAlgorithm(stream, reason);
		        }
		        function closeAlgorithm() {
		            return TransformStreamDefaultSinkCloseAlgorithm(stream);
		        }
		        stream._writable = CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, writableHighWaterMark, writableSizeAlgorithm);
		        function pullAlgorithm() {
		            return TransformStreamDefaultSourcePullAlgorithm(stream);
		        }
		        function cancelAlgorithm(reason) {
		            TransformStreamErrorWritableAndUnblockWrite(stream, reason);
		            return promiseResolvedWith(undefined);
		        }
		        stream._readable = CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
		        // The [[backpressure]] slot is set to undefined so that it can be initialised by TransformStreamSetBackpressure.
		        stream._backpressure = undefined;
		        stream._backpressureChangePromise = undefined;
		        stream._backpressureChangePromise_resolve = undefined;
		        TransformStreamSetBackpressure(stream, true);
		        stream._transformStreamController = undefined;
		    }
		    function IsTransformStream(x) {
		        if (!typeIsObject(x)) {
		            return false;
		        }
		        if (!Object.prototype.hasOwnProperty.call(x, '_transformStreamController')) {
		            return false;
		        }
		        return x instanceof TransformStream;
		    }
		    // This is a no-op if both sides are already errored.
		    function TransformStreamError(stream, e) {
		        ReadableStreamDefaultControllerError(stream._readable._readableStreamController, e);
		        TransformStreamErrorWritableAndUnblockWrite(stream, e);
		    }
		    function TransformStreamErrorWritableAndUnblockWrite(stream, e) {
		        TransformStreamDefaultControllerClearAlgorithms(stream._transformStreamController);
		        WritableStreamDefaultControllerErrorIfNeeded(stream._writable._writableStreamController, e);
		        if (stream._backpressure) {
		            // Pretend that pull() was called to permit any pending write() calls to complete. TransformStreamSetBackpressure()
		            // cannot be called from enqueue() or pull() once the ReadableStream is errored, so this will will be the final time
		            // _backpressure is set.
		            TransformStreamSetBackpressure(stream, false);
		        }
		    }
		    function TransformStreamSetBackpressure(stream, backpressure) {
		        // Passes also when called during construction.
		        if (stream._backpressureChangePromise !== undefined) {
		            stream._backpressureChangePromise_resolve();
		        }
		        stream._backpressureChangePromise = newPromise(resolve => {
		            stream._backpressureChangePromise_resolve = resolve;
		        });
		        stream._backpressure = backpressure;
		    }
		    // Class TransformStreamDefaultController
		    /**
		     * Allows control of the {@link ReadableStream} and {@link WritableStream} of the associated {@link TransformStream}.
		     *
		     * @public
		     */
		    class TransformStreamDefaultController {
		        constructor() {
		            throw new TypeError('Illegal constructor');
		        }
		        /**
		         * Returns the desired size to fill the readable side’s internal queue. It can be negative, if the queue is over-full.
		         */
		        get desiredSize() {
		            if (!IsTransformStreamDefaultController(this)) {
		                throw defaultControllerBrandCheckException('desiredSize');
		            }
		            const readableController = this._controlledTransformStream._readable._readableStreamController;
		            return ReadableStreamDefaultControllerGetDesiredSize(readableController);
		        }
		        enqueue(chunk = undefined) {
		            if (!IsTransformStreamDefaultController(this)) {
		                throw defaultControllerBrandCheckException('enqueue');
		            }
		            TransformStreamDefaultControllerEnqueue(this, chunk);
		        }
		        /**
		         * Errors both the readable side and the writable side of the controlled transform stream, making all future
		         * interactions with it fail with the given error `e`. Any chunks queued for transformation will be discarded.
		         */
		        error(reason = undefined) {
		            if (!IsTransformStreamDefaultController(this)) {
		                throw defaultControllerBrandCheckException('error');
		            }
		            TransformStreamDefaultControllerError(this, reason);
		        }
		        /**
		         * Closes the readable side and errors the writable side of the controlled transform stream. This is useful when the
		         * transformer only needs to consume a portion of the chunks written to the writable side.
		         */
		        terminate() {
		            if (!IsTransformStreamDefaultController(this)) {
		                throw defaultControllerBrandCheckException('terminate');
		            }
		            TransformStreamDefaultControllerTerminate(this);
		        }
		    }
		    Object.defineProperties(TransformStreamDefaultController.prototype, {
		        enqueue: { enumerable: true },
		        error: { enumerable: true },
		        terminate: { enumerable: true },
		        desiredSize: { enumerable: true }
		    });
		    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
		        Object.defineProperty(TransformStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
		            value: 'TransformStreamDefaultController',
		            configurable: true
		        });
		    }
		    // Transform Stream Default Controller Abstract Operations
		    function IsTransformStreamDefaultController(x) {
		        if (!typeIsObject(x)) {
		            return false;
		        }
		        if (!Object.prototype.hasOwnProperty.call(x, '_controlledTransformStream')) {
		            return false;
		        }
		        return x instanceof TransformStreamDefaultController;
		    }
		    function SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm) {
		        controller._controlledTransformStream = stream;
		        stream._transformStreamController = controller;
		        controller._transformAlgorithm = transformAlgorithm;
		        controller._flushAlgorithm = flushAlgorithm;
		    }
		    function SetUpTransformStreamDefaultControllerFromTransformer(stream, transformer) {
		        const controller = Object.create(TransformStreamDefaultController.prototype);
		        let transformAlgorithm = (chunk) => {
		            try {
		                TransformStreamDefaultControllerEnqueue(controller, chunk);
		                return promiseResolvedWith(undefined);
		            }
		            catch (transformResultE) {
		                return promiseRejectedWith(transformResultE);
		            }
		        };
		        let flushAlgorithm = () => promiseResolvedWith(undefined);
		        if (transformer.transform !== undefined) {
		            transformAlgorithm = chunk => transformer.transform(chunk, controller);
		        }
		        if (transformer.flush !== undefined) {
		            flushAlgorithm = () => transformer.flush(controller);
		        }
		        SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm);
		    }
		    function TransformStreamDefaultControllerClearAlgorithms(controller) {
		        controller._transformAlgorithm = undefined;
		        controller._flushAlgorithm = undefined;
		    }
		    function TransformStreamDefaultControllerEnqueue(controller, chunk) {
		        const stream = controller._controlledTransformStream;
		        const readableController = stream._readable._readableStreamController;
		        if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(readableController)) {
		            throw new TypeError('Readable side is not in a state that permits enqueue');
		        }
		        // We throttle transform invocations based on the backpressure of the ReadableStream, but we still
		        // accept TransformStreamDefaultControllerEnqueue() calls.
		        try {
		            ReadableStreamDefaultControllerEnqueue(readableController, chunk);
		        }
		        catch (e) {
		            // This happens when readableStrategy.size() throws.
		            TransformStreamErrorWritableAndUnblockWrite(stream, e);
		            throw stream._readable._storedError;
		        }
		        const backpressure = ReadableStreamDefaultControllerHasBackpressure(readableController);
		        if (backpressure !== stream._backpressure) {
		            TransformStreamSetBackpressure(stream, true);
		        }
		    }
		    function TransformStreamDefaultControllerError(controller, e) {
		        TransformStreamError(controller._controlledTransformStream, e);
		    }
		    function TransformStreamDefaultControllerPerformTransform(controller, chunk) {
		        const transformPromise = controller._transformAlgorithm(chunk);
		        return transformPromiseWith(transformPromise, undefined, r => {
		            TransformStreamError(controller._controlledTransformStream, r);
		            throw r;
		        });
		    }
		    function TransformStreamDefaultControllerTerminate(controller) {
		        const stream = controller._controlledTransformStream;
		        const readableController = stream._readable._readableStreamController;
		        ReadableStreamDefaultControllerClose(readableController);
		        const error = new TypeError('TransformStream terminated');
		        TransformStreamErrorWritableAndUnblockWrite(stream, error);
		    }
		    // TransformStreamDefaultSink Algorithms
		    function TransformStreamDefaultSinkWriteAlgorithm(stream, chunk) {
		        const controller = stream._transformStreamController;
		        if (stream._backpressure) {
		            const backpressureChangePromise = stream._backpressureChangePromise;
		            return transformPromiseWith(backpressureChangePromise, () => {
		                const writable = stream._writable;
		                const state = writable._state;
		                if (state === 'erroring') {
		                    throw writable._storedError;
		                }
		                return TransformStreamDefaultControllerPerformTransform(controller, chunk);
		            });
		        }
		        return TransformStreamDefaultControllerPerformTransform(controller, chunk);
		    }
		    function TransformStreamDefaultSinkAbortAlgorithm(stream, reason) {
		        // abort() is not called synchronously, so it is possible for abort() to be called when the stream is already
		        // errored.
		        TransformStreamError(stream, reason);
		        return promiseResolvedWith(undefined);
		    }
		    function TransformStreamDefaultSinkCloseAlgorithm(stream) {
		        // stream._readable cannot change after construction, so caching it across a call to user code is safe.
		        const readable = stream._readable;
		        const controller = stream._transformStreamController;
		        const flushPromise = controller._flushAlgorithm();
		        TransformStreamDefaultControllerClearAlgorithms(controller);
		        // Return a promise that is fulfilled with undefined on success.
		        return transformPromiseWith(flushPromise, () => {
		            if (readable._state === 'errored') {
		                throw readable._storedError;
		            }
		            ReadableStreamDefaultControllerClose(readable._readableStreamController);
		        }, r => {
		            TransformStreamError(stream, r);
		            throw readable._storedError;
		        });
		    }
		    // TransformStreamDefaultSource Algorithms
		    function TransformStreamDefaultSourcePullAlgorithm(stream) {
		        // Invariant. Enforced by the promises returned by start() and pull().
		        TransformStreamSetBackpressure(stream, false);
		        // Prevent the next pull() call until there is backpressure.
		        return stream._backpressureChangePromise;
		    }
		    // Helper functions for the TransformStreamDefaultController.
		    function defaultControllerBrandCheckException(name) {
		        return new TypeError(`TransformStreamDefaultController.prototype.${name} can only be used on a TransformStreamDefaultController`);
		    }
		    // Helper functions for the TransformStream.
		    function streamBrandCheckException(name) {
		        return new TypeError(`TransformStream.prototype.${name} can only be used on a TransformStream`);
		    }

		    exports.ByteLengthQueuingStrategy = ByteLengthQueuingStrategy;
		    exports.CountQueuingStrategy = CountQueuingStrategy;
		    exports.ReadableByteStreamController = ReadableByteStreamController;
		    exports.ReadableStream = ReadableStream;
		    exports.ReadableStreamBYOBReader = ReadableStreamBYOBReader;
		    exports.ReadableStreamBYOBRequest = ReadableStreamBYOBRequest;
		    exports.ReadableStreamDefaultController = ReadableStreamDefaultController;
		    exports.ReadableStreamDefaultReader = ReadableStreamDefaultReader;
		    exports.TransformStream = TransformStream;
		    exports.TransformStreamDefaultController = TransformStreamDefaultController;
		    exports.WritableStream = WritableStream;
		    exports.WritableStreamDefaultController = WritableStreamDefaultController;
		    exports.WritableStreamDefaultWriter = WritableStreamDefaultWriter;

		    Object.defineProperty(exports, '__esModule', { value: true });

		})));
		
} (ponyfill_es2018, ponyfill_es2018.exports));
	return ponyfill_es2018.exports;
}

/* c8 ignore start */

// 64 KiB (same size chrome slice theirs blob into Uint8array's)
const POOL_SIZE$1 = 65536;

if (!globalThis.ReadableStream) {
  // `node:stream/web` got introduced in v16.5.0 as experimental
  // and it's preferred over the polyfilled version. So we also
  // suppress the warning that gets emitted by NodeJS for using it.
  try {
    const process = require('node:process');
    const { emitWarning } = process;
    try {
      process.emitWarning = () => {};
      Object.assign(globalThis, require('node:stream/web'));
      process.emitWarning = emitWarning;
    } catch (error) {
      process.emitWarning = emitWarning;
      throw error
    }
  } catch (error) {
    // fallback to polyfill implementation
    Object.assign(globalThis, requirePonyfill_es2018());
  }
}

try {
  // Don't use node: prefix for this, require+node: is not supported until node v14.14
  // Only `import()` can use prefix in 12.20 and later
  const { Blob } = require('buffer');
  if (Blob && !Blob.prototype.stream) {
    Blob.prototype.stream = function name (params) {
      let position = 0;
      const blob = this;

      return new ReadableStream({
        type: 'bytes',
        async pull (ctrl) {
          const chunk = blob.slice(position, Math.min(blob.size, position + POOL_SIZE$1));
          const buffer = await chunk.arrayBuffer();
          position += buffer.byteLength;
          ctrl.enqueue(new Uint8Array(buffer));

          if (position === blob.size) {
            ctrl.close();
          }
        }
      })
    };
  }
} catch (error) {}

/*! fetch-blob. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */

// 64 KiB (same size chrome slice theirs blob into Uint8array's)
const POOL_SIZE = 65536;

/** @param {(Blob | Uint8Array)[]} parts */
async function * toIterator (parts, clone = true) {
  for (const part of parts) {
    if ('stream' in part) {
      yield * (/** @type {AsyncIterableIterator<Uint8Array>} */ (part.stream()));
    } else if (ArrayBuffer.isView(part)) {
      if (clone) {
        let position = part.byteOffset;
        const end = part.byteOffset + part.byteLength;
        while (position !== end) {
          const size = Math.min(end - position, POOL_SIZE);
          const chunk = part.buffer.slice(position, position + size);
          position += chunk.byteLength;
          yield new Uint8Array(chunk);
        }
      } else {
        yield part;
      }
    /* c8 ignore next 10 */
    } else {
      // For blobs that have arrayBuffer but no stream method (nodes buffer.Blob)
      let position = 0, b = (/** @type {Blob} */ (part));
      while (position !== b.size) {
        const chunk = b.slice(position, Math.min(b.size, position + POOL_SIZE));
        const buffer = await chunk.arrayBuffer();
        position += buffer.byteLength;
        yield new Uint8Array(buffer);
      }
    }
  }
}

const _Blob = class Blob {
  /** @type {Array.<(Blob|Uint8Array)>} */
  #parts = []
  #type = ''
  #size = 0
  #endings = 'transparent'

  /**
   * The Blob() constructor returns a new Blob object. The content
   * of the blob consists of the concatenation of the values given
   * in the parameter array.
   *
   * @param {*} blobParts
   * @param {{ type?: string, endings?: string }} [options]
   */
  constructor (blobParts = [], options = {}) {
    if (typeof blobParts !== 'object' || blobParts === null) {
      throw new TypeError('Failed to construct \'Blob\': The provided value cannot be converted to a sequence.')
    }

    if (typeof blobParts[Symbol.iterator] !== 'function') {
      throw new TypeError('Failed to construct \'Blob\': The object must have a callable @@iterator property.')
    }

    if (typeof options !== 'object' && typeof options !== 'function') {
      throw new TypeError('Failed to construct \'Blob\': parameter 2 cannot convert to dictionary.')
    }

    if (options === null) options = {};

    const encoder = new TextEncoder();
    for (const element of blobParts) {
      let part;
      if (ArrayBuffer.isView(element)) {
        part = new Uint8Array(element.buffer.slice(element.byteOffset, element.byteOffset + element.byteLength));
      } else if (element instanceof ArrayBuffer) {
        part = new Uint8Array(element.slice(0));
      } else if (element instanceof Blob) {
        part = element;
      } else {
        part = encoder.encode(`${element}`);
      }

      const size = ArrayBuffer.isView(part) ? part.byteLength : part.size;
      // Avoid pushing empty parts into the array to better GC them
      if (size) {
        this.#size += size;
        this.#parts.push(part);
      }
    }

    this.#endings = `${options.endings === undefined ? 'transparent' : options.endings}`;
    const type = options.type === undefined ? '' : String(options.type);
    this.#type = /^[\x20-\x7E]*$/.test(type) ? type : '';
  }

  /**
   * The Blob interface's size property returns the
   * size of the Blob in bytes.
   */
  get size () {
    return this.#size
  }

  /**
   * The type property of a Blob object returns the MIME type of the file.
   */
  get type () {
    return this.#type
  }

  /**
   * The text() method in the Blob interface returns a Promise
   * that resolves with a string containing the contents of
   * the blob, interpreted as UTF-8.
   *
   * @return {Promise<string>}
   */
  async text () {
    // More optimized than using this.arrayBuffer()
    // that requires twice as much ram
    const decoder = new TextDecoder();
    let str = '';
    for await (const part of toIterator(this.#parts, false)) {
      str += decoder.decode(part, { stream: true });
    }
    // Remaining
    str += decoder.decode();
    return str
  }

  /**
   * The arrayBuffer() method in the Blob interface returns a
   * Promise that resolves with the contents of the blob as
   * binary data contained in an ArrayBuffer.
   *
   * @return {Promise<ArrayBuffer>}
   */
  async arrayBuffer () {
    // Easier way... Just a unnecessary overhead
    // const view = new Uint8Array(this.size);
    // await this.stream().getReader({mode: 'byob'}).read(view);
    // return view.buffer;

    const data = new Uint8Array(this.size);
    let offset = 0;
    for await (const chunk of toIterator(this.#parts, false)) {
      data.set(chunk, offset);
      offset += chunk.length;
    }

    return data.buffer
  }

  stream () {
    const it = toIterator(this.#parts, true);

    return new globalThis.ReadableStream({
      // @ts-ignore
      type: 'bytes',
      async pull (ctrl) {
        const chunk = await it.next();
        chunk.done ? ctrl.close() : ctrl.enqueue(chunk.value);
      },

      async cancel () {
        await it.return();
      }
    })
  }

  /**
   * The Blob interface's slice() method creates and returns a
   * new Blob object which contains data from a subset of the
   * blob on which it's called.
   *
   * @param {number} [start]
   * @param {number} [end]
   * @param {string} [type]
   */
  slice (start = 0, end = this.size, type = '') {
    const { size } = this;

    let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
    let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);

    const span = Math.max(relativeEnd - relativeStart, 0);
    const parts = this.#parts;
    const blobParts = [];
    let added = 0;

    for (const part of parts) {
      // don't add the overflow to new blobParts
      if (added >= span) {
        break
      }

      const size = ArrayBuffer.isView(part) ? part.byteLength : part.size;
      if (relativeStart && size <= relativeStart) {
        // Skip the beginning and change the relative
        // start & end position as we skip the unwanted parts
        relativeStart -= size;
        relativeEnd -= size;
      } else {
        let chunk;
        if (ArrayBuffer.isView(part)) {
          chunk = part.subarray(relativeStart, Math.min(size, relativeEnd));
          added += chunk.byteLength;
        } else {
          chunk = part.slice(relativeStart, Math.min(size, relativeEnd));
          added += chunk.size;
        }
        relativeEnd -= size;
        blobParts.push(chunk);
        relativeStart = 0; // All next sequential parts should start at 0
      }
    }

    const blob = new Blob([], { type: String(type).toLowerCase() });
    blob.#size = span;
    blob.#parts = blobParts;

    return blob
  }

  get [Symbol.toStringTag] () {
    return 'Blob'
  }

  static [Symbol.hasInstance] (object) {
    return (
      object &&
      typeof object === 'object' &&
      typeof object.constructor === 'function' &&
      (
        typeof object.stream === 'function' ||
        typeof object.arrayBuffer === 'function'
      ) &&
      /^(Blob|File)$/.test(object[Symbol.toStringTag])
    )
  }
};

Object.defineProperties(_Blob.prototype, {
  size: { enumerable: true },
  type: { enumerable: true },
  slice: { enumerable: true }
});

/** @type {typeof globalThis.Blob} */
const Blob = _Blob;

const _File = class File extends Blob {
  #lastModified = 0
  #name = ''

  /**
   * @param {*[]} fileBits
   * @param {string} fileName
   * @param {{lastModified?: number, type?: string}} options
   */// @ts-ignore
  constructor (fileBits, fileName, options = {}) {
    if (arguments.length < 2) {
      throw new TypeError(`Failed to construct 'File': 2 arguments required, but only ${arguments.length} present.`)
    }
    super(fileBits, options);

    if (options === null) options = {};

    // Simulate WebIDL type casting for NaN value in lastModified option.
    const lastModified = options.lastModified === undefined ? Date.now() : Number(options.lastModified);
    if (!Number.isNaN(lastModified)) {
      this.#lastModified = lastModified;
    }

    this.#name = String(fileName);
  }

  get name () {
    return this.#name
  }

  get lastModified () {
    return this.#lastModified
  }

  get [Symbol.toStringTag] () {
    return 'File'
  }

  static [Symbol.hasInstance] (object) {
    return !!object && object instanceof Blob &&
      /^(File)$/.test(object[Symbol.toStringTag])
  }
};

/** @type {typeof globalThis.File} */// @ts-ignore
const File = _File;

/*! formdata-polyfill. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */

var {toStringTag:t,iterator:i,hasInstance:h}=Symbol,
r=Math.random,
m='append,set,get,getAll,delete,keys,values,entries,forEach,constructor'.split(','),
f=(a,b,c)=>(a+='',/^(Blob|File)$/.test(b && b[t])?[(c=c!==void 0?c+'':b[t]=='File'?b.name:'blob',a),b.name!==c||b[t]=='blob'?new File([b],c,b):b]:[a,b+'']),
e=(c,f)=>(f?c:c.replace(/\r?\n|\r/g,'\r\n')).replace(/\n/g,'%0A').replace(/\r/g,'%0D').replace(/"/g,'%22'),
x=(n, a, e)=>{if(a.length<e){throw new TypeError(`Failed to execute '${n}' on 'FormData': ${e} arguments required, but only ${a.length} present.`)}};

/** @type {typeof globalThis.FormData} */
const FormData = class FormData {
#d=[];
constructor(...a){if(a.length)throw new TypeError(`Failed to construct 'FormData': parameter 1 is not of type 'HTMLFormElement'.`)}
get [t]() {return 'FormData'}
[i](){return this.entries()}
static [h](o) {return o&&typeof o==='object'&&o[t]==='FormData'&&!m.some(m=>typeof o[m]!='function')}
append(...a){x('append',arguments,2);this.#d.push(f(...a));}
delete(a){x('delete',arguments,1);a+='';this.#d=this.#d.filter(([b])=>b!==a);}
get(a){x('get',arguments,1);a+='';for(var b=this.#d,l=b.length,c=0;c<l;c++)if(b[c][0]===a)return b[c][1];return null}
getAll(a,b){x('getAll',arguments,1);b=[];a+='';this.#d.forEach(c=>c[0]===a&&b.push(c[1]));return b}
has(a){x('has',arguments,1);a+='';return this.#d.some(b=>b[0]===a)}
forEach(a,b){x('forEach',arguments,1);for(var [c,d]of this)a.call(b,d,c,this);}
set(...a){x('set',arguments,2);var b=[],c=!0;a=f(...a);this.#d.forEach(d=>{d[0]===a[0]?c&&(c=!b.push(a)):b.push(d);});c&&b.push(a);this.#d=b;}
*entries(){yield*this.#d;}
*keys(){for(var[a]of this)yield a;}
*values(){for(var[,a]of this)yield a;}};

/** @param {FormData} F */
function formDataToBlob (F,B=Blob){
var b=`${r()}${r()}`.replace(/\./g, '').slice(-28).padStart(32, '-'),c=[],p=`--${b}\r\nContent-Disposition: form-data; name="`;
F.forEach((v,n)=>typeof v=='string'
?c.push(p+e(n)+`"\r\n\r\n${v.replace(/\r(?!\n)|(?<!\r)\n/g, '\r\n')}\r\n`)
:c.push(p+e(n)+`"; filename="${e(v.name, 1)}"\r\nContent-Type: ${v.type||"application/octet-stream"}\r\n\r\n`, v, '\r\n'));
c.push(`--${b}--`);
return new B(c,{type:"multipart/form-data; boundary="+b})}

class FetchBaseError extends Error {
	constructor(message, type) {
		super(message);
		// Hide custom error implementation details from end-users
		Error.captureStackTrace(this, this.constructor);

		this.type = type;
	}

	get name() {
		return this.constructor.name;
	}

	get [Symbol.toStringTag]() {
		return this.constructor.name;
	}
}

/**
 * @typedef {{ address?: string, code: string, dest?: string, errno: number, info?: object, message: string, path?: string, port?: number, syscall: string}} SystemError
*/

/**
 * FetchError interface for operational errors
 */
class FetchError extends FetchBaseError {
	/**
	 * @param  {string} message -      Error message for human
	 * @param  {string} [type] -        Error type for machine
	 * @param  {SystemError} [systemError] - For Node.js system error
	 */
	constructor(message, type, systemError) {
		super(message, type);
		// When err.type is `system`, err.erroredSysCall contains system error and err.code contains system error code
		if (systemError) {
			// eslint-disable-next-line no-multi-assign
			this.code = this.errno = systemError.code;
			this.erroredSysCall = systemError.syscall;
		}
	}
}

/**
 * Is.js
 *
 * Object type checks.
 */

const NAME = Symbol.toStringTag;

/**
 * Check if `obj` is a URLSearchParams object
 * ref: https://github.com/node-fetch/node-fetch/issues/296#issuecomment-307598143
 * @param {*} object - Object to check for
 * @return {boolean}
 */
const isURLSearchParameters = object => {
	return (
		typeof object === 'object' &&
		typeof object.append === 'function' &&
		typeof object.delete === 'function' &&
		typeof object.get === 'function' &&
		typeof object.getAll === 'function' &&
		typeof object.has === 'function' &&
		typeof object.set === 'function' &&
		typeof object.sort === 'function' &&
		object[NAME] === 'URLSearchParams'
	);
};

/**
 * Check if `object` is a W3C `Blob` object (which `File` inherits from)
 * @param {*} object - Object to check for
 * @return {boolean}
 */
const isBlob = object => {
	return (
		object &&
		typeof object === 'object' &&
		typeof object.arrayBuffer === 'function' &&
		typeof object.type === 'string' &&
		typeof object.stream === 'function' &&
		typeof object.constructor === 'function' &&
		/^(Blob|File)$/.test(object[NAME])
	);
};

node_util.promisify(Stream__default["default"].pipeline);
const INTERNALS = Symbol('Body internals');

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Body {
	constructor(body, {
		size = 0
	} = {}) {
		let boundary = null;

		if (body === null) {
			// Body is undefined or null
			body = null;
		} else if (isURLSearchParameters(body)) {
			// Body is a URLSearchParams
			body = node_buffer.Buffer.from(body.toString());
		} else if (isBlob(body)) ; else if (node_buffer.Buffer.isBuffer(body)) ; else if (node_util.types.isAnyArrayBuffer(body)) {
			// Body is ArrayBuffer
			body = node_buffer.Buffer.from(body);
		} else if (ArrayBuffer.isView(body)) {
			// Body is ArrayBufferView
			body = node_buffer.Buffer.from(body.buffer, body.byteOffset, body.byteLength);
		} else if (body instanceof Stream__default["default"]) ; else if (body instanceof FormData) {
			// Body is FormData
			body = formDataToBlob(body);
			boundary = body.type.split('=')[1];
		} else {
			// None of the above
			// coerce to string then buffer
			body = node_buffer.Buffer.from(String(body));
		}

		let stream = body;

		if (node_buffer.Buffer.isBuffer(body)) {
			stream = Stream__default["default"].Readable.from(body);
		} else if (isBlob(body)) {
			stream = Stream__default["default"].Readable.from(body.stream());
		}

		this[INTERNALS] = {
			body,
			stream,
			boundary,
			disturbed: false,
			error: null
		};
		this.size = size;

		if (body instanceof Stream__default["default"]) {
			body.on('error', error_ => {
				const error = error_ instanceof FetchBaseError ?
					error_ :
					new FetchError(`Invalid response body while trying to fetch ${this.url}: ${error_.message}`, 'system', error_);
				this[INTERNALS].error = error;
			});
		}
	}

	get body() {
		return this[INTERNALS].stream;
	}

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	}

	/**
	 * Decode response as ArrayBuffer
	 *
	 * @return  Promise
	 */
	async arrayBuffer() {
		const {buffer, byteOffset, byteLength} = await consumeBody(this);
		return buffer.slice(byteOffset, byteOffset + byteLength);
	}

	async formData() {
		const ct = this.headers.get('content-type');

		if (ct.startsWith('application/x-www-form-urlencoded')) {
			const formData = new FormData();
			const parameters = new URLSearchParams(await this.text());

			for (const [name, value] of parameters) {
				formData.append(name, value);
			}

			return formData;
		}

		const {toFormData} = await Promise.resolve().then(function () { return require('./multipart-parser-b5349a9c.js'); });
		return toFormData(this.body, ct);
	}

	/**
	 * Return raw response as Blob
	 *
	 * @return Promise
	 */
	async blob() {
		const ct = (this.headers && this.headers.get('content-type')) || (this[INTERNALS].body && this[INTERNALS].body.type) || '';
		const buf = await this.arrayBuffer();

		return new Blob([buf], {
			type: ct
		});
	}

	/**
	 * Decode response as json
	 *
	 * @return  Promise
	 */
	async json() {
		const text = await this.text();
		return JSON.parse(text);
	}

	/**
	 * Decode response as text
	 *
	 * @return  Promise
	 */
	async text() {
		const buffer = await consumeBody(this);
		return new TextDecoder().decode(buffer);
	}

	/**
	 * Decode response as buffer (non-spec api)
	 *
	 * @return  Promise
	 */
	buffer() {
		return consumeBody(this);
	}
}

Body.prototype.buffer = node_util.deprecate(Body.prototype.buffer, 'Please use \'response.arrayBuffer()\' instead of \'response.buffer()\'', 'node-fetch#buffer');

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: {enumerable: true},
	bodyUsed: {enumerable: true},
	arrayBuffer: {enumerable: true},
	blob: {enumerable: true},
	json: {enumerable: true},
	text: {enumerable: true},
	data: {get: node_util.deprecate(() => {},
		'data doesn\'t exist, use json(), text(), arrayBuffer(), or body instead',
		'https://github.com/node-fetch/node-fetch/issues/1000 (response)')}
});

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return Promise
 */
async function consumeBody(data) {
	if (data[INTERNALS].disturbed) {
		throw new TypeError(`body used already for: ${data.url}`);
	}

	data[INTERNALS].disturbed = true;

	if (data[INTERNALS].error) {
		throw data[INTERNALS].error;
	}

	const {body} = data;

	// Body is null
	if (body === null) {
		return node_buffer.Buffer.alloc(0);
	}

	/* c8 ignore next 3 */
	if (!(body instanceof Stream__default["default"])) {
		return node_buffer.Buffer.alloc(0);
	}

	// Body is stream
	// get ready to actually consume the body
	const accum = [];
	let accumBytes = 0;

	try {
		for await (const chunk of body) {
			if (data.size > 0 && accumBytes + chunk.length > data.size) {
				const error = new FetchError(`content size at ${data.url} over limit: ${data.size}`, 'max-size');
				body.destroy(error);
				throw error;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		}
	} catch (error) {
		const error_ = error instanceof FetchBaseError ? error : new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error.message}`, 'system', error);
		throw error_;
	}

	if (body.readableEnded === true || body._readableState.ended === true) {
		try {
			if (accum.every(c => typeof c === 'string')) {
				return node_buffer.Buffer.from(accum.join(''));
			}

			return node_buffer.Buffer.concat(accum, accumBytes);
		} catch (error) {
			throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error.message}`, 'system', error);
		}
	} else {
		throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
	}
}

node_util.deprecate(
	body => body.getBoundary(),
	'form-data doesn\'t follow the spec and requires special treatment. Use alternative package',
	'https://github.com/node-fetch/node-fetch/issues/1167'
);

/**
 * Headers.js
 *
 * Headers class offers convenient helpers
 */

/* c8 ignore next 9 */
const validateHeaderName = typeof http__default["default"].validateHeaderName === 'function' ?
	http__default["default"].validateHeaderName :
	name => {
		if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
			const error = new TypeError(`Header name must be a valid HTTP token [${name}]`);
			Object.defineProperty(error, 'code', {value: 'ERR_INVALID_HTTP_TOKEN'});
			throw error;
		}
	};

/* c8 ignore next 9 */
const validateHeaderValue = typeof http__default["default"].validateHeaderValue === 'function' ?
	http__default["default"].validateHeaderValue :
	(name, value) => {
		if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
			const error = new TypeError(`Invalid character in header content ["${name}"]`);
			Object.defineProperty(error, 'code', {value: 'ERR_INVALID_CHAR'});
			throw error;
		}
	};

/**
 * @typedef {Headers | Record<string, string> | Iterable<readonly [string, string]> | Iterable<Iterable<string>>} HeadersInit
 */

/**
 * This Fetch API interface allows you to perform various actions on HTTP request and response headers.
 * These actions include retrieving, setting, adding to, and removing.
 * A Headers object has an associated header list, which is initially empty and consists of zero or more name and value pairs.
 * You can add to this using methods like append() (see Examples.)
 * In all methods of this interface, header names are matched by case-insensitive byte sequence.
 *
 */
class Headers extends URLSearchParams {
	/**
	 * Headers class
	 *
	 * @constructor
	 * @param {HeadersInit} [init] - Response headers
	 */
	constructor(init) {
		// Validate and normalize init object in [name, value(s)][]
		/** @type {string[][]} */
		let result = [];
		if (init instanceof Headers) {
			const raw = init.raw();
			for (const [name, values] of Object.entries(raw)) {
				result.push(...values.map(value => [name, value]));
			}
		} else if (init == null) ; else if (typeof init === 'object' && !node_util.types.isBoxedPrimitive(init)) {
			const method = init[Symbol.iterator];
			// eslint-disable-next-line no-eq-null, eqeqeq
			if (method == null) {
				// Record<ByteString, ByteString>
				result.push(...Object.entries(init));
			} else {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// Sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				result = [...init]
					.map(pair => {
						if (
							typeof pair !== 'object' || node_util.types.isBoxedPrimitive(pair)
						) {
							throw new TypeError('Each header pair must be an iterable object');
						}

						return [...pair];
					}).map(pair => {
						if (pair.length !== 2) {
							throw new TypeError('Each header pair must be a name/value tuple');
						}

						return [...pair];
					});
			}
		} else {
			throw new TypeError('Failed to construct \'Headers\': The provided value is not of type \'(sequence<sequence<ByteString>> or record<ByteString, ByteString>)');
		}

		// Validate and lowercase
		result =
			result.length > 0 ?
				result.map(([name, value]) => {
					validateHeaderName(name);
					validateHeaderValue(name, String(value));
					return [String(name).toLowerCase(), String(value)];
				}) :
				undefined;

		super(result);

		// Returning a Proxy that will lowercase key names, validate parameters and sort keys
		// eslint-disable-next-line no-constructor-return
		return new Proxy(this, {
			get(target, p, receiver) {
				switch (p) {
					case 'append':
					case 'set':
						return (name, value) => {
							validateHeaderName(name);
							validateHeaderValue(name, String(value));
							return URLSearchParams.prototype[p].call(
								target,
								String(name).toLowerCase(),
								String(value)
							);
						};

					case 'delete':
					case 'has':
					case 'getAll':
						return name => {
							validateHeaderName(name);
							return URLSearchParams.prototype[p].call(
								target,
								String(name).toLowerCase()
							);
						};

					case 'keys':
						return () => {
							target.sort();
							return new Set(URLSearchParams.prototype.keys.call(target)).keys();
						};

					default:
						return Reflect.get(target, p, receiver);
				}
			}
		});
		/* c8 ignore next */
	}

	get [Symbol.toStringTag]() {
		return this.constructor.name;
	}

	toString() {
		return Object.prototype.toString.call(this);
	}

	get(name) {
		const values = this.getAll(name);
		if (values.length === 0) {
			return null;
		}

		let value = values.join(', ');
		if (/^content-encoding$/i.test(name)) {
			value = value.toLowerCase();
		}

		return value;
	}

	forEach(callback, thisArg = undefined) {
		for (const name of this.keys()) {
			Reflect.apply(callback, thisArg, [this.get(name), name, this]);
		}
	}

	* values() {
		for (const name of this.keys()) {
			yield this.get(name);
		}
	}

	/**
	 * @type {() => IterableIterator<[string, string]>}
	 */
	* entries() {
		for (const name of this.keys()) {
			yield [name, this.get(name)];
		}
	}

	[Symbol.iterator]() {
		return this.entries();
	}

	/**
	 * Node-fetch non-spec method
	 * returning all headers and their values as array
	 * @returns {Record<string, string[]>}
	 */
	raw() {
		return [...this.keys()].reduce((result, key) => {
			result[key] = this.getAll(key);
			return result;
		}, {});
	}

	/**
	 * For better console.log(headers) and also to convert Headers into Node.js Request compatible format
	 */
	[Symbol.for('nodejs.util.inspect.custom')]() {
		return [...this.keys()].reduce((result, key) => {
			const values = this.getAll(key);
			// Http.request() only supports string as Host header.
			// This hack makes specifying custom Host header possible.
			if (key === 'host') {
				result[key] = values[0];
			} else {
				result[key] = values.length > 1 ? values : values[0];
			}

			return result;
		}, {});
	}
}

/**
 * Re-shaping object for Web IDL tests
 * Only need to do it for overridden methods
 */
Object.defineProperties(
	Headers.prototype,
	['get', 'entries', 'forEach', 'values'].reduce((result, property) => {
		result[property] = {enumerable: true};
		return result;
	}, {})
);

/**
 * Request.js
 *
 * Request class contains server only options
 *
 * All spec algorithm step numbers are based on https://fetch.spec.whatwg.org/commit-snapshots/ae716822cb3a61843226cd090eefc6589446c1d2/.
 */

node_util.deprecate(() => {},
	'.data is not a valid RequestInit property, use .body instead',
	'https://github.com/node-fetch/node-fetch/issues/1000 (request)');

/*! node-domexception. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */

if (!globalThis.DOMException) {
  try {
    const { MessageChannel } = require('worker_threads'),
    port = new MessageChannel().port1,
    ab = new ArrayBuffer();
    port.postMessage(ab, [ab, ab]);
  } catch (err) {
    err.constructor.name === 'DOMException' && (
      globalThis.DOMException = err.constructor
    );
  }
}

const ALIAS = Symbol.for('yaml.alias');
const DOC = Symbol.for('yaml.document');
const MAP = Symbol.for('yaml.map');
const PAIR = Symbol.for('yaml.pair');
const SCALAR = Symbol.for('yaml.scalar');
const SEQ = Symbol.for('yaml.seq');
const NODE_TYPE = Symbol.for('yaml.node.type');
const isAlias = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === ALIAS;
const isDocument = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === DOC;
const isMap = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === MAP;
const isPair = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === PAIR;
const isScalar = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === SCALAR;
const isSeq = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === SEQ;
function isCollection(node) {
    if (node && typeof node === 'object')
        switch (node[NODE_TYPE]) {
            case MAP:
            case SEQ:
                return true;
        }
    return false;
}
function isNode(node) {
    if (node && typeof node === 'object')
        switch (node[NODE_TYPE]) {
            case ALIAS:
            case MAP:
            case SCALAR:
            case SEQ:
                return true;
        }
    return false;
}
const hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;
class NodeBase {
    constructor(type) {
        Object.defineProperty(this, NODE_TYPE, { value: type });
    }
    /** Create a copy of this node.  */
    clone() {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (this.range)
            copy.range = this.range.slice();
        return copy;
    }
}

const BREAK = Symbol('break visit');
const SKIP = Symbol('skip children');
const REMOVE = Symbol('remove node');
/**
 * Apply a visitor to an AST node or document.
 *
 * Walks through the tree (depth-first) starting from `node`, calling a
 * `visitor` function with three arguments:
 *   - `key`: For sequence values and map `Pair`, the node's index in the
 *     collection. Within a `Pair`, `'key'` or `'value'`, correspondingly.
 *     `null` for the root node.
 *   - `node`: The current node.
 *   - `path`: The ancestry of the current node.
 *
 * The return value of the visitor may be used to control the traversal:
 *   - `undefined` (default): Do nothing and continue
 *   - `visit.SKIP`: Do not visit the children of this node, continue with next
 *     sibling
 *   - `visit.BREAK`: Terminate traversal completely
 *   - `visit.REMOVE`: Remove the current node, then continue with the next one
 *   - `Node`: Replace the current node, then continue by visiting it
 *   - `number`: While iterating the items of a sequence or map, set the index
 *     of the next step. This is useful especially if the index of the current
 *     node has changed.
 *
 * If `visitor` is a single function, it will be called with all values
 * encountered in the tree, including e.g. `null` values. Alternatively,
 * separate visitor functions may be defined for each `Map`, `Pair`, `Seq`,
 * `Alias` and `Scalar` node. To define the same visitor function for more than
 * one node type, use the `Collection` (map and seq), `Value` (map, seq & scalar)
 * and `Node` (alias, map, seq & scalar) targets. Of all these, only the most
 * specific defined one will be used for each node.
 */
function visit(node, visitor) {
    const visitor_ = initVisitor(visitor);
    if (isDocument(node)) {
        const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
            node.contents = null;
    }
    else
        visit_(null, node, visitor_, Object.freeze([]));
}
// Without the `as symbol` casts, TS declares these in the `visit`
// namespace using `var`, but then complains about that because
// `unique symbol` must be `const`.
/** Terminate visit traversal completely */
visit.BREAK = BREAK;
/** Do not visit the children of the current node */
visit.SKIP = SKIP;
/** Remove the current node */
visit.REMOVE = REMOVE;
function visit_(key, node, visitor, path) {
    const ctrl = callVisitor(key, node, visitor, path);
    if (isNode(ctrl) || isPair(ctrl)) {
        replaceNode(key, path, ctrl);
        return visit_(key, ctrl, visitor, path);
    }
    if (typeof ctrl !== 'symbol') {
        if (isCollection(node)) {
            path = Object.freeze(path.concat(node));
            for (let i = 0; i < node.items.length; ++i) {
                const ci = visit_(i, node.items[i], visitor, path);
                if (typeof ci === 'number')
                    i = ci - 1;
                else if (ci === BREAK)
                    return BREAK;
                else if (ci === REMOVE) {
                    node.items.splice(i, 1);
                    i -= 1;
                }
            }
        }
        else if (isPair(node)) {
            path = Object.freeze(path.concat(node));
            const ck = visit_('key', node.key, visitor, path);
            if (ck === BREAK)
                return BREAK;
            else if (ck === REMOVE)
                node.key = null;
            const cv = visit_('value', node.value, visitor, path);
            if (cv === BREAK)
                return BREAK;
            else if (cv === REMOVE)
                node.value = null;
        }
    }
    return ctrl;
}
function initVisitor(visitor) {
    if (typeof visitor === 'object' &&
        (visitor.Collection || visitor.Node || visitor.Value)) {
        return Object.assign({
            Alias: visitor.Node,
            Map: visitor.Node,
            Scalar: visitor.Node,
            Seq: visitor.Node
        }, visitor.Value && {
            Map: visitor.Value,
            Scalar: visitor.Value,
            Seq: visitor.Value
        }, visitor.Collection && {
            Map: visitor.Collection,
            Seq: visitor.Collection
        }, visitor);
    }
    return visitor;
}
function callVisitor(key, node, visitor, path) {
    if (typeof visitor === 'function')
        return visitor(key, node, path);
    if (isMap(node))
        return visitor.Map?.(key, node, path);
    if (isSeq(node))
        return visitor.Seq?.(key, node, path);
    if (isPair(node))
        return visitor.Pair?.(key, node, path);
    if (isScalar(node))
        return visitor.Scalar?.(key, node, path);
    if (isAlias(node))
        return visitor.Alias?.(key, node, path);
    return undefined;
}
function replaceNode(key, path, node) {
    const parent = path[path.length - 1];
    if (isCollection(parent)) {
        parent.items[key] = node;
    }
    else if (isPair(parent)) {
        if (key === 'key')
            parent.key = node;
        else
            parent.value = node;
    }
    else if (isDocument(parent)) {
        parent.contents = node;
    }
    else {
        const pt = isAlias(parent) ? 'alias' : 'scalar';
        throw new Error(`Cannot replace node with ${pt} parent`);
    }
}

/**
 * Verify that the input string is a valid anchor.
 *
 * Will throw on errors.
 */
function anchorIsValid(anchor) {
    if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
        const sa = JSON.stringify(anchor);
        const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
        throw new Error(msg);
    }
    return true;
}

class Alias extends NodeBase {
    constructor(source) {
        super(ALIAS);
        this.source = source;
        Object.defineProperty(this, 'tag', {
            set() {
                throw new Error('Alias nodes cannot have tags');
            }
        });
    }
    /**
     * Resolve the value of this alias within `doc`, finding the last
     * instance of the `source` anchor before this node.
     */
    resolve(doc) {
        let found = undefined;
        visit(doc, {
            Node: (_key, node) => {
                if (node === this)
                    return visit.BREAK;
                if (node.anchor === this.source)
                    found = node;
            }
        });
        return found;
    }
    toJSON(_arg, ctx) {
        if (!ctx)
            return { source: this.source };
        const { anchors, doc, maxAliasCount } = ctx;
        const source = this.resolve(doc);
        if (!source) {
            const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
            throw new ReferenceError(msg);
        }
        const data = anchors.get(source);
        /* istanbul ignore if */
        if (!data || data.res === undefined) {
            const msg = 'This should not happen: Alias anchor was not resolved?';
            throw new ReferenceError(msg);
        }
        if (maxAliasCount >= 0) {
            data.count += 1;
            if (data.aliasCount === 0)
                data.aliasCount = getAliasCount(doc, source, anchors);
            if (data.count * data.aliasCount > maxAliasCount) {
                const msg = 'Excessive alias count indicates a resource exhaustion attack';
                throw new ReferenceError(msg);
            }
        }
        return data.res;
    }
    toString(ctx, _onComment, _onChompKeep) {
        const src = `*${this.source}`;
        if (ctx) {
            anchorIsValid(this.source);
            if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
                const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
                throw new Error(msg);
            }
            if (ctx.implicitKey)
                return `${src} `;
        }
        return src;
    }
}
function getAliasCount(doc, node, anchors) {
    if (isAlias(node)) {
        const source = node.resolve(doc);
        const anchor = anchors && source && anchors.get(source);
        return anchor ? anchor.count * anchor.aliasCount : 0;
    }
    else if (isCollection(node)) {
        let count = 0;
        for (const item of node.items) {
            const c = getAliasCount(doc, item, anchors);
            if (c > count)
                count = c;
        }
        return count;
    }
    else if (isPair(node)) {
        const kc = getAliasCount(doc, node.key, anchors);
        const vc = getAliasCount(doc, node.value, anchors);
        return Math.max(kc, vc);
    }
    return 1;
}

/**
 * Recursively convert any node or its contents to native JavaScript
 *
 * @param value - The input value
 * @param arg - If `value` defines a `toJSON()` method, use this
 *   as its first argument
 * @param ctx - Conversion context, originally set in Document#toJS(). If
 *   `{ keep: true }` is not set, output should be suitable for JSON
 *   stringification.
 */
function toJS(value, arg, ctx) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    if (Array.isArray(value))
        return value.map((v, i) => toJS(v, String(i), ctx));
    if (value && typeof value.toJSON === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        if (!ctx || !hasAnchor(value))
            return value.toJSON(arg, ctx);
        const data = { aliasCount: 0, count: 1, res: undefined };
        ctx.anchors.set(value, data);
        ctx.onCreate = res => {
            data.res = res;
            delete ctx.onCreate;
        };
        const res = value.toJSON(arg, ctx);
        if (ctx.onCreate)
            ctx.onCreate(res);
        return res;
    }
    if (typeof value === 'bigint' && !ctx?.keep)
        return Number(value);
    return value;
}

const isScalarValue = (value) => !value || (typeof value !== 'function' && typeof value !== 'object');
class Scalar extends NodeBase {
    constructor(value) {
        super(SCALAR);
        this.value = value;
    }
    toJSON(arg, ctx) {
        return ctx?.keep ? this.value : toJS(this.value, arg, ctx);
    }
    toString() {
        return String(this.value);
    }
}
Scalar.BLOCK_FOLDED = 'BLOCK_FOLDED';
Scalar.BLOCK_LITERAL = 'BLOCK_LITERAL';
Scalar.PLAIN = 'PLAIN';
Scalar.QUOTE_DOUBLE = 'QUOTE_DOUBLE';
Scalar.QUOTE_SINGLE = 'QUOTE_SINGLE';

const defaultTagPrefix = 'tag:yaml.org,2002:';
function findTagObject(value, tagName, tags) {
    if (tagName) {
        const match = tags.filter(t => t.tag === tagName);
        const tagObj = match.find(t => !t.format) ?? match[0];
        if (!tagObj)
            throw new Error(`Tag ${tagName} not found`);
        return tagObj;
    }
    return tags.find(t => t.identify?.(value) && !t.format);
}
function createNode(value, tagName, ctx) {
    if (isDocument(value))
        value = value.contents;
    if (isNode(value))
        return value;
    if (isPair(value)) {
        const map = ctx.schema[MAP].createNode?.(ctx.schema, null, ctx);
        map.items.push(value);
        return map;
    }
    if (value instanceof String ||
        value instanceof Number ||
        value instanceof Boolean ||
        (typeof BigInt === 'function' && value instanceof BigInt) // not supported everywhere
    ) {
        // https://tc39.es/ecma262/#sec-serializejsonproperty
        value = value.valueOf();
    }
    const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
    // Detect duplicate references to the same object & use Alias nodes for all
    // after first. The `ref` wrapper allows for circular references to resolve.
    let ref = undefined;
    if (aliasDuplicateObjects && value && typeof value === 'object') {
        ref = sourceObjects.get(value);
        if (ref) {
            if (!ref.anchor)
                ref.anchor = onAnchor(value);
            return new Alias(ref.anchor);
        }
        else {
            ref = { anchor: null, node: null };
            sourceObjects.set(value, ref);
        }
    }
    if (tagName?.startsWith('!!'))
        tagName = defaultTagPrefix + tagName.slice(2);
    let tagObj = findTagObject(value, tagName, schema.tags);
    if (!tagObj) {
        if (value && typeof value.toJSON === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            value = value.toJSON();
        }
        if (!value || typeof value !== 'object') {
            const node = new Scalar(value);
            if (ref)
                ref.node = node;
            return node;
        }
        tagObj =
            value instanceof Map
                ? schema[MAP]
                : Symbol.iterator in Object(value)
                    ? schema[SEQ]
                    : schema[MAP];
    }
    if (onTagObj) {
        onTagObj(tagObj);
        delete ctx.onTagObj;
    }
    const node = tagObj?.createNode
        ? tagObj.createNode(ctx.schema, value, ctx)
        : new Scalar(value);
    if (tagName)
        node.tag = tagName;
    if (ref)
        ref.node = node;
    return node;
}

function collectionFromPath(schema, path, value) {
    let v = value;
    for (let i = path.length - 1; i >= 0; --i) {
        const k = path[i];
        if (typeof k === 'number' && Number.isInteger(k) && k >= 0) {
            const a = [];
            a[k] = v;
            v = a;
        }
        else {
            v = new Map([[k, v]]);
        }
    }
    return createNode(v, undefined, {
        aliasDuplicateObjects: false,
        keepUndefined: false,
        onAnchor: () => {
            throw new Error('This should not happen, please report a bug.');
        },
        schema,
        sourceObjects: new Map()
    });
}
// Type guard is intentionally a little wrong so as to be more useful,
// as it does not cover untypable empty non-string iterables (e.g. []).
const isEmptyPath = (path) => path == null ||
    (typeof path === 'object' && !!path[Symbol.iterator]().next().done);
class Collection extends NodeBase {
    constructor(type, schema) {
        super(type);
        Object.defineProperty(this, 'schema', {
            value: schema,
            configurable: true,
            enumerable: false,
            writable: true
        });
    }
    /**
     * Create a copy of this collection.
     *
     * @param schema - If defined, overwrites the original's schema
     */
    clone(schema) {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (schema)
            copy.schema = schema;
        copy.items = copy.items.map(it => isNode(it) || isPair(it) ? it.clone(schema) : it);
        if (this.range)
            copy.range = this.range.slice();
        return copy;
    }
    /**
     * Adds a value to the collection. For `!!map` and `!!omap` the value must
     * be a Pair instance or a `{ key, value }` object, which may not have a key
     * that already exists in the map.
     */
    addIn(path, value) {
        if (isEmptyPath(path))
            this.add(value);
        else {
            const [key, ...rest] = path;
            const node = this.get(key, true);
            if (isCollection(node))
                node.addIn(rest, value);
            else if (node === undefined && this.schema)
                this.set(key, collectionFromPath(this.schema, rest, value));
            else
                throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
    }
    /**
     * Removes a value from the collection.
     * @returns `true` if the item was found and removed.
     */
    deleteIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
            return this.delete(key);
        const node = this.get(key, true);
        if (isCollection(node))
            return node.deleteIn(rest);
        else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
    }
    /**
     * Returns item at `key`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    getIn(path, keepScalar) {
        const [key, ...rest] = path;
        const node = this.get(key, true);
        if (rest.length === 0)
            return !keepScalar && isScalar(node) ? node.value : node;
        else
            return isCollection(node) ? node.getIn(rest, keepScalar) : undefined;
    }
    hasAllNullValues(allowScalar) {
        return this.items.every(node => {
            if (!isPair(node))
                return false;
            const n = node.value;
            return (n == null ||
                (allowScalar &&
                    isScalar(n) &&
                    n.value == null &&
                    !n.commentBefore &&
                    !n.comment &&
                    !n.tag));
        });
    }
    /**
     * Checks if the collection includes a value with the key `key`.
     */
    hasIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
            return this.has(key);
        const node = this.get(key, true);
        return isCollection(node) ? node.hasIn(rest) : false;
    }
    /**
     * Sets a value in this collection. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    setIn(path, value) {
        const [key, ...rest] = path;
        if (rest.length === 0) {
            this.set(key, value);
        }
        else {
            const node = this.get(key, true);
            if (isCollection(node))
                node.setIn(rest, value);
            else if (node === undefined && this.schema)
                this.set(key, collectionFromPath(this.schema, rest, value));
            else
                throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
    }
}
Collection.maxFlowStringSingleLineLength = 60;

/**
 * Stringifies a comment.
 *
 * Empty comment lines are left empty,
 * lines consisting of a single space are replaced by `#`,
 * and all other lines are prefixed with a `#`.
 */
const stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, '#');
function indentComment(comment, indent) {
    if (/^\n+$/.test(comment))
        return comment.substring(1);
    return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
}
const lineComment = (str, indent, comment) => str.endsWith('\n')
    ? indentComment(comment, indent)
    : comment.includes('\n')
        ? '\n' + indentComment(comment, indent)
        : (str.endsWith(' ') ? '' : ' ') + comment;

const FOLD_FLOW = 'flow';
const FOLD_BLOCK = 'block';
const FOLD_QUOTED = 'quoted';
/**
 * Tries to keep input at up to `lineWidth` characters, splitting only on spaces
 * not followed by newlines or spaces unless `mode` is `'quoted'`. Lines are
 * terminated with `\n` and started with `indent`.
 */
function foldFlowLines(text, indent, mode = 'flow', { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
    if (!lineWidth || lineWidth < 0)
        return text;
    const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
    if (text.length <= endStep)
        return text;
    const folds = [];
    const escapedFolds = {};
    let end = lineWidth - indent.length;
    if (typeof indentAtStart === 'number') {
        if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
            folds.push(0);
        else
            end = lineWidth - indentAtStart;
    }
    let split = undefined;
    let prev = undefined;
    let overflow = false;
    let i = -1;
    let escStart = -1;
    let escEnd = -1;
    if (mode === FOLD_BLOCK) {
        i = consumeMoreIndentedLines(text, i);
        if (i !== -1)
            end = i + endStep;
    }
    for (let ch; (ch = text[(i += 1)]);) {
        if (mode === FOLD_QUOTED && ch === '\\') {
            escStart = i;
            switch (text[i + 1]) {
                case 'x':
                    i += 3;
                    break;
                case 'u':
                    i += 5;
                    break;
                case 'U':
                    i += 9;
                    break;
                default:
                    i += 1;
            }
            escEnd = i;
        }
        if (ch === '\n') {
            if (mode === FOLD_BLOCK)
                i = consumeMoreIndentedLines(text, i);
            end = i + endStep;
            split = undefined;
        }
        else {
            if (ch === ' ' &&
                prev &&
                prev !== ' ' &&
                prev !== '\n' &&
                prev !== '\t') {
                // space surrounded by non-space can be replaced with newline + indent
                const next = text[i + 1];
                if (next && next !== ' ' && next !== '\n' && next !== '\t')
                    split = i;
            }
            if (i >= end) {
                if (split) {
                    folds.push(split);
                    end = split + endStep;
                    split = undefined;
                }
                else if (mode === FOLD_QUOTED) {
                    // white-space collected at end may stretch past lineWidth
                    while (prev === ' ' || prev === '\t') {
                        prev = ch;
                        ch = text[(i += 1)];
                        overflow = true;
                    }
                    // Account for newline escape, but don't break preceding escape
                    const j = i > escEnd + 1 ? i - 2 : escStart - 1;
                    // Bail out if lineWidth & minContentWidth are shorter than an escape string
                    if (escapedFolds[j])
                        return text;
                    folds.push(j);
                    escapedFolds[j] = true;
                    end = j + endStep;
                    split = undefined;
                }
                else {
                    overflow = true;
                }
            }
        }
        prev = ch;
    }
    if (overflow && onOverflow)
        onOverflow();
    if (folds.length === 0)
        return text;
    if (onFold)
        onFold();
    let res = text.slice(0, folds[0]);
    for (let i = 0; i < folds.length; ++i) {
        const fold = folds[i];
        const end = folds[i + 1] || text.length;
        if (fold === 0)
            res = `\n${indent}${text.slice(0, end)}`;
        else {
            if (mode === FOLD_QUOTED && escapedFolds[fold])
                res += `${text[fold]}\\`;
            res += `\n${indent}${text.slice(fold + 1, end)}`;
        }
    }
    return res;
}
/**
 * Presumes `i + 1` is at the start of a line
 * @returns index of last newline in more-indented block
 */
function consumeMoreIndentedLines(text, i) {
    let ch = text[i + 1];
    while (ch === ' ' || ch === '\t') {
        do {
            ch = text[(i += 1)];
        } while (ch && ch !== '\n');
        ch = text[i + 1];
    }
    return i;
}

const getFoldOptions = (ctx) => ({
    indentAtStart: ctx.indentAtStart,
    lineWidth: ctx.options.lineWidth,
    minContentWidth: ctx.options.minContentWidth
});
// Also checks for lines starting with %, as parsing the output as YAML 1.1 will
// presume that's starting a new document.
const containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
function lineLengthOverLimit(str, lineWidth, indentLength) {
    if (!lineWidth || lineWidth < 0)
        return false;
    const limit = lineWidth - indentLength;
    const strLen = str.length;
    if (strLen <= limit)
        return false;
    for (let i = 0, start = 0; i < strLen; ++i) {
        if (str[i] === '\n') {
            if (i - start > limit)
                return true;
            start = i + 1;
            if (strLen - start <= limit)
                return false;
        }
    }
    return true;
}
function doubleQuotedString(value, ctx) {
    const json = JSON.stringify(value);
    if (ctx.options.doubleQuotedAsJSON)
        return json;
    const { implicitKey } = ctx;
    const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
    const indent = ctx.indent || (containsDocumentMarker(value) ? '  ' : '');
    let str = '';
    let start = 0;
    for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
        if (ch === ' ' && json[i + 1] === '\\' && json[i + 2] === 'n') {
            // space before newline needs to be escaped to not be folded
            str += json.slice(start, i) + '\\ ';
            i += 1;
            start = i;
            ch = '\\';
        }
        if (ch === '\\')
            switch (json[i + 1]) {
                case 'u':
                    {
                        str += json.slice(start, i);
                        const code = json.substr(i + 2, 4);
                        switch (code) {
                            case '0000':
                                str += '\\0';
                                break;
                            case '0007':
                                str += '\\a';
                                break;
                            case '000b':
                                str += '\\v';
                                break;
                            case '001b':
                                str += '\\e';
                                break;
                            case '0085':
                                str += '\\N';
                                break;
                            case '00a0':
                                str += '\\_';
                                break;
                            case '2028':
                                str += '\\L';
                                break;
                            case '2029':
                                str += '\\P';
                                break;
                            default:
                                if (code.substr(0, 2) === '00')
                                    str += '\\x' + code.substr(2);
                                else
                                    str += json.substr(i, 6);
                        }
                        i += 5;
                        start = i + 1;
                    }
                    break;
                case 'n':
                    if (implicitKey ||
                        json[i + 2] === '"' ||
                        json.length < minMultiLineLength) {
                        i += 1;
                    }
                    else {
                        // folding will eat first newline
                        str += json.slice(start, i) + '\n\n';
                        while (json[i + 2] === '\\' &&
                            json[i + 3] === 'n' &&
                            json[i + 4] !== '"') {
                            str += '\n';
                            i += 2;
                        }
                        str += indent;
                        // space after newline needs to be escaped to not be folded
                        if (json[i + 2] === ' ')
                            str += '\\';
                        i += 1;
                        start = i + 1;
                    }
                    break;
                default:
                    i += 1;
            }
    }
    str = start ? str + json.slice(start) : json;
    return implicitKey
        ? str
        : foldFlowLines(str, indent, FOLD_QUOTED, getFoldOptions(ctx));
}
function singleQuotedString(value, ctx) {
    if (ctx.options.singleQuote === false ||
        (ctx.implicitKey && value.includes('\n')) ||
        /[ \t]\n|\n[ \t]/.test(value) // single quoted string can't have leading or trailing whitespace around newline
    )
        return doubleQuotedString(value, ctx);
    const indent = ctx.indent || (containsDocumentMarker(value) ? '  ' : '');
    const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&\n${indent}`) + "'";
    return ctx.implicitKey
        ? res
        : foldFlowLines(res, indent, FOLD_FLOW, getFoldOptions(ctx));
}
function quotedString(value, ctx) {
    const { singleQuote } = ctx.options;
    let qs;
    if (singleQuote === false)
        qs = doubleQuotedString;
    else {
        const hasDouble = value.includes('"');
        const hasSingle = value.includes("'");
        if (hasDouble && !hasSingle)
            qs = singleQuotedString;
        else if (hasSingle && !hasDouble)
            qs = doubleQuotedString;
        else
            qs = singleQuote ? singleQuotedString : doubleQuotedString;
    }
    return qs(value, ctx);
}
function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
    const { blockQuote, commentString, lineWidth } = ctx.options;
    // 1. Block can't end in whitespace unless the last line is non-empty.
    // 2. Strings consisting of only whitespace are best rendered explicitly.
    if (!blockQuote || /\n[\t ]+$/.test(value) || /^\s*$/.test(value)) {
        return quotedString(value, ctx);
    }
    const indent = ctx.indent ||
        (ctx.forceBlockIndent || containsDocumentMarker(value) ? '  ' : '');
    const literal = blockQuote === 'literal'
        ? true
        : blockQuote === 'folded' || type === Scalar.BLOCK_FOLDED
            ? false
            : type === Scalar.BLOCK_LITERAL
                ? true
                : !lineLengthOverLimit(value, lineWidth, indent.length);
    if (!value)
        return literal ? '|\n' : '>\n';
    // determine chomping from whitespace at value end
    let chomp;
    let endStart;
    for (endStart = value.length; endStart > 0; --endStart) {
        const ch = value[endStart - 1];
        if (ch !== '\n' && ch !== '\t' && ch !== ' ')
            break;
    }
    let end = value.substring(endStart);
    const endNlPos = end.indexOf('\n');
    if (endNlPos === -1) {
        chomp = '-'; // strip
    }
    else if (value === end || endNlPos !== end.length - 1) {
        chomp = '+'; // keep
        if (onChompKeep)
            onChompKeep();
    }
    else {
        chomp = ''; // clip
    }
    if (end) {
        value = value.slice(0, -end.length);
        if (end[end.length - 1] === '\n')
            end = end.slice(0, -1);
        end = end.replace(/\n+(?!\n|$)/g, `$&${indent}`);
    }
    // determine indent indicator from whitespace at value start
    let startWithSpace = false;
    let startEnd;
    let startNlPos = -1;
    for (startEnd = 0; startEnd < value.length; ++startEnd) {
        const ch = value[startEnd];
        if (ch === ' ')
            startWithSpace = true;
        else if (ch === '\n')
            startNlPos = startEnd;
        else
            break;
    }
    let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
    if (start) {
        value = value.substring(start.length);
        start = start.replace(/\n+/g, `$&${indent}`);
    }
    const indentSize = indent ? '2' : '1'; // root is at -1
    let header = (literal ? '|' : '>') + (startWithSpace ? indentSize : '') + chomp;
    if (comment) {
        header += ' ' + commentString(comment.replace(/ ?[\r\n]+/g, ' '));
        if (onComment)
            onComment();
    }
    if (literal) {
        value = value.replace(/\n+/g, `$&${indent}`);
        return `${header}\n${indent}${start}${value}${end}`;
    }
    value = value
        .replace(/\n+/g, '\n$&')
        .replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, '$1$2') // more-indented lines aren't folded
        //                ^ more-ind. ^ empty     ^ capture next empty lines only at end of indent
        .replace(/\n+/g, `$&${indent}`);
    const body = foldFlowLines(`${start}${value}${end}`, indent, FOLD_BLOCK, getFoldOptions(ctx));
    return `${header}\n${indent}${body}`;
}
function plainString(item, ctx, onComment, onChompKeep) {
    const { type, value } = item;
    const { actualString, implicitKey, indent, inFlow } = ctx;
    if ((implicitKey && /[\n[\]{},]/.test(value)) ||
        (inFlow && /[[\]{},]/.test(value))) {
        return quotedString(value, ctx);
    }
    if (!value ||
        /^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
        // not allowed:
        // - empty string, '-' or '?'
        // - start with an indicator character (except [?:-]) or /[?-] /
        // - '\n ', ': ' or ' \n' anywhere
        // - '#' not preceded by a non-space char
        // - end with ' ' or ':'
        return implicitKey || inFlow || !value.includes('\n')
            ? quotedString(value, ctx)
            : blockString(item, ctx, onComment, onChompKeep);
    }
    if (!implicitKey &&
        !inFlow &&
        type !== Scalar.PLAIN &&
        value.includes('\n')) {
        // Where allowed & type not set explicitly, prefer block style for multiline strings
        return blockString(item, ctx, onComment, onChompKeep);
    }
    if (indent === '' && containsDocumentMarker(value)) {
        ctx.forceBlockIndent = true;
        return blockString(item, ctx, onComment, onChompKeep);
    }
    const str = value.replace(/\n+/g, `$&\n${indent}`);
    // Verify that output will be parsed as a string, as e.g. plain numbers and
    // booleans get parsed with those types in v1.2 (e.g. '42', 'true' & '0.9e-3'),
    // and others in v1.1.
    if (actualString) {
        const test = (tag) => tag.default && tag.tag !== 'tag:yaml.org,2002:str' && tag.test?.test(str);
        const { compat, tags } = ctx.doc.schema;
        if (tags.some(test) || compat?.some(test))
            return quotedString(value, ctx);
    }
    return implicitKey
        ? str
        : foldFlowLines(str, indent, FOLD_FLOW, getFoldOptions(ctx));
}
function stringifyString(item, ctx, onComment, onChompKeep) {
    const { implicitKey, inFlow } = ctx;
    const ss = typeof item.value === 'string'
        ? item
        : Object.assign({}, item, { value: String(item.value) });
    let { type } = item;
    if (type !== Scalar.QUOTE_DOUBLE) {
        // force double quotes on control characters & unpaired surrogates
        if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
            type = Scalar.QUOTE_DOUBLE;
    }
    const _stringify = (_type) => {
        switch (_type) {
            case Scalar.BLOCK_FOLDED:
            case Scalar.BLOCK_LITERAL:
                return implicitKey || inFlow
                    ? quotedString(ss.value, ctx) // blocks are not valid inside flow containers
                    : blockString(ss, ctx, onComment, onChompKeep);
            case Scalar.QUOTE_DOUBLE:
                return doubleQuotedString(ss.value, ctx);
            case Scalar.QUOTE_SINGLE:
                return singleQuotedString(ss.value, ctx);
            case Scalar.PLAIN:
                return plainString(ss, ctx, onComment, onChompKeep);
            default:
                return null;
        }
    };
    let res = _stringify(type);
    if (res === null) {
        const { defaultKeyType, defaultStringType } = ctx.options;
        const t = (implicitKey && defaultKeyType) || defaultStringType;
        res = _stringify(t);
        if (res === null)
            throw new Error(`Unsupported default string type ${t}`);
    }
    return res;
}

function createStringifyContext(doc, options) {
    const opt = Object.assign({
        blockQuote: true,
        commentString: stringifyComment,
        defaultKeyType: null,
        defaultStringType: 'PLAIN',
        directives: null,
        doubleQuotedAsJSON: false,
        doubleQuotedMinMultiLineLength: 40,
        falseStr: 'false',
        indentSeq: true,
        lineWidth: 80,
        minContentWidth: 20,
        nullStr: 'null',
        simpleKeys: false,
        singleQuote: null,
        trueStr: 'true',
        verifyAliasOrder: true
    }, doc.schema.toStringOptions, options);
    let inFlow;
    switch (opt.collectionStyle) {
        case 'block':
            inFlow = false;
            break;
        case 'flow':
            inFlow = true;
            break;
        default:
            inFlow = null;
    }
    return {
        anchors: new Set(),
        doc,
        indent: '',
        indentStep: typeof opt.indent === 'number' ? ' '.repeat(opt.indent) : '  ',
        inFlow,
        options: opt
    };
}
function getTagObject(tags, item) {
    if (item.tag) {
        const match = tags.filter(t => t.tag === item.tag);
        if (match.length > 0)
            return match.find(t => t.format === item.format) ?? match[0];
    }
    let tagObj = undefined;
    let obj;
    if (isScalar(item)) {
        obj = item.value;
        const match = tags.filter(t => t.identify?.(obj));
        tagObj =
            match.find(t => t.format === item.format) ?? match.find(t => !t.format);
    }
    else {
        obj = item;
        tagObj = tags.find(t => t.nodeClass && obj instanceof t.nodeClass);
    }
    if (!tagObj) {
        const name = obj?.constructor?.name ?? typeof obj;
        throw new Error(`Tag not resolved for ${name} value`);
    }
    return tagObj;
}
// needs to be called before value stringifier to allow for circular anchor refs
function stringifyProps(node, tagObj, { anchors, doc }) {
    if (!doc.directives)
        return '';
    const props = [];
    const anchor = (isScalar(node) || isCollection(node)) && node.anchor;
    if (anchor && anchorIsValid(anchor)) {
        anchors.add(anchor);
        props.push(`&${anchor}`);
    }
    const tag = node.tag ? node.tag : tagObj.default ? null : tagObj.tag;
    if (tag)
        props.push(doc.directives.tagString(tag));
    return props.join(' ');
}
function stringify(item, ctx, onComment, onChompKeep) {
    if (isPair(item))
        return item.toString(ctx, onComment, onChompKeep);
    if (isAlias(item)) {
        if (ctx.doc.directives)
            return item.toString(ctx);
        if (ctx.resolvedAliases?.has(item)) {
            throw new TypeError(`Cannot stringify circular structure without alias nodes`);
        }
        else {
            if (ctx.resolvedAliases)
                ctx.resolvedAliases.add(item);
            else
                ctx.resolvedAliases = new Set([item]);
            item = item.resolve(ctx.doc);
        }
    }
    let tagObj = undefined;
    const node = isNode(item)
        ? item
        : ctx.doc.createNode(item, { onTagObj: o => (tagObj = o) });
    if (!tagObj)
        tagObj = getTagObject(ctx.doc.schema.tags, node);
    const props = stringifyProps(node, tagObj, ctx);
    if (props.length > 0)
        ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
    const str = typeof tagObj.stringify === 'function'
        ? tagObj.stringify(node, ctx, onComment, onChompKeep)
        : isScalar(node)
            ? stringifyString(node, ctx, onComment, onChompKeep)
            : node.toString(ctx, onComment, onChompKeep);
    if (!props)
        return str;
    return isScalar(node) || str[0] === '{' || str[0] === '['
        ? `${props} ${str}`
        : `${props}\n${ctx.indent}${str}`;
}

function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
    const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
    let keyComment = (isNode(key) && key.comment) || null;
    if (simpleKeys) {
        if (keyComment) {
            throw new Error('With simple keys, key nodes cannot have comments');
        }
        if (isCollection(key)) {
            const msg = 'With simple keys, collection cannot be used as a key value';
            throw new Error(msg);
        }
    }
    let explicitKey = !simpleKeys &&
        (!key ||
            (keyComment && value == null && !ctx.inFlow) ||
            isCollection(key) ||
            (isScalar(key)
                ? key.type === Scalar.BLOCK_FOLDED || key.type === Scalar.BLOCK_LITERAL
                : typeof key === 'object'));
    ctx = Object.assign({}, ctx, {
        allNullValues: false,
        implicitKey: !explicitKey && (simpleKeys || !allNullValues),
        indent: indent + indentStep
    });
    let keyCommentDone = false;
    let chompKeep = false;
    let str = stringify(key, ctx, () => (keyCommentDone = true), () => (chompKeep = true));
    if (!explicitKey && !ctx.inFlow && str.length > 1024) {
        if (simpleKeys)
            throw new Error('With simple keys, single line scalar must not span more than 1024 characters');
        explicitKey = true;
    }
    if (ctx.inFlow) {
        if (allNullValues || value == null) {
            if (keyCommentDone && onComment)
                onComment();
            return str === '' ? '?' : explicitKey ? `? ${str}` : str;
        }
    }
    else if ((allNullValues && !simpleKeys) || (value == null && explicitKey)) {
        str = `? ${str}`;
        if (keyComment && !keyCommentDone) {
            str += lineComment(str, ctx.indent, commentString(keyComment));
        }
        else if (chompKeep && onChompKeep)
            onChompKeep();
        return str;
    }
    if (keyCommentDone)
        keyComment = null;
    if (explicitKey) {
        if (keyComment)
            str += lineComment(str, ctx.indent, commentString(keyComment));
        str = `? ${str}\n${indent}:`;
    }
    else {
        str = `${str}:`;
        if (keyComment)
            str += lineComment(str, ctx.indent, commentString(keyComment));
    }
    let vcb = '';
    let valueComment = null;
    if (isNode(value)) {
        if (value.spaceBefore)
            vcb = '\n';
        if (value.commentBefore) {
            const cs = commentString(value.commentBefore);
            vcb += `\n${indentComment(cs, ctx.indent)}`;
        }
        valueComment = value.comment;
    }
    else if (value && typeof value === 'object') {
        value = doc.createNode(value);
    }
    ctx.implicitKey = false;
    if (!explicitKey && !keyComment && isScalar(value))
        ctx.indentAtStart = str.length + 1;
    chompKeep = false;
    if (!indentSeq &&
        indentStep.length >= 2 &&
        !ctx.inFlow &&
        !explicitKey &&
        isSeq(value) &&
        !value.flow &&
        !value.tag &&
        !value.anchor) {
        // If indentSeq === false, consider '- ' as part of indentation where possible
        ctx.indent = ctx.indent.substr(2);
    }
    let valueCommentDone = false;
    const valueStr = stringify(value, ctx, () => (valueCommentDone = true), () => (chompKeep = true));
    let ws = ' ';
    if (vcb || keyComment) {
        if (valueStr === '' && !ctx.inFlow)
            ws = vcb === '\n' ? '\n\n' : vcb;
        else
            ws = `${vcb}\n${ctx.indent}`;
    }
    else if (!explicitKey && isCollection(value)) {
        const flow = valueStr[0] === '[' || valueStr[0] === '{';
        if (!flow || valueStr.includes('\n'))
            ws = `\n${ctx.indent}`;
    }
    else if (valueStr === '' || valueStr[0] === '\n')
        ws = '';
    str += ws + valueStr;
    if (ctx.inFlow) {
        if (valueCommentDone && onComment)
            onComment();
    }
    else if (valueComment && !valueCommentDone) {
        str += lineComment(str, ctx.indent, commentString(valueComment));
    }
    else if (chompKeep && onChompKeep) {
        onChompKeep();
    }
    return str;
}

function warn(logLevel, warning) {
    if (logLevel === 'debug' || logLevel === 'warn') {
        if (typeof process !== 'undefined' && process.emitWarning)
            process.emitWarning(warning);
        else
            console.warn(warning);
    }
}

const MERGE_KEY = '<<';
function addPairToJSMap(ctx, map, { key, value }) {
    if (ctx?.doc.schema.merge && isMergeKey(key)) {
        value = isAlias(value) ? value.resolve(ctx.doc) : value;
        if (isSeq(value))
            for (const it of value.items)
                mergeToJSMap(ctx, map, it);
        else if (Array.isArray(value))
            for (const it of value)
                mergeToJSMap(ctx, map, it);
        else
            mergeToJSMap(ctx, map, value);
    }
    else {
        const jsKey = toJS(key, '', ctx);
        if (map instanceof Map) {
            map.set(jsKey, toJS(value, jsKey, ctx));
        }
        else if (map instanceof Set) {
            map.add(jsKey);
        }
        else {
            const stringKey = stringifyKey(key, jsKey, ctx);
            const jsValue = toJS(value, stringKey, ctx);
            if (stringKey in map)
                Object.defineProperty(map, stringKey, {
                    value: jsValue,
                    writable: true,
                    enumerable: true,
                    configurable: true
                });
            else
                map[stringKey] = jsValue;
        }
    }
    return map;
}
const isMergeKey = (key) => key === MERGE_KEY ||
    (isScalar(key) &&
        key.value === MERGE_KEY &&
        (!key.type || key.type === Scalar.PLAIN));
// If the value associated with a merge key is a single mapping node, each of
// its key/value pairs is inserted into the current mapping, unless the key
// already exists in it. If the value associated with the merge key is a
// sequence, then this sequence is expected to contain mapping nodes and each
// of these nodes is merged in turn according to its order in the sequence.
// Keys in mapping nodes earlier in the sequence override keys specified in
// later mapping nodes. -- http://yaml.org/type/merge.html
function mergeToJSMap(ctx, map, value) {
    const source = ctx && isAlias(value) ? value.resolve(ctx.doc) : value;
    if (!isMap(source))
        throw new Error('Merge sources must be maps or map aliases');
    const srcMap = source.toJSON(null, ctx, Map);
    for (const [key, value] of srcMap) {
        if (map instanceof Map) {
            if (!map.has(key))
                map.set(key, value);
        }
        else if (map instanceof Set) {
            map.add(key);
        }
        else if (!Object.prototype.hasOwnProperty.call(map, key)) {
            Object.defineProperty(map, key, {
                value,
                writable: true,
                enumerable: true,
                configurable: true
            });
        }
    }
    return map;
}
function stringifyKey(key, jsKey, ctx) {
    if (jsKey === null)
        return '';
    if (typeof jsKey !== 'object')
        return String(jsKey);
    if (isNode(key) && ctx && ctx.doc) {
        const strCtx = createStringifyContext(ctx.doc, {});
        strCtx.anchors = new Set();
        for (const node of ctx.anchors.keys())
            strCtx.anchors.add(node.anchor);
        strCtx.inFlow = true;
        strCtx.inStringifyKey = true;
        const strKey = key.toString(strCtx);
        if (!ctx.mapKeyWarned) {
            let jsonStr = JSON.stringify(strKey);
            if (jsonStr.length > 40)
                jsonStr = jsonStr.substring(0, 36) + '..."';
            warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
            ctx.mapKeyWarned = true;
        }
        return strKey;
    }
    return JSON.stringify(jsKey);
}

class Pair {
    constructor(key, value = null) {
        Object.defineProperty(this, NODE_TYPE, { value: PAIR });
        this.key = key;
        this.value = value;
    }
    clone(schema) {
        let { key, value } = this;
        if (isNode(key))
            key = key.clone(schema);
        if (isNode(value))
            value = value.clone(schema);
        return new Pair(key, value);
    }
    toJSON(_, ctx) {
        const pair = ctx?.mapAsMap ? new Map() : {};
        return addPairToJSMap(ctx, pair, this);
    }
    toString(ctx, onComment, onChompKeep) {
        return ctx?.doc
            ? stringifyPair(this, ctx, onComment, onChompKeep)
            : JSON.stringify(this);
    }
}

function stringifyCollection(collection, ctx, options) {
    const flow = ctx.inFlow ?? collection.flow;
    const stringify = flow ? stringifyFlowCollection : stringifyBlockCollection;
    return stringify(collection, ctx, options);
}
function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
    const { indent, options: { commentString } } = ctx;
    const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
    let chompKeep = false; // flag for the preceding node's status
    const lines = [];
    for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment = null;
        if (isNode(item)) {
            if (!chompKeep && item.spaceBefore)
                lines.push('');
            addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
            if (item.comment)
                comment = item.comment;
        }
        else if (isPair(item)) {
            const ik = isNode(item.key) ? item.key : null;
            if (ik) {
                if (!chompKeep && ik.spaceBefore)
                    lines.push('');
                addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
            }
        }
        chompKeep = false;
        let str = stringify(item, itemCtx, () => (comment = null), () => (chompKeep = true));
        if (comment)
            str += lineComment(str, itemIndent, commentString(comment));
        if (chompKeep && comment)
            chompKeep = false;
        lines.push(blockItemPrefix + str);
    }
    let str;
    if (lines.length === 0) {
        str = flowChars.start + flowChars.end;
    }
    else {
        str = lines[0];
        for (let i = 1; i < lines.length; ++i) {
            const line = lines[i];
            str += line ? `\n${indent}${line}` : '\n';
        }
    }
    if (comment) {
        str += '\n' + indentComment(commentString(comment), indent);
        if (onComment)
            onComment();
    }
    else if (chompKeep && onChompKeep)
        onChompKeep();
    return str;
}
function stringifyFlowCollection({ comment, items }, ctx, { flowChars, itemIndent, onComment }) {
    const { indent, indentStep, options: { commentString } } = ctx;
    itemIndent += indentStep;
    const itemCtx = Object.assign({}, ctx, {
        indent: itemIndent,
        inFlow: true,
        type: null
    });
    let reqNewline = false;
    let linesAtValue = 0;
    const lines = [];
    for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment = null;
        if (isNode(item)) {
            if (item.spaceBefore)
                lines.push('');
            addCommentBefore(ctx, lines, item.commentBefore, false);
            if (item.comment)
                comment = item.comment;
        }
        else if (isPair(item)) {
            const ik = isNode(item.key) ? item.key : null;
            if (ik) {
                if (ik.spaceBefore)
                    lines.push('');
                addCommentBefore(ctx, lines, ik.commentBefore, false);
                if (ik.comment)
                    reqNewline = true;
            }
            const iv = isNode(item.value) ? item.value : null;
            if (iv) {
                if (iv.comment)
                    comment = iv.comment;
                if (iv.commentBefore)
                    reqNewline = true;
            }
            else if (item.value == null && ik && ik.comment) {
                comment = ik.comment;
            }
        }
        if (comment)
            reqNewline = true;
        let str = stringify(item, itemCtx, () => (comment = null));
        if (i < items.length - 1)
            str += ',';
        if (comment)
            str += lineComment(str, itemIndent, commentString(comment));
        if (!reqNewline && (lines.length > linesAtValue || str.includes('\n')))
            reqNewline = true;
        lines.push(str);
        linesAtValue = lines.length;
    }
    let str;
    const { start, end } = flowChars;
    if (lines.length === 0) {
        str = start + end;
    }
    else {
        if (!reqNewline) {
            const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
            reqNewline = len > Collection.maxFlowStringSingleLineLength;
        }
        if (reqNewline) {
            str = start;
            for (const line of lines)
                str += line ? `\n${indentStep}${indent}${line}` : '\n';
            str += `\n${indent}${end}`;
        }
        else {
            str = `${start} ${lines.join(' ')} ${end}`;
        }
    }
    if (comment) {
        str += lineComment(str, commentString(comment), indent);
        if (onComment)
            onComment();
    }
    return str;
}
function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
    if (comment && chompKeep)
        comment = comment.replace(/^\n+/, '');
    if (comment) {
        const ic = indentComment(commentString(comment), indent);
        lines.push(ic.trimStart()); // Avoid double indent on first line
    }
}

function findPair(items, key) {
    const k = isScalar(key) ? key.value : key;
    for (const it of items) {
        if (isPair(it)) {
            if (it.key === key || it.key === k)
                return it;
            if (isScalar(it.key) && it.key.value === k)
                return it;
        }
    }
    return undefined;
}
class YAMLMap extends Collection {
    constructor(schema) {
        super(MAP, schema);
        this.items = [];
    }
    static get tagName() {
        return 'tag:yaml.org,2002:map';
    }
    /**
     * Adds a value to the collection.
     *
     * @param overwrite - If not set `true`, using a key that is already in the
     *   collection will throw. Otherwise, overwrites the previous value.
     */
    add(pair, overwrite) {
        let _pair;
        if (isPair(pair))
            _pair = pair;
        else if (!pair || typeof pair !== 'object' || !('key' in pair)) {
            // In TypeScript, this never happens.
            _pair = new Pair(pair, pair?.value);
        }
        else
            _pair = new Pair(pair.key, pair.value);
        const prev = findPair(this.items, _pair.key);
        const sortEntries = this.schema?.sortMapEntries;
        if (prev) {
            if (!overwrite)
                throw new Error(`Key ${_pair.key} already set`);
            // For scalars, keep the old node & its comments and anchors
            if (isScalar(prev.value) && isScalarValue(_pair.value))
                prev.value.value = _pair.value;
            else
                prev.value = _pair.value;
        }
        else if (sortEntries) {
            const i = this.items.findIndex(item => sortEntries(_pair, item) < 0);
            if (i === -1)
                this.items.push(_pair);
            else
                this.items.splice(i, 0, _pair);
        }
        else {
            this.items.push(_pair);
        }
    }
    delete(key) {
        const it = findPair(this.items, key);
        if (!it)
            return false;
        const del = this.items.splice(this.items.indexOf(it), 1);
        return del.length > 0;
    }
    get(key, keepScalar) {
        const it = findPair(this.items, key);
        const node = it?.value;
        return (!keepScalar && isScalar(node) ? node.value : node) ?? undefined;
    }
    has(key) {
        return !!findPair(this.items, key);
    }
    set(key, value) {
        this.add(new Pair(key, value), true);
    }
    /**
     * @param ctx - Conversion context, originally set in Document#toJS()
     * @param {Class} Type - If set, forces the returned collection type
     * @returns Instance of Type, Map, or Object
     */
    toJSON(_, ctx, Type) {
        const map = Type ? new Type() : ctx?.mapAsMap ? new Map() : {};
        if (ctx?.onCreate)
            ctx.onCreate(map);
        for (const item of this.items)
            addPairToJSMap(ctx, map, item);
        return map;
    }
    toString(ctx, onComment, onChompKeep) {
        if (!ctx)
            return JSON.stringify(this);
        for (const item of this.items) {
            if (!isPair(item))
                throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
        }
        if (!ctx.allNullValues && this.hasAllNullValues(false))
            ctx = Object.assign({}, ctx, { allNullValues: true });
        return stringifyCollection(this, ctx, {
            blockItemPrefix: '',
            flowChars: { start: '{', end: '}' },
            itemIndent: ctx.indent || '',
            onChompKeep,
            onComment
        });
    }
}

class YAMLSeq extends Collection {
    constructor(schema) {
        super(SEQ, schema);
        this.items = [];
    }
    static get tagName() {
        return 'tag:yaml.org,2002:seq';
    }
    add(value) {
        this.items.push(value);
    }
    /**
     * Removes a value from the collection.
     *
     * `key` must contain a representation of an integer for this to succeed.
     * It may be wrapped in a `Scalar`.
     *
     * @returns `true` if the item was found and removed.
     */
    delete(key) {
        const idx = asItemIndex(key);
        if (typeof idx !== 'number')
            return false;
        const del = this.items.splice(idx, 1);
        return del.length > 0;
    }
    get(key, keepScalar) {
        const idx = asItemIndex(key);
        if (typeof idx !== 'number')
            return undefined;
        const it = this.items[idx];
        return !keepScalar && isScalar(it) ? it.value : it;
    }
    /**
     * Checks if the collection includes a value with the key `key`.
     *
     * `key` must contain a representation of an integer for this to succeed.
     * It may be wrapped in a `Scalar`.
     */
    has(key) {
        const idx = asItemIndex(key);
        return typeof idx === 'number' && idx < this.items.length;
    }
    /**
     * Sets a value in this collection. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     *
     * If `key` does not contain a representation of an integer, this will throw.
     * It may be wrapped in a `Scalar`.
     */
    set(key, value) {
        const idx = asItemIndex(key);
        if (typeof idx !== 'number')
            throw new Error(`Expected a valid index, not ${key}.`);
        const prev = this.items[idx];
        if (isScalar(prev) && isScalarValue(value))
            prev.value = value;
        else
            this.items[idx] = value;
    }
    toJSON(_, ctx) {
        const seq = [];
        if (ctx?.onCreate)
            ctx.onCreate(seq);
        let i = 0;
        for (const item of this.items)
            seq.push(toJS(item, String(i++), ctx));
        return seq;
    }
    toString(ctx, onComment, onChompKeep) {
        if (!ctx)
            return JSON.stringify(this);
        return stringifyCollection(this, ctx, {
            blockItemPrefix: '- ',
            flowChars: { start: '[', end: ']' },
            itemIndent: (ctx.indent || '') + '  ',
            onChompKeep,
            onComment
        });
    }
}
function asItemIndex(key) {
    let idx = isScalar(key) ? key.value : key;
    if (idx && typeof idx === 'string')
        idx = Number(idx);
    return typeof idx === 'number' && Number.isInteger(idx) && idx >= 0
        ? idx
        : null;
}

class YAMLOMap extends YAMLSeq {
    constructor() {
        super();
        this.add = YAMLMap.prototype.add.bind(this);
        this.delete = YAMLMap.prototype.delete.bind(this);
        this.get = YAMLMap.prototype.get.bind(this);
        this.has = YAMLMap.prototype.has.bind(this);
        this.set = YAMLMap.prototype.set.bind(this);
        this.tag = YAMLOMap.tag;
    }
    /**
     * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
     * but TypeScript won't allow widening the signature of a child method.
     */
    toJSON(_, ctx) {
        if (!ctx)
            return super.toJSON(_);
        const map = new Map();
        if (ctx?.onCreate)
            ctx.onCreate(map);
        for (const pair of this.items) {
            let key, value;
            if (isPair(pair)) {
                key = toJS(pair.key, '', ctx);
                value = toJS(pair.value, key, ctx);
            }
            else {
                key = toJS(pair, '', ctx);
            }
            if (map.has(key))
                throw new Error('Ordered maps must not include duplicate keys');
            map.set(key, value);
        }
        return map;
    }
}
YAMLOMap.tag = 'tag:yaml.org,2002:omap';

class YAMLSet extends YAMLMap {
    constructor(schema) {
        super(schema);
        this.tag = YAMLSet.tag;
    }
    add(key) {
        let pair;
        if (isPair(key))
            pair = key;
        else if (typeof key === 'object' &&
            'key' in key &&
            'value' in key &&
            key.value === null)
            pair = new Pair(key.key, null);
        else
            pair = new Pair(key, null);
        const prev = findPair(this.items, pair.key);
        if (!prev)
            this.items.push(pair);
    }
    /**
     * If `keepPair` is `true`, returns the Pair matching `key`.
     * Otherwise, returns the value of that Pair's key.
     */
    get(key, keepPair) {
        const pair = findPair(this.items, key);
        return !keepPair && isPair(pair)
            ? isScalar(pair.key)
                ? pair.key.value
                : pair.key
            : pair;
    }
    set(key, value) {
        if (typeof value !== 'boolean')
            throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
        const prev = findPair(this.items, key);
        if (prev && !value) {
            this.items.splice(this.items.indexOf(prev), 1);
        }
        else if (!prev && value) {
            this.items.push(new Pair(key));
        }
    }
    toJSON(_, ctx) {
        return super.toJSON(_, ctx, Set);
    }
    toString(ctx, onComment, onChompKeep) {
        if (!ctx)
            return JSON.stringify(this);
        if (this.hasAllNullValues(true))
            return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
        else
            throw new Error('Set items must all have null values');
    }
}
YAMLSet.tag = 'tag:yaml.org,2002:set';

// Copyright 2022 Google LLC
minimist(process.argv.slice(2));
Object.assign(function globby$1(patterns, options) {
    return globby(patterns, options);
}, globbyModule);

const cwd = process.cwd(); // 获取node进程的当前工作目录
const templatePath = (...dir) => require$$0$4.resolve(__dirname, '../template', ...dir);
const execute = (options) => {
    const { projectName, pickPresets, hasProjectDir } = options;
    const root = require$$0$4.join(cwd, projectName);
    if (hasProjectDir) {
        lib$1.removeSync(root);
    }
    else {
        lib$1.ensureDirSync(root);
    }
    if (pickPresets === 'react') {
        lib$1.copySync(templatePath('typescript-react'), root);
    }
    if (pickPresets === 'vue') {
        lib$1.copySync(templatePath('typescript-vue'), root);
    }
    hadnleProcess(root);
};
const hadnleProcess = async (root) => {
    const projectName = root.split('/').at(-1);
    $.verbose = false;
    await cd(`/${root}`);
    await $ `git init`;
    console.log(`\n\n ${chalk.greenBright(`进入${projectName}目录啦，正在安装依赖，请稍等...`)}\n\n`);
    await $ `pnpm i`;
    console.log(` ${chalk.greenBright('依赖安装完啦')}\n`);
};

var prompts$2 = {};

var kleur;
var hasRequiredKleur;

function requireKleur () {
	if (hasRequiredKleur) return kleur;
	hasRequiredKleur = 1;

	const { FORCE_COLOR, NODE_DISABLE_COLORS, TERM } = process.env;

	const $ = {
		enabled: !NODE_DISABLE_COLORS && TERM !== 'dumb' && FORCE_COLOR !== '0',

		// modifiers
		reset: init(0, 0),
		bold: init(1, 22),
		dim: init(2, 22),
		italic: init(3, 23),
		underline: init(4, 24),
		inverse: init(7, 27),
		hidden: init(8, 28),
		strikethrough: init(9, 29),

		// colors
		black: init(30, 39),
		red: init(31, 39),
		green: init(32, 39),
		yellow: init(33, 39),
		blue: init(34, 39),
		magenta: init(35, 39),
		cyan: init(36, 39),
		white: init(37, 39),
		gray: init(90, 39),
		grey: init(90, 39),

		// background colors
		bgBlack: init(40, 49),
		bgRed: init(41, 49),
		bgGreen: init(42, 49),
		bgYellow: init(43, 49),
		bgBlue: init(44, 49),
		bgMagenta: init(45, 49),
		bgCyan: init(46, 49),
		bgWhite: init(47, 49)
	};

	function run(arr, str) {
		let i=0, tmp, beg='', end='';
		for (; i < arr.length; i++) {
			tmp = arr[i];
			beg += tmp.open;
			end += tmp.close;
			if (str.includes(tmp.close)) {
				str = str.replace(tmp.rgx, tmp.close + tmp.open);
			}
		}
		return beg + str + end;
	}

	function chain(has, keys) {
		let ctx = { has, keys };

		ctx.reset = $.reset.bind(ctx);
		ctx.bold = $.bold.bind(ctx);
		ctx.dim = $.dim.bind(ctx);
		ctx.italic = $.italic.bind(ctx);
		ctx.underline = $.underline.bind(ctx);
		ctx.inverse = $.inverse.bind(ctx);
		ctx.hidden = $.hidden.bind(ctx);
		ctx.strikethrough = $.strikethrough.bind(ctx);

		ctx.black = $.black.bind(ctx);
		ctx.red = $.red.bind(ctx);
		ctx.green = $.green.bind(ctx);
		ctx.yellow = $.yellow.bind(ctx);
		ctx.blue = $.blue.bind(ctx);
		ctx.magenta = $.magenta.bind(ctx);
		ctx.cyan = $.cyan.bind(ctx);
		ctx.white = $.white.bind(ctx);
		ctx.gray = $.gray.bind(ctx);
		ctx.grey = $.grey.bind(ctx);

		ctx.bgBlack = $.bgBlack.bind(ctx);
		ctx.bgRed = $.bgRed.bind(ctx);
		ctx.bgGreen = $.bgGreen.bind(ctx);
		ctx.bgYellow = $.bgYellow.bind(ctx);
		ctx.bgBlue = $.bgBlue.bind(ctx);
		ctx.bgMagenta = $.bgMagenta.bind(ctx);
		ctx.bgCyan = $.bgCyan.bind(ctx);
		ctx.bgWhite = $.bgWhite.bind(ctx);

		return ctx;
	}

	function init(open, close) {
		let blk = {
			open: `\x1b[${open}m`,
			close: `\x1b[${close}m`,
			rgx: new RegExp(`\\x1b\\[${close}m`, 'g')
		};
		return function (txt) {
			if (this !== void 0 && this.has !== void 0) {
				this.has.includes(open) || (this.has.push(open),this.keys.push(blk));
				return txt === void 0 ? this : $.enabled ? run(this.keys, txt+'') : txt+'';
			}
			return txt === void 0 ? chain([open], [blk]) : $.enabled ? run([blk], txt+'') : txt+'';
		};
	}

	kleur = $;
	return kleur;
}

var action$1;
var hasRequiredAction$1;

function requireAction$1 () {
	if (hasRequiredAction$1) return action$1;
	hasRequiredAction$1 = 1;

	action$1 = (key, isSelect) => {
	  if (key.meta && key.name !== 'escape') return;

	  if (key.ctrl) {
	    if (key.name === 'a') return 'first';
	    if (key.name === 'c') return 'abort';
	    if (key.name === 'd') return 'abort';
	    if (key.name === 'e') return 'last';
	    if (key.name === 'g') return 'reset';
	  }

	  if (isSelect) {
	    if (key.name === 'j') return 'down';
	    if (key.name === 'k') return 'up';
	  }

	  if (key.name === 'return') return 'submit';
	  if (key.name === 'enter') return 'submit'; // ctrl + J

	  if (key.name === 'backspace') return 'delete';
	  if (key.name === 'delete') return 'deleteForward';
	  if (key.name === 'abort') return 'abort';
	  if (key.name === 'escape') return 'exit';
	  if (key.name === 'tab') return 'next';
	  if (key.name === 'pagedown') return 'nextPage';
	  if (key.name === 'pageup') return 'prevPage'; // TODO create home() in prompt types (e.g. TextPrompt)

	  if (key.name === 'home') return 'home'; // TODO create end() in prompt types (e.g. TextPrompt)

	  if (key.name === 'end') return 'end';
	  if (key.name === 'up') return 'up';
	  if (key.name === 'down') return 'down';
	  if (key.name === 'right') return 'right';
	  if (key.name === 'left') return 'left';
	  return false;
	};
	return action$1;
}

var strip$1;
var hasRequiredStrip$1;

function requireStrip$1 () {
	if (hasRequiredStrip$1) return strip$1;
	hasRequiredStrip$1 = 1;

	strip$1 = str => {
	  const pattern = ['[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)', '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))'].join('|');
	  const RGX = new RegExp(pattern, 'g');
	  return typeof str === 'string' ? str.replace(RGX, '') : str;
	};
	return strip$1;
}

var src;
var hasRequiredSrc;

function requireSrc () {
	if (hasRequiredSrc) return src;
	hasRequiredSrc = 1;

	const ESC = '\x1B';
	const CSI = `${ESC}[`;
	const beep = '\u0007';

	const cursor = {
	  to(x, y) {
	    if (!y) return `${CSI}${x + 1}G`;
	    return `${CSI}${y + 1};${x + 1}H`;
	  },
	  move(x, y) {
	    let ret = '';

	    if (x < 0) ret += `${CSI}${-x}D`;
	    else if (x > 0) ret += `${CSI}${x}C`;

	    if (y < 0) ret += `${CSI}${-y}A`;
	    else if (y > 0) ret += `${CSI}${y}B`;

	    return ret;
	  },
	  up: (count = 1) => `${CSI}${count}A`,
	  down: (count = 1) => `${CSI}${count}B`,
	  forward: (count = 1) => `${CSI}${count}C`,
	  backward: (count = 1) => `${CSI}${count}D`,
	  nextLine: (count = 1) => `${CSI}E`.repeat(count),
	  prevLine: (count = 1) => `${CSI}F`.repeat(count),
	  left: `${CSI}G`,
	  hide: `${CSI}?25l`,
	  show: `${CSI}?25h`,
	  save: `${ESC}7`,
	  restore: `${ESC}8`
	};

	const scroll = {
	  up: (count = 1) => `${CSI}S`.repeat(count),
	  down: (count = 1) => `${CSI}T`.repeat(count)
	};

	const erase = {
	  screen: `${CSI}2J`,
	  up: (count = 1) => `${CSI}1J`.repeat(count),
	  down: (count = 1) => `${CSI}J`.repeat(count),
	  line: `${CSI}2K`,
	  lineEnd: `${CSI}K`,
	  lineStart: `${CSI}1K`,
	  lines(count) {
	    let clear = '';
	    for (let i = 0; i < count; i++)
	      clear += this.line + (i < count - 1 ? cursor.up() : '');
	    if (count)
	      clear += cursor.left;
	    return clear;
	  }
	};

	src = { cursor, scroll, erase, beep };
	return src;
}

var clear$1;
var hasRequiredClear$1;

function requireClear$1 () {
	if (hasRequiredClear$1) return clear$1;
	hasRequiredClear$1 = 1;

	function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

	function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

	function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

	const strip = requireStrip$1();

	const _require = requireSrc(),
	      erase = _require.erase,
	      cursor = _require.cursor;

	const width = str => [...strip(str)].length;
	/**
	 * @param {string} prompt
	 * @param {number} perLine
	 */


	clear$1 = function (prompt, perLine) {
	  if (!perLine) return erase.line + cursor.to(0);
	  let rows = 0;
	  const lines = prompt.split(/\r?\n/);

	  var _iterator = _createForOfIteratorHelper(lines),
	      _step;

	  try {
	    for (_iterator.s(); !(_step = _iterator.n()).done;) {
	      let line = _step.value;
	      rows += 1 + Math.floor(Math.max(width(line) - 1, 0) / perLine);
	    }
	  } catch (err) {
	    _iterator.e(err);
	  } finally {
	    _iterator.f();
	  }

	  return erase.lines(rows);
	};
	return clear$1;
}

var figures_1$1;
var hasRequiredFigures$1;

function requireFigures$1 () {
	if (hasRequiredFigures$1) return figures_1$1;
	hasRequiredFigures$1 = 1;

	const main = {
	  arrowUp: '↑',
	  arrowDown: '↓',
	  arrowLeft: '←',
	  arrowRight: '→',
	  radioOn: '◉',
	  radioOff: '◯',
	  tick: '✔',
	  cross: '✖',
	  ellipsis: '…',
	  pointerSmall: '›',
	  line: '─',
	  pointer: '❯'
	};
	const win = {
	  arrowUp: main.arrowUp,
	  arrowDown: main.arrowDown,
	  arrowLeft: main.arrowLeft,
	  arrowRight: main.arrowRight,
	  radioOn: '(*)',
	  radioOff: '( )',
	  tick: '√',
	  cross: '×',
	  ellipsis: '...',
	  pointerSmall: '»',
	  line: '─',
	  pointer: '>'
	};
	const figures = process.platform === 'win32' ? win : main;
	figures_1$1 = figures;
	return figures_1$1;
}

var style$1;
var hasRequiredStyle$1;

function requireStyle$1 () {
	if (hasRequiredStyle$1) return style$1;
	hasRequiredStyle$1 = 1;

	const c = requireKleur();

	const figures = requireFigures$1(); // rendering user input.


	const styles = Object.freeze({
	  password: {
	    scale: 1,
	    render: input => '*'.repeat(input.length)
	  },
	  emoji: {
	    scale: 2,
	    render: input => '😃'.repeat(input.length)
	  },
	  invisible: {
	    scale: 0,
	    render: input => ''
	  },
	  default: {
	    scale: 1,
	    render: input => `${input}`
	  }
	});

	const render = type => styles[type] || styles.default; // icon to signalize a prompt.


	const symbols = Object.freeze({
	  aborted: c.red(figures.cross),
	  done: c.green(figures.tick),
	  exited: c.yellow(figures.cross),
	  default: c.cyan('?')
	});

	const symbol = (done, aborted, exited) => aborted ? symbols.aborted : exited ? symbols.exited : done ? symbols.done : symbols.default; // between the question and the user's input.


	const delimiter = completing => c.gray(completing ? figures.ellipsis : figures.pointerSmall);

	const item = (expandable, expanded) => c.gray(expandable ? expanded ? figures.pointerSmall : '+' : figures.line);

	style$1 = {
	  styles,
	  render,
	  symbols,
	  symbol,
	  delimiter,
	  item
	};
	return style$1;
}

var lines$1;
var hasRequiredLines$1;

function requireLines$1 () {
	if (hasRequiredLines$1) return lines$1;
	hasRequiredLines$1 = 1;

	const strip = requireStrip$1();
	/**
	 * @param {string} msg
	 * @param {number} perLine
	 */


	lines$1 = function (msg, perLine) {
	  let lines = String(strip(msg) || '').split(/\r?\n/);
	  if (!perLine) return lines.length;
	  return lines.map(l => Math.ceil(l.length / perLine)).reduce((a, b) => a + b);
	};
	return lines$1;
}

var wrap$1;
var hasRequiredWrap$1;

function requireWrap$1 () {
	if (hasRequiredWrap$1) return wrap$1;
	hasRequiredWrap$1 = 1;
	/**
	 * @param {string} msg The message to wrap
	 * @param {object} opts
	 * @param {number|string} [opts.margin] Left margin
	 * @param {number} opts.width Maximum characters per line including the margin
	 */

	wrap$1 = (msg, opts = {}) => {
	  const tab = Number.isSafeInteger(parseInt(opts.margin)) ? new Array(parseInt(opts.margin)).fill(' ').join('') : opts.margin || '';
	  const width = opts.width;
	  return (msg || '').split(/\r?\n/g).map(line => line.split(/\s+/g).reduce((arr, w) => {
	    if (w.length + tab.length >= width || arr[arr.length - 1].length + w.length + 1 < width) arr[arr.length - 1] += ` ${w}`;else arr.push(`${tab}${w}`);
	    return arr;
	  }, [tab]).join('\n')).join('\n');
	};
	return wrap$1;
}

var entriesToDisplay$1;
var hasRequiredEntriesToDisplay$1;

function requireEntriesToDisplay$1 () {
	if (hasRequiredEntriesToDisplay$1) return entriesToDisplay$1;
	hasRequiredEntriesToDisplay$1 = 1;
	/**
	 * Determine what entries should be displayed on the screen, based on the
	 * currently selected index and the maximum visible. Used in list-based
	 * prompts like `select` and `multiselect`.
	 *
	 * @param {number} cursor the currently selected entry
	 * @param {number} total the total entries available to display
	 * @param {number} [maxVisible] the number of entries that can be displayed
	 */

	entriesToDisplay$1 = (cursor, total, maxVisible) => {
	  maxVisible = maxVisible || total;
	  let startIndex = Math.min(total - maxVisible, cursor - Math.floor(maxVisible / 2));
	  if (startIndex < 0) startIndex = 0;
	  let endIndex = Math.min(startIndex + maxVisible, total);
	  return {
	    startIndex,
	    endIndex
	  };
	};
	return entriesToDisplay$1;
}

var util$1;
var hasRequiredUtil$1;

function requireUtil$1 () {
	if (hasRequiredUtil$1) return util$1;
	hasRequiredUtil$1 = 1;

	util$1 = {
	  action: requireAction$1(),
	  clear: requireClear$1(),
	  style: requireStyle$1(),
	  strip: requireStrip$1(),
	  figures: requireFigures$1(),
	  lines: requireLines$1(),
	  wrap: requireWrap$1(),
	  entriesToDisplay: requireEntriesToDisplay$1()
	};
	return util$1;
}

var prompt$1;
var hasRequiredPrompt$1;

function requirePrompt$1 () {
	if (hasRequiredPrompt$1) return prompt$1;
	hasRequiredPrompt$1 = 1;

	const readline = require$$0__default$6["default"];

	const _require = requireUtil$1(),
	      action = _require.action;

	const EventEmitter = require$$2__default$1["default"];

	const _require2 = requireSrc(),
	      beep = _require2.beep,
	      cursor = _require2.cursor;

	const color = requireKleur();
	/**
	 * Base prompt skeleton
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 */


	class Prompt extends EventEmitter {
	  constructor(opts = {}) {
	    super();
	    this.firstRender = true;
	    this.in = opts.stdin || process.stdin;
	    this.out = opts.stdout || process.stdout;

	    this.onRender = (opts.onRender || (() => void 0)).bind(this);

	    const rl = readline.createInterface({
	      input: this.in,
	      escapeCodeTimeout: 50
	    });
	    readline.emitKeypressEvents(this.in, rl);
	    if (this.in.isTTY) this.in.setRawMode(true);
	    const isSelect = ['SelectPrompt', 'MultiselectPrompt'].indexOf(this.constructor.name) > -1;

	    const keypress = (str, key) => {
	      let a = action(key, isSelect);

	      if (a === false) {
	        this._ && this._(str, key);
	      } else if (typeof this[a] === 'function') {
	        this[a](key);
	      } else {
	        this.bell();
	      }
	    };

	    this.close = () => {
	      this.out.write(cursor.show);
	      this.in.removeListener('keypress', keypress);
	      if (this.in.isTTY) this.in.setRawMode(false);
	      rl.close();
	      this.emit(this.aborted ? 'abort' : this.exited ? 'exit' : 'submit', this.value);
	      this.closed = true;
	    };

	    this.in.on('keypress', keypress);
	  }

	  fire() {
	    this.emit('state', {
	      value: this.value,
	      aborted: !!this.aborted,
	      exited: !!this.exited
	    });
	  }

	  bell() {
	    this.out.write(beep);
	  }

	  render() {
	    this.onRender(color);
	    if (this.firstRender) this.firstRender = false;
	  }

	}

	prompt$1 = Prompt;
	return prompt$1;
}

var text$1;
var hasRequiredText$1;

function requireText$1 () {
	if (hasRequiredText$1) return text$1;
	hasRequiredText$1 = 1;

	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

	function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

	const color = requireKleur();

	const Prompt = requirePrompt$1();

	const _require = requireSrc(),
	      erase = _require.erase,
	      cursor = _require.cursor;

	const _require2 = requireUtil$1(),
	      style = _require2.style,
	      clear = _require2.clear,
	      lines = _require2.lines,
	      figures = _require2.figures;
	/**
	 * TextPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {String} [opts.style='default'] Render style
	 * @param {String} [opts.initial] Default value
	 * @param {Function} [opts.validate] Validate function
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 * @param {String} [opts.error] The invalid error label
	 */


	class TextPrompt extends Prompt {
	  constructor(opts = {}) {
	    super(opts);
	    this.transform = style.render(opts.style);
	    this.scale = this.transform.scale;
	    this.msg = opts.message;
	    this.initial = opts.initial || ``;

	    this.validator = opts.validate || (() => true);

	    this.value = ``;
	    this.errorMsg = opts.error || `Please Enter A Valid Value`;
	    this.cursor = Number(!!this.initial);
	    this.cursorOffset = 0;
	    this.clear = clear(``, this.out.columns);
	    this.render();
	  }

	  set value(v) {
	    if (!v && this.initial) {
	      this.placeholder = true;
	      this.rendered = color.gray(this.transform.render(this.initial));
	    } else {
	      this.placeholder = false;
	      this.rendered = this.transform.render(v);
	    }

	    this._value = v;
	    this.fire();
	  }

	  get value() {
	    return this._value;
	  }

	  reset() {
	    this.value = ``;
	    this.cursor = Number(!!this.initial);
	    this.cursorOffset = 0;
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.value = this.value || this.initial;
	    this.done = this.aborted = true;
	    this.error = false;
	    this.red = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  validate() {
	    var _this = this;

	    return _asyncToGenerator(function* () {
	      let valid = yield _this.validator(_this.value);

	      if (typeof valid === `string`) {
	        _this.errorMsg = valid;
	        valid = false;
	      }

	      _this.error = !valid;
	    })();
	  }

	  submit() {
	    var _this2 = this;

	    return _asyncToGenerator(function* () {
	      _this2.value = _this2.value || _this2.initial;
	      _this2.cursorOffset = 0;
	      _this2.cursor = _this2.rendered.length;
	      yield _this2.validate();

	      if (_this2.error) {
	        _this2.red = true;

	        _this2.fire();

	        _this2.render();

	        return;
	      }

	      _this2.done = true;
	      _this2.aborted = false;

	      _this2.fire();

	      _this2.render();

	      _this2.out.write('\n');

	      _this2.close();
	    })();
	  }

	  next() {
	    if (!this.placeholder) return this.bell();
	    this.value = this.initial;
	    this.cursor = this.rendered.length;
	    this.fire();
	    this.render();
	  }

	  moveCursor(n) {
	    if (this.placeholder) return;
	    this.cursor = this.cursor + n;
	    this.cursorOffset += n;
	  }

	  _(c, key) {
	    let s1 = this.value.slice(0, this.cursor);
	    let s2 = this.value.slice(this.cursor);
	    this.value = `${s1}${c}${s2}`;
	    this.red = false;
	    this.cursor = this.placeholder ? 0 : s1.length + 1;
	    this.render();
	  }

	  delete() {
	    if (this.isCursorAtStart()) return this.bell();
	    let s1 = this.value.slice(0, this.cursor - 1);
	    let s2 = this.value.slice(this.cursor);
	    this.value = `${s1}${s2}`;
	    this.red = false;

	    if (this.isCursorAtStart()) {
	      this.cursorOffset = 0;
	    } else {
	      this.cursorOffset++;
	      this.moveCursor(-1);
	    }

	    this.render();
	  }

	  deleteForward() {
	    if (this.cursor * this.scale >= this.rendered.length || this.placeholder) return this.bell();
	    let s1 = this.value.slice(0, this.cursor);
	    let s2 = this.value.slice(this.cursor + 1);
	    this.value = `${s1}${s2}`;
	    this.red = false;

	    if (this.isCursorAtEnd()) {
	      this.cursorOffset = 0;
	    } else {
	      this.cursorOffset++;
	    }

	    this.render();
	  }

	  first() {
	    this.cursor = 0;
	    this.render();
	  }

	  last() {
	    this.cursor = this.value.length;
	    this.render();
	  }

	  left() {
	    if (this.cursor <= 0 || this.placeholder) return this.bell();
	    this.moveCursor(-1);
	    this.render();
	  }

	  right() {
	    if (this.cursor * this.scale >= this.rendered.length || this.placeholder) return this.bell();
	    this.moveCursor(1);
	    this.render();
	  }

	  isCursorAtStart() {
	    return this.cursor === 0 || this.placeholder && this.cursor === 1;
	  }

	  isCursorAtEnd() {
	    return this.cursor === this.rendered.length || this.placeholder && this.cursor === this.rendered.length + 1;
	  }

	  render() {
	    if (this.closed) return;

	    if (!this.firstRender) {
	      if (this.outputError) this.out.write(cursor.down(lines(this.outputError, this.out.columns) - 1) + clear(this.outputError, this.out.columns));
	      this.out.write(clear(this.outputText, this.out.columns));
	    }

	    super.render();
	    this.outputError = '';
	    this.outputText = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(this.done), this.red ? color.red(this.rendered) : this.rendered].join(` `);

	    if (this.error) {
	      this.outputError += this.errorMsg.split(`\n`).reduce((a, l, i) => a + `\n${i ? ' ' : figures.pointerSmall} ${color.red().italic(l)}`, ``);
	    }

	    this.out.write(erase.line + cursor.to(0) + this.outputText + cursor.save + this.outputError + cursor.restore + cursor.move(this.cursorOffset, 0));
	  }

	}

	text$1 = TextPrompt;
	return text$1;
}

var select$1;
var hasRequiredSelect$1;

function requireSelect$1 () {
	if (hasRequiredSelect$1) return select$1;
	hasRequiredSelect$1 = 1;

	const color = requireKleur();

	const Prompt = requirePrompt$1();

	const _require = requireUtil$1(),
	      style = _require.style,
	      clear = _require.clear,
	      figures = _require.figures,
	      wrap = _require.wrap,
	      entriesToDisplay = _require.entriesToDisplay;

	const _require2 = requireSrc(),
	      cursor = _require2.cursor;
	/**
	 * SelectPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Array} opts.choices Array of choice objects
	 * @param {String} [opts.hint] Hint to display
	 * @param {Number} [opts.initial] Index of default value
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 * @param {Number} [opts.optionsPerPage=10] Max options to display at once
	 */


	class SelectPrompt extends Prompt {
	  constructor(opts = {}) {
	    super(opts);
	    this.msg = opts.message;
	    this.hint = opts.hint || '- Use arrow-keys. Return to submit.';
	    this.warn = opts.warn || '- This option is disabled';
	    this.cursor = opts.initial || 0;
	    this.choices = opts.choices.map((ch, idx) => {
	      if (typeof ch === 'string') ch = {
	        title: ch,
	        value: idx
	      };
	      return {
	        title: ch && (ch.title || ch.value || ch),
	        value: ch && (ch.value === undefined ? idx : ch.value),
	        description: ch && ch.description,
	        selected: ch && ch.selected,
	        disabled: ch && ch.disabled
	      };
	    });
	    this.optionsPerPage = opts.optionsPerPage || 10;
	    this.value = (this.choices[this.cursor] || {}).value;
	    this.clear = clear('', this.out.columns);
	    this.render();
	  }

	  moveCursor(n) {
	    this.cursor = n;
	    this.value = this.choices[n].value;
	    this.fire();
	  }

	  reset() {
	    this.moveCursor(0);
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  submit() {
	    if (!this.selection.disabled) {
	      this.done = true;
	      this.aborted = false;
	      this.fire();
	      this.render();
	      this.out.write('\n');
	      this.close();
	    } else this.bell();
	  }

	  first() {
	    this.moveCursor(0);
	    this.render();
	  }

	  last() {
	    this.moveCursor(this.choices.length - 1);
	    this.render();
	  }

	  up() {
	    if (this.cursor === 0) {
	      this.moveCursor(this.choices.length - 1);
	    } else {
	      this.moveCursor(this.cursor - 1);
	    }

	    this.render();
	  }

	  down() {
	    if (this.cursor === this.choices.length - 1) {
	      this.moveCursor(0);
	    } else {
	      this.moveCursor(this.cursor + 1);
	    }

	    this.render();
	  }

	  next() {
	    this.moveCursor((this.cursor + 1) % this.choices.length);
	    this.render();
	  }

	  _(c, key) {
	    if (c === ' ') return this.submit();
	  }

	  get selection() {
	    return this.choices[this.cursor];
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);else this.out.write(clear(this.outputText, this.out.columns));
	    super.render();

	    let _entriesToDisplay = entriesToDisplay(this.cursor, this.choices.length, this.optionsPerPage),
	        startIndex = _entriesToDisplay.startIndex,
	        endIndex = _entriesToDisplay.endIndex; // Print prompt


	    this.outputText = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(false), this.done ? this.selection.title : this.selection.disabled ? color.yellow(this.warn) : color.gray(this.hint)].join(' '); // Print choices

	    if (!this.done) {
	      this.outputText += '\n';

	      for (let i = startIndex; i < endIndex; i++) {
	        let title,
	            prefix,
	            desc = '',
	            v = this.choices[i]; // Determine whether to display "more choices" indicators

	        if (i === startIndex && startIndex > 0) {
	          prefix = figures.arrowUp;
	        } else if (i === endIndex - 1 && endIndex < this.choices.length) {
	          prefix = figures.arrowDown;
	        } else {
	          prefix = ' ';
	        }

	        if (v.disabled) {
	          title = this.cursor === i ? color.gray().underline(v.title) : color.strikethrough().gray(v.title);
	          prefix = (this.cursor === i ? color.bold().gray(figures.pointer) + ' ' : '  ') + prefix;
	        } else {
	          title = this.cursor === i ? color.cyan().underline(v.title) : v.title;
	          prefix = (this.cursor === i ? color.cyan(figures.pointer) + ' ' : '  ') + prefix;

	          if (v.description && this.cursor === i) {
	            desc = ` - ${v.description}`;

	            if (prefix.length + title.length + desc.length >= this.out.columns || v.description.split(/\r?\n/).length > 1) {
	              desc = '\n' + wrap(v.description, {
	                margin: 3,
	                width: this.out.columns
	              });
	            }
	          }
	        }

	        this.outputText += `${prefix} ${title}${color.gray(desc)}\n`;
	      }
	    }

	    this.out.write(this.outputText);
	  }

	}

	select$1 = SelectPrompt;
	return select$1;
}

var toggle$1;
var hasRequiredToggle$1;

function requireToggle$1 () {
	if (hasRequiredToggle$1) return toggle$1;
	hasRequiredToggle$1 = 1;

	const color = requireKleur();

	const Prompt = requirePrompt$1();

	const _require = requireUtil$1(),
	      style = _require.style,
	      clear = _require.clear;

	const _require2 = requireSrc(),
	      cursor = _require2.cursor,
	      erase = _require2.erase;
	/**
	 * TogglePrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Boolean} [opts.initial=false] Default value
	 * @param {String} [opts.active='no'] Active label
	 * @param {String} [opts.inactive='off'] Inactive label
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 */


	class TogglePrompt extends Prompt {
	  constructor(opts = {}) {
	    super(opts);
	    this.msg = opts.message;
	    this.value = !!opts.initial;
	    this.active = opts.active || 'on';
	    this.inactive = opts.inactive || 'off';
	    this.initialValue = this.value;
	    this.render();
	  }

	  reset() {
	    this.value = this.initialValue;
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  submit() {
	    this.done = true;
	    this.aborted = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  deactivate() {
	    if (this.value === false) return this.bell();
	    this.value = false;
	    this.render();
	  }

	  activate() {
	    if (this.value === true) return this.bell();
	    this.value = true;
	    this.render();
	  }

	  delete() {
	    this.deactivate();
	  }

	  left() {
	    this.deactivate();
	  }

	  right() {
	    this.activate();
	  }

	  down() {
	    this.deactivate();
	  }

	  up() {
	    this.activate();
	  }

	  next() {
	    this.value = !this.value;
	    this.fire();
	    this.render();
	  }

	  _(c, key) {
	    if (c === ' ') {
	      this.value = !this.value;
	    } else if (c === '1') {
	      this.value = true;
	    } else if (c === '0') {
	      this.value = false;
	    } else return this.bell();

	    this.render();
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);else this.out.write(clear(this.outputText, this.out.columns));
	    super.render();
	    this.outputText = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(this.done), this.value ? this.inactive : color.cyan().underline(this.inactive), color.gray('/'), this.value ? color.cyan().underline(this.active) : this.active].join(' ');
	    this.out.write(erase.line + cursor.to(0) + this.outputText);
	  }

	}

	toggle$1 = TogglePrompt;
	return toggle$1;
}

var datepart$1;
var hasRequiredDatepart$1;

function requireDatepart$1 () {
	if (hasRequiredDatepart$1) return datepart$1;
	hasRequiredDatepart$1 = 1;

	class DatePart {
	  constructor({
	    token,
	    date,
	    parts,
	    locales
	  }) {
	    this.token = token;
	    this.date = date || new Date();
	    this.parts = parts || [this];
	    this.locales = locales || {};
	  }

	  up() {}

	  down() {}

	  next() {
	    const currentIdx = this.parts.indexOf(this);
	    return this.parts.find((part, idx) => idx > currentIdx && part instanceof DatePart);
	  }

	  setTo(val) {}

	  prev() {
	    let parts = [].concat(this.parts).reverse();
	    const currentIdx = parts.indexOf(this);
	    return parts.find((part, idx) => idx > currentIdx && part instanceof DatePart);
	  }

	  toString() {
	    return String(this.date);
	  }

	}

	datepart$1 = DatePart;
	return datepart$1;
}

var meridiem$1;
var hasRequiredMeridiem$1;

function requireMeridiem$1 () {
	if (hasRequiredMeridiem$1) return meridiem$1;
	hasRequiredMeridiem$1 = 1;

	const DatePart = requireDatepart$1();

	class Meridiem extends DatePart {
	  constructor(opts = {}) {
	    super(opts);
	  }

	  up() {
	    this.date.setHours((this.date.getHours() + 12) % 24);
	  }

	  down() {
	    this.up();
	  }

	  toString() {
	    let meridiem = this.date.getHours() > 12 ? 'pm' : 'am';
	    return /\A/.test(this.token) ? meridiem.toUpperCase() : meridiem;
	  }

	}

	meridiem$1 = Meridiem;
	return meridiem$1;
}

var day$1;
var hasRequiredDay$1;

function requireDay$1 () {
	if (hasRequiredDay$1) return day$1;
	hasRequiredDay$1 = 1;

	const DatePart = requireDatepart$1();

	const pos = n => {
	  n = n % 10;
	  return n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
	};

	class Day extends DatePart {
	  constructor(opts = {}) {
	    super(opts);
	  }

	  up() {
	    this.date.setDate(this.date.getDate() + 1);
	  }

	  down() {
	    this.date.setDate(this.date.getDate() - 1);
	  }

	  setTo(val) {
	    this.date.setDate(parseInt(val.substr(-2)));
	  }

	  toString() {
	    let date = this.date.getDate();
	    let day = this.date.getDay();
	    return this.token === 'DD' ? String(date).padStart(2, '0') : this.token === 'Do' ? date + pos(date) : this.token === 'd' ? day + 1 : this.token === 'ddd' ? this.locales.weekdaysShort[day] : this.token === 'dddd' ? this.locales.weekdays[day] : date;
	  }

	}

	day$1 = Day;
	return day$1;
}

var hours$1;
var hasRequiredHours$1;

function requireHours$1 () {
	if (hasRequiredHours$1) return hours$1;
	hasRequiredHours$1 = 1;

	const DatePart = requireDatepart$1();

	class Hours extends DatePart {
	  constructor(opts = {}) {
	    super(opts);
	  }

	  up() {
	    this.date.setHours(this.date.getHours() + 1);
	  }

	  down() {
	    this.date.setHours(this.date.getHours() - 1);
	  }

	  setTo(val) {
	    this.date.setHours(parseInt(val.substr(-2)));
	  }

	  toString() {
	    let hours = this.date.getHours();
	    if (/h/.test(this.token)) hours = hours % 12 || 12;
	    return this.token.length > 1 ? String(hours).padStart(2, '0') : hours;
	  }

	}

	hours$1 = Hours;
	return hours$1;
}

var milliseconds$1;
var hasRequiredMilliseconds$1;

function requireMilliseconds$1 () {
	if (hasRequiredMilliseconds$1) return milliseconds$1;
	hasRequiredMilliseconds$1 = 1;

	const DatePart = requireDatepart$1();

	class Milliseconds extends DatePart {
	  constructor(opts = {}) {
	    super(opts);
	  }

	  up() {
	    this.date.setMilliseconds(this.date.getMilliseconds() + 1);
	  }

	  down() {
	    this.date.setMilliseconds(this.date.getMilliseconds() - 1);
	  }

	  setTo(val) {
	    this.date.setMilliseconds(parseInt(val.substr(-this.token.length)));
	  }

	  toString() {
	    return String(this.date.getMilliseconds()).padStart(4, '0').substr(0, this.token.length);
	  }

	}

	milliseconds$1 = Milliseconds;
	return milliseconds$1;
}

var minutes$1;
var hasRequiredMinutes$1;

function requireMinutes$1 () {
	if (hasRequiredMinutes$1) return minutes$1;
	hasRequiredMinutes$1 = 1;

	const DatePart = requireDatepart$1();

	class Minutes extends DatePart {
	  constructor(opts = {}) {
	    super(opts);
	  }

	  up() {
	    this.date.setMinutes(this.date.getMinutes() + 1);
	  }

	  down() {
	    this.date.setMinutes(this.date.getMinutes() - 1);
	  }

	  setTo(val) {
	    this.date.setMinutes(parseInt(val.substr(-2)));
	  }

	  toString() {
	    let m = this.date.getMinutes();
	    return this.token.length > 1 ? String(m).padStart(2, '0') : m;
	  }

	}

	minutes$1 = Minutes;
	return minutes$1;
}

var month$1;
var hasRequiredMonth$1;

function requireMonth$1 () {
	if (hasRequiredMonth$1) return month$1;
	hasRequiredMonth$1 = 1;

	const DatePart = requireDatepart$1();

	class Month extends DatePart {
	  constructor(opts = {}) {
	    super(opts);
	  }

	  up() {
	    this.date.setMonth(this.date.getMonth() + 1);
	  }

	  down() {
	    this.date.setMonth(this.date.getMonth() - 1);
	  }

	  setTo(val) {
	    val = parseInt(val.substr(-2)) - 1;
	    this.date.setMonth(val < 0 ? 0 : val);
	  }

	  toString() {
	    let month = this.date.getMonth();
	    let tl = this.token.length;
	    return tl === 2 ? String(month + 1).padStart(2, '0') : tl === 3 ? this.locales.monthsShort[month] : tl === 4 ? this.locales.months[month] : String(month + 1);
	  }

	}

	month$1 = Month;
	return month$1;
}

var seconds$1;
var hasRequiredSeconds$1;

function requireSeconds$1 () {
	if (hasRequiredSeconds$1) return seconds$1;
	hasRequiredSeconds$1 = 1;

	const DatePart = requireDatepart$1();

	class Seconds extends DatePart {
	  constructor(opts = {}) {
	    super(opts);
	  }

	  up() {
	    this.date.setSeconds(this.date.getSeconds() + 1);
	  }

	  down() {
	    this.date.setSeconds(this.date.getSeconds() - 1);
	  }

	  setTo(val) {
	    this.date.setSeconds(parseInt(val.substr(-2)));
	  }

	  toString() {
	    let s = this.date.getSeconds();
	    return this.token.length > 1 ? String(s).padStart(2, '0') : s;
	  }

	}

	seconds$1 = Seconds;
	return seconds$1;
}

var year$1;
var hasRequiredYear$1;

function requireYear$1 () {
	if (hasRequiredYear$1) return year$1;
	hasRequiredYear$1 = 1;

	const DatePart = requireDatepart$1();

	class Year extends DatePart {
	  constructor(opts = {}) {
	    super(opts);
	  }

	  up() {
	    this.date.setFullYear(this.date.getFullYear() + 1);
	  }

	  down() {
	    this.date.setFullYear(this.date.getFullYear() - 1);
	  }

	  setTo(val) {
	    this.date.setFullYear(val.substr(-4));
	  }

	  toString() {
	    let year = String(this.date.getFullYear()).padStart(4, '0');
	    return this.token.length === 2 ? year.substr(-2) : year;
	  }

	}

	year$1 = Year;
	return year$1;
}

var dateparts$1;
var hasRequiredDateparts$1;

function requireDateparts$1 () {
	if (hasRequiredDateparts$1) return dateparts$1;
	hasRequiredDateparts$1 = 1;

	dateparts$1 = {
	  DatePart: requireDatepart$1(),
	  Meridiem: requireMeridiem$1(),
	  Day: requireDay$1(),
	  Hours: requireHours$1(),
	  Milliseconds: requireMilliseconds$1(),
	  Minutes: requireMinutes$1(),
	  Month: requireMonth$1(),
	  Seconds: requireSeconds$1(),
	  Year: requireYear$1()
	};
	return dateparts$1;
}

var date$1;
var hasRequiredDate$1;

function requireDate$1 () {
	if (hasRequiredDate$1) return date$1;
	hasRequiredDate$1 = 1;

	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

	function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

	const color = requireKleur();

	const Prompt = requirePrompt$1();

	const _require = requireUtil$1(),
	      style = _require.style,
	      clear = _require.clear,
	      figures = _require.figures;

	const _require2 = requireSrc(),
	      erase = _require2.erase,
	      cursor = _require2.cursor;

	const _require3 = requireDateparts$1(),
	      DatePart = _require3.DatePart,
	      Meridiem = _require3.Meridiem,
	      Day = _require3.Day,
	      Hours = _require3.Hours,
	      Milliseconds = _require3.Milliseconds,
	      Minutes = _require3.Minutes,
	      Month = _require3.Month,
	      Seconds = _require3.Seconds,
	      Year = _require3.Year;

	const regex = /\\(.)|"((?:\\["\\]|[^"])+)"|(D[Do]?|d{3,4}|d)|(M{1,4})|(YY(?:YY)?)|([aA])|([Hh]{1,2})|(m{1,2})|(s{1,2})|(S{1,4})|./g;
	const regexGroups = {
	  1: ({
	    token
	  }) => token.replace(/\\(.)/g, '$1'),
	  2: opts => new Day(opts),
	  // Day // TODO
	  3: opts => new Month(opts),
	  // Month
	  4: opts => new Year(opts),
	  // Year
	  5: opts => new Meridiem(opts),
	  // AM/PM // TODO (special)
	  6: opts => new Hours(opts),
	  // Hours
	  7: opts => new Minutes(opts),
	  // Minutes
	  8: opts => new Seconds(opts),
	  // Seconds
	  9: opts => new Milliseconds(opts) // Fractional seconds

	};
	const dfltLocales = {
	  months: 'January,February,March,April,May,June,July,August,September,October,November,December'.split(','),
	  monthsShort: 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(','),
	  weekdays: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'.split(','),
	  weekdaysShort: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat'.split(',')
	};
	/**
	 * DatePrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Number} [opts.initial] Index of default value
	 * @param {String} [opts.mask] The format mask
	 * @param {object} [opts.locales] The date locales
	 * @param {String} [opts.error] The error message shown on invalid value
	 * @param {Function} [opts.validate] Function to validate the submitted value
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 */

	class DatePrompt extends Prompt {
	  constructor(opts = {}) {
	    super(opts);
	    this.msg = opts.message;
	    this.cursor = 0;
	    this.typed = '';
	    this.locales = Object.assign(dfltLocales, opts.locales);
	    this._date = opts.initial || new Date();
	    this.errorMsg = opts.error || 'Please Enter A Valid Value';

	    this.validator = opts.validate || (() => true);

	    this.mask = opts.mask || 'YYYY-MM-DD HH:mm:ss';
	    this.clear = clear('', this.out.columns);
	    this.render();
	  }

	  get value() {
	    return this.date;
	  }

	  get date() {
	    return this._date;
	  }

	  set date(date) {
	    if (date) this._date.setTime(date.getTime());
	  }

	  set mask(mask) {
	    let result;
	    this.parts = [];

	    while (result = regex.exec(mask)) {
	      let match = result.shift();
	      let idx = result.findIndex(gr => gr != null);
	      this.parts.push(idx in regexGroups ? regexGroups[idx]({
	        token: result[idx] || match,
	        date: this.date,
	        parts: this.parts,
	        locales: this.locales
	      }) : result[idx] || match);
	    }

	    let parts = this.parts.reduce((arr, i) => {
	      if (typeof i === 'string' && typeof arr[arr.length - 1] === 'string') arr[arr.length - 1] += i;else arr.push(i);
	      return arr;
	    }, []);
	    this.parts.splice(0);
	    this.parts.push(...parts);
	    this.reset();
	  }

	  moveCursor(n) {
	    this.typed = '';
	    this.cursor = n;
	    this.fire();
	  }

	  reset() {
	    this.moveCursor(this.parts.findIndex(p => p instanceof DatePart));
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.error = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  validate() {
	    var _this = this;

	    return _asyncToGenerator(function* () {
	      let valid = yield _this.validator(_this.value);

	      if (typeof valid === 'string') {
	        _this.errorMsg = valid;
	        valid = false;
	      }

	      _this.error = !valid;
	    })();
	  }

	  submit() {
	    var _this2 = this;

	    return _asyncToGenerator(function* () {
	      yield _this2.validate();

	      if (_this2.error) {
	        _this2.color = 'red';

	        _this2.fire();

	        _this2.render();

	        return;
	      }

	      _this2.done = true;
	      _this2.aborted = false;

	      _this2.fire();

	      _this2.render();

	      _this2.out.write('\n');

	      _this2.close();
	    })();
	  }

	  up() {
	    this.typed = '';
	    this.parts[this.cursor].up();
	    this.render();
	  }

	  down() {
	    this.typed = '';
	    this.parts[this.cursor].down();
	    this.render();
	  }

	  left() {
	    let prev = this.parts[this.cursor].prev();
	    if (prev == null) return this.bell();
	    this.moveCursor(this.parts.indexOf(prev));
	    this.render();
	  }

	  right() {
	    let next = this.parts[this.cursor].next();
	    if (next == null) return this.bell();
	    this.moveCursor(this.parts.indexOf(next));
	    this.render();
	  }

	  next() {
	    let next = this.parts[this.cursor].next();
	    this.moveCursor(next ? this.parts.indexOf(next) : this.parts.findIndex(part => part instanceof DatePart));
	    this.render();
	  }

	  _(c) {
	    if (/\d/.test(c)) {
	      this.typed += c;
	      this.parts[this.cursor].setTo(this.typed);
	      this.render();
	    }
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);else this.out.write(clear(this.outputText, this.out.columns));
	    super.render(); // Print prompt

	    this.outputText = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(false), this.parts.reduce((arr, p, idx) => arr.concat(idx === this.cursor && !this.done ? color.cyan().underline(p.toString()) : p), []).join('')].join(' '); // Print error

	    if (this.error) {
	      this.outputText += this.errorMsg.split('\n').reduce((a, l, i) => a + `\n${i ? ` ` : figures.pointerSmall} ${color.red().italic(l)}`, ``);
	    }

	    this.out.write(erase.line + cursor.to(0) + this.outputText);
	  }

	}

	date$1 = DatePrompt;
	return date$1;
}

var number$1;
var hasRequiredNumber$1;

function requireNumber$1 () {
	if (hasRequiredNumber$1) return number$1;
	hasRequiredNumber$1 = 1;

	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

	function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

	const color = requireKleur();

	const Prompt = requirePrompt$1();

	const _require = requireSrc(),
	      cursor = _require.cursor,
	      erase = _require.erase;

	const _require2 = requireUtil$1(),
	      style = _require2.style,
	      figures = _require2.figures,
	      clear = _require2.clear,
	      lines = _require2.lines;

	const isNumber = /[0-9]/;

	const isDef = any => any !== undefined;

	const round = (number, precision) => {
	  let factor = Math.pow(10, precision);
	  return Math.round(number * factor) / factor;
	};
	/**
	 * NumberPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {String} [opts.style='default'] Render style
	 * @param {Number} [opts.initial] Default value
	 * @param {Number} [opts.max=+Infinity] Max value
	 * @param {Number} [opts.min=-Infinity] Min value
	 * @param {Boolean} [opts.float=false] Parse input as floats
	 * @param {Number} [opts.round=2] Round floats to x decimals
	 * @param {Number} [opts.increment=1] Number to increment by when using arrow-keys
	 * @param {Function} [opts.validate] Validate function
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 * @param {String} [opts.error] The invalid error label
	 */


	class NumberPrompt extends Prompt {
	  constructor(opts = {}) {
	    super(opts);
	    this.transform = style.render(opts.style);
	    this.msg = opts.message;
	    this.initial = isDef(opts.initial) ? opts.initial : '';
	    this.float = !!opts.float;
	    this.round = opts.round || 2;
	    this.inc = opts.increment || 1;
	    this.min = isDef(opts.min) ? opts.min : -Infinity;
	    this.max = isDef(opts.max) ? opts.max : Infinity;
	    this.errorMsg = opts.error || `Please Enter A Valid Value`;

	    this.validator = opts.validate || (() => true);

	    this.color = `cyan`;
	    this.value = ``;
	    this.typed = ``;
	    this.lastHit = 0;
	    this.render();
	  }

	  set value(v) {
	    if (!v && v !== 0) {
	      this.placeholder = true;
	      this.rendered = color.gray(this.transform.render(`${this.initial}`));
	      this._value = ``;
	    } else {
	      this.placeholder = false;
	      this.rendered = this.transform.render(`${round(v, this.round)}`);
	      this._value = round(v, this.round);
	    }

	    this.fire();
	  }

	  get value() {
	    return this._value;
	  }

	  parse(x) {
	    return this.float ? parseFloat(x) : parseInt(x);
	  }

	  valid(c) {
	    return c === `-` || c === `.` && this.float || isNumber.test(c);
	  }

	  reset() {
	    this.typed = ``;
	    this.value = ``;
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    let x = this.value;
	    this.value = x !== `` ? x : this.initial;
	    this.done = this.aborted = true;
	    this.error = false;
	    this.fire();
	    this.render();
	    this.out.write(`\n`);
	    this.close();
	  }

	  validate() {
	    var _this = this;

	    return _asyncToGenerator(function* () {
	      let valid = yield _this.validator(_this.value);

	      if (typeof valid === `string`) {
	        _this.errorMsg = valid;
	        valid = false;
	      }

	      _this.error = !valid;
	    })();
	  }

	  submit() {
	    var _this2 = this;

	    return _asyncToGenerator(function* () {
	      yield _this2.validate();

	      if (_this2.error) {
	        _this2.color = `red`;

	        _this2.fire();

	        _this2.render();

	        return;
	      }

	      let x = _this2.value;
	      _this2.value = x !== `` ? x : _this2.initial;
	      _this2.done = true;
	      _this2.aborted = false;
	      _this2.error = false;

	      _this2.fire();

	      _this2.render();

	      _this2.out.write(`\n`);

	      _this2.close();
	    })();
	  }

	  up() {
	    this.typed = ``;

	    if (this.value === '') {
	      this.value = this.min - this.inc;
	    }

	    if (this.value >= this.max) return this.bell();
	    this.value += this.inc;
	    this.color = `cyan`;
	    this.fire();
	    this.render();
	  }

	  down() {
	    this.typed = ``;

	    if (this.value === '') {
	      this.value = this.min + this.inc;
	    }

	    if (this.value <= this.min) return this.bell();
	    this.value -= this.inc;
	    this.color = `cyan`;
	    this.fire();
	    this.render();
	  }

	  delete() {
	    let val = this.value.toString();
	    if (val.length === 0) return this.bell();
	    this.value = this.parse(val = val.slice(0, -1)) || ``;

	    if (this.value !== '' && this.value < this.min) {
	      this.value = this.min;
	    }

	    this.color = `cyan`;
	    this.fire();
	    this.render();
	  }

	  next() {
	    this.value = this.initial;
	    this.fire();
	    this.render();
	  }

	  _(c, key) {
	    if (!this.valid(c)) return this.bell();
	    const now = Date.now();
	    if (now - this.lastHit > 1000) this.typed = ``; // 1s elapsed

	    this.typed += c;
	    this.lastHit = now;
	    this.color = `cyan`;
	    if (c === `.`) return this.fire();
	    this.value = Math.min(this.parse(this.typed), this.max);
	    if (this.value > this.max) this.value = this.max;
	    if (this.value < this.min) this.value = this.min;
	    this.fire();
	    this.render();
	  }

	  render() {
	    if (this.closed) return;

	    if (!this.firstRender) {
	      if (this.outputError) this.out.write(cursor.down(lines(this.outputError, this.out.columns) - 1) + clear(this.outputError, this.out.columns));
	      this.out.write(clear(this.outputText, this.out.columns));
	    }

	    super.render();
	    this.outputError = ''; // Print prompt

	    this.outputText = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(this.done), !this.done || !this.done && !this.placeholder ? color[this.color]().underline(this.rendered) : this.rendered].join(` `); // Print error

	    if (this.error) {
	      this.outputError += this.errorMsg.split(`\n`).reduce((a, l, i) => a + `\n${i ? ` ` : figures.pointerSmall} ${color.red().italic(l)}`, ``);
	    }

	    this.out.write(erase.line + cursor.to(0) + this.outputText + cursor.save + this.outputError + cursor.restore);
	  }

	}

	number$1 = NumberPrompt;
	return number$1;
}

var multiselect$1;
var hasRequiredMultiselect$1;

function requireMultiselect$1 () {
	if (hasRequiredMultiselect$1) return multiselect$1;
	hasRequiredMultiselect$1 = 1;

	const color = requireKleur();

	const _require = requireSrc(),
	      cursor = _require.cursor;

	const Prompt = requirePrompt$1();

	const _require2 = requireUtil$1(),
	      clear = _require2.clear,
	      figures = _require2.figures,
	      style = _require2.style,
	      wrap = _require2.wrap,
	      entriesToDisplay = _require2.entriesToDisplay;
	/**
	 * MultiselectPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Array} opts.choices Array of choice objects
	 * @param {String} [opts.hint] Hint to display
	 * @param {String} [opts.warn] Hint shown for disabled choices
	 * @param {Number} [opts.max] Max choices
	 * @param {Number} [opts.cursor=0] Cursor start position
	 * @param {Number} [opts.optionsPerPage=10] Max options to display at once
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 */


	class MultiselectPrompt extends Prompt {
	  constructor(opts = {}) {
	    super(opts);
	    this.msg = opts.message;
	    this.cursor = opts.cursor || 0;
	    this.scrollIndex = opts.cursor || 0;
	    this.hint = opts.hint || '';
	    this.warn = opts.warn || '- This option is disabled -';
	    this.minSelected = opts.min;
	    this.showMinError = false;
	    this.maxChoices = opts.max;
	    this.instructions = opts.instructions;
	    this.optionsPerPage = opts.optionsPerPage || 10;
	    this.value = opts.choices.map((ch, idx) => {
	      if (typeof ch === 'string') ch = {
	        title: ch,
	        value: idx
	      };
	      return {
	        title: ch && (ch.title || ch.value || ch),
	        description: ch && ch.description,
	        value: ch && (ch.value === undefined ? idx : ch.value),
	        selected: ch && ch.selected,
	        disabled: ch && ch.disabled
	      };
	    });
	    this.clear = clear('', this.out.columns);

	    if (!opts.overrideRender) {
	      this.render();
	    }
	  }

	  reset() {
	    this.value.map(v => !v.selected);
	    this.cursor = 0;
	    this.fire();
	    this.render();
	  }

	  selected() {
	    return this.value.filter(v => v.selected);
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  submit() {
	    const selected = this.value.filter(e => e.selected);

	    if (this.minSelected && selected.length < this.minSelected) {
	      this.showMinError = true;
	      this.render();
	    } else {
	      this.done = true;
	      this.aborted = false;
	      this.fire();
	      this.render();
	      this.out.write('\n');
	      this.close();
	    }
	  }

	  first() {
	    this.cursor = 0;
	    this.render();
	  }

	  last() {
	    this.cursor = this.value.length - 1;
	    this.render();
	  }

	  next() {
	    this.cursor = (this.cursor + 1) % this.value.length;
	    this.render();
	  }

	  up() {
	    if (this.cursor === 0) {
	      this.cursor = this.value.length - 1;
	    } else {
	      this.cursor--;
	    }

	    this.render();
	  }

	  down() {
	    if (this.cursor === this.value.length - 1) {
	      this.cursor = 0;
	    } else {
	      this.cursor++;
	    }

	    this.render();
	  }

	  left() {
	    this.value[this.cursor].selected = false;
	    this.render();
	  }

	  right() {
	    if (this.value.filter(e => e.selected).length >= this.maxChoices) return this.bell();
	    this.value[this.cursor].selected = true;
	    this.render();
	  }

	  handleSpaceToggle() {
	    const v = this.value[this.cursor];

	    if (v.selected) {
	      v.selected = false;
	      this.render();
	    } else if (v.disabled || this.value.filter(e => e.selected).length >= this.maxChoices) {
	      return this.bell();
	    } else {
	      v.selected = true;
	      this.render();
	    }
	  }

	  toggleAll() {
	    if (this.maxChoices !== undefined || this.value[this.cursor].disabled) {
	      return this.bell();
	    }

	    const newSelected = !this.value[this.cursor].selected;
	    this.value.filter(v => !v.disabled).forEach(v => v.selected = newSelected);
	    this.render();
	  }

	  _(c, key) {
	    if (c === ' ') {
	      this.handleSpaceToggle();
	    } else if (c === 'a') {
	      this.toggleAll();
	    } else {
	      return this.bell();
	    }
	  }

	  renderInstructions() {
	    if (this.instructions === undefined || this.instructions) {
	      if (typeof this.instructions === 'string') {
	        return this.instructions;
	      }

	      return '\nInstructions:\n' + `    ${figures.arrowUp}/${figures.arrowDown}: Highlight option\n` + `    ${figures.arrowLeft}/${figures.arrowRight}/[space]: Toggle selection\n` + (this.maxChoices === undefined ? `    a: Toggle all\n` : '') + `    enter/return: Complete answer`;
	    }

	    return '';
	  }

	  renderOption(cursor, v, i, arrowIndicator) {
	    const prefix = (v.selected ? color.green(figures.radioOn) : figures.radioOff) + ' ' + arrowIndicator + ' ';
	    let title, desc;

	    if (v.disabled) {
	      title = cursor === i ? color.gray().underline(v.title) : color.strikethrough().gray(v.title);
	    } else {
	      title = cursor === i ? color.cyan().underline(v.title) : v.title;

	      if (cursor === i && v.description) {
	        desc = ` - ${v.description}`;

	        if (prefix.length + title.length + desc.length >= this.out.columns || v.description.split(/\r?\n/).length > 1) {
	          desc = '\n' + wrap(v.description, {
	            margin: prefix.length,
	            width: this.out.columns
	          });
	        }
	      }
	    }

	    return prefix + title + color.gray(desc || '');
	  } // shared with autocompleteMultiselect


	  paginateOptions(options) {
	    if (options.length === 0) {
	      return color.red('No matches for this query.');
	    }

	    let _entriesToDisplay = entriesToDisplay(this.cursor, options.length, this.optionsPerPage),
	        startIndex = _entriesToDisplay.startIndex,
	        endIndex = _entriesToDisplay.endIndex;

	    let prefix,
	        styledOptions = [];

	    for (let i = startIndex; i < endIndex; i++) {
	      if (i === startIndex && startIndex > 0) {
	        prefix = figures.arrowUp;
	      } else if (i === endIndex - 1 && endIndex < options.length) {
	        prefix = figures.arrowDown;
	      } else {
	        prefix = ' ';
	      }

	      styledOptions.push(this.renderOption(this.cursor, options[i], i, prefix));
	    }

	    return '\n' + styledOptions.join('\n');
	  } // shared with autocomleteMultiselect


	  renderOptions(options) {
	    if (!this.done) {
	      return this.paginateOptions(options);
	    }

	    return '';
	  }

	  renderDoneOrInstructions() {
	    if (this.done) {
	      return this.value.filter(e => e.selected).map(v => v.title).join(', ');
	    }

	    const output = [color.gray(this.hint), this.renderInstructions()];

	    if (this.value[this.cursor].disabled) {
	      output.push(color.yellow(this.warn));
	    }

	    return output.join(' ');
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);
	    super.render(); // print prompt

	    let prompt = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(false), this.renderDoneOrInstructions()].join(' ');

	    if (this.showMinError) {
	      prompt += color.red(`You must select a minimum of ${this.minSelected} choices.`);
	      this.showMinError = false;
	    }

	    prompt += this.renderOptions(this.value);
	    this.out.write(this.clear + prompt);
	    this.clear = clear(prompt, this.out.columns);
	  }

	}

	multiselect$1 = MultiselectPrompt;
	return multiselect$1;
}

var autocomplete$1;
var hasRequiredAutocomplete$1;

function requireAutocomplete$1 () {
	if (hasRequiredAutocomplete$1) return autocomplete$1;
	hasRequiredAutocomplete$1 = 1;

	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

	function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

	const color = requireKleur();

	const Prompt = requirePrompt$1();

	const _require = requireSrc(),
	      erase = _require.erase,
	      cursor = _require.cursor;

	const _require2 = requireUtil$1(),
	      style = _require2.style,
	      clear = _require2.clear,
	      figures = _require2.figures,
	      wrap = _require2.wrap,
	      entriesToDisplay = _require2.entriesToDisplay;

	const getVal = (arr, i) => arr[i] && (arr[i].value || arr[i].title || arr[i]);

	const getTitle = (arr, i) => arr[i] && (arr[i].title || arr[i].value || arr[i]);

	const getIndex = (arr, valOrTitle) => {
	  const index = arr.findIndex(el => el.value === valOrTitle || el.title === valOrTitle);
	  return index > -1 ? index : undefined;
	};
	/**
	 * TextPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Array} opts.choices Array of auto-complete choices objects
	 * @param {Function} [opts.suggest] Filter function. Defaults to sort by title
	 * @param {Number} [opts.limit=10] Max number of results to show
	 * @param {Number} [opts.cursor=0] Cursor start position
	 * @param {String} [opts.style='default'] Render style
	 * @param {String} [opts.fallback] Fallback message - initial to default value
	 * @param {String} [opts.initial] Index of the default value
	 * @param {Boolean} [opts.clearFirst] The first ESCAPE keypress will clear the input
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 * @param {String} [opts.noMatches] The no matches found label
	 */


	class AutocompletePrompt extends Prompt {
	  constructor(opts = {}) {
	    super(opts);
	    this.msg = opts.message;
	    this.suggest = opts.suggest;
	    this.choices = opts.choices;
	    this.initial = typeof opts.initial === 'number' ? opts.initial : getIndex(opts.choices, opts.initial);
	    this.select = this.initial || opts.cursor || 0;
	    this.i18n = {
	      noMatches: opts.noMatches || 'no matches found'
	    };
	    this.fallback = opts.fallback || this.initial;
	    this.clearFirst = opts.clearFirst || false;
	    this.suggestions = [];
	    this.input = '';
	    this.limit = opts.limit || 10;
	    this.cursor = 0;
	    this.transform = style.render(opts.style);
	    this.scale = this.transform.scale;
	    this.render = this.render.bind(this);
	    this.complete = this.complete.bind(this);
	    this.clear = clear('', this.out.columns);
	    this.complete(this.render);
	    this.render();
	  }

	  set fallback(fb) {
	    this._fb = Number.isSafeInteger(parseInt(fb)) ? parseInt(fb) : fb;
	  }

	  get fallback() {
	    let choice;
	    if (typeof this._fb === 'number') choice = this.choices[this._fb];else if (typeof this._fb === 'string') choice = {
	      title: this._fb
	    };
	    return choice || this._fb || {
	      title: this.i18n.noMatches
	    };
	  }

	  moveSelect(i) {
	    this.select = i;
	    if (this.suggestions.length > 0) this.value = getVal(this.suggestions, i);else this.value = this.fallback.value;
	    this.fire();
	  }

	  complete(cb) {
	    var _this = this;

	    return _asyncToGenerator(function* () {
	      const p = _this.completing = _this.suggest(_this.input, _this.choices);

	      const suggestions = yield p;
	      if (_this.completing !== p) return;
	      _this.suggestions = suggestions.map((s, i, arr) => ({
	        title: getTitle(arr, i),
	        value: getVal(arr, i),
	        description: s.description
	      }));
	      _this.completing = false;
	      const l = Math.max(suggestions.length - 1, 0);

	      _this.moveSelect(Math.min(l, _this.select));

	      cb && cb();
	    })();
	  }

	  reset() {
	    this.input = '';
	    this.complete(() => {
	      this.moveSelect(this.initial !== void 0 ? this.initial : 0);
	      this.render();
	    });
	    this.render();
	  }

	  exit() {
	    if (this.clearFirst && this.input.length > 0) {
	      this.reset();
	    } else {
	      this.done = this.exited = true;
	      this.aborted = false;
	      this.fire();
	      this.render();
	      this.out.write('\n');
	      this.close();
	    }
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.exited = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  submit() {
	    this.done = true;
	    this.aborted = this.exited = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  _(c, key) {
	    let s1 = this.input.slice(0, this.cursor);
	    let s2 = this.input.slice(this.cursor);
	    this.input = `${s1}${c}${s2}`;
	    this.cursor = s1.length + 1;
	    this.complete(this.render);
	    this.render();
	  }

	  delete() {
	    if (this.cursor === 0) return this.bell();
	    let s1 = this.input.slice(0, this.cursor - 1);
	    let s2 = this.input.slice(this.cursor);
	    this.input = `${s1}${s2}`;
	    this.complete(this.render);
	    this.cursor = this.cursor - 1;
	    this.render();
	  }

	  deleteForward() {
	    if (this.cursor * this.scale >= this.rendered.length) return this.bell();
	    let s1 = this.input.slice(0, this.cursor);
	    let s2 = this.input.slice(this.cursor + 1);
	    this.input = `${s1}${s2}`;
	    this.complete(this.render);
	    this.render();
	  }

	  first() {
	    this.moveSelect(0);
	    this.render();
	  }

	  last() {
	    this.moveSelect(this.suggestions.length - 1);
	    this.render();
	  }

	  up() {
	    if (this.select === 0) {
	      this.moveSelect(this.suggestions.length - 1);
	    } else {
	      this.moveSelect(this.select - 1);
	    }

	    this.render();
	  }

	  down() {
	    if (this.select === this.suggestions.length - 1) {
	      this.moveSelect(0);
	    } else {
	      this.moveSelect(this.select + 1);
	    }

	    this.render();
	  }

	  next() {
	    if (this.select === this.suggestions.length - 1) {
	      this.moveSelect(0);
	    } else this.moveSelect(this.select + 1);

	    this.render();
	  }

	  nextPage() {
	    this.moveSelect(Math.min(this.select + this.limit, this.suggestions.length - 1));
	    this.render();
	  }

	  prevPage() {
	    this.moveSelect(Math.max(this.select - this.limit, 0));
	    this.render();
	  }

	  left() {
	    if (this.cursor <= 0) return this.bell();
	    this.cursor = this.cursor - 1;
	    this.render();
	  }

	  right() {
	    if (this.cursor * this.scale >= this.rendered.length) return this.bell();
	    this.cursor = this.cursor + 1;
	    this.render();
	  }

	  renderOption(v, hovered, isStart, isEnd) {
	    let desc;
	    let prefix = isStart ? figures.arrowUp : isEnd ? figures.arrowDown : ' ';
	    let title = hovered ? color.cyan().underline(v.title) : v.title;
	    prefix = (hovered ? color.cyan(figures.pointer) + ' ' : '  ') + prefix;

	    if (v.description) {
	      desc = ` - ${v.description}`;

	      if (prefix.length + title.length + desc.length >= this.out.columns || v.description.split(/\r?\n/).length > 1) {
	        desc = '\n' + wrap(v.description, {
	          margin: 3,
	          width: this.out.columns
	        });
	      }
	    }

	    return prefix + ' ' + title + color.gray(desc || '');
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);else this.out.write(clear(this.outputText, this.out.columns));
	    super.render();

	    let _entriesToDisplay = entriesToDisplay(this.select, this.choices.length, this.limit),
	        startIndex = _entriesToDisplay.startIndex,
	        endIndex = _entriesToDisplay.endIndex;

	    this.outputText = [style.symbol(this.done, this.aborted, this.exited), color.bold(this.msg), style.delimiter(this.completing), this.done && this.suggestions[this.select] ? this.suggestions[this.select].title : this.rendered = this.transform.render(this.input)].join(' ');

	    if (!this.done) {
	      const suggestions = this.suggestions.slice(startIndex, endIndex).map((item, i) => this.renderOption(item, this.select === i + startIndex, i === 0 && startIndex > 0, i + startIndex === endIndex - 1 && endIndex < this.choices.length)).join('\n');
	      this.outputText += `\n` + (suggestions || color.gray(this.fallback.title));
	    }

	    this.out.write(erase.line + cursor.to(0) + this.outputText);
	  }

	}

	autocomplete$1 = AutocompletePrompt;
	return autocomplete$1;
}

var autocompleteMultiselect$1;
var hasRequiredAutocompleteMultiselect$1;

function requireAutocompleteMultiselect$1 () {
	if (hasRequiredAutocompleteMultiselect$1) return autocompleteMultiselect$1;
	hasRequiredAutocompleteMultiselect$1 = 1;

	const color = requireKleur();

	const _require = requireSrc(),
	      cursor = _require.cursor;

	const MultiselectPrompt = requireMultiselect$1();

	const _require2 = requireUtil$1(),
	      clear = _require2.clear,
	      style = _require2.style,
	      figures = _require2.figures;
	/**
	 * MultiselectPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Array} opts.choices Array of choice objects
	 * @param {String} [opts.hint] Hint to display
	 * @param {String} [opts.warn] Hint shown for disabled choices
	 * @param {Number} [opts.max] Max choices
	 * @param {Number} [opts.cursor=0] Cursor start position
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 */


	class AutocompleteMultiselectPrompt extends MultiselectPrompt {
	  constructor(opts = {}) {
	    opts.overrideRender = true;
	    super(opts);
	    this.inputValue = '';
	    this.clear = clear('', this.out.columns);
	    this.filteredOptions = this.value;
	    this.render();
	  }

	  last() {
	    this.cursor = this.filteredOptions.length - 1;
	    this.render();
	  }

	  next() {
	    this.cursor = (this.cursor + 1) % this.filteredOptions.length;
	    this.render();
	  }

	  up() {
	    if (this.cursor === 0) {
	      this.cursor = this.filteredOptions.length - 1;
	    } else {
	      this.cursor--;
	    }

	    this.render();
	  }

	  down() {
	    if (this.cursor === this.filteredOptions.length - 1) {
	      this.cursor = 0;
	    } else {
	      this.cursor++;
	    }

	    this.render();
	  }

	  left() {
	    this.filteredOptions[this.cursor].selected = false;
	    this.render();
	  }

	  right() {
	    if (this.value.filter(e => e.selected).length >= this.maxChoices) return this.bell();
	    this.filteredOptions[this.cursor].selected = true;
	    this.render();
	  }

	  delete() {
	    if (this.inputValue.length) {
	      this.inputValue = this.inputValue.substr(0, this.inputValue.length - 1);
	      this.updateFilteredOptions();
	    }
	  }

	  updateFilteredOptions() {
	    const currentHighlight = this.filteredOptions[this.cursor];
	    this.filteredOptions = this.value.filter(v => {
	      if (this.inputValue) {
	        if (typeof v.title === 'string') {
	          if (v.title.toLowerCase().includes(this.inputValue.toLowerCase())) {
	            return true;
	          }
	        }

	        if (typeof v.value === 'string') {
	          if (v.value.toLowerCase().includes(this.inputValue.toLowerCase())) {
	            return true;
	          }
	        }

	        return false;
	      }

	      return true;
	    });
	    const newHighlightIndex = this.filteredOptions.findIndex(v => v === currentHighlight);
	    this.cursor = newHighlightIndex < 0 ? 0 : newHighlightIndex;
	    this.render();
	  }

	  handleSpaceToggle() {
	    const v = this.filteredOptions[this.cursor];

	    if (v.selected) {
	      v.selected = false;
	      this.render();
	    } else if (v.disabled || this.value.filter(e => e.selected).length >= this.maxChoices) {
	      return this.bell();
	    } else {
	      v.selected = true;
	      this.render();
	    }
	  }

	  handleInputChange(c) {
	    this.inputValue = this.inputValue + c;
	    this.updateFilteredOptions();
	  }

	  _(c, key) {
	    if (c === ' ') {
	      this.handleSpaceToggle();
	    } else {
	      this.handleInputChange(c);
	    }
	  }

	  renderInstructions() {
	    if (this.instructions === undefined || this.instructions) {
	      if (typeof this.instructions === 'string') {
	        return this.instructions;
	      }

	      return `
	Instructions:
	    ${figures.arrowUp}/${figures.arrowDown}: Highlight option
	    ${figures.arrowLeft}/${figures.arrowRight}/[space]: Toggle selection
	    [a,b,c]/delete: Filter choices
	    enter/return: Complete answer
	`;
	    }

	    return '';
	  }

	  renderCurrentInput() {
	    return `
	Filtered results for: ${this.inputValue ? this.inputValue : color.gray('Enter something to filter')}\n`;
	  }

	  renderOption(cursor, v, i) {
	    let title;
	    if (v.disabled) title = cursor === i ? color.gray().underline(v.title) : color.strikethrough().gray(v.title);else title = cursor === i ? color.cyan().underline(v.title) : v.title;
	    return (v.selected ? color.green(figures.radioOn) : figures.radioOff) + '  ' + title;
	  }

	  renderDoneOrInstructions() {
	    if (this.done) {
	      return this.value.filter(e => e.selected).map(v => v.title).join(', ');
	    }

	    const output = [color.gray(this.hint), this.renderInstructions(), this.renderCurrentInput()];

	    if (this.filteredOptions.length && this.filteredOptions[this.cursor].disabled) {
	      output.push(color.yellow(this.warn));
	    }

	    return output.join(' ');
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);
	    super.render(); // print prompt

	    let prompt = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(false), this.renderDoneOrInstructions()].join(' ');

	    if (this.showMinError) {
	      prompt += color.red(`You must select a minimum of ${this.minSelected} choices.`);
	      this.showMinError = false;
	    }

	    prompt += this.renderOptions(this.filteredOptions);
	    this.out.write(this.clear + prompt);
	    this.clear = clear(prompt, this.out.columns);
	  }

	}

	autocompleteMultiselect$1 = AutocompleteMultiselectPrompt;
	return autocompleteMultiselect$1;
}

var confirm$1;
var hasRequiredConfirm$1;

function requireConfirm$1 () {
	if (hasRequiredConfirm$1) return confirm$1;
	hasRequiredConfirm$1 = 1;

	const color = requireKleur();

	const Prompt = requirePrompt$1();

	const _require = requireUtil$1(),
	      style = _require.style,
	      clear = _require.clear;

	const _require2 = requireSrc(),
	      erase = _require2.erase,
	      cursor = _require2.cursor;
	/**
	 * ConfirmPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Boolean} [opts.initial] Default value (true/false)
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 * @param {String} [opts.yes] The "Yes" label
	 * @param {String} [opts.yesOption] The "Yes" option when choosing between yes/no
	 * @param {String} [opts.no] The "No" label
	 * @param {String} [opts.noOption] The "No" option when choosing between yes/no
	 */


	class ConfirmPrompt extends Prompt {
	  constructor(opts = {}) {
	    super(opts);
	    this.msg = opts.message;
	    this.value = opts.initial;
	    this.initialValue = !!opts.initial;
	    this.yesMsg = opts.yes || 'yes';
	    this.yesOption = opts.yesOption || '(Y/n)';
	    this.noMsg = opts.no || 'no';
	    this.noOption = opts.noOption || '(y/N)';
	    this.render();
	  }

	  reset() {
	    this.value = this.initialValue;
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  submit() {
	    this.value = this.value || false;
	    this.done = true;
	    this.aborted = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  _(c, key) {
	    if (c.toLowerCase() === 'y') {
	      this.value = true;
	      return this.submit();
	    }

	    if (c.toLowerCase() === 'n') {
	      this.value = false;
	      return this.submit();
	    }

	    return this.bell();
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);else this.out.write(clear(this.outputText, this.out.columns));
	    super.render();
	    this.outputText = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(this.done), this.done ? this.value ? this.yesMsg : this.noMsg : color.gray(this.initialValue ? this.yesOption : this.noOption)].join(' ');
	    this.out.write(erase.line + cursor.to(0) + this.outputText);
	  }

	}

	confirm$1 = ConfirmPrompt;
	return confirm$1;
}

var elements$1;
var hasRequiredElements$1;

function requireElements$1 () {
	if (hasRequiredElements$1) return elements$1;
	hasRequiredElements$1 = 1;

	elements$1 = {
	  TextPrompt: requireText$1(),
	  SelectPrompt: requireSelect$1(),
	  TogglePrompt: requireToggle$1(),
	  DatePrompt: requireDate$1(),
	  NumberPrompt: requireNumber$1(),
	  MultiselectPrompt: requireMultiselect$1(),
	  AutocompletePrompt: requireAutocomplete$1(),
	  AutocompleteMultiselectPrompt: requireAutocompleteMultiselect$1(),
	  ConfirmPrompt: requireConfirm$1()
	};
	return elements$1;
}

var hasRequiredPrompts$1;

function requirePrompts$1 () {
	if (hasRequiredPrompts$1) return prompts$2;
	hasRequiredPrompts$1 = 1;
	(function (exports) {

		const $ = exports;

		const el = requireElements$1();

		const noop = v => v;

		function toPrompt(type, args, opts = {}) {
		  return new Promise((res, rej) => {
		    const p = new el[type](args);
		    const onAbort = opts.onAbort || noop;
		    const onSubmit = opts.onSubmit || noop;
		    const onExit = opts.onExit || noop;
		    p.on('state', args.onState || noop);
		    p.on('submit', x => res(onSubmit(x)));
		    p.on('exit', x => res(onExit(x)));
		    p.on('abort', x => rej(onAbort(x)));
		  });
		}
		/**
		 * Text prompt
		 * @param {string} args.message Prompt message to display
		 * @param {string} [args.initial] Default string value
		 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
		 * @param {function} [args.onState] On state change callback
		 * @param {function} [args.validate] Function to validate user input
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */


		$.text = args => toPrompt('TextPrompt', args);
		/**
		 * Password prompt with masked input
		 * @param {string} args.message Prompt message to display
		 * @param {string} [args.initial] Default string value
		 * @param {function} [args.onState] On state change callback
		 * @param {function} [args.validate] Function to validate user input
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */


		$.password = args => {
		  args.style = 'password';
		  return $.text(args);
		};
		/**
		 * Prompt where input is invisible, like sudo
		 * @param {string} args.message Prompt message to display
		 * @param {string} [args.initial] Default string value
		 * @param {function} [args.onState] On state change callback
		 * @param {function} [args.validate] Function to validate user input
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */


		$.invisible = args => {
		  args.style = 'invisible';
		  return $.text(args);
		};
		/**
		 * Number prompt
		 * @param {string} args.message Prompt message to display
		 * @param {number} args.initial Default number value
		 * @param {function} [args.onState] On state change callback
		 * @param {number} [args.max] Max value
		 * @param {number} [args.min] Min value
		 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
		 * @param {Boolean} [opts.float=false] Parse input as floats
		 * @param {Number} [opts.round=2] Round floats to x decimals
		 * @param {Number} [opts.increment=1] Number to increment by when using arrow-keys
		 * @param {function} [args.validate] Function to validate user input
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */


		$.number = args => toPrompt('NumberPrompt', args);
		/**
		 * Date prompt
		 * @param {string} args.message Prompt message to display
		 * @param {number} args.initial Default number value
		 * @param {function} [args.onState] On state change callback
		 * @param {number} [args.max] Max value
		 * @param {number} [args.min] Min value
		 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
		 * @param {Boolean} [opts.float=false] Parse input as floats
		 * @param {Number} [opts.round=2] Round floats to x decimals
		 * @param {Number} [opts.increment=1] Number to increment by when using arrow-keys
		 * @param {function} [args.validate] Function to validate user input
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */


		$.date = args => toPrompt('DatePrompt', args);
		/**
		 * Classic yes/no prompt
		 * @param {string} args.message Prompt message to display
		 * @param {boolean} [args.initial=false] Default value
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */


		$.confirm = args => toPrompt('ConfirmPrompt', args);
		/**
		 * List prompt, split intput string by `seperator`
		 * @param {string} args.message Prompt message to display
		 * @param {string} [args.initial] Default string value
		 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
		 * @param {string} [args.separator] String separator
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input, in form of an `Array`
		 */


		$.list = args => {
		  const sep = args.separator || ',';
		  return toPrompt('TextPrompt', args, {
		    onSubmit: str => str.split(sep).map(s => s.trim())
		  });
		};
		/**
		 * Toggle/switch prompt
		 * @param {string} args.message Prompt message to display
		 * @param {boolean} [args.initial=false] Default value
		 * @param {string} [args.active="on"] Text for `active` state
		 * @param {string} [args.inactive="off"] Text for `inactive` state
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */


		$.toggle = args => toPrompt('TogglePrompt', args);
		/**
		 * Interactive select prompt
		 * @param {string} args.message Prompt message to display
		 * @param {Array} args.choices Array of choices objects `[{ title, value }, ...]`
		 * @param {number} [args.initial] Index of default value
		 * @param {String} [args.hint] Hint to display
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */


		$.select = args => toPrompt('SelectPrompt', args);
		/**
		 * Interactive multi-select / autocompleteMultiselect prompt
		 * @param {string} args.message Prompt message to display
		 * @param {Array} args.choices Array of choices objects `[{ title, value, [selected] }, ...]`
		 * @param {number} [args.max] Max select
		 * @param {string} [args.hint] Hint to display user
		 * @param {Number} [args.cursor=0] Cursor start position
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */


		$.multiselect = args => {
		  args.choices = [].concat(args.choices || []);

		  const toSelected = items => items.filter(item => item.selected).map(item => item.value);

		  return toPrompt('MultiselectPrompt', args, {
		    onAbort: toSelected,
		    onSubmit: toSelected
		  });
		};

		$.autocompleteMultiselect = args => {
		  args.choices = [].concat(args.choices || []);

		  const toSelected = items => items.filter(item => item.selected).map(item => item.value);

		  return toPrompt('AutocompleteMultiselectPrompt', args, {
		    onAbort: toSelected,
		    onSubmit: toSelected
		  });
		};

		const byTitle = (input, choices) => Promise.resolve(choices.filter(item => item.title.slice(0, input.length).toLowerCase() === input.toLowerCase()));
		/**
		 * Interactive auto-complete prompt
		 * @param {string} args.message Prompt message to display
		 * @param {Array} args.choices Array of auto-complete choices objects `[{ title, value }, ...]`
		 * @param {Function} [args.suggest] Function to filter results based on user input. Defaults to sort by `title`
		 * @param {number} [args.limit=10] Max number of results to show
		 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
		 * @param {String} [args.initial] Index of the default value
		 * @param {boolean} [opts.clearFirst] The first ESCAPE keypress will clear the input
		 * @param {String} [args.fallback] Fallback message - defaults to initial value
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */


		$.autocomplete = args => {
		  args.suggest = args.suggest || byTitle;
		  args.choices = [].concat(args.choices || []);
		  return toPrompt('AutocompletePrompt', args);
		};
} (prompts$2));
	return prompts$2;
}

var dist;
var hasRequiredDist;

function requireDist () {
	if (hasRequiredDist) return dist;
	hasRequiredDist = 1;

	function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

	function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

	function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

	function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

	function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

	const prompts = requirePrompts$1();

	const passOn = ['suggest', 'format', 'onState', 'validate', 'onRender', 'type'];

	const noop = () => {};
	/**
	 * Prompt for a series of questions
	 * @param {Array|Object} questions Single question object or Array of question objects
	 * @param {Function} [onSubmit] Callback function called on prompt submit
	 * @param {Function} [onCancel] Callback function called on cancel/abort
	 * @returns {Object} Object with values from user input
	 */


	function prompt() {
	  return _prompt.apply(this, arguments);
	}

	function _prompt() {
	  _prompt = _asyncToGenerator(function* (questions = [], {
	    onSubmit = noop,
	    onCancel = noop
	  } = {}) {
	    const answers = {};
	    const override = prompt._override || {};
	    questions = [].concat(questions);
	    let answer, question, quit, name, type, lastPrompt;

	    const getFormattedAnswer = /*#__PURE__*/function () {
	      var _ref = _asyncToGenerator(function* (question, answer, skipValidation = false) {
	        if (!skipValidation && question.validate && question.validate(answer) !== true) {
	          return;
	        }

	        return question.format ? yield question.format(answer, answers) : answer;
	      });

	      return function getFormattedAnswer(_x, _x2) {
	        return _ref.apply(this, arguments);
	      };
	    }();

	    var _iterator = _createForOfIteratorHelper(questions),
	        _step;

	    try {
	      for (_iterator.s(); !(_step = _iterator.n()).done;) {
	        question = _step.value;
	        var _question = question;
	        name = _question.name;
	        type = _question.type;

	        // evaluate type first and skip if type is a falsy value
	        if (typeof type === 'function') {
	          type = yield type(answer, _objectSpread({}, answers), question);
	          question['type'] = type;
	        }

	        if (!type) continue; // if property is a function, invoke it unless it's a special function

	        for (let key in question) {
	          if (passOn.includes(key)) continue;
	          let value = question[key];
	          question[key] = typeof value === 'function' ? yield value(answer, _objectSpread({}, answers), lastPrompt) : value;
	        }

	        lastPrompt = question;

	        if (typeof question.message !== 'string') {
	          throw new Error('prompt message is required');
	        } // update vars in case they changed


	        var _question2 = question;
	        name = _question2.name;
	        type = _question2.type;

	        if (prompts[type] === void 0) {
	          throw new Error(`prompt type (${type}) is not defined`);
	        }

	        if (override[question.name] !== undefined) {
	          answer = yield getFormattedAnswer(question, override[question.name]);

	          if (answer !== undefined) {
	            answers[name] = answer;
	            continue;
	          }
	        }

	        try {
	          // Get the injected answer if there is one or prompt the user
	          answer = prompt._injected ? getInjectedAnswer(prompt._injected, question.initial) : yield prompts[type](question);
	          answers[name] = answer = yield getFormattedAnswer(question, answer, true);
	          quit = yield onSubmit(question, answer, answers);
	        } catch (err) {
	          quit = !(yield onCancel(question, answers));
	        }

	        if (quit) return answers;
	      }
	    } catch (err) {
	      _iterator.e(err);
	    } finally {
	      _iterator.f();
	    }

	    return answers;
	  });
	  return _prompt.apply(this, arguments);
	}

	function getInjectedAnswer(injected, deafultValue) {
	  const answer = injected.shift();

	  if (answer instanceof Error) {
	    throw answer;
	  }

	  return answer === undefined ? deafultValue : answer;
	}

	function inject(answers) {
	  prompt._injected = (prompt._injected || []).concat(answers);
	}

	function override(answers) {
	  prompt._override = Object.assign({}, answers);
	}

	dist = Object.assign(prompt, {
	  prompt,
	  prompts,
	  inject,
	  override
	});
	return dist;
}

var prompts$1 = {};

var action;
var hasRequiredAction;

function requireAction () {
	if (hasRequiredAction) return action;
	hasRequiredAction = 1;

	action = (key, isSelect) => {
	  if (key.meta && key.name !== 'escape') return;
	  
	  if (key.ctrl) {
	    if (key.name === 'a') return 'first';
	    if (key.name === 'c') return 'abort';
	    if (key.name === 'd') return 'abort';
	    if (key.name === 'e') return 'last';
	    if (key.name === 'g') return 'reset';
	  }
	  
	  if (isSelect) {
	    if (key.name === 'j') return 'down';
	    if (key.name === 'k') return 'up';
	  }

	  if (key.name === 'return') return 'submit';
	  if (key.name === 'enter') return 'submit'; // ctrl + J
	  if (key.name === 'backspace') return 'delete';
	  if (key.name === 'delete') return 'deleteForward';
	  if (key.name === 'abort') return 'abort';
	  if (key.name === 'escape') return 'exit';
	  if (key.name === 'tab') return 'next';
	  if (key.name === 'pagedown') return 'nextPage';
	  if (key.name === 'pageup') return 'prevPage';
	  // TODO create home() in prompt types (e.g. TextPrompt)
	  if (key.name === 'home') return 'home';
	  // TODO create end() in prompt types (e.g. TextPrompt)
	  if (key.name === 'end') return 'end';

	  if (key.name === 'up') return 'up';
	  if (key.name === 'down') return 'down';
	  if (key.name === 'right') return 'right';
	  if (key.name === 'left') return 'left';

	  return false;
	};
	return action;
}

var strip;
var hasRequiredStrip;

function requireStrip () {
	if (hasRequiredStrip) return strip;
	hasRequiredStrip = 1;

	strip = str => {
	  const pattern = [
	    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
	    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))'
	  ].join('|');

	  const RGX = new RegExp(pattern, 'g');
	  return typeof str === 'string' ? str.replace(RGX, '') : str;
	};
	return strip;
}

var clear;
var hasRequiredClear;

function requireClear () {
	if (hasRequiredClear) return clear;
	hasRequiredClear = 1;

	const strip = requireStrip();
	const { erase, cursor } = requireSrc();

	const width = str => [...strip(str)].length;

	/**
	 * @param {string} prompt
	 * @param {number} perLine
	 */
	clear = function(prompt, perLine) {
	  if (!perLine) return erase.line + cursor.to(0);

	  let rows = 0;
	  const lines = prompt.split(/\r?\n/);
	  for (let line of lines) {
	    rows += 1 + Math.floor(Math.max(width(line) - 1, 0) / perLine);
	  }

	  return erase.lines(rows);
	};
	return clear;
}

var figures_1;
var hasRequiredFigures;

function requireFigures () {
	if (hasRequiredFigures) return figures_1;
	hasRequiredFigures = 1;

	 const main = {
	  arrowUp: '↑',
	  arrowDown: '↓',
	  arrowLeft: '←',
	  arrowRight: '→',
	  radioOn: '◉',
	  radioOff: '◯',
	  tick: '✔',	
	  cross: '✖',	
	  ellipsis: '…',	
	  pointerSmall: '›',	
	  line: '─',	
	  pointer: '❯'	
	};	
	const win = {
	  arrowUp: main.arrowUp,
	  arrowDown: main.arrowDown,
	  arrowLeft: main.arrowLeft,
	  arrowRight: main.arrowRight,
	  radioOn: '(*)',
	  radioOff: '( )',	
	  tick: '√',	
	  cross: '×',	
	  ellipsis: '...',	
	  pointerSmall: '»',	
	  line: '─',	
	  pointer: '>'	
	};	
	const figures = process.platform === 'win32' ? win : main;	

	 figures_1 = figures;
	return figures_1;
}

var style;
var hasRequiredStyle;

function requireStyle () {
	if (hasRequiredStyle) return style;
	hasRequiredStyle = 1;

	const c = requireKleur();
	const figures = requireFigures();

	// rendering user input.
	const styles = Object.freeze({
	  password: { scale: 1, render: input => '*'.repeat(input.length) },
	  emoji: { scale: 2, render: input => '😃'.repeat(input.length) },
	  invisible: { scale: 0, render: input => '' },
	  default: { scale: 1, render: input => `${input}` }
	});
	const render = type => styles[type] || styles.default;

	// icon to signalize a prompt.
	const symbols = Object.freeze({
	  aborted: c.red(figures.cross),
	  done: c.green(figures.tick),
	  exited: c.yellow(figures.cross),
	  default: c.cyan('?')
	});

	const symbol = (done, aborted, exited) =>
	  aborted ? symbols.aborted : exited ? symbols.exited : done ? symbols.done : symbols.default;

	// between the question and the user's input.
	const delimiter = completing =>
	  c.gray(completing ? figures.ellipsis : figures.pointerSmall);

	const item = (expandable, expanded) =>
	  c.gray(expandable ? (expanded ? figures.pointerSmall : '+') : figures.line);

	style = {
	  styles,
	  render,
	  symbols,
	  symbol,
	  delimiter,
	  item
	};
	return style;
}

var lines;
var hasRequiredLines;

function requireLines () {
	if (hasRequiredLines) return lines;
	hasRequiredLines = 1;

	const strip = requireStrip();

	/**
	 * @param {string} msg
	 * @param {number} perLine
	 */
	lines = function (msg, perLine) {
	  let lines = String(strip(msg) || '').split(/\r?\n/);

	  if (!perLine) return lines.length;
	  return lines.map(l => Math.ceil(l.length / perLine))
	      .reduce((a, b) => a + b);
	};
	return lines;
}

var wrap;
var hasRequiredWrap;

function requireWrap () {
	if (hasRequiredWrap) return wrap;
	hasRequiredWrap = 1;

	/**
	 * @param {string} msg The message to wrap
	 * @param {object} opts
	 * @param {number|string} [opts.margin] Left margin
	 * @param {number} opts.width Maximum characters per line including the margin
	 */
	wrap = (msg, opts = {}) => {
	  const tab = Number.isSafeInteger(parseInt(opts.margin))
	    ? new Array(parseInt(opts.margin)).fill(' ').join('')
	    : (opts.margin || '');

	  const width = opts.width;

	  return (msg || '').split(/\r?\n/g)
	    .map(line => line
	      .split(/\s+/g)
	      .reduce((arr, w) => {
	        if (w.length + tab.length >= width || arr[arr.length - 1].length + w.length + 1 < width)
	          arr[arr.length - 1] += ` ${w}`;
	        else arr.push(`${tab}${w}`);
	        return arr;
	      }, [ tab ])
	      .join('\n'))
	    .join('\n');
	};
	return wrap;
}

var entriesToDisplay;
var hasRequiredEntriesToDisplay;

function requireEntriesToDisplay () {
	if (hasRequiredEntriesToDisplay) return entriesToDisplay;
	hasRequiredEntriesToDisplay = 1;

	/**
	 * Determine what entries should be displayed on the screen, based on the
	 * currently selected index and the maximum visible. Used in list-based
	 * prompts like `select` and `multiselect`.
	 *
	 * @param {number} cursor the currently selected entry
	 * @param {number} total the total entries available to display
	 * @param {number} [maxVisible] the number of entries that can be displayed
	 */
	entriesToDisplay = (cursor, total, maxVisible)  => {
	  maxVisible = maxVisible || total;

	  let startIndex = Math.min(total- maxVisible, cursor - Math.floor(maxVisible / 2));
	  if (startIndex < 0) startIndex = 0;

	  let endIndex = Math.min(startIndex + maxVisible, total);

	  return { startIndex, endIndex };
	};
	return entriesToDisplay;
}

var util;
var hasRequiredUtil;

function requireUtil () {
	if (hasRequiredUtil) return util;
	hasRequiredUtil = 1;

	util = {
	  action: requireAction(),
	  clear: requireClear(),
	  style: requireStyle(),
	  strip: requireStrip(),
	  figures: requireFigures(),
	  lines: requireLines(),
	  wrap: requireWrap(),
	  entriesToDisplay: requireEntriesToDisplay()
	};
	return util;
}

var prompt;
var hasRequiredPrompt;

function requirePrompt () {
	if (hasRequiredPrompt) return prompt;
	hasRequiredPrompt = 1;

	const readline = require$$0__default$6["default"];
	const { action } = requireUtil();
	const EventEmitter = require$$2__default$1["default"];
	const { beep, cursor } = requireSrc();
	const color = requireKleur();

	/**
	 * Base prompt skeleton
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 */
	class Prompt extends EventEmitter {
	  constructor(opts={}) {
	    super();

	    this.firstRender = true;
	    this.in = opts.stdin || process.stdin;
	    this.out = opts.stdout || process.stdout;
	    this.onRender = (opts.onRender || (() => void 0)).bind(this);
	    const rl = readline.createInterface({ input:this.in, escapeCodeTimeout:50 });
	    readline.emitKeypressEvents(this.in, rl);

	    if (this.in.isTTY) this.in.setRawMode(true);
	    const isSelect = [ 'SelectPrompt', 'MultiselectPrompt' ].indexOf(this.constructor.name) > -1;
	    const keypress = (str, key) => {
	      let a = action(key, isSelect);
	      if (a === false) {
	        this._ && this._(str, key);
	      } else if (typeof this[a] === 'function') {
	        this[a](key);
	      } else {
	        this.bell();
	      }
	    };

	    this.close = () => {
	      this.out.write(cursor.show);
	      this.in.removeListener('keypress', keypress);
	      if (this.in.isTTY) this.in.setRawMode(false);
	      rl.close();
	      this.emit(this.aborted ? 'abort' : this.exited ? 'exit' : 'submit', this.value);
	      this.closed = true;
	    };

	    this.in.on('keypress', keypress);
	  }

	  fire() {
	    this.emit('state', {
	      value: this.value,
	      aborted: !!this.aborted,
	      exited: !!this.exited
	    });
	  }

	  bell() {
	    this.out.write(beep);
	  }

	  render() {
	    this.onRender(color);
	    if (this.firstRender) this.firstRender = false;
	  }
	}

	prompt = Prompt;
	return prompt;
}

var text;
var hasRequiredText;

function requireText () {
	if (hasRequiredText) return text;
	hasRequiredText = 1;
	const color = requireKleur();
	const Prompt = requirePrompt();
	const { erase, cursor } = requireSrc();
	const { style, clear, lines, figures } = requireUtil();

	/**
	 * TextPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {String} [opts.style='default'] Render style
	 * @param {String} [opts.initial] Default value
	 * @param {Function} [opts.validate] Validate function
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 * @param {String} [opts.error] The invalid error label
	 */
	class TextPrompt extends Prompt {
	  constructor(opts={}) {
	    super(opts);
	    this.transform = style.render(opts.style);
	    this.scale = this.transform.scale;
	    this.msg = opts.message;
	    this.initial = opts.initial || ``;
	    this.validator = opts.validate || (() => true);
	    this.value = ``;
	    this.errorMsg = opts.error || `Please Enter A Valid Value`;
	    this.cursor = Number(!!this.initial);
	    this.cursorOffset = 0;
	    this.clear = clear(``, this.out.columns);
	    this.render();
	  }

	  set value(v) {
	    if (!v && this.initial) {
	      this.placeholder = true;
	      this.rendered = color.gray(this.transform.render(this.initial));
	    } else {
	      this.placeholder = false;
	      this.rendered = this.transform.render(v);
	    }
	    this._value = v;
	    this.fire();
	  }

	  get value() {
	    return this._value;
	  }

	  reset() {
	    this.value = ``;
	    this.cursor = Number(!!this.initial);
	    this.cursorOffset = 0;
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.value = this.value || this.initial;
	    this.done = this.aborted = true;
	    this.error = false;
	    this.red = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  async validate() {
	    let valid = await this.validator(this.value);
	    if (typeof valid === `string`) {
	      this.errorMsg = valid;
	      valid = false;
	    }
	    this.error = !valid;
	  }

	  async submit() {
	    this.value = this.value || this.initial;
	    this.cursorOffset = 0;
	    this.cursor = this.rendered.length;
	    await this.validate();
	    if (this.error) {
	      this.red = true;
	      this.fire();
	      this.render();
	      return;
	    }
	    this.done = true;
	    this.aborted = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  next() {
	    if (!this.placeholder) return this.bell();
	    this.value = this.initial;
	    this.cursor = this.rendered.length;
	    this.fire();
	    this.render();
	  }

	  moveCursor(n) {
	    if (this.placeholder) return;
	    this.cursor = this.cursor+n;
	    this.cursorOffset += n;
	  }

	  _(c, key) {
	    let s1 = this.value.slice(0, this.cursor);
	    let s2 = this.value.slice(this.cursor);
	    this.value = `${s1}${c}${s2}`;
	    this.red = false;
	    this.cursor = this.placeholder ? 0 : s1.length+1;
	    this.render();
	  }

	  delete() {
	    if (this.isCursorAtStart()) return this.bell();
	    let s1 = this.value.slice(0, this.cursor-1);
	    let s2 = this.value.slice(this.cursor);
	    this.value = `${s1}${s2}`;
	    this.red = false;
	    if (this.isCursorAtStart()) {
	      this.cursorOffset = 0;
	    } else {
	      this.cursorOffset++;
	      this.moveCursor(-1);
	    }
	    this.render();
	  }

	  deleteForward() {
	    if(this.cursor*this.scale >= this.rendered.length || this.placeholder) return this.bell();
	    let s1 = this.value.slice(0, this.cursor);
	    let s2 = this.value.slice(this.cursor+1);
	    this.value = `${s1}${s2}`;
	    this.red = false;
	    if (this.isCursorAtEnd()) {
	      this.cursorOffset = 0;
	    } else {
	      this.cursorOffset++;
	    }
	    this.render();
	  }

	  first() {
	    this.cursor = 0;
	    this.render();
	  }

	  last() {
	    this.cursor = this.value.length;
	    this.render();
	  }

	  left() {
	    if (this.cursor <= 0 || this.placeholder) return this.bell();
	    this.moveCursor(-1);
	    this.render();
	  }

	  right() {
	    if (this.cursor*this.scale >= this.rendered.length || this.placeholder) return this.bell();
	    this.moveCursor(1);
	    this.render();
	  }

	  isCursorAtStart() {
	    return this.cursor === 0 || (this.placeholder && this.cursor === 1);
	  }

	  isCursorAtEnd() {
	    return this.cursor === this.rendered.length || (this.placeholder && this.cursor === this.rendered.length + 1)
	  }

	  render() {
	    if (this.closed) return;
	    if (!this.firstRender) {
	      if (this.outputError)
	        this.out.write(cursor.down(lines(this.outputError, this.out.columns) - 1) + clear(this.outputError, this.out.columns));
	      this.out.write(clear(this.outputText, this.out.columns));
	    }
	    super.render();
	    this.outputError = '';

	    this.outputText = [
	      style.symbol(this.done, this.aborted),
	      color.bold(this.msg),
	      style.delimiter(this.done),
	      this.red ? color.red(this.rendered) : this.rendered
	    ].join(` `);

	    if (this.error) {
	      this.outputError += this.errorMsg.split(`\n`)
	          .reduce((a, l, i) => a + `\n${i ? ' ' : figures.pointerSmall} ${color.red().italic(l)}`, ``);
	    }

	    this.out.write(erase.line + cursor.to(0) + this.outputText + cursor.save + this.outputError + cursor.restore + cursor.move(this.cursorOffset, 0));
	  }
	}

	text = TextPrompt;
	return text;
}

var select;
var hasRequiredSelect;

function requireSelect () {
	if (hasRequiredSelect) return select;
	hasRequiredSelect = 1;

	const color = requireKleur();
	const Prompt = requirePrompt();
	const { style, clear, figures, wrap, entriesToDisplay } = requireUtil();
	const { cursor } = requireSrc();

	/**
	 * SelectPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Array} opts.choices Array of choice objects
	 * @param {String} [opts.hint] Hint to display
	 * @param {Number} [opts.initial] Index of default value
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 * @param {Number} [opts.optionsPerPage=10] Max options to display at once
	 */
	class SelectPrompt extends Prompt {
	  constructor(opts={}) {
	    super(opts);
	    this.msg = opts.message;
	    this.hint = opts.hint || '- Use arrow-keys. Return to submit.';
	    this.warn = opts.warn || '- This option is disabled';
	    this.cursor = opts.initial || 0;
	    this.choices = opts.choices.map((ch, idx) => {
	      if (typeof ch === 'string')
	        ch = {title: ch, value: idx};
	      return {
	        title: ch && (ch.title || ch.value || ch),
	        value: ch && (ch.value === undefined ? idx : ch.value),
	        description: ch && ch.description,
	        selected: ch && ch.selected,
	        disabled: ch && ch.disabled
	      };
	    });
	    this.optionsPerPage = opts.optionsPerPage || 10;
	    this.value = (this.choices[this.cursor] || {}).value;
	    this.clear = clear('', this.out.columns);
	    this.render();
	  }

	  moveCursor(n) {
	    this.cursor = n;
	    this.value = this.choices[n].value;
	    this.fire();
	  }

	  reset() {
	    this.moveCursor(0);
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  submit() {
	    if (!this.selection.disabled) {
	      this.done = true;
	      this.aborted = false;
	      this.fire();
	      this.render();
	      this.out.write('\n');
	      this.close();
	    } else
	      this.bell();
	  }

	  first() {
	    this.moveCursor(0);
	    this.render();
	  }

	  last() {
	    this.moveCursor(this.choices.length - 1);
	    this.render();
	  }

	  up() {
	    if (this.cursor === 0) {
	      this.moveCursor(this.choices.length - 1);
	    } else {
	      this.moveCursor(this.cursor - 1);
	    }
	    this.render();
	  }

	  down() {
	    if (this.cursor === this.choices.length - 1) {
	      this.moveCursor(0);
	    } else {
	      this.moveCursor(this.cursor + 1);
	    }
	    this.render();
	  }

	  next() {
	    this.moveCursor((this.cursor + 1) % this.choices.length);
	    this.render();
	  }

	  _(c, key) {
	    if (c === ' ') return this.submit();
	  }

	  get selection() {
	    return this.choices[this.cursor];
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);
	    else this.out.write(clear(this.outputText, this.out.columns));
	    super.render();

	    let { startIndex, endIndex } = entriesToDisplay(this.cursor, this.choices.length, this.optionsPerPage);

	    // Print prompt
	    this.outputText = [
	      style.symbol(this.done, this.aborted),
	      color.bold(this.msg),
	      style.delimiter(false),
	      this.done ? this.selection.title : this.selection.disabled
	          ? color.yellow(this.warn) : color.gray(this.hint)
	    ].join(' ');

	    // Print choices
	    if (!this.done) {
	      this.outputText += '\n';
	      for (let i = startIndex; i < endIndex; i++) {
	        let title, prefix, desc = '', v = this.choices[i];

	        // Determine whether to display "more choices" indicators
	        if (i === startIndex && startIndex > 0) {
	          prefix = figures.arrowUp;
	        } else if (i === endIndex - 1 && endIndex < this.choices.length) {
	          prefix = figures.arrowDown;
	        } else {
	          prefix = ' ';
	        }

	        if (v.disabled) {
	          title = this.cursor === i ? color.gray().underline(v.title) : color.strikethrough().gray(v.title);
	          prefix = (this.cursor === i ? color.bold().gray(figures.pointer) + ' ' : '  ') + prefix;
	        } else {
	          title = this.cursor === i ? color.cyan().underline(v.title) : v.title;
	          prefix = (this.cursor === i ? color.cyan(figures.pointer) + ' ' : '  ') + prefix;
	          if (v.description && this.cursor === i) {
	            desc = ` - ${v.description}`;
	            if (prefix.length + title.length + desc.length >= this.out.columns
	                || v.description.split(/\r?\n/).length > 1) {
	              desc = '\n' + wrap(v.description, { margin: 3, width: this.out.columns });
	            }
	          }
	        }

	        this.outputText += `${prefix} ${title}${color.gray(desc)}\n`;
	      }
	    }

	    this.out.write(this.outputText);
	  }
	}

	select = SelectPrompt;
	return select;
}

var toggle;
var hasRequiredToggle;

function requireToggle () {
	if (hasRequiredToggle) return toggle;
	hasRequiredToggle = 1;
	const color = requireKleur();
	const Prompt = requirePrompt();
	const { style, clear } = requireUtil();
	const { cursor, erase } = requireSrc();

	/**
	 * TogglePrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Boolean} [opts.initial=false] Default value
	 * @param {String} [opts.active='no'] Active label
	 * @param {String} [opts.inactive='off'] Inactive label
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 */
	class TogglePrompt extends Prompt {
	  constructor(opts={}) {
	    super(opts);
	    this.msg = opts.message;
	    this.value = !!opts.initial;
	    this.active = opts.active || 'on';
	    this.inactive = opts.inactive || 'off';
	    this.initialValue = this.value;
	    this.render();
	  }

	  reset() {
	    this.value = this.initialValue;
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  submit() {
	    this.done = true;
	    this.aborted = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  deactivate() {
	    if (this.value === false) return this.bell();
	    this.value = false;
	    this.render();
	  }

	  activate() {
	    if (this.value === true) return this.bell();
	    this.value = true;
	    this.render();
	  }

	  delete() {
	    this.deactivate();
	  }
	  left() {
	    this.deactivate();
	  }
	  right() {
	    this.activate();
	  }
	  down() {
	    this.deactivate();
	  }
	  up() {
	    this.activate();
	  }

	  next() {
	    this.value = !this.value;
	    this.fire();
	    this.render();
	  }

	  _(c, key) {
	    if (c === ' ') {
	      this.value = !this.value;
	    } else if (c === '1') {
	      this.value = true;
	    } else if (c === '0') {
	      this.value = false;
	    } else return this.bell();
	    this.render();
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);
	    else this.out.write(clear(this.outputText, this.out.columns));
	    super.render();

	    this.outputText = [
	      style.symbol(this.done, this.aborted),
	      color.bold(this.msg),
	      style.delimiter(this.done),
	      this.value ? this.inactive : color.cyan().underline(this.inactive),
	      color.gray('/'),
	      this.value ? color.cyan().underline(this.active) : this.active
	    ].join(' ');

	    this.out.write(erase.line + cursor.to(0) + this.outputText);
	  }
	}

	toggle = TogglePrompt;
	return toggle;
}

var datepart;
var hasRequiredDatepart;

function requireDatepart () {
	if (hasRequiredDatepart) return datepart;
	hasRequiredDatepart = 1;

	class DatePart {
	  constructor({token, date, parts, locales}) {
	    this.token = token;
	    this.date = date || new Date();
	    this.parts = parts || [this];
	    this.locales = locales || {};
	  }

	  up() {}

	  down() {}

	  next() {
	    const currentIdx = this.parts.indexOf(this);
	    return this.parts.find((part, idx) => idx > currentIdx && part instanceof DatePart);
	  }

	  setTo(val) {}

	  prev() {
	    let parts = [].concat(this.parts).reverse();
	    const currentIdx = parts.indexOf(this);
	    return parts.find((part, idx) => idx > currentIdx && part instanceof DatePart);
	  }

	  toString() {
	    return String(this.date);
	  }
	}

	datepart = DatePart;
	return datepart;
}

var meridiem;
var hasRequiredMeridiem;

function requireMeridiem () {
	if (hasRequiredMeridiem) return meridiem;
	hasRequiredMeridiem = 1;

	const DatePart = requireDatepart();

	class Meridiem extends DatePart {
	  constructor(opts={}) {
	    super(opts);
	  }

	  up() {
	    this.date.setHours((this.date.getHours() + 12) % 24);
	  }

	  down() {
	    this.up();
	  }

	  toString() {
	    let meridiem = this.date.getHours() > 12 ? 'pm' : 'am';
	    return /\A/.test(this.token) ? meridiem.toUpperCase() : meridiem;
	  }
	}

	meridiem = Meridiem;
	return meridiem;
}

var day;
var hasRequiredDay;

function requireDay () {
	if (hasRequiredDay) return day;
	hasRequiredDay = 1;

	const DatePart = requireDatepart();

	const pos = n => {
	  n = n % 10;
	  return n === 1 ? 'st'
	       : n === 2 ? 'nd'
	       : n === 3 ? 'rd'
	       : 'th';
	};

	class Day extends DatePart {
	  constructor(opts={}) {
	    super(opts);
	  }

	  up() {
	    this.date.setDate(this.date.getDate() + 1);
	  }

	  down() {
	    this.date.setDate(this.date.getDate() - 1);
	  }

	  setTo(val) {
	    this.date.setDate(parseInt(val.substr(-2)));
	  }

	  toString() {
	    let date = this.date.getDate();
	    let day = this.date.getDay();
	    return this.token === 'DD' ? String(date).padStart(2, '0')
	         : this.token === 'Do' ? date + pos(date)
	         : this.token === 'd' ? day + 1
	         : this.token === 'ddd' ? this.locales.weekdaysShort[day]
	         : this.token === 'dddd' ? this.locales.weekdays[day]
	         : date;
	  }
	}

	day = Day;
	return day;
}

var hours;
var hasRequiredHours;

function requireHours () {
	if (hasRequiredHours) return hours;
	hasRequiredHours = 1;

	const DatePart = requireDatepart();

	class Hours extends DatePart {
	  constructor(opts={}) {
	    super(opts);
	  }

	  up() {
	    this.date.setHours(this.date.getHours() + 1);
	  }

	  down() {
	    this.date.setHours(this.date.getHours() - 1);
	  }

	  setTo(val) {
	    this.date.setHours(parseInt(val.substr(-2)));
	  }

	  toString() {
	    let hours = this.date.getHours();
	    if (/h/.test(this.token))
	      hours = (hours % 12) || 12;
	    return this.token.length > 1 ? String(hours).padStart(2, '0') : hours;
	  }
	}

	hours = Hours;
	return hours;
}

var milliseconds;
var hasRequiredMilliseconds;

function requireMilliseconds () {
	if (hasRequiredMilliseconds) return milliseconds;
	hasRequiredMilliseconds = 1;

	const DatePart = requireDatepart();

	class Milliseconds extends DatePart {
	  constructor(opts={}) {
	    super(opts);
	  }

	  up() {
	    this.date.setMilliseconds(this.date.getMilliseconds() + 1);
	  }

	  down() {
	    this.date.setMilliseconds(this.date.getMilliseconds() - 1);
	  }

	  setTo(val) {
	    this.date.setMilliseconds(parseInt(val.substr(-(this.token.length))));
	  }

	  toString() {
	    return String(this.date.getMilliseconds()).padStart(4, '0')
	                                              .substr(0, this.token.length);
	  }
	}

	milliseconds = Milliseconds;
	return milliseconds;
}

var minutes;
var hasRequiredMinutes;

function requireMinutes () {
	if (hasRequiredMinutes) return minutes;
	hasRequiredMinutes = 1;

	const DatePart = requireDatepart();

	class Minutes extends DatePart {
	  constructor(opts={}) {
	    super(opts);
	  }

	  up() {
	    this.date.setMinutes(this.date.getMinutes() + 1);
	  }

	  down() {
	    this.date.setMinutes(this.date.getMinutes() - 1);
	  }

	  setTo(val) {
	    this.date.setMinutes(parseInt(val.substr(-2)));
	  }

	  toString() {
	    let m = this.date.getMinutes();
	    return this.token.length > 1 ? String(m).padStart(2, '0') : m;
	  }
	}

	minutes = Minutes;
	return minutes;
}

var month;
var hasRequiredMonth;

function requireMonth () {
	if (hasRequiredMonth) return month;
	hasRequiredMonth = 1;

	const DatePart = requireDatepart();

	class Month extends DatePart {
	  constructor(opts={}) {
	    super(opts);
	  }

	  up() {
	    this.date.setMonth(this.date.getMonth() + 1);
	  }

	  down() {
	    this.date.setMonth(this.date.getMonth() - 1);
	  }

	  setTo(val) {
	    val = parseInt(val.substr(-2)) - 1;
	    this.date.setMonth(val < 0 ? 0 : val);
	  }

	  toString() {
	    let month = this.date.getMonth();
	    let tl = this.token.length;
	    return tl === 2 ? String(month + 1).padStart(2, '0')
	           : tl === 3 ? this.locales.monthsShort[month]
	             : tl === 4 ? this.locales.months[month]
	               : String(month + 1);
	  }
	}

	month = Month;
	return month;
}

var seconds;
var hasRequiredSeconds;

function requireSeconds () {
	if (hasRequiredSeconds) return seconds;
	hasRequiredSeconds = 1;

	const DatePart = requireDatepart();

	class Seconds extends DatePart {
	  constructor(opts={}) {
	    super(opts);
	  }

	  up() {
	    this.date.setSeconds(this.date.getSeconds() + 1);
	  }

	  down() {
	    this.date.setSeconds(this.date.getSeconds() - 1);
	  }

	  setTo(val) {
	    this.date.setSeconds(parseInt(val.substr(-2)));
	  }

	  toString() {
	    let s = this.date.getSeconds();
	    return this.token.length > 1 ? String(s).padStart(2, '0') : s;
	  }
	}

	seconds = Seconds;
	return seconds;
}

var year;
var hasRequiredYear;

function requireYear () {
	if (hasRequiredYear) return year;
	hasRequiredYear = 1;

	const DatePart = requireDatepart();

	class Year extends DatePart {
	  constructor(opts={}) {
	    super(opts);
	  }

	  up() {
	    this.date.setFullYear(this.date.getFullYear() + 1);
	  }

	  down() {
	    this.date.setFullYear(this.date.getFullYear() - 1);
	  }

	  setTo(val) {
	    this.date.setFullYear(val.substr(-4));
	  }

	  toString() {
	    let year = String(this.date.getFullYear()).padStart(4, '0');
	    return this.token.length === 2 ? year.substr(-2) : year;
	  }
	}

	year = Year;
	return year;
}

var dateparts;
var hasRequiredDateparts;

function requireDateparts () {
	if (hasRequiredDateparts) return dateparts;
	hasRequiredDateparts = 1;

	dateparts = {
	  DatePart: requireDatepart(),
	  Meridiem: requireMeridiem(),
	  Day: requireDay(),
	  Hours: requireHours(),
	  Milliseconds: requireMilliseconds(),
	  Minutes: requireMinutes(),
	  Month: requireMonth(),
	  Seconds: requireSeconds(),
	  Year: requireYear(),
	};
	return dateparts;
}

var date;
var hasRequiredDate;

function requireDate () {
	if (hasRequiredDate) return date;
	hasRequiredDate = 1;

	const color = requireKleur();
	const Prompt = requirePrompt();
	const { style, clear, figures } = requireUtil();
	const { erase, cursor } = requireSrc();
	const { DatePart, Meridiem, Day, Hours, Milliseconds, Minutes, Month, Seconds, Year } = requireDateparts();

	const regex = /\\(.)|"((?:\\["\\]|[^"])+)"|(D[Do]?|d{3,4}|d)|(M{1,4})|(YY(?:YY)?)|([aA])|([Hh]{1,2})|(m{1,2})|(s{1,2})|(S{1,4})|./g;
	const regexGroups = {
	  1: ({token}) => token.replace(/\\(.)/g, '$1'),
	  2: (opts) => new Day(opts), // Day // TODO
	  3: (opts) => new Month(opts), // Month
	  4: (opts) => new Year(opts), // Year
	  5: (opts) => new Meridiem(opts), // AM/PM // TODO (special)
	  6: (opts) => new Hours(opts), // Hours
	  7: (opts) => new Minutes(opts), // Minutes
	  8: (opts) => new Seconds(opts), // Seconds
	  9: (opts) => new Milliseconds(opts), // Fractional seconds
	};

	const dfltLocales = {
	  months: 'January,February,March,April,May,June,July,August,September,October,November,December'.split(','),
	  monthsShort: 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(','),
	  weekdays: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'.split(','),
	  weekdaysShort: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat'.split(',')
	};


	/**
	 * DatePrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Number} [opts.initial] Index of default value
	 * @param {String} [opts.mask] The format mask
	 * @param {object} [opts.locales] The date locales
	 * @param {String} [opts.error] The error message shown on invalid value
	 * @param {Function} [opts.validate] Function to validate the submitted value
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 */
	class DatePrompt extends Prompt {
	  constructor(opts={}) {
	    super(opts);
	    this.msg = opts.message;
	    this.cursor = 0;
	    this.typed = '';
	    this.locales = Object.assign(dfltLocales, opts.locales);
	    this._date = opts.initial || new Date();
	    this.errorMsg = opts.error || 'Please Enter A Valid Value';
	    this.validator = opts.validate || (() => true);
	    this.mask = opts.mask || 'YYYY-MM-DD HH:mm:ss';
	    this.clear = clear('', this.out.columns);
	    this.render();
	  }

	  get value() {
	    return this.date
	  }

	  get date() {
	    return this._date;
	  }

	  set date(date) {
	    if (date) this._date.setTime(date.getTime());
	  }

	  set mask(mask) {
	    let result;
	    this.parts = [];
	    while(result = regex.exec(mask)) {
	      let match = result.shift();
	      let idx = result.findIndex(gr => gr != null);
	      this.parts.push(idx in regexGroups
	        ? regexGroups[idx]({ token: result[idx] || match, date: this.date, parts: this.parts, locales: this.locales })
	        : result[idx] || match);
	    }

	    let parts = this.parts.reduce((arr, i) => {
	      if (typeof i === 'string' && typeof arr[arr.length - 1] === 'string')
	        arr[arr.length - 1] += i;
	      else arr.push(i);
	      return arr;
	    }, []);

	    this.parts.splice(0);
	    this.parts.push(...parts);
	    this.reset();
	  }

	  moveCursor(n) {
	    this.typed = '';
	    this.cursor = n;
	    this.fire();
	  }

	  reset() {
	    this.moveCursor(this.parts.findIndex(p => p instanceof DatePart));
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.error = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  async validate() {
	    let valid = await this.validator(this.value);
	    if (typeof valid === 'string') {
	      this.errorMsg = valid;
	      valid = false;
	    }
	    this.error = !valid;
	  }

	  async submit() {
	    await this.validate();
	    if (this.error) {
	      this.color = 'red';
	      this.fire();
	      this.render();
	      return;
	    }
	    this.done = true;
	    this.aborted = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  up() {
	    this.typed = '';
	    this.parts[this.cursor].up();
	    this.render();
	  }

	  down() {
	    this.typed = '';
	    this.parts[this.cursor].down();
	    this.render();
	  }

	  left() {
	    let prev = this.parts[this.cursor].prev();
	    if (prev == null) return this.bell();
	    this.moveCursor(this.parts.indexOf(prev));
	    this.render();
	  }

	  right() {
	    let next = this.parts[this.cursor].next();
	    if (next == null) return this.bell();
	    this.moveCursor(this.parts.indexOf(next));
	    this.render();
	  }

	  next() {
	    let next = this.parts[this.cursor].next();
	    this.moveCursor(next
	      ? this.parts.indexOf(next)
	      : this.parts.findIndex((part) => part instanceof DatePart));
	    this.render();
	  }

	  _(c) {
	    if (/\d/.test(c)) {
	      this.typed += c;
	      this.parts[this.cursor].setTo(this.typed);
	      this.render();
	    }
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);
	    else this.out.write(clear(this.outputText, this.out.columns));
	    super.render();

	    // Print prompt
	    this.outputText = [
	      style.symbol(this.done, this.aborted),
	      color.bold(this.msg),
	      style.delimiter(false),
	      this.parts.reduce((arr, p, idx) => arr.concat(idx === this.cursor && !this.done ? color.cyan().underline(p.toString()) : p), [])
	          .join('')
	    ].join(' ');

	    // Print error
	    if (this.error) {
	      this.outputText += this.errorMsg.split('\n').reduce(
	          (a, l, i) => a + `\n${i ? ` ` : figures.pointerSmall} ${color.red().italic(l)}`, ``);
	    }

	    this.out.write(erase.line + cursor.to(0) + this.outputText);
	  }
	}

	date = DatePrompt;
	return date;
}

var number;
var hasRequiredNumber;

function requireNumber () {
	if (hasRequiredNumber) return number;
	hasRequiredNumber = 1;
	const color = requireKleur();
	const Prompt = requirePrompt();
	const { cursor, erase } = requireSrc();
	const { style, figures, clear, lines } = requireUtil();

	const isNumber = /[0-9]/;
	const isDef = any => any !== undefined;
	const round = (number, precision) => {
	  let factor = Math.pow(10, precision);
	  return Math.round(number * factor) / factor;
	};

	/**
	 * NumberPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {String} [opts.style='default'] Render style
	 * @param {Number} [opts.initial] Default value
	 * @param {Number} [opts.max=+Infinity] Max value
	 * @param {Number} [opts.min=-Infinity] Min value
	 * @param {Boolean} [opts.float=false] Parse input as floats
	 * @param {Number} [opts.round=2] Round floats to x decimals
	 * @param {Number} [opts.increment=1] Number to increment by when using arrow-keys
	 * @param {Function} [opts.validate] Validate function
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 * @param {String} [opts.error] The invalid error label
	 */
	class NumberPrompt extends Prompt {
	  constructor(opts={}) {
	    super(opts);
	    this.transform = style.render(opts.style);
	    this.msg = opts.message;
	    this.initial = isDef(opts.initial) ? opts.initial : '';
	    this.float = !!opts.float;
	    this.round = opts.round || 2;
	    this.inc = opts.increment || 1;
	    this.min = isDef(opts.min) ? opts.min : -Infinity;
	    this.max = isDef(opts.max) ? opts.max : Infinity;
	    this.errorMsg = opts.error || `Please Enter A Valid Value`;
	    this.validator = opts.validate || (() => true);
	    this.color = `cyan`;
	    this.value = ``;
	    this.typed = ``;
	    this.lastHit = 0;
	    this.render();
	  }

	  set value(v) {
	    if (!v && v !== 0) {
	      this.placeholder = true;
	      this.rendered = color.gray(this.transform.render(`${this.initial}`));
	      this._value = ``;
	    } else {
	      this.placeholder = false;
	      this.rendered = this.transform.render(`${round(v, this.round)}`);
	      this._value = round(v, this.round);
	    }
	    this.fire();
	  }

	  get value() {
	    return this._value;
	  }

	  parse(x) {
	    return this.float ? parseFloat(x) : parseInt(x);
	  }

	  valid(c) {
	    return c === `-` || c === `.` && this.float || isNumber.test(c)
	  }

	  reset() {
	    this.typed = ``;
	    this.value = ``;
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    let x = this.value;
	    this.value = x !== `` ? x : this.initial;
	    this.done = this.aborted = true;
	    this.error = false;
	    this.fire();
	    this.render();
	    this.out.write(`\n`);
	    this.close();
	  }

	  async validate() {
	    let valid = await this.validator(this.value);
	    if (typeof valid === `string`) {
	      this.errorMsg = valid;
	      valid = false;
	    }
	    this.error = !valid;
	  }

	  async submit() {
	    await this.validate();
	    if (this.error) {
	      this.color = `red`;
	      this.fire();
	      this.render();
	      return;
	    }
	    let x = this.value;
	    this.value = x !== `` ? x : this.initial;
	    this.done = true;
	    this.aborted = false;
	    this.error = false;
	    this.fire();
	    this.render();
	    this.out.write(`\n`);
	    this.close();
	  }

	  up() {
	    this.typed = ``;
	    if(this.value === '') {
	      this.value = this.min - this.inc;
	    }
	    if (this.value >= this.max) return this.bell();
	    this.value += this.inc;
	    this.color = `cyan`;
	    this.fire();
	    this.render();
	  }

	  down() {
	    this.typed = ``;
	    if(this.value === '') {
	      this.value = this.min + this.inc;
	    }
	    if (this.value <= this.min) return this.bell();
	    this.value -= this.inc;
	    this.color = `cyan`;
	    this.fire();
	    this.render();
	  }

	  delete() {
	    let val = this.value.toString();
	    if (val.length === 0) return this.bell();
	    this.value = this.parse((val = val.slice(0, -1))) || ``;
	    if (this.value !== '' && this.value < this.min) {
	      this.value = this.min;
	    }
	    this.color = `cyan`;
	    this.fire();
	    this.render();
	  }

	  next() {
	    this.value = this.initial;
	    this.fire();
	    this.render();
	  }

	  _(c, key) {
	    if (!this.valid(c)) return this.bell();

	    const now = Date.now();
	    if (now - this.lastHit > 1000) this.typed = ``; // 1s elapsed
	    this.typed += c;
	    this.lastHit = now;
	    this.color = `cyan`;

	    if (c === `.`) return this.fire();

	    this.value = Math.min(this.parse(this.typed), this.max);
	    if (this.value > this.max) this.value = this.max;
	    if (this.value < this.min) this.value = this.min;
	    this.fire();
	    this.render();
	  }

	  render() {
	    if (this.closed) return;
	    if (!this.firstRender) {
	      if (this.outputError)
	        this.out.write(cursor.down(lines(this.outputError, this.out.columns) - 1) + clear(this.outputError, this.out.columns));
	      this.out.write(clear(this.outputText, this.out.columns));
	    }
	    super.render();
	    this.outputError = '';

	    // Print prompt
	    this.outputText = [
	      style.symbol(this.done, this.aborted),
	      color.bold(this.msg),
	      style.delimiter(this.done),
	      !this.done || (!this.done && !this.placeholder)
	          ? color[this.color]().underline(this.rendered) : this.rendered
	    ].join(` `);

	    // Print error
	    if (this.error) {
	      this.outputError += this.errorMsg.split(`\n`)
	          .reduce((a, l, i) => a + `\n${i ? ` ` : figures.pointerSmall} ${color.red().italic(l)}`, ``);
	    }

	    this.out.write(erase.line + cursor.to(0) + this.outputText + cursor.save + this.outputError + cursor.restore);
	  }
	}

	number = NumberPrompt;
	return number;
}

var multiselect;
var hasRequiredMultiselect;

function requireMultiselect () {
	if (hasRequiredMultiselect) return multiselect;
	hasRequiredMultiselect = 1;

	const color = requireKleur();
	const { cursor } = requireSrc();
	const Prompt = requirePrompt();
	const { clear, figures, style, wrap, entriesToDisplay } = requireUtil();

	/**
	 * MultiselectPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Array} opts.choices Array of choice objects
	 * @param {String} [opts.hint] Hint to display
	 * @param {String} [opts.warn] Hint shown for disabled choices
	 * @param {Number} [opts.max] Max choices
	 * @param {Number} [opts.cursor=0] Cursor start position
	 * @param {Number} [opts.optionsPerPage=10] Max options to display at once
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 */
	class MultiselectPrompt extends Prompt {
	  constructor(opts={}) {
	    super(opts);
	    this.msg = opts.message;
	    this.cursor = opts.cursor || 0;
	    this.scrollIndex = opts.cursor || 0;
	    this.hint = opts.hint || '';
	    this.warn = opts.warn || '- This option is disabled -';
	    this.minSelected = opts.min;
	    this.showMinError = false;
	    this.maxChoices = opts.max;
	    this.instructions = opts.instructions;
	    this.optionsPerPage = opts.optionsPerPage || 10;
	    this.value = opts.choices.map((ch, idx) => {
	      if (typeof ch === 'string')
	        ch = {title: ch, value: idx};
	      return {
	        title: ch && (ch.title || ch.value || ch),
	        description: ch && ch.description,
	        value: ch && (ch.value === undefined ? idx : ch.value),
	        selected: ch && ch.selected,
	        disabled: ch && ch.disabled
	      };
	    });
	    this.clear = clear('', this.out.columns);
	    if (!opts.overrideRender) {
	      this.render();
	    }
	  }

	  reset() {
	    this.value.map(v => !v.selected);
	    this.cursor = 0;
	    this.fire();
	    this.render();
	  }

	  selected() {
	    return this.value.filter(v => v.selected);
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  submit() {
	    const selected = this.value
	      .filter(e => e.selected);
	    if (this.minSelected && selected.length < this.minSelected) {
	      this.showMinError = true;
	      this.render();
	    } else {
	      this.done = true;
	      this.aborted = false;
	      this.fire();
	      this.render();
	      this.out.write('\n');
	      this.close();
	    }
	  }

	  first() {
	    this.cursor = 0;
	    this.render();
	  }

	  last() {
	    this.cursor = this.value.length - 1;
	    this.render();
	  }
	  next() {
	    this.cursor = (this.cursor + 1) % this.value.length;
	    this.render();
	  }

	  up() {
	    if (this.cursor === 0) {
	      this.cursor = this.value.length - 1;
	    } else {
	      this.cursor--;
	    }
	    this.render();
	  }

	  down() {
	    if (this.cursor === this.value.length - 1) {
	      this.cursor = 0;
	    } else {
	      this.cursor++;
	    }
	    this.render();
	  }

	  left() {
	    this.value[this.cursor].selected = false;
	    this.render();
	  }

	  right() {
	    if (this.value.filter(e => e.selected).length >= this.maxChoices) return this.bell();
	    this.value[this.cursor].selected = true;
	    this.render();
	  }

	  handleSpaceToggle() {
	    const v = this.value[this.cursor];

	    if (v.selected) {
	      v.selected = false;
	      this.render();
	    } else if (v.disabled || this.value.filter(e => e.selected).length >= this.maxChoices) {
	      return this.bell();
	    } else {
	      v.selected = true;
	      this.render();
	    }
	  }

	  toggleAll() {
	    if (this.maxChoices !== undefined || this.value[this.cursor].disabled) {
	      return this.bell();
	    }

	    const newSelected = !this.value[this.cursor].selected;
	    this.value.filter(v => !v.disabled).forEach(v => v.selected = newSelected);
	    this.render();
	  }

	  _(c, key) {
	    if (c === ' ') {
	      this.handleSpaceToggle();
	    } else if (c === 'a') {
	      this.toggleAll();
	    } else {
	      return this.bell();
	    }
	  }

	  renderInstructions() {
	    if (this.instructions === undefined || this.instructions) {
	      if (typeof this.instructions === 'string') {
	        return this.instructions;
	      }
	      return '\nInstructions:\n'
	        + `    ${figures.arrowUp}/${figures.arrowDown}: Highlight option\n`
	        + `    ${figures.arrowLeft}/${figures.arrowRight}/[space]: Toggle selection\n`
	        + (this.maxChoices === undefined ? `    a: Toggle all\n` : '')
	        + `    enter/return: Complete answer`;
	    }
	    return '';
	  }

	  renderOption(cursor, v, i, arrowIndicator) {
	    const prefix = (v.selected ? color.green(figures.radioOn) : figures.radioOff) + ' ' + arrowIndicator + ' ';
	    let title, desc;

	    if (v.disabled) {
	      title = cursor === i ? color.gray().underline(v.title) : color.strikethrough().gray(v.title);
	    } else {
	      title = cursor === i ? color.cyan().underline(v.title) : v.title;
	      if (cursor === i && v.description) {
	        desc = ` - ${v.description}`;
	        if (prefix.length + title.length + desc.length >= this.out.columns
	          || v.description.split(/\r?\n/).length > 1) {
	          desc = '\n' + wrap(v.description, { margin: prefix.length, width: this.out.columns });
	        }
	      }
	    }

	    return prefix + title + color.gray(desc || '');
	  }

	  // shared with autocompleteMultiselect
	  paginateOptions(options) {
	    if (options.length === 0) {
	      return color.red('No matches for this query.');
	    }

	    let { startIndex, endIndex } = entriesToDisplay(this.cursor, options.length, this.optionsPerPage);
	    let prefix, styledOptions = [];

	    for (let i = startIndex; i < endIndex; i++) {
	      if (i === startIndex && startIndex > 0) {
	        prefix = figures.arrowUp;
	      } else if (i === endIndex - 1 && endIndex < options.length) {
	        prefix = figures.arrowDown;
	      } else {
	        prefix = ' ';
	      }
	      styledOptions.push(this.renderOption(this.cursor, options[i], i, prefix));
	    }

	    return '\n' + styledOptions.join('\n');
	  }

	  // shared with autocomleteMultiselect
	  renderOptions(options) {
	    if (!this.done) {
	      return this.paginateOptions(options);
	    }
	    return '';
	  }

	  renderDoneOrInstructions() {
	    if (this.done) {
	      return this.value
	        .filter(e => e.selected)
	        .map(v => v.title)
	        .join(', ');
	    }

	    const output = [color.gray(this.hint), this.renderInstructions()];

	    if (this.value[this.cursor].disabled) {
	      output.push(color.yellow(this.warn));
	    }
	    return output.join(' ');
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);
	    super.render();

	    // print prompt
	    let prompt = [
	      style.symbol(this.done, this.aborted),
	      color.bold(this.msg),
	      style.delimiter(false),
	      this.renderDoneOrInstructions()
	    ].join(' ');
	    if (this.showMinError) {
	      prompt += color.red(`You must select a minimum of ${this.minSelected} choices.`);
	      this.showMinError = false;
	    }
	    prompt += this.renderOptions(this.value);

	    this.out.write(this.clear + prompt);
	    this.clear = clear(prompt, this.out.columns);
	  }
	}

	multiselect = MultiselectPrompt;
	return multiselect;
}

var autocomplete;
var hasRequiredAutocomplete;

function requireAutocomplete () {
	if (hasRequiredAutocomplete) return autocomplete;
	hasRequiredAutocomplete = 1;

	const color = requireKleur();
	const Prompt = requirePrompt();
	const { erase, cursor } = requireSrc();
	const { style, clear, figures, wrap, entriesToDisplay } = requireUtil();

	const getVal = (arr, i) => arr[i] && (arr[i].value || arr[i].title || arr[i]);
	const getTitle = (arr, i) => arr[i] && (arr[i].title || arr[i].value || arr[i]);
	const getIndex = (arr, valOrTitle) => {
	  const index = arr.findIndex(el => el.value === valOrTitle || el.title === valOrTitle);
	  return index > -1 ? index : undefined;
	};

	/**
	 * TextPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Array} opts.choices Array of auto-complete choices objects
	 * @param {Function} [opts.suggest] Filter function. Defaults to sort by title
	 * @param {Number} [opts.limit=10] Max number of results to show
	 * @param {Number} [opts.cursor=0] Cursor start position
	 * @param {String} [opts.style='default'] Render style
	 * @param {String} [opts.fallback] Fallback message - initial to default value
	 * @param {String} [opts.initial] Index of the default value
	 * @param {Boolean} [opts.clearFirst] The first ESCAPE keypress will clear the input
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 * @param {String} [opts.noMatches] The no matches found label
	 */
	class AutocompletePrompt extends Prompt {
	  constructor(opts={}) {
	    super(opts);
	    this.msg = opts.message;
	    this.suggest = opts.suggest;
	    this.choices = opts.choices;
	    this.initial = typeof opts.initial === 'number'
	      ? opts.initial
	      : getIndex(opts.choices, opts.initial);
	    this.select = this.initial || opts.cursor || 0;
	    this.i18n = { noMatches: opts.noMatches || 'no matches found' };
	    this.fallback = opts.fallback || this.initial;
	    this.clearFirst = opts.clearFirst || false;
	    this.suggestions = [];
	    this.input = '';
	    this.limit = opts.limit || 10;
	    this.cursor = 0;
	    this.transform = style.render(opts.style);
	    this.scale = this.transform.scale;
	    this.render = this.render.bind(this);
	    this.complete = this.complete.bind(this);
	    this.clear = clear('', this.out.columns);
	    this.complete(this.render);
	    this.render();
	  }

	  set fallback(fb) {
	    this._fb = Number.isSafeInteger(parseInt(fb)) ? parseInt(fb) : fb;
	  }

	  get fallback() {
	    let choice;
	    if (typeof this._fb === 'number')
	      choice = this.choices[this._fb];
	    else if (typeof this._fb === 'string')
	      choice = { title: this._fb };
	    return choice || this._fb || { title: this.i18n.noMatches };
	  }

	  moveSelect(i) {
	    this.select = i;
	    if (this.suggestions.length > 0)
	      this.value = getVal(this.suggestions, i);
	    else this.value = this.fallback.value;
	    this.fire();
	  }

	  async complete(cb) {
	    const p = (this.completing = this.suggest(this.input, this.choices));
	    const suggestions = await p;

	    if (this.completing !== p) return;
	    this.suggestions = suggestions
	      .map((s, i, arr) => ({ title: getTitle(arr, i), value: getVal(arr, i), description: s.description }));
	    this.completing = false;
	    const l = Math.max(suggestions.length - 1, 0);
	    this.moveSelect(Math.min(l, this.select));

	    cb && cb();
	  }

	  reset() {
	    this.input = '';
	    this.complete(() => {
	      this.moveSelect(this.initial !== void 0 ? this.initial : 0);
	      this.render();
	    });
	    this.render();
	  }

	  exit() {
	    if (this.clearFirst && this.input.length > 0) {
	      this.reset();
	    } else {
	      this.done = this.exited = true; 
	      this.aborted = false;
	      this.fire();
	      this.render();
	      this.out.write('\n');
	      this.close();
	    }
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.exited = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  submit() {
	    this.done = true;
	    this.aborted = this.exited = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  _(c, key) {
	    let s1 = this.input.slice(0, this.cursor);
	    let s2 = this.input.slice(this.cursor);
	    this.input = `${s1}${c}${s2}`;
	    this.cursor = s1.length+1;
	    this.complete(this.render);
	    this.render();
	  }

	  delete() {
	    if (this.cursor === 0) return this.bell();
	    let s1 = this.input.slice(0, this.cursor-1);
	    let s2 = this.input.slice(this.cursor);
	    this.input = `${s1}${s2}`;
	    this.complete(this.render);
	    this.cursor = this.cursor-1;
	    this.render();
	  }

	  deleteForward() {
	    if(this.cursor*this.scale >= this.rendered.length) return this.bell();
	    let s1 = this.input.slice(0, this.cursor);
	    let s2 = this.input.slice(this.cursor+1);
	    this.input = `${s1}${s2}`;
	    this.complete(this.render);
	    this.render();
	  }

	  first() {
	    this.moveSelect(0);
	    this.render();
	  }

	  last() {
	    this.moveSelect(this.suggestions.length - 1);
	    this.render();
	  }

	  up() {
	    if (this.select === 0) {
	      this.moveSelect(this.suggestions.length - 1);
	    } else {
	      this.moveSelect(this.select - 1);
	    }
	    this.render();
	  }

	  down() {
	    if (this.select === this.suggestions.length - 1) {
	      this.moveSelect(0);
	    } else {
	      this.moveSelect(this.select + 1);
	    }
	    this.render();
	  }

	  next() {
	    if (this.select === this.suggestions.length - 1) {
	      this.moveSelect(0);
	    } else this.moveSelect(this.select + 1);
	    this.render();
	  }

	  nextPage() {
	    this.moveSelect(Math.min(this.select + this.limit, this.suggestions.length - 1));
	    this.render();
	  }

	  prevPage() {
	    this.moveSelect(Math.max(this.select - this.limit, 0));
	    this.render();
	  }

	  left() {
	    if (this.cursor <= 0) return this.bell();
	    this.cursor = this.cursor-1;
	    this.render();
	  }

	  right() {
	    if (this.cursor*this.scale >= this.rendered.length) return this.bell();
	    this.cursor = this.cursor+1;
	    this.render();
	  }

	  renderOption(v, hovered, isStart, isEnd) {
	    let desc;
	    let prefix = isStart ? figures.arrowUp : isEnd ? figures.arrowDown : ' ';
	    let title = hovered ? color.cyan().underline(v.title) : v.title;
	    prefix = (hovered ? color.cyan(figures.pointer) + ' ' : '  ') + prefix;
	    if (v.description) {
	      desc = ` - ${v.description}`;
	      if (prefix.length + title.length + desc.length >= this.out.columns
	        || v.description.split(/\r?\n/).length > 1) {
	        desc = '\n' + wrap(v.description, { margin: 3, width: this.out.columns });
	      }
	    }
	    return prefix + ' ' + title + color.gray(desc || '');
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);
	    else this.out.write(clear(this.outputText, this.out.columns));
	    super.render();

	    let { startIndex, endIndex } = entriesToDisplay(this.select, this.choices.length, this.limit);

	    this.outputText = [
	      style.symbol(this.done, this.aborted, this.exited),
	      color.bold(this.msg),
	      style.delimiter(this.completing),
	      this.done && this.suggestions[this.select]
	        ? this.suggestions[this.select].title
	        : this.rendered = this.transform.render(this.input)
	    ].join(' ');

	    if (!this.done) {
	      const suggestions = this.suggestions
	        .slice(startIndex, endIndex)
	        .map((item, i) =>  this.renderOption(item,
	          this.select === i + startIndex,
	          i === 0 && startIndex > 0,
	          i + startIndex === endIndex - 1 && endIndex < this.choices.length))
	        .join('\n');
	      this.outputText += `\n` + (suggestions || color.gray(this.fallback.title));
	    }

	    this.out.write(erase.line + cursor.to(0) + this.outputText);
	  }
	}

	autocomplete = AutocompletePrompt;
	return autocomplete;
}

var autocompleteMultiselect;
var hasRequiredAutocompleteMultiselect;

function requireAutocompleteMultiselect () {
	if (hasRequiredAutocompleteMultiselect) return autocompleteMultiselect;
	hasRequiredAutocompleteMultiselect = 1;

	const color = requireKleur();
	const { cursor } = requireSrc();
	const MultiselectPrompt = requireMultiselect();
	const { clear, style, figures } = requireUtil();
	/**
	 * MultiselectPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Array} opts.choices Array of choice objects
	 * @param {String} [opts.hint] Hint to display
	 * @param {String} [opts.warn] Hint shown for disabled choices
	 * @param {Number} [opts.max] Max choices
	 * @param {Number} [opts.cursor=0] Cursor start position
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 */
	class AutocompleteMultiselectPrompt extends MultiselectPrompt {
	  constructor(opts={}) {
	    opts.overrideRender = true;
	    super(opts);
	    this.inputValue = '';
	    this.clear = clear('', this.out.columns);
	    this.filteredOptions = this.value;
	    this.render();
	  }

	  last() {
	    this.cursor = this.filteredOptions.length - 1;
	    this.render();
	  }
	  next() {
	    this.cursor = (this.cursor + 1) % this.filteredOptions.length;
	    this.render();
	  }

	  up() {
	    if (this.cursor === 0) {
	      this.cursor = this.filteredOptions.length - 1;
	    } else {
	      this.cursor--;
	    }
	    this.render();
	  }

	  down() {
	    if (this.cursor === this.filteredOptions.length - 1) {
	      this.cursor = 0;
	    } else {
	      this.cursor++;
	    }
	    this.render();
	  }

	  left() {
	    this.filteredOptions[this.cursor].selected = false;
	    this.render();
	  }

	  right() {
	    if (this.value.filter(e => e.selected).length >= this.maxChoices) return this.bell();
	    this.filteredOptions[this.cursor].selected = true;
	    this.render();
	  }

	  delete() {
	    if (this.inputValue.length) {
	      this.inputValue = this.inputValue.substr(0, this.inputValue.length - 1);
	      this.updateFilteredOptions();
	    }
	  }

	  updateFilteredOptions() {
	    const currentHighlight = this.filteredOptions[this.cursor];
	    this.filteredOptions = this.value
	      .filter(v => {
	        if (this.inputValue) {
	          if (typeof v.title === 'string') {
	            if (v.title.toLowerCase().includes(this.inputValue.toLowerCase())) {
	              return true;
	            }
	          }
	          if (typeof v.value === 'string') {
	            if (v.value.toLowerCase().includes(this.inputValue.toLowerCase())) {
	              return true;
	            }
	          }
	          return false;
	        }
	        return true;
	      });
	    const newHighlightIndex = this.filteredOptions.findIndex(v => v === currentHighlight);
	    this.cursor = newHighlightIndex < 0 ? 0 : newHighlightIndex;
	    this.render();
	  }

	  handleSpaceToggle() {
	    const v = this.filteredOptions[this.cursor];

	    if (v.selected) {
	      v.selected = false;
	      this.render();
	    } else if (v.disabled || this.value.filter(e => e.selected).length >= this.maxChoices) {
	      return this.bell();
	    } else {
	      v.selected = true;
	      this.render();
	    }
	  }

	  handleInputChange(c) {
	    this.inputValue = this.inputValue + c;
	    this.updateFilteredOptions();
	  }

	  _(c, key) {
	    if (c === ' ') {
	      this.handleSpaceToggle();
	    } else {
	      this.handleInputChange(c);
	    }
	  }

	  renderInstructions() {
	    if (this.instructions === undefined || this.instructions) {
	      if (typeof this.instructions === 'string') {
	        return this.instructions;
	      }
	      return `
	Instructions:
	    ${figures.arrowUp}/${figures.arrowDown}: Highlight option
	    ${figures.arrowLeft}/${figures.arrowRight}/[space]: Toggle selection
	    [a,b,c]/delete: Filter choices
	    enter/return: Complete answer
	`;
	    }
	    return '';
	  }

	  renderCurrentInput() {
	    return `
	Filtered results for: ${this.inputValue ? this.inputValue : color.gray('Enter something to filter')}\n`;
	  }

	  renderOption(cursor, v, i) {
	    let title;
	    if (v.disabled) title = cursor === i ? color.gray().underline(v.title) : color.strikethrough().gray(v.title);
	    else title = cursor === i ? color.cyan().underline(v.title) : v.title;
	    return (v.selected ? color.green(figures.radioOn) : figures.radioOff) + '  ' + title
	  }

	  renderDoneOrInstructions() {
	    if (this.done) {
	      return this.value
	        .filter(e => e.selected)
	        .map(v => v.title)
	        .join(', ');
	    }

	    const output = [color.gray(this.hint), this.renderInstructions(), this.renderCurrentInput()];

	    if (this.filteredOptions.length && this.filteredOptions[this.cursor].disabled) {
	      output.push(color.yellow(this.warn));
	    }
	    return output.join(' ');
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);
	    super.render();

	    // print prompt

	    let prompt = [
	      style.symbol(this.done, this.aborted),
	      color.bold(this.msg),
	      style.delimiter(false),
	      this.renderDoneOrInstructions()
	    ].join(' ');

	    if (this.showMinError) {
	      prompt += color.red(`You must select a minimum of ${this.minSelected} choices.`);
	      this.showMinError = false;
	    }
	    prompt += this.renderOptions(this.filteredOptions);

	    this.out.write(this.clear + prompt);
	    this.clear = clear(prompt, this.out.columns);
	  }
	}

	autocompleteMultiselect = AutocompleteMultiselectPrompt;
	return autocompleteMultiselect;
}

var confirm;
var hasRequiredConfirm;

function requireConfirm () {
	if (hasRequiredConfirm) return confirm;
	hasRequiredConfirm = 1;
	const color = requireKleur();
	const Prompt = requirePrompt();
	const { style, clear } = requireUtil();
	const { erase, cursor } = requireSrc();

	/**
	 * ConfirmPrompt Base Element
	 * @param {Object} opts Options
	 * @param {String} opts.message Message
	 * @param {Boolean} [opts.initial] Default value (true/false)
	 * @param {Stream} [opts.stdin] The Readable stream to listen to
	 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
	 * @param {String} [opts.yes] The "Yes" label
	 * @param {String} [opts.yesOption] The "Yes" option when choosing between yes/no
	 * @param {String} [opts.no] The "No" label
	 * @param {String} [opts.noOption] The "No" option when choosing between yes/no
	 */
	class ConfirmPrompt extends Prompt {
	  constructor(opts={}) {
	    super(opts);
	    this.msg = opts.message;
	    this.value = opts.initial;
	    this.initialValue = !!opts.initial;
	    this.yesMsg = opts.yes || 'yes';
	    this.yesOption = opts.yesOption || '(Y/n)';
	    this.noMsg = opts.no || 'no';
	    this.noOption = opts.noOption || '(y/N)';
	    this.render();
	  }

	  reset() {
	    this.value = this.initialValue;
	    this.fire();
	    this.render();
	  }

	  exit() {
	    this.abort();
	  }

	  abort() {
	    this.done = this.aborted = true;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  submit() {
	    this.value = this.value || false;
	    this.done = true;
	    this.aborted = false;
	    this.fire();
	    this.render();
	    this.out.write('\n');
	    this.close();
	  }

	  _(c, key) {
	    if (c.toLowerCase() === 'y') {
	      this.value = true;
	      return this.submit();
	    }
	    if (c.toLowerCase() === 'n') {
	      this.value = false;
	      return this.submit();
	    }
	    return this.bell();
	  }

	  render() {
	    if (this.closed) return;
	    if (this.firstRender) this.out.write(cursor.hide);
	    else this.out.write(clear(this.outputText, this.out.columns));
	    super.render();

	    this.outputText = [
	      style.symbol(this.done, this.aborted),
	      color.bold(this.msg),
	      style.delimiter(this.done),
	      this.done ? (this.value ? this.yesMsg : this.noMsg)
	          : color.gray(this.initialValue ? this.yesOption : this.noOption)
	    ].join(' ');

	    this.out.write(erase.line + cursor.to(0) + this.outputText);
	  }
	}

	confirm = ConfirmPrompt;
	return confirm;
}

var elements;
var hasRequiredElements;

function requireElements () {
	if (hasRequiredElements) return elements;
	hasRequiredElements = 1;

	elements = {
	  TextPrompt: requireText(),
	  SelectPrompt: requireSelect(),
	  TogglePrompt: requireToggle(),
	  DatePrompt: requireDate(),
	  NumberPrompt: requireNumber(),
	  MultiselectPrompt: requireMultiselect(),
	  AutocompletePrompt: requireAutocomplete(),
	  AutocompleteMultiselectPrompt: requireAutocompleteMultiselect(),
	  ConfirmPrompt: requireConfirm()
	};
	return elements;
}

var hasRequiredPrompts;

function requirePrompts () {
	if (hasRequiredPrompts) return prompts$1;
	hasRequiredPrompts = 1;
	(function (exports) {
		const $ = exports;
		const el = requireElements();
		const noop = v => v;

		function toPrompt(type, args, opts={}) {
		  return new Promise((res, rej) => {
		    const p = new el[type](args);
		    const onAbort = opts.onAbort || noop;
		    const onSubmit = opts.onSubmit || noop;
		    const onExit = opts.onExit || noop;
		    p.on('state', args.onState || noop);
		    p.on('submit', x => res(onSubmit(x)));
		    p.on('exit', x => res(onExit(x)));
		    p.on('abort', x => rej(onAbort(x)));
		  });
		}

		/**
		 * Text prompt
		 * @param {string} args.message Prompt message to display
		 * @param {string} [args.initial] Default string value
		 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
		 * @param {function} [args.onState] On state change callback
		 * @param {function} [args.validate] Function to validate user input
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */
		$.text = args => toPrompt('TextPrompt', args);

		/**
		 * Password prompt with masked input
		 * @param {string} args.message Prompt message to display
		 * @param {string} [args.initial] Default string value
		 * @param {function} [args.onState] On state change callback
		 * @param {function} [args.validate] Function to validate user input
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */
		$.password = args => {
		  args.style = 'password';
		  return $.text(args);
		};

		/**
		 * Prompt where input is invisible, like sudo
		 * @param {string} args.message Prompt message to display
		 * @param {string} [args.initial] Default string value
		 * @param {function} [args.onState] On state change callback
		 * @param {function} [args.validate] Function to validate user input
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */
		$.invisible = args => {
		  args.style = 'invisible';
		  return $.text(args);
		};

		/**
		 * Number prompt
		 * @param {string} args.message Prompt message to display
		 * @param {number} args.initial Default number value
		 * @param {function} [args.onState] On state change callback
		 * @param {number} [args.max] Max value
		 * @param {number} [args.min] Min value
		 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
		 * @param {Boolean} [opts.float=false] Parse input as floats
		 * @param {Number} [opts.round=2] Round floats to x decimals
		 * @param {Number} [opts.increment=1] Number to increment by when using arrow-keys
		 * @param {function} [args.validate] Function to validate user input
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */
		$.number = args => toPrompt('NumberPrompt', args);

		/**
		 * Date prompt
		 * @param {string} args.message Prompt message to display
		 * @param {number} args.initial Default number value
		 * @param {function} [args.onState] On state change callback
		 * @param {number} [args.max] Max value
		 * @param {number} [args.min] Min value
		 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
		 * @param {Boolean} [opts.float=false] Parse input as floats
		 * @param {Number} [opts.round=2] Round floats to x decimals
		 * @param {Number} [opts.increment=1] Number to increment by when using arrow-keys
		 * @param {function} [args.validate] Function to validate user input
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */
		$.date = args => toPrompt('DatePrompt', args);

		/**
		 * Classic yes/no prompt
		 * @param {string} args.message Prompt message to display
		 * @param {boolean} [args.initial=false] Default value
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */
		$.confirm = args => toPrompt('ConfirmPrompt', args);

		/**
		 * List prompt, split intput string by `seperator`
		 * @param {string} args.message Prompt message to display
		 * @param {string} [args.initial] Default string value
		 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
		 * @param {string} [args.separator] String separator
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input, in form of an `Array`
		 */
		$.list = args => {
		  const sep = args.separator || ',';
		  return toPrompt('TextPrompt', args, {
		    onSubmit: str => str.split(sep).map(s => s.trim())
		  });
		};

		/**
		 * Toggle/switch prompt
		 * @param {string} args.message Prompt message to display
		 * @param {boolean} [args.initial=false] Default value
		 * @param {string} [args.active="on"] Text for `active` state
		 * @param {string} [args.inactive="off"] Text for `inactive` state
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */
		$.toggle = args => toPrompt('TogglePrompt', args);

		/**
		 * Interactive select prompt
		 * @param {string} args.message Prompt message to display
		 * @param {Array} args.choices Array of choices objects `[{ title, value }, ...]`
		 * @param {number} [args.initial] Index of default value
		 * @param {String} [args.hint] Hint to display
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */
		$.select = args => toPrompt('SelectPrompt', args);

		/**
		 * Interactive multi-select / autocompleteMultiselect prompt
		 * @param {string} args.message Prompt message to display
		 * @param {Array} args.choices Array of choices objects `[{ title, value, [selected] }, ...]`
		 * @param {number} [args.max] Max select
		 * @param {string} [args.hint] Hint to display user
		 * @param {Number} [args.cursor=0] Cursor start position
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */
		$.multiselect = args => {
		  args.choices = [].concat(args.choices || []);
		  const toSelected = items => items.filter(item => item.selected).map(item => item.value);
		  return toPrompt('MultiselectPrompt', args, {
		    onAbort: toSelected,
		    onSubmit: toSelected
		  });
		};

		$.autocompleteMultiselect = args => {
		  args.choices = [].concat(args.choices || []);
		  const toSelected = items => items.filter(item => item.selected).map(item => item.value);
		  return toPrompt('AutocompleteMultiselectPrompt', args, {
		    onAbort: toSelected,
		    onSubmit: toSelected
		  });
		};

		const byTitle = (input, choices) => Promise.resolve(
		  choices.filter(item => item.title.slice(0, input.length).toLowerCase() === input.toLowerCase())
		);

		/**
		 * Interactive auto-complete prompt
		 * @param {string} args.message Prompt message to display
		 * @param {Array} args.choices Array of auto-complete choices objects `[{ title, value }, ...]`
		 * @param {Function} [args.suggest] Function to filter results based on user input. Defaults to sort by `title`
		 * @param {number} [args.limit=10] Max number of results to show
		 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
		 * @param {String} [args.initial] Index of the default value
		 * @param {boolean} [opts.clearFirst] The first ESCAPE keypress will clear the input
		 * @param {String} [args.fallback] Fallback message - defaults to initial value
		 * @param {function} [args.onState] On state change callback
		 * @param {Stream} [args.stdin] The Readable stream to listen to
		 * @param {Stream} [args.stdout] The Writable stream to write readline data to
		 * @returns {Promise} Promise with user input
		 */
		$.autocomplete = args => {
		  args.suggest = args.suggest || byTitle;
		  args.choices = [].concat(args.choices || []);
		  return toPrompt('AutocompletePrompt', args);
		};
} (prompts$1));
	return prompts$1;
}

var lib;
var hasRequiredLib;

function requireLib () {
	if (hasRequiredLib) return lib;
	hasRequiredLib = 1;

	const prompts = requirePrompts();

	const passOn = ['suggest', 'format', 'onState', 'validate', 'onRender', 'type'];
	const noop = () => {};

	/**
	 * Prompt for a series of questions
	 * @param {Array|Object} questions Single question object or Array of question objects
	 * @param {Function} [onSubmit] Callback function called on prompt submit
	 * @param {Function} [onCancel] Callback function called on cancel/abort
	 * @returns {Object} Object with values from user input
	 */
	async function prompt(questions=[], { onSubmit=noop, onCancel=noop }={}) {
	  const answers = {};
	  const override = prompt._override || {};
	  questions = [].concat(questions);
	  let answer, question, quit, name, type, lastPrompt;

	  const getFormattedAnswer = async (question, answer, skipValidation = false) => {
	    if (!skipValidation && question.validate && question.validate(answer) !== true) {
	      return;
	    }
	    return question.format ? await question.format(answer, answers) : answer
	  };

	  for (question of questions) {
	    ({ name, type } = question);

	    // evaluate type first and skip if type is a falsy value
	    if (typeof type === 'function') {
	      type = await type(answer, { ...answers }, question);
	      question['type'] = type;
	    }
	    if (!type) continue;

	    // if property is a function, invoke it unless it's a special function
	    for (let key in question) {
	      if (passOn.includes(key)) continue;
	      let value = question[key];
	      question[key] = typeof value === 'function' ? await value(answer, { ...answers }, lastPrompt) : value;
	    }

	    lastPrompt = question;

	    if (typeof question.message !== 'string') {
	      throw new Error('prompt message is required');
	    }

	    // update vars in case they changed
	    ({ name, type } = question);

	    if (prompts[type] === void 0) {
	      throw new Error(`prompt type (${type}) is not defined`);
	    }

	    if (override[question.name] !== undefined) {
	      answer = await getFormattedAnswer(question, override[question.name]);
	      if (answer !== undefined) {
	        answers[name] = answer;
	        continue;
	      }
	    }

	    try {
	      // Get the injected answer if there is one or prompt the user
	      answer = prompt._injected ? getInjectedAnswer(prompt._injected, question.initial) : await prompts[type](question);
	      answers[name] = answer = await getFormattedAnswer(question, answer, true);
	      quit = await onSubmit(question, answer, answers);
	    } catch (err) {
	      quit = !(await onCancel(question, answers));
	    }

	    if (quit) return answers;
	  }

	  return answers;
	}

	function getInjectedAnswer(injected, deafultValue) {
	  const answer = injected.shift();
	    if (answer instanceof Error) {
	      throw answer;
	    }

	    return (answer === undefined) ? deafultValue : answer;
	}

	function inject(answers) {
	  prompt._injected = (prompt._injected || []).concat(answers);
	}

	function override(answers) {
	  prompt._override = Object.assign({}, answers);
	}

	lib = Object.assign(prompt, { prompt, prompts, inject, override });
	return lib;
}

function isNodeLT(tar) {
  tar = (Array.isArray(tar) ? tar : tar.split('.')).map(Number);
  let i=0, src=process.versions.node.split('.').map(Number);
  for (; i < tar.length; i++) {
    if (src[i] > tar[i]) return false;
    if (tar[i] > src[i]) return true;
  }
  return false;
}

var prompts =
  isNodeLT('8.6.0')
    ? requireDist()
    : requireLib();

const argv = minimist(process.argv.slice(2));
const targetDir = argv._[0];
const defaultProjectName = targetDir || 'create-app';
/* 判断这个目录是否存在 并判断里面是否有文件 */
const hasProjectDir = (dir) => {
    return require$$0$2.existsSync(dir) && !!require$$0$2.readdirSync(dir).length;
};
const options = [
    {
        name: 'projectName',
        type: targetDir ? null : 'text',
        message: 'Project Name:',
        initial: defaultProjectName
    },
    {
        name: 'hasProjectDir',
        type: () => (hasProjectDir(defaultProjectName) ? 'toggle' : null),
        message: 'Now Current directory has files. Do you wanting Remove existing files and continue?',
        initial: true,
        active: 'yes',
        inactive: 'no'
    },
    {
        name: 'checkStep',
        type: (prev, values) => {
            const { shouldOverwrite } = values;
            if (shouldOverwrite && !shouldOverwrite) {
                console.log(`  ${chalk.red('✖ 取消操作')}`);
            }
            return null;
        }
    },
    {
        name: 'pickPresets',
        type: 'select',
        message: '请选择一个预设',
        choices: [
            { title: 'vue3 (typescript eslint prettier)', value: 'vue' },
            { title: 'react (typescript eslint prettier husky)', value: 'react' }
        ]
    }
];
const initOptions = async () => {
    try {
        const result = await prompts(options, {
            onCancel: () => {
                throw new Error('取消操作');
            }
        });
        return { projectName: defaultProjectName, ...result };
    }
    catch (err) {
        console.log(`  ${chalk.red('✖ ' + err.message)}`);
        process.exit(1); //  退出进程 1 代表失败
    }
};

(async function () {
    const result = await initOptions();
    if (result) {
        execute(result);
    }
})();

exports.File = File;
exports.FormData = FormData;
