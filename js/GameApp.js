$(document).ready(function() {
    ajaxNetwork = new AjaxNetwork();
    $("#submitGameRequest").click(function() {
		submitGameRequest();
    });

    $("#logout").click(function() {
        ajaxNetwork.sendLogout();
    });

	$("#numPlayers").on("keypress", function(e) {
		if (e.which == '13' ) {
			submitGameRequest();
		}
	});

	function submitGameRequest() {
		desiredPlayers = $("#numPlayers").val();
		if (desiredPlayers === "") {
			desiredPlayers = 1;
		}
		initialize();
		removeNewGameInterface();
	}
});


var game;
var loadQueue;
var renderer;

var innerInitialize = function() {
    renderer = new Renderer($(window).width(), $(window).height(), "canvas_land");
    setupRenderLayers(renderer);

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
