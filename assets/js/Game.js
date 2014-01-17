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
        this.Inputs = new InputManager();
        // temporary. The fact remains units can't be added until the sprites
        // have been loaded, so that'll have to be kept in mind for when the
        // networking happens
        // start the game
        this.mainLoop();
    }

    function mainLoop() {
        var now = Date.now();
        var dt = (now - this.lastTime) / 1000.0;

        this.Inputs.processKeyboard();
        // update entities, animations, and such, with dt
        this.update(dt);
        render();

        this.lastTime = now;
        requestAnimFrame(this.mainLoop.bind(this));
    }

    function changeState(newState) {
        this.currentState = newState;
    }

    function update(dt) {
        this.stateMap[this.currentState].update(dt);
    }

    function selectWorld(x, y) {
        this.selector = {
            pos: {
                x: x,
                y: y,
            },
            spriteName: "selector"
        }
        this.selectorCallback(this.selector);
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
    this.selectWorld = selectWorld;

    this.selector = null;
}

function updateEverything(dt) {
    // dt is in seconds, so convert to ms before passing to sprites
    assets.spriteManager.update(dt * 1000);
}
