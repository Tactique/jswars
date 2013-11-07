var gfx = {
    ctx: null,
    width: 0,
    height: 0
};

$(document).ready(function() {
    initCanvas($(window).width(), $(window).height());
    assets.load(['img/unit_sprites.png', 'img/env_sprites.png']);
});

$(window).resize(function() {
    resizeCanvas($(window).width(), $(window).height());
});

var initCanvas = function(width, height) {
    var canvas = document.createElement("canvas");
    canvas.id = "canvas";
    document.getElementById("canvas_land").appendChild(canvas);
    resizeCanvas(width, height);

    gfx.ctx = canvas.getContext("2d");
}

var resizeCanvas = function(width, height) {
    var canvas = document.getElementById("canvas");
    canvas.width = width;
    canvas.height = height;

    gfx.width = width;
    gfx.height = height;
}
