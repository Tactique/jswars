$(document).ready(function() {
    innerInitialize();
});

var innerInitialize = function() {
    // Create the canvas and context
    initCanvas($(window).width(), $(window).height());
    // initialize the camera
    camera = new Camera();
    // create the editor object and all its business
    app = new Editor();
    initRenderers();
    // collect assets and start the editor when they're ready
    GatherAssets(app.init.bind(app));
    magic = $("#interfacing");
    magic.width(canvas.width() - 15);
    magic.height(100);
}