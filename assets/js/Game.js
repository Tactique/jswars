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
        // temporary. The fact remains units can't be added until the sprites
        // have been loaded, so that'll have to be kept in mind for when the
        // networking happens
        // start the game
        game.mainLoop();
    }

    function mainLoop() {
        var now = Date.now();
        var dt = (now - game.lastTime) / 1000.0;

        game.Inputs.processInputs();
        // update entities, animations, and such, with dt
        game.update(dt);
        render();

        game.lastTime = now;
        requestAnimFrame(game.mainLoop);
    }

    function changeState(newState) {
        this.currentState = newState;
    }

    function update(dt) {
        this.stateMap[this.currentState].update(dt);
    }

    this.lastTime = 0;
    this.currentState = "MENU_CONTROL";

    // using strings sucks here, should probably use an array
    this.stateMap = {
        "CAMERA_CONTROL" : {
            update : updateEverything,
            mouse : handleCameraMouse,
            keyboard: handleCameraKeyboard
        },
        "UNIT_CONTROL" : {
            update : updateEverything,
            mouse : handleUnitMouse,
            keyboard: handleUnitKeyboard
        },
        "MENU_CONTROL" : {
            update : updateEverything,
            mouse : handleCameraMouse,
            keyboard : handleCameraKeyboard
        }
    }

    this.init = init;
    this.mainLoop = mainLoop;
    this.changeState = changeState;
    this.update = update;
}

function updateEverything(dt) {
    // dt is in seconds, so convert to ms before passing to sprites
    assets.sprites.update(dt * 1000);
}
