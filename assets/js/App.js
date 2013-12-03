var edgeMargin = 100;

var gfx = {
    ctx: null,
    width: 0,
    height: 0
};

var game;
var camera;

$(document).ready(function() {
    initialize();
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
    GatherAssets(game.init);
}

var initCanvas = function(width, height) {
    var canvas = document.createElement("canvas");
    canvas.id = "canvas";
    document.getElementById("canvas_land").appendChild(canvas);
    resizeCanvas(width, height);

    gfx.ctx = setupContext(canvas.getContext("2d"));
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
}
