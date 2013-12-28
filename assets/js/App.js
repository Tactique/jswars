var edgeMargin = 15;
// cache the canvas so we can get information about it later
var canvas;

var gfx = {
    ctx: null,
    width: 0,
    height: 0
};

var game;
var camera;
var network;
var desiredPlayers;
var playerID;

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
    });
});

$(window).resize(function() {
    resizeCanvas($(window).width(), $(window).height());
});

var initialize = function() {
    // Create the canvas and context
    initCanvas($(window).width(), $(window).height());
    // initialize the camera
    camera = new Camera();
    // create the Game object in preparation to play
    game = new Game();
    // load sprites and other assets from the server
    GatherAssets(game.init.bind(game));
    // load the network
    network = new Network();
}

var getPlayerId = function() {
    return parseInt(playerID);
}

var initCanvas = function(width, height) {
    canvas = document.createElement("canvas");
    canvas.id = "canvas";
    document.getElementById("canvas_land").appendChild(canvas);
    resizeCanvas(width, height);

    gfx.ctx = setupContext(canvas.getContext("2d"));

    // we want the jquery version of this object, but that has to happen after
    // the initialization above
    canvas = $(canvas);
}

var setupContext = function(ctx) {
    ctx.imageSmoothingEnabled = false;

    return ctx;
}

var resizeCanvas = function(width, height) {
    var canvas = document.getElementById("canvas");
    canvas.width = width - edgeMargin;
    canvas.height = height - edgeMargin;

    gfx.width = canvas.width;
    gfx.height = canvas.height;

    gfx.ctx = setupContext(canvas.getContext("2d"));
}
