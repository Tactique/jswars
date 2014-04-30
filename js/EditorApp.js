$(document).ready(function() {
    initialize();
});

var innerInitialize = function() {
    // Create the canvas and context
    initCanvas($(window).width(), $(window).height());
    // initialize the camera
    camera = new Camera();
    // create the editor object and all its business
    app = new Editor();
    initRenderers();
    initInterface();
    loadQueue = new TaskQueue(app.init.bind(app));
    // necessary network stuff
    ajaxNetwork = new AjaxNetwork();
    ajaxNetwork.sendGetAllCells();
    loadQueue.enqueueTask(ajaxNetwork.sendGetAllCells, ajaxNetwork.handleGetAllCells);
    loadQueue.enqueueTask(GatherAssets, function(){});

    loadQueue.executeTasks();
};

function initInterface() {
    interface = $("#interfacing");
    interface.width(canvas.width() - 15);
    interface.height(100);
}
