function Editor() {
    function init() {
        this.Inputs = new InputManager();

        // Eventually this size can come from some ui
        this.world = plainsWorld(20, 20);

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
        requestAnimFrame(this.mainLoop);
    }

    function update(dt) {
        this.stateMap[this.currentState].update(dt);
    }

    this.stateMap = {
        "CELL_PLACEMENT": {
            update: updateNothing,
            mouse: handleCameraMouse,
            keyboard: handleCameraKeyboard
        }
    }

    this.currentState = "CELL_PLACEMENT";
    this.lastTime = 0;
    this.init = init;
    this.mainLoop = mainLoop.bind(this);
    this.update = update;
}

function updateNothing(dt) {
    // the editor doesn't animate right now, or need any notion of time,
    // so this function is a nop
}