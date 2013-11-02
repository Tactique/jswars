$(document).ready(function() {
    initCanvas($(window).width(), $(window).height());
});

var initCanvas = function(width, height) {
    // Create the canvas
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    document.getElementById("canvas_land").appendChild(canvas);
}
