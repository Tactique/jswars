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
        game.Inputs = new InputManager();
        // start the game
        game.mainLoop();
    }

    function mainLoop() {
        var now = Date.now();
        var dt = (now - game.lastTime) / 1000.0;

        game.Inputs.processInputs();
        // update entities, animations, and such, with dt
        // update(dt)
        render();

        game.lastTime = now;
        requestAnimFrame(game.mainLoop);
    }

    function changeState(newState) {
        this.currentState = newState;
    }

    // this world initialization here is temporary
    this.world = new World(5, 5);
    this.world.initialize([[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]]);

    this.lastTime = 0;
    this.currentState = "CAMERA_CONTROL";

    // using strings sucks here, should probably use an array
    this.stateMap = {
        "CAMERA_CONTROL" : {
            render : drawWorld,
            mouse : handleCameraMouse,
            keyboard: handleCameraKeyboard
        },
        "UNIT_CONTROL" : {
            render : drawWorld,
            mouse : handleUnitMouse,
            keyboard: handleUnitKeyboard
        }
    }

    this.init = init;
    this.mainLoop = mainLoop;
    this.changeState = changeState;
}
