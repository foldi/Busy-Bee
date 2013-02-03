/*
Busy Bee
Copyright (c) 2012 Vince Allen
vince@vinceallen.com
http://www.vinceallen.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
/* Version: 1.0.0 */
/* Build time: February 3, 2013 03:08:19 */
/** @namespace */
var BusyBee = {}, exports = BusyBee;

(function(exports) {
'use strict';
/*global window, exports */
/**
 * Creates a new Project.
 *
 * A BusyBee project uses a pool of Web Workers to complete a list
 * of tasks. Tasks are passed into a new Project as an array of objects
 * with a command and a set of options. Supply callbacks for feedback on start,
 * progress, completion and error. All callbacks are triggered via the event object
 * from the Web Worker.
 *
 * @example
 * var tasks = [
 *    {
 *      cmd: 'add', options: {max: 20000}
 *    },
 *    {
 *      cmd: 'sub', options: {max: 20000}
 *    }
 * ]
 * var project = new BusyBee.Project(
 *    tasks,
 *    function (e) {
 *      console.log('Work is starting.');
 *    },
 *    function (e) {
 *      console.log('Work is progressing.');
 *    },
 *    function (e) {
 *      console.log('Work is finished!');
 *    },
 *    function (e) {
 *      console.log('We encountered an error: ' + e.data.msg);
 *    }
 * );
 * project.start();
 *
 * @constructor
 * @param {Array.<Object>} tasks An array of tasks to send to the Web Workers.
 * @param {Function} opt_onStart A function to call when starting Web Workers.
 * @param {Function} opt_onProgress A function to call after each Web Worker completes.
 * @param {Function} opt_onFinish A function to call after completing all tasks.
 * @param {Function} opt_onError A function to call if Workers encounter an error.
 * @param {string} [opt_path = 'scripts/tasks.js'] The path to the tasks.js Worker file.
 * @param {Swarm} opt_swarm An instance of the Swarm class. Supply an instance if you
 *    want to alter number of Workers from the default value of 4.
 */
function Project(tasks, opt_onStart, opt_onProgress, opt_onFinish, opt_onError, opt_path, opt_swarm) {

  this.tasks = tasks;
  this.onStart = opt_onStart || this._noop;
  this.onProgress = opt_onProgress || this._noop;
  this.onFinish = opt_onFinish || this._noop;
  this.onError = opt_onError || this._noop;
  this.path = opt_path || 'scripts/tasks.js';
  this.swarm = opt_swarm || new exports.Swarm(4);

  this.startTime = new Date().getTime();

  this.swarm._init(this.tasks, this.path, this.onStart.bind(this), this.onProgress.bind(this),
      this.onFinish.bind(this), this.onError.bind(this));
}

/**
 * Call to detect if this browser supports Web Workers.
 *
 * @returns {boolean} True if browser supports Web Workers. False if not.
 * @public
 */
Project.workersAvailable = function() {
  return !!window.Worker;
};

Project.prototype.name = 'Project';

/**
 * Call to start the project.
 *
 * @public
 */
Project.prototype.start = function() {
  this.swarm._start();
};

/**
 * An empty function to use as a default callback.
 */
Project.prototype._noop = function() {};

exports.Project = Project;
/*global exports, Worker */
/**
 * Creates a new Swarm.
 *
 * @constructor
 * @param {number} [opt_maxWorkers = 4] The max number of Web Workers to use for the project.
 */
function Swarm(opt_maxWorkers) {

  this.maxWorkers = opt_maxWorkers || 4;
  this.workers = {
    lookup: {},
    list: []
  };
  this.totalBusy = 0;
  this.onStart = null;
  this.onProgress = null;
  this.onFinish = null;
  this.onError = null;
}

Swarm.workerIdCount = 0;

Swarm.prototype.name = 'Swarm';

/**
 * Creates Web Workers and sets the onFinish callback to invoke after
 * completing all tasks.
 *
 * @param {Array.<Object>} tasks An array of tasks to send to the Web Workers.
 * @param {string} path The path to the tasks.js Worker file.
 * @param {Function} onStart A function to invoke before starting Web Workers.
 * @param {Function} onProgress A function to call after each Web Worker completes.
 * @param {Function} onFinish A function to invoke after completing all tasks.
 * @param {Function} onError A function to invoke if the Worker encounters an error.
 * @private
 */
Swarm.prototype._init = function(tasks, path, onStart, onProgress, onFinish, onError) {

  this.tasks = tasks;
  this.onStart = onStart;
  this.onProgress = onProgress;
  this.onFinish = onFinish;
  this.onError = onError;

  for (var i = 0; i < this.maxWorkers; i++) {
    this.workers.list[this.workers.list.length] = new Worker(path);
    this.workers.list[this.workers.list.length - 1].addEventListener('message',
        this._handleMessage.bind(this), false);
    this.workers.list[this.workers.list.length - 1].addEventListener('error',
        this.onError.bind(this), false);
    this.workers.list[this.workers.list.length - 1].id = Swarm.workerIdCount;
    this.workers.lookup[Swarm.workerIdCount] = i;
    this.workers.lookup[Swarm.workerIdCount] = i;
    Swarm.workerIdCount++;
  }
};

/**
 * Call to start the Web Workers.
 *
 * @private
 */
Swarm.prototype._start = function() {
  this.onStart(this.tasks.length);
  for (var i = 0; i < this.maxWorkers; i++) {
    this.workers.list[i].postMessage(this._createMessage(this.tasks.shift(), this.workers.list[i].id));
    this.totalBusy++;
  }
};

/**
 * Creates an object to pass to the Web Workers.
 *
 * @param {Object} An object with a command and set of options. Example: {cmd: 'add', options: {max: 200}}
 * @param {string} A Web Worker id.
 * @private
 */
Swarm.prototype._createMessage = function(task, id) {
  return {cmd: task.cmd, workerId: id, start: new Date().getTime(), options: task.options};
};

/**
 * Called when a Web Worker completes a task.
 *
 * @param {Object} An event object.
 * @private
 */
Swarm.prototype._finish = function(e) {
  this.onProgress(e);
  this._checkTasks(e);
};

/**
 * Called when a Web Worker encounters an error.
 *
 * @param {Object} An event object.
 * @private
 */
Swarm.prototype._error = function(e) {
  this.onError(e);
  this._checkTasks(e);
};

/**
 * Checks if tasks are available to pass to a Worker. If so,
 * this function posts a message. If not, calls onFinish().
 *
 * @param {Object} An event object.
 * @private
 */
Swarm.prototype._checkTasks = function(e) {

  var i, max, id = e.data.workerId, thisWorker;

  this.totalBusy--;

  if (this.tasks.length) { // if there are tasks left, start the next worker
    thisWorker = this.workers.list[this.workers.lookup[id]];
    thisWorker.postMessage(this._createMessage(this.tasks.shift(), id));
    this.totalBusy++;
  } else if (!this.totalBusy) { // if no tasks left, terminate the workers
    for (i = 0, max = this.workers.list.length; i < max; i++) {
      this.workers.list[i].terminate();
    }
    this.onFinish(e);
  }
};

/**
 * Called from a Web Worker via postMessage. Use to
 * call methods based on the passed e.data.cmd value.
 *
 * @param {Object} An event object.
 * @private
 */
Swarm.prototype._handleMessage = function(e) {

  var cmd = e.data.cmd;

  switch (cmd) {
    case 'done':
      this._finish(e);
      break;
    case 'error':
      this._error(e);
      break;
    default:
      this._error(e);
  }
};

exports.Swarm = Swarm;
}(exports));
