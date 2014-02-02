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

$(window).resize(function() {
    resizeCanvas($(window).width(), $(window).height());
});

var initialize = function() {
    // Call the sub apps initialize function
    innerInitialize();
}

var getPortNum = function() {
    return $("#wsport").text().slice(1);
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
