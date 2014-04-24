function TaskQueue(finalCallback) {
    this.finalCallback = finalCallback;
    this.tasks = {};

    // Functions passed to this queue must take their own callback as their last
    // argument. If they take more arguments they must be binded by the caller.
    // If tasks are functions with the same name, taskName must be defined to a
    // unique name. Further, tasks callbacks which are passed here must have
    // bound their arguments by the caller
    function enqueueTask(task, taskCallback, taskName) {
        if (taskCallback == null) {
            console.log("enqueueTask without callback. Cowardly refusing to enqueue");
            return;
        }
        var name = taskName != null ? taskName : task.name;
        var taskCompletion = this.dequeueTask.bind(this, name);
        this.tasks[name] = {func: task,
                            callerCallback: taskCallback,
                            queueCallback: taskCompletion};
    }

    function dequeueTask(completedTaskName) {
        var args = Array.prototype.slice.call(arguments);
        // removes first arg from arguments, which is the above
        args.shift();
        this.tasks[completedTaskName].callerCallback.apply(null, args);
        delete this.tasks[completedTaskName];

        // this signifies we've done everything we promised to do
        if (Object.keys(this.tasks).length == 0) {
            finalCallback();
        }
    }

    function executeTasks() {
        for (var task in this.tasks) {
            if (this.tasks.hasOwnProperty(task)) {
                var callback = this.tasks[task].queueCallback;
                this.tasks[task].func(callback);
            }
        }
    }

    this.enqueueTask = enqueueTask;
    this.dequeueTask = dequeueTask;
    this.executeTasks = executeTasks;
}