/*
Busy Bee
Copyright (c) 2013 Vince Allen
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
/* Build time: February 3, 2013 03:20:04 */

var BusyBee={},exports=BusyBee;
(function(d){function c(a,b,h,c,e,f,i){this.tasks=a;this.onStart=b||this._noop;this.onProgress=h||this._noop;this.onFinish=c||this._noop;this.onError=e||this._noop;this.path=f||"scripts/tasks.js";this.swarm=i||new d.Swarm(4);this.startTime=(new Date).getTime();this.swarm._init(this.tasks,this.path,this.onStart.bind(this),this.onProgress.bind(this),this.onFinish.bind(this),this.onError.bind(this))}function b(a){this.maxWorkers=a||4;this.workers={lookup:{},list:[]};this.totalBusy=0;this.onError=this.onFinish=
this.onProgress=this.onStart=null}c.workersAvailable=function(){return!!window.Worker};c.prototype.name="Project";c.prototype.start=function(){this.swarm._start()};c.prototype._noop=function(){};d.Project=c;b.workerIdCount=0;b.prototype.name="Swarm";b.prototype._init=function(a,g,c,d,e,f){this.tasks=a;this.onStart=c;this.onProgress=d;this.onFinish=e;this.onError=f;for(a=0;a<this.maxWorkers;a++)this.workers.list[this.workers.list.length]=new Worker(g),this.workers.list[this.workers.list.length-1].addEventListener("message",
this._handleMessage.bind(this),!1),this.workers.list[this.workers.list.length-1].addEventListener("error",this.onError.bind(this),!1),this.workers.list[this.workers.list.length-1].id=b.workerIdCount,this.workers.lookup[b.workerIdCount]=a,this.workers.lookup[b.workerIdCount]=a,b.workerIdCount++};b.prototype._start=function(){this.onStart(this.tasks.length);for(var a=0;a<this.maxWorkers;a++)this.workers.list[a].postMessage(this._createMessage(this.tasks.shift(),this.workers.list[a].id)),this.totalBusy++};
b.prototype._createMessage=function(a,b){return{cmd:a.cmd,workerId:b,start:(new Date).getTime(),options:a.options}};b.prototype._finish=function(a){this.onProgress(a);this._checkTasks(a)};b.prototype._error=function(a){this.onError(a);this._checkTasks(a)};b.prototype._checkTasks=function(a){var b,c;b=a.data.workerId;this.totalBusy--;if(this.tasks.length)a=this.workers.list[this.workers.lookup[b]],a.postMessage(this._createMessage(this.tasks.shift(),b)),this.totalBusy++;else if(!this.totalBusy){b=
0;for(c=this.workers.list.length;b<c;b++)this.workers.list[b].terminate();this.onFinish(a)}};b.prototype._handleMessage=function(a){switch(a.data.cmd){case "done":this._finish(a);break;case "error":this._error(a);break;default:this._error(a)}};d.Swarm=b})(exports);

