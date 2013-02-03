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
