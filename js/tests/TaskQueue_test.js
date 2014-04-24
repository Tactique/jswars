module("TaskQueue tests");
asyncTest("TaskQueue", function() {
    var callbackCounter = 0;
    function addCallback() {
        callbackCounter += 1;
    }

    function testFunc(callback) {
        setTimeout(callback, 1);
    }

    function testCallbackCount(correctCount) {
        equal(callbackCounter, correctCount);
        start();
    }

    var queue = new TaskQueue(testCallbackCount.bind(this, 5));

    // tasks with no callbacks are invalid
    queue.enqueueTask(testFunc);
    equal(Object.keys(queue.tasks).length, 0);

    // Normal use cases don't have functions with the same name, but here we do
    queue.enqueueTask(testFunc, addCallback, "testFunc1");
    queue.enqueueTask(testFunc, addCallback, "testFunc2");
    queue.enqueueTask(testFunc, addCallback, "testFunc3");
    queue.enqueueTask(testFunc, addCallback, "testFunc4");
    queue.enqueueTask(testFunc, addCallback, "testFunc5");

    equal(Object.keys(queue.tasks).length, 5);

    queue.executeTasks();
});

asyncTest("TaskQueue.differingTimes", function() {
    var callbackCounter = 0;
    function addCallback() {
        callbackCounter += 1;
    }

    function testFunc(delay, callback) {
        setTimeout(callback, delay);
    }

    function testCallbackCount(correctCount) {
        equal(callbackCounter, correctCount);
        start();
    }

    var queue = new TaskQueue(testCallbackCount.bind(this, 5));

    // Normal use cases don't have functions with the same name, but here we do
    queue.enqueueTask(testFunc.bind(null, 5), addCallback, "testFunc1");
    queue.enqueueTask(testFunc.bind(null, 14), addCallback, "testFunc2");
    queue.enqueueTask(testFunc.bind(null, 30), addCallback, "testFunc3");
    queue.enqueueTask(testFunc.bind(null, 22), addCallback, "testFunc4");
    queue.enqueueTask(testFunc.bind(null, 100), addCallback, "testFunc5");

    equal(Object.keys(queue.tasks).length, 5);

    queue.executeTasks();
});

asyncTest("TaskQueue.differingTimesAndCounts", function() {
    var callbackCounter = 0;
    function addCallback(toAdd) {
        callbackCounter += toAdd;
    }

    function testFunc(delay, callback) {
        setTimeout(callback, delay);
    }

    function testCallbackCount(correctCount) {
        equal(callbackCounter, correctCount);
        start();
    }

    // The expected result from the binds below:
    // 5 + 14 + 30 + 22 + 100 = 171
    var queue = new TaskQueue(testCallbackCount.bind(this, 171));

    // Normal use cases don't have functions with the same name, but here we do
    queue.enqueueTask(testFunc.bind(null, 5), addCallback.bind(null, 5), "testFunc1");
    queue.enqueueTask(testFunc.bind(null, 14), addCallback.bind(null, 14), "testFunc2");
    queue.enqueueTask(testFunc.bind(null, 30), addCallback.bind(null, 30), "testFunc3");
    queue.enqueueTask(testFunc.bind(null, 22), addCallback.bind(null, 22), "testFunc4");
    queue.enqueueTask(testFunc.bind(null, 100), addCallback.bind(null, 100), "testFunc5");

    equal(Object.keys(queue.tasks).length, 5);

    queue.executeTasks();
});