function handleMessage(e) {

  var data = e.data;

  if (!data.cmd) {
    return;
  }

  switch (data.cmd) {
    case 'add':
      add(data.workerId, data.start, data.options);
      break;

    case 'sub':
      sub(data.workerId, data.start, data.options);
      break;

    default:
      postMessage({cmd: 'error', workerId: data.workerId, start: data.start,
          msg: 'Command \"' + data.cmd + '\" does not exist in tasks.js.'});
      break;
  }

}

function add(workerId, start, options) {

  var n = 0, max = options.max;

  while (n < max) {
    n++;
  }

  postMessage({cmd: 'done', workerId: workerId, start: start});
}

function sub(workerId, start, options) {

  var n = options.max;

  while (n > 0) {
    n--;
  }

  postMessage({cmd: 'done', workerId: workerId, start: start});
}

self.addEventListener('message', handleMessage, false);