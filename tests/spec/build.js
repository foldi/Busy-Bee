describe("A new Project", function() {

  var obj, tasks = [
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

  beforeEach(function() {
    obj = new BusyBee.Project(
      tasks,
      function() {},
      function() {},
      function() {},
      function() {}
    );
  });

  afterEach(function() {

  });

  it("should have its required properties.", function() {
    expect(typeof obj.tasks).toEqual('object');
    expect(obj.tasks.length).toEqual(2);
    expect(typeof obj.onStart).toEqual('function');
    expect(typeof obj.onProgress).toEqual('function');
    expect(typeof obj.onFinish).toEqual('function');
    expect(typeof obj.onError).toEqual('function');
    expect(obj.path).toEqual('scripts/tasks.js');
    expect(typeof obj.swarm).toEqual('object');
    expect(obj.swarm.maxWorkers).toEqual(4);
    expect(typeof obj.startTime).toEqual('number');
    expect(obj.name).toEqual('Project');
  });
});

describe("A new Swarm", function() {

  var obj;

  beforeEach(function() {
    obj = new BusyBee.Swarm(2);
  });

  afterEach(function() {

  });

  it("should have its required properties.", function() {
    expect(obj.maxWorkers).toEqual(2);
    expect(obj.workers.lookup).toEqual({});
    expect(obj.workers.list).toEqual([]);
    expect(obj.totalBusy).toEqual(0);
    expect(obj.onStart).toEqual(null);
    expect(obj.onProgress).toEqual(null);
    expect(obj.onFinish).toEqual(null);
    expect(obj.onError).toEqual(null);
    expect(obj.name).toEqual('Swarm');
  });
});
