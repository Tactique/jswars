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
    // initialize the camera
    camera = new Camera();
    // create the Game object in preparation to play
    app = new Game();
    game = app;
    // initialize renderers and stuff, connect render hooks and such
    initRenderers($(window).width(), $(window).height(), "canvas_land");
    canvas_element = $("#canvas_land");
    initMenus($(window).width(), $(window).height());
    // Setup the network and load stuff async style
    loadQueue = new TaskQueue(app.init.bind(app));
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
