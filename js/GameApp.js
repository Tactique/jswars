$(document).ready(function() {
    $("#submitGameRequest").click(function() {
        playerID = $("#enteredPlayerId").val();
        if (playerID == "") {
            playerID = 1;
        }
        desiredPlayers = $("#numPlayers").val();
        if (desiredPlayers == "") {
            desiredPlayers = 1;
        }
        initialize();
        removeNewGameInterface();
    });

    $("#quintenbutton").click(function() {
        playerID = 1;
        desiredPlayers = 1;
        initialize();
        removeNewGameInterface();
    })
});

var game;

var innerInitialize = function() {
    // Create the canvas and context
    initCanvas($(window).width(), $(window).height());
    // initialize the camera
    camera = new Camera();
    // create the Game object in preparation to play
    app = new Game();
    game = app;
    // connect render hooks and such
    initRenderers();
    ajaxNetwork = new AjaxNetwork();
    ajaxNetwork.sendGetAllCells();
    // load sprites and other assets from the server
    GatherAssets(app.init.bind(app));
    // load the network
    network = new Network();
}

var getPlayerId = function() {
    return parseInt(playerID);
}

var removeNewGameInterface = function() {
    $("#gameinfo").remove();
}
