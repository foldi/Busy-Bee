/*global window, exports */
/**
 * Creates a new Project.
 *
 * A BusyBee project uses a pool of Web Workers to complete a list
 * of tasks. Tasks are passed into a new Project as an array of objects
 * with a command and a set of options. Supply callbacks for feedback on start,
 * progress, completion and error.
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
