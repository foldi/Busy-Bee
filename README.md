Busy Bee
======

Busy Bee pools Web Workers to complete a list of tasks. By default, Busy Bee uses four workers in parallel. If a worker is done and tasks are still available, the worker will pick up a new task and get back to work.

Tasks are passed into a new Project as an array of objects with a command and a set of options. Supply callbacks for feedback on start, progress, completion and error.

## Example

The following is taken from dev/index.html. Define your tasks in a separate js file. In this case, the tasks are defined in tasks.js

Add a reference to BusyBee.js and define an array of tasks to complete. The following tasks simply count up to 100,000,000 or down from 100,000,000.

Define a new Project and pass in callbacks that get fired as the workers progress through the tasks.

Finally, call start() to kick off the process.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv='content-type' content='text/html; charset=UTF-8' />
    <meta name='keywords' content='BusyBee' />
    <meta name='description' content='' />
    <meta name='viewport' content='user-scalable=no, width=device-width, initial-scale=1.0; maximum-scale=1.0;' />
    <title>BusyBee</title>
    <link rel='stylesheet' href='css/BusyBee.css' type='text/css' charset='utf-8' />
    <script src='scripts/tasks.js' type='text/javascript' charset='utf-8'></script>
    <script src='scripts/BusyBee.js' type='text/javascript' charset='utf-8'></script>
  </head>
  <body>
    <script type='text/javascript' charset='utf-8'>
    var tasks = [
      {
        cmd: 'sub',
        options: {
          max: 100000000
        }
      },
      {
        cmd: 'add',
        options: {
          max: 100000000
        }
      },
      {
        cmd: 'sub',
        options: {
          max: 100000000
        }
      },
      {
        cmd: 'add',
        options: {
          max: 100000000
        }
      },
      {
        cmd: 'sub',
        options: {
          max: 100000000
        }
      },
      {
        cmd: 'add',
        options: {
          max: 100000000
        }
      }
    ];

    if (BusyBee.Project.workersAvailable()) { // checks if browser supports workers

      var project = new BusyBee.Project(
        tasks,
        function(e) {
          var result = document.createElement('div');
          result.textContent = 'Starting project with ' + this.tasks.length + ' tasks.';
          document.body.appendChild(result);
        },
        function(e) {
          var result = document.createElement('div');
          result.textContent = 'Worker ' + e.data.workerId +
              ' completed task in ' + (new Date().getTime() - e.data.start) + 'ms';
          document.body.appendChild(result);
        },
        function(e) {
          var result = document.createElement('div');
          result.style.marginBottom = '1em';
          result.textContent = 'Project completed in ' + (new Date().getTime() - e.data.start) + 'ms';
          document.body.appendChild(result);
        },
        function(e) {
          var msg = e.data.msg || '',
              result = document.createElement('div');
          result.textContent = 'Error: Worker ' + e.data.workerId +
              ' after ' + (new Date().getTime() - e.data.start) + 'ms. ' + msg;
          document.body.appendChild(result);
        }
      );
      project.start();
    }
    </script>
  </body>
</html>
```

You should see messages printed to the screen as each worker completes a task. If any tasks are left, the available worker picks it up.
