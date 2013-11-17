// A cross-browser requestAnimationFrame
// See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
var requestAnimFrame = (function(){
    return window.requestAnimationFrame    ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();


function Game() {
    function init() {
        // setup the game state, hook up inputs, so on...
        initInputs();
        // start the game
        mainLoop();
    }

    function mainLoop() {
        var now = Date.now();
        var dt = (now - this.lastTime) / 1000.0;

        // update entities, animations, and such, with dt
        // update(dt)
        render();

        this.lastTime = now;
        requestAnimFrame(mainLoop);
    }

    this.lastTime = 0;

    this.init = init;
    this.mainLoop = mainLoop;
}
