var gfx = {
    ctx: null,
    width: 0,
    height: 0
};

$(document).ready(function() {
    initCanvas($(window).width(), $(window).height());
    GatherAssets();
});

$(window).resize(function() {
    resizeCanvas($(window).width(), $(window).height());
});

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
    canvas.width = width;
    canvas.height = height;

    gfx.width = width;
    gfx.height = height;
}
