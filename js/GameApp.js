$(document).ready(function() {
    ajaxNetwork = new AjaxNetwork();
    $("#submitGameRequest").click(function() {
        desiredPlayers = $("#numPlayers").val();
        if (desiredPlayers === "") {
            desiredPlayers = 1;
        }
        initialize();
        removeNewGameInterface();
    });

    $("#quintenbutton").click(function() {
        desiredPlayers = 1;
        initialize();
        removeNewGameInterface();
    });

    $("#logout").click(function() {
        ajaxNetwork.sendLogout();
    });
});

var game;
var loadQueue;

var innerInitialize = function() {
    // Create the canvas and context
    initCanvas($(window).width(), $(window).height());
    // initialize the camera
    camera = new Camera();
    // create the Game object in preparation to play
    app = new Game();
    game = app;
    loadQueue = new TaskQueue(app.init.bind(app));
    // connect render hooks and such
    initRenderers();
    ajaxNetwork = new AjaxNetwork();
    // load sprites and other assets from the server
    loadQueue.enqueueTask(ajaxNetwork.sendGetAllCells, ajaxNetwork.handleGetAllCells);
    loadQueue.enqueueTask(ajaxNetwork.getAllTemplates, function() {});
    loadQueue.enqueueTask(ajaxNetwork.sendGetPlayerInfo, ajaxNetwork.handlePlayerInfo);
    loadQueue.enqueueTask(GatherAssets, function() {});
    loadQueue.executeTasks();
};

var removeNewGameInterface = function() {
    $("#gameinfo").remove();
};
